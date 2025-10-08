<template>
  <ClientOnly>
    <div ref="mapEl" style="width:100%; height:600px;"></div>
  </ClientOnly>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRuntimeConfig } from '#imports'

/* ========== Props & emits ========== */
const props = defineProps({
  polygons: { type: [Array, Object], required: true },   // ref([]) или []
  modelValue: { type: Object, default: null },
  cemeteryBoundary: { type: Object, default: null },     // { polygon_data: { coordinates: [[lng,lat], ...] } }
  centerCoords: { type: Array, default: null },          // [lat, lng]
})
const emit = defineEmits(['update:modelValue'])

/* ========== Local refs/state ========== */
const mapEl = ref(null)
let map = null
let cemeteryPolygon = null
let plotObjects = []     // [{ id, polygon, data }]
const selected = ref(props.modelValue || null)
const unwatchers = []

/* ========== Utilities ========== */
const getItems = () => (Array.isArray(props.polygons) ? props.polygons : (props.polygons?.value || []))

function toLatLng(ring) {
  // YMaps 2.1 ждёт [lat, lng]
  return (Array.isArray(ring) ? ring : []).map(([lng, lat]) => [lat, lng])
}
const isRing = (ring) => Array.isArray(ring) && ring.length >= 3 && ring.every(p => Array.isArray(p) && p.length === 2)

function getFillColor (item, isSelected) {
  if (isSelected && item.status === 'free') return '#43DC49CC'
  if (isSelected) {
    if (item.status === 'reserved') return '#FFD700'
    if (item.status === 'occupied') return '#939393'
    return '#999999'
  }
  if (item.status === 'free') return '#66FF99'
  if (item.status === 'reserved') return '#FFD700'
  if (item.status === 'occupied') return '#939393'
  return '#999999'
}
function getStrokeColor (item, isSelected) {
  if (!isSelected) return '#006600'
  return item.status === 'free' ? '#38949B' : 'gray'
}
const strokeWidth = (isSelected) => (isSelected ? 4 : 1)

/* ========== Robust loader for Yandex Maps 2.1 ========== */
async function loadYMaps21(apiKey, lang='ru_RU') {
  // If ymaps already present and Map constructor available — return it.
  if (window.ymaps && typeof window.ymaps.Map === 'function') {
    return window.ymaps
  }

  // If namespace exists with .load — prefer using it (it returns a promise)
  if (window.ymaps && typeof window.ymaps.load === 'function') {
    try {
      const ym = await window.ymaps.load()
      return ym || window.ymaps
    } catch (err) {
      console.warn('ymaps.load() rejected, will try re-injecting script', err)
      // fall through to script injection attempt
    }
  }

  // Check if a script with YMaps base already exists — avoid duplicate injection
  const srcPrefix = 'https://api-maps.yandex.ru/2.1/'
  const existing = Array.from(document.getElementsByTagName('script'))
      .find(s => s.src && s.src.startsWith(srcPrefix))

  const desiredSrc = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(apiKey)}&lang=${lang}`

  if (existing) {
    // If script exists but ymaps not ready, wait shortly and try to use .load or direct namespace
    if (window.ymaps && typeof window.ymaps.load === 'function') {
      const ym = await window.ymaps.load()
      return ym || window.ymaps
    }
    // give small grace period for initialization
    await new Promise(res => setTimeout(res, 300))
    if (window.ymaps && typeof window.ymaps.Map === 'function') return window.ymaps
    throw new Error('Yandex Maps script is present but ymaps namespace not ready')
  }

  // Inject script
  await new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = desiredSrc
    s.async = true
    s.defer = true
    s.onload = () => resolve(true)
    s.onerror = () => reject(new Error('Failed to load Yandex Maps API 2.1'))
    document.head.appendChild(s)
  })

  // Prefer using window.ymaps.load if available
  if (window.ymaps && typeof window.ymaps.load === 'function') {
    const ym = await window.ymaps.load()
    return ym || window.ymaps
  }

  // Final check
  if (window.ymaps && typeof window.ymaps.Map === 'function') return window.ymaps

  throw new Error('Yandex Maps did not initialize correctly')
}

/* ========== Center calculation ========== */
function initialCenter() {
  const items = getItems()
  if (Array.isArray(props.centerCoords) && props.centerCoords.length === 2) {
    const [lat, lng] = props.centerCoords
    return [lat, lng]
  }
  const ring = props.cemeteryBoundary?.polygon_data?.coordinates
  if (isRing(ring)) {
    const s = ring.reduce((a, [L,A]) => ({ lng: a.lng + L, lat: a.lat + A }), { lng: 0, lat: 0 })
    return [s.lat / ring.length, s.lng / ring.length]
  }
  const first = items?.[0]?.polygon_data?.coordinates?.[0]
  if (Array.isArray(first)) return [first[1], first[0]]
  return [43.238949, 76.889709] // default [lat, lng]
}

/* ========== Map initialization ========== */
async function initMap() {
  const cfg = useRuntimeConfig()
  const API_KEY = cfg.public?.yandexMapApiKey || cfg.public?.yandexMaps?.apikey
  if (!API_KEY) throw new Error('public.yandexMapApiKey not found')

  // Wait for DOM render of mapEl (ClientOnly etc.)
  await nextTick()
  if (!mapEl.value) {
    // small fallback wait
    await new Promise(res => setTimeout(res, 100))
  }
  if (!mapEl.value) {
    throw new Error('map container (mapEl) not found — cannot initialize map')
  }

  const ymaps = await loadYMaps21(API_KEY, 'ru_RU')

  if (!ymaps || typeof ymaps.Map !== 'function') {
    throw new Error('ymaps namespace is present but does not expose Map constructor')
  }

  // If previously created map — destroy to avoid duplicates
  try { if (map) { map.destroy(); map = null } } catch (e) { /* ignore */ }

  map = new ymaps.Map(mapEl.value, {
    center: initialCenter(),
    zoom: props.centerCoords ? 15 : (props.cemeteryBoundary ? 14 : 18),
    controls: [],
  }, {
    suppressMapOpenBlock: true,
  })

  // If container is invisible or zero-size, YMaps may try to read offsetWidth and fail.
  // We'll try a small deferred fitToViewport to allow browser to layout.
  try {
    const rect = mapEl.value.getBoundingClientRect?.()
    if (!rect || rect.width === 0 || rect.height === 0) {
      setTimeout(() => {
        try { map.container.fitToViewport(); } catch (e) { /* ignore */ }
      }, 200)
    }
  } catch (e) {
    // do not block initialization for this
  }

  // Draw data
  drawCemetery()
  drawPlots()

  // Watchers to react to prop changes
  unwatchers.push(
      watch(() => props.cemeteryBoundary, () => { redrawCemetery() }, { deep: true }),
      watch(() => props.polygons, () => { redrawPlots() }, { deep: true }),
      watch(() => props.centerCoords, (v) => {
        if (Array.isArray(v) && v.length === 2 && map) {
          try { map.setCenter([v[0], v[1]], 15) } catch (e) { /* ignore */ }
        }
      })
  )
}

/* ========== Cemetery boundary ========== */
function drawCemetery() {
  const ymaps = window.ymaps
  if (!map || !ymaps) return

  if (cemeteryPolygon) {
    try {
      map.geoObjects.remove(cemeteryPolygon)
    } catch {
    }
    cemeteryPolygon = null
  }
  const ring = props.cemeteryBoundary?.polygon_data?.coordinates
  if (!isRing(ring)) return

  cemeteryPolygon = new ymaps.Polygon([toLatLng(ring)], {}, {
    fillColor: 'rgba(0,0,0,0)',
    strokeColor: '#FF0000',
    strokeWidth: 3,
    zIndex: 1,
    cursor: 'default',
  })
  try {
    map.geoObjects.add(cemeteryPolygon)
  } catch (e) {
    console.warn('Failed to add cemetery polygon', e)
  }
}

const redrawCemetery = () => drawCemetery()

/* ========== Plots handling ========== */
function clearPlots() {
  plotObjects.forEach(p => {
    try {
      map.geoObjects.remove(p.polygon)
    } catch {
    }
  })
  plotObjects = []
}

function drawPlots() {
  const ymaps = window.ymaps
  if (!map || !ymaps) return

  const items = getItems()
  items.forEach(item => {
    const ring = item?.polygon_data?.coordinates
    if (!isRing(ring)) return

    const isSel = !!(selected.value && selected.value.id === item.id)
    const polygon = new ymaps.Polygon([toLatLng(ring)], {}, {
      fillColor: getFillColor(item, isSel),
      strokeColor: getStrokeColor(item, isSel),
      strokeWidth: strokeWidth(isSel),
      zIndex: 10,
      cursor: 'pointer',
      strokeStyle: isSel ? 'solid' : 'solid',
    })

    polygon.events.add('click', () => selectPlot(item))
    try {
      map.geoObjects.add(polygon)
    } catch (e) {
      console.warn('Failed to add plot polygon', e)
    }

    plotObjects.push({id: item.id, polygon, data: item})
  })
}

function redrawPlots() {
  clearPlots()
  drawPlots()
}

/* ========== Selection logic ========== */
function selectPlot(item) {
  selected.value = item
  emit('update:modelValue', item)
  plotObjects.forEach(({id, polygon, data}) => {
    const sel = id === item.id
    try {
      polygon.options.set({
        fillColor: getFillColor(data, sel),
        strokeColor: getStrokeColor(data, sel),
        strokeWidth: strokeWidth(sel),
        zIndex: sel ? 12 : 10,
        cursor: 'pointer',
      })
    } catch (e) { /* ignore per-polygon failures */
    }
  })
}

/* ========== Lifecycle ========== */
onMounted(async () => {
  try {
    await initMap()
  } catch (error) {
    console.error('Ошибка при инициализации карты:', error)
    const {$toast} = useNuxtApp()
    if ($toast && typeof $toast.error === 'function') {
      $toast.error('Не удалось загрузить карту: ' + (error.message || 'ошибка'))
    }
  }
})

onBeforeUnmount(() => {
  unwatchers.forEach(u => {
    try {
      u()
    } catch {
    }
  })
  try {
    if (map) {
      // try remove geoObjects to be safe
      try {
        map.geoObjects.removeAll()
      } catch {
      }
      map.destroy()
    }
  } catch (e) { /* ignore */
  }
  map = null
  cemeteryPolygon = null
  plotObjects = []
})
</script>
