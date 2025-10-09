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
  polygons: { type: [Array, Object], required: true },
  modelValue: { type: Object, default: null },
  cemeteryBoundary: { type: Object, default: null },
  centerCoords: { type: Array, default: null },
})
const emit = defineEmits(['update:modelValue'])

/* ========== Local refs/state ========== */
const mapEl = ref(null)
let map = null
let cemeteryPolygon = null
let plotObjects = []
const selected = ref(props.modelValue || null)
const unwatchers = []

/* Resize / DOM helpers (for cleanup) */
let _resizeHandler = null
let _resizeObserver = null
let _mutationObserver = null

/* ========== Utilities ========== */
const getItems = () => (Array.isArray(props.polygons) ? props.polygons : (props.polygons?.value || []))

function toLatLng(ring) {
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
  if (window.ymaps && typeof window.ymaps.Map === 'function') return window.ymaps

  if (window.ymaps && typeof window.ymaps.load === 'function') {
    try {
      const ym = await window.ymaps.load()
      return ym || window.ymaps
    } catch (err) {
      console.warn('ymaps.load() rejected, will try re-injecting script', err)
    }
  }

  const srcPrefix = 'https://api-maps.yandex.ru/2.1/'
  const existing = Array.from(document.getElementsByTagName('script'))
      .find(s => s.src && s.src.startsWith(srcPrefix))

  const desiredSrc = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(apiKey)}&lang=${lang}`

  if (existing) {
    if (window.ymaps && typeof window.ymaps.load === 'function') {
      const ym = await window.ymaps.load()
      return ym || window.ymaps
    }
    await new Promise(res => setTimeout(res, 300))
    if (window.ymaps && typeof window.ymaps.Map === 'function') return window.ymaps
    throw new Error('Yandex Maps script present but ymaps not ready')
  }

  await new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = desiredSrc
    s.async = true
    s.defer = true
    s.onload = () => resolve(true)
    s.onerror = () => reject(new Error('Failed to load Yandex Maps API 2.1'))
    document.head.appendChild(s)
  })

  if (window.ymaps && typeof window.ymaps.load === 'function') {
    const ym = await window.ymaps.load()
    return ym || window.ymaps
  }

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
  return [43.238949, 76.889709]
}

/* ======= helper: wait for element to exist in DOM and be connected ======= */
function waitForElement(refGetter, timeout = 5000) {
  return new Promise((resolve) => {
    const start = Date.now()
    const pollInterval = 100

    function check() {
      try {
        const el = refGetter?.()
        if (el && (el.isConnected === undefined || el.isConnected) ) {
          resolve(el)
          return
        }
      } catch {}
      if (Date.now() - start >= timeout) {
        resolve(null)
        return
      }
      setTimeout(check, pollInterval)
    }

    check()

    // additionally observe DOM mutations to wake up earlier if element is added
    try {
      if (typeof MutationObserver !== 'undefined') {
        _mutationObserver = new MutationObserver(() => {
          const el = refGetter?.()
          if (el && (el.isConnected === undefined || el.isConnected)) {
            try { _mutationObserver.disconnect() } catch {}
            _mutationObserver = null
            resolve(el)
          }
        })
        _mutationObserver.observe(document.documentElement || document.body, { childList: true, subtree: true })
      }
    } catch (e) {
      // ignore
    }
  })
}

/* ======= helper: wait until element has non-zero size (returns true/false) ======= */
function waitForNonZeroSizeSafe(el, timeout = 2500) {
  return new Promise((resolve) => {
    if (!el) return resolve(false)

    const rect = el.getBoundingClientRect?.()
    if (rect && rect.width > 0 && rect.height > 0) return resolve(true)

    let resolved = false
    let ro = null
    try {
      ro = new ResizeObserver(entries => {
        for (const entry of entries) {
          const cr = entry.contentRect || entry.target.getBoundingClientRect()
          if (cr && cr.width > 0 && cr.height > 0) {
            if (!resolved) {
              resolved = true
              try { ro.disconnect() } catch {}
              clearTimeout(timer)
              resolve(true)
            }
            return
          }
        }
      })
      ro.observe(el)
    } catch (e) {
      // ResizeObserver not available — we'll fall back to polling
    }

    const pollInterval = 150
    const start = Date.now()
    const poll = setInterval(() => {
      const r = el.getBoundingClientRect?.()
      if (r && r.width > 0 && r.height > 0) {
        if (!resolved) {
          resolved = true
          try { if (ro) ro.disconnect() } catch {}
          clearInterval(poll)
          clearTimeout(timer)
          resolve(true)
        }
      }
      if (Date.now() - start >= timeout) {
        if (!resolved) {
          resolved = true
          try { if (ro) ro.disconnect() } catch {}
          clearInterval(poll)
          clearTimeout(timer)
          resolve(false)
        }
      }
    }, pollInterval)

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true
        try { if (ro) ro.disconnect() } catch {}
        clearInterval(poll)
        resolve(false)
      }
    }, timeout)
  })
}

/* ========== Map initialization with robust waiting and retries ========== */
async function initMap() {
  const cfg = useRuntimeConfig()
  const API_KEY = cfg.public?.yandexMapApiKey || cfg.public?.yandexMaps?.apikey
  if (!API_KEY) throw new Error('public.yandexMapApiKey not found')

  await nextTick()

  const ymaps = await loadYMaps21(API_KEY, 'ru_RU')
  if (!ymaps || typeof ymaps.Map !== 'function') {
    throw new Error('ymaps namespace is present but does not expose Map constructor')
  }

  // destroy prev map if any
  try { if (map) { map.destroy(); map = null } } catch (e) {}

  const maxAttempts = 6
  let lastErr = null
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Ждём появления элемента (короткий таймаут)
      const el = await waitForElement(() => mapEl.value, 1200)
      if (!el) {
        // элемент не появился — пробуем ещё раз (в следующих итерациях)
        throw new Error('mapEl not present before attempt')
      }

      // Дополнительно дождёмся ненулевого размера (короткий)
      await waitForNonZeroSizeSafe(el, 900)

      // Попытка создать карту
      map = new ymaps.Map(el, {
        center: initialCenter(),
        zoom: props.centerCoords ? 18 : (props.cemeteryBoundary ? 20 : 18),
        controls: [],
      }, {
        suppressMapOpenBlock: true,
      })

      // Успешно — выходим из цикла
      break
    } catch (e) {
      lastErr = e
      // Если элемент исчез в процессе — не бросаем окончательно, делаем backoff и ретрай
      if (attempt < maxAttempts) {
        const backoff = 120 * attempt + 80
        await new Promise(res => setTimeout(res, backoff))
        continue
      }
    }
  }

  if (!map) {
    throw new Error('Failed to construct ymaps.Map: ' + (lastErr?.message || lastErr || 'unknown error'))
  }

  try { map.container.fitToViewport() } catch (e) { console.warn('fitToViewport failed', e) }

  // стандартный resize/observer/рисование
  _resizeHandler = () => { try { if (map) map.container.fitToViewport() } catch {} }
  window.addEventListener('resize', _resizeHandler)
  try {
    _resizeObserver = new ResizeObserver(() => { try { if (map) map.container.fitToViewport() } catch {} })
    _resizeObserver.observe(mapEl.value)
  } catch (e) {}
  drawCemetery()
  drawPlots()

  // watchers
  unwatchers.push(
      watch(() => props.cemeteryBoundary, () => { redrawCemetery() }, { deep: true }),
      watch(() => props.polygons, () => { redrawPlots() }, { deep: true }),
      watch(() => props.centerCoords, (v) => {
        if (Array.isArray(v) && v.length === 2 && map) {
          try { map.setCenter([v[0], v[1]], 15) } catch {}
        }
      })
  )
}

/* ========== Cemetery boundary ========== */
function drawCemetery() {
  const ymaps = window.ymaps
  if (!map || !ymaps) return

  if (cemeteryPolygon) {
    try { map.geoObjects.remove(cemeteryPolygon) } catch {}
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
  try { map.geoObjects.add(cemeteryPolygon) } catch (e) { console.warn('Failed to add cemetery polygon', e) }
}
const redrawCemetery = () => drawCemetery()

/* ========== Plots handling ========== */
function clearPlots() {
  plotObjects.forEach(p => {
    try { map.geoObjects.remove(p.polygon) } catch {}
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
    try { map.geoObjects.add(polygon) } catch (e) { console.warn('Failed to add plot polygon', e) }

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
    } catch (e) {}
  })
}

/* ========== Lifecycle ========== */
onMounted(async () => {
  try {
    await initMap()
  } catch (error) {
    // show toast only if map never got created
    if (!map) {
      console.error('Ошибка при инициализации карты:', error)
    } else {
      console.warn('Init map reported error but map exists:', error)
    }
  }
})

onBeforeUnmount(() => {
  // remove watchers
  unwatchers.forEach(u => { try { u() } catch {} })
  unwatchers.length = 0

  // mutation observer
  try { if (_mutationObserver) { _mutationObserver.disconnect(); _mutationObserver = null } } catch {}

  // resize observer/handler
  try { if (_resizeObserver) { _resizeObserver.disconnect(); _resizeObserver = null } } catch {}
  try { if (_resizeHandler) { window.removeEventListener('resize', _resizeHandler); _resizeHandler = null } } catch {}

  // destroy map
  try {
    if (map) {
      try { map.geoObjects.removeAll() } catch {}
      try { map.destroy() } catch {}
    }
  } catch (e) {}

  map = null
  cemeteryPolygon = null
  plotObjects = []
})
</script>
