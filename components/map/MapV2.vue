<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRuntimeConfig } from '#imports'

const props = defineProps({
  polygons: { type: [Array, Object], required: true },   // ref([]) или []
  modelValue: { type: Object, default: null },
  cemeteryBoundary: { type: Object, default: null },     // { polygon_data: { coordinates: [[lng,lat], ...] } }
  centerCoords: { type: Array, default: null },          // [lat, lng]
})
const emit = defineEmits(['update:modelValue'])

const mapEl = ref(null)
let map = null
let cemeteryPolygon = null
let plotObjects = []     // [{ id, polygon, data }]
const selected = ref(props.modelValue || null)

/* ===== utils ===== */
const getItems = () => (Array.isArray(props.polygons) ? props.polygons : (props.polygons?.value || []))

function toLatLng(ring) {
  // ymaps 2.1 ждёт [lat, lng] !
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

/* ===== loader для Yandex Maps API 2.1 ===== */
async function loadYMaps21(apiKey, lang='ru_RU') {
  if (window.ymaps && window.ymaps.load) {
    await window.ymaps.load()
    return window.ymaps
  }
  await new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(apiKey)}&lang=${lang}`
    s.async = true
    s.onload = resolve
    s.onerror = () => reject(new Error('Failed to load Yandex Maps API 2.1'))
    document.head.appendChild(s)
  })
  await window.ymaps.load()
  return window.ymaps
}

/* ===== инициализация карты и слоёв ===== */
function initialCenter() {
  const items = getItems()
  if (Array.isArray(props.centerCoords) && props.centerCoords.length === 2) {
    const [lat, lng] = props.centerCoords
    return [lat, lng] // в 2.1 — [lat, lng]
  }
  const ring = props.cemeteryBoundary?.polygon_data?.coordinates
  if (isRing(ring)) {
    const s = ring.reduce((a, [L,A]) => ({ lng: a.lng + L, lat: a.lat + A }), { lng: 0, lat: 0 })
    return [s.lat / ring.length, s.lng / ring.length]
  }
  const first = items?.[0]?.polygon_data?.coordinates?.[0]
  if (Array.isArray(first)) return [first[1], first[0]]
  return [43.238949, 76.889709] // [lat, lng]
}

async function initMap() {
  const cfg = useRuntimeConfig()
  const API_KEY = cfg.public?.yandexMapApiKey || cfg.public?.yandexMaps?.apikey
  if (!API_KEY) throw new Error('public.yandexMapApiKey not found')

  const ymaps = await loadYMaps21(API_KEY, 'ru_RU')

  map = new ymaps.Map(mapEl.value, {
    center: initialCenter(), // [lat,lng]
    zoom: props.centerCoords ? 15 : (props.cemeteryBoundary ? 14 : 18),
    controls: [],
  }, {
    suppressMapOpenBlock: true,
  })

  // граница кладбища
  drawCemetery()

  // участки
  drawPlots()

  // вотчеры
  unwatchers.push(
      watch(() => props.cemeteryBoundary, () => { redrawCemetery() }, { deep: true }),
      watch(() => props.polygons, () => { redrawPlots() }, { deep: true }),
      watch(() => props.centerCoords, (v) => {
        if (Array.isArray(v) && v.length === 2 && map) {
          map.setCenter([v[0], v[1]], 15)
        }
      })
  )
}

/* ===== граница кладбища ===== */
function drawCemetery() {
  const ymaps = window.ymaps
  if (cemeteryPolygon) {
    try { map.geoObjects.remove(cemeteryPolygon) } catch {}
    cemeteryPolygon = null
  }
  const ring = props.cemeteryBoundary?.polygon_data?.coordinates
  if (!isRing(ring)) return
  cemeteryPolygon = new ymaps.Polygon([ toLatLng(ring) ], {}, {
    fillColor: 'rgba(0,0,0,0)',
    strokeColor: '#FF0000',
    strokeWidth: 3,
    zIndex: 1,
    cursor: 'default',
  })
  map.geoObjects.add(cemeteryPolygon)
}
const redrawCemetery = () => drawCemetery()

/* ===== участки ===== */
function clearPlots() {
  plotObjects.forEach(p => {
    try { map.geoObjects.remove(p.polygon) } catch {}
  })
  plotObjects = []
}

function drawPlots() {
  const ymaps = window.ymaps
  const items = getItems()

  items.forEach(item => {
    const ring = item?.polygon_data?.coordinates
    if (!isRing(ring)) return

    const isSel = !!(selected.value && selected.value.id === item.id)
    const polygon = new ymaps.Polygon([ toLatLng(ring) ], {}, {
      fillColor: getFillColor(item, isSel),
      strokeColor: getStrokeColor(item, isSel),
      strokeWidth: strokeWidth(isSel),
      zIndex: 10,
      cursor: 'pointer',
      // делаем «щедрый» хитбокс по контуру
      strokeStyle: isSel ? 'solid' : 'solid',
    })

    polygon.events.add('click', () => selectPlot(item))
    map.geoObjects.add(polygon)

    plotObjects.push({ id: item.id, polygon, data: item })
  })
}

function redrawPlots() {
  clearPlots()
  drawPlots()
}

/* ===== выбор и подсветка ===== */
function selectPlot(item) {
  selected.value = item
  emit('update:modelValue', item)
  plotObjects.forEach(({ id, polygon, data }) => {
    const sel = id === item.id
    polygon.options.set({
      fillColor: getFillColor(data, sel),
      strokeColor: getStrokeColor(data, sel),
      strokeWidth: strokeWidth(sel),
      zIndex: sel ? 12 : 10,
      cursor: 'pointer',
    })
  })
}

/* ===== lifecycle ===== */
const unwatchers = []
onMounted(async () => { 
  try {
    await initMap()
  } catch (error) {
    console.error('Ошибка при инициализации карты:', error)
    const { $toast } = useNuxtApp()
    $toast.error('Сервер не доступен')
  }
})
onBeforeUnmount(() => {
  unwatchers.forEach(u => { try { u() } catch {} })
  try { if (map) map.destroy() } catch {}
  map = null
})
</script>

<template>
  <ClientOnly>
    <div ref="mapEl" style="width:100%; height:600px;"></div>
  </ClientOnly>
</template>
