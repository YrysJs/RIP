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
  neighborGrave: { type: Object, default: null },
  cemeteryBoundary: { type: Object, default: null },
  centerCoords: { type: Array, default: null },
  cemeteries: { type: Array, default: () => [] }, // список всех кладбищ для маркеров
})
const emit = defineEmits([
  'update:modelValue',
  'update:neighborGrave',
  'mapBoundsChanged', // добавили для передачи координат карты
  'cemeterySelected', // событие выбора кладбища
  'cemeteryDeselected', // событие сброса выбора кладбища
  'occupiedGraveClicked', // событие клика по занятой могиле
])

/* ========== Local refs/state ========== */
const mapEl = ref(null)
let map = null
let cemeteryPolygon = null
let plotObjects = []
let cemeteryMarkers = [] // маркеры кладбищ
let wasShowingMarkers = false // отслеживаем показ маркеров
let occupiedGraveClickCounts = {} // счетчики кликов по занятым могилам
const selected = ref(props.modelValue || null)
const neighborSelected = ref(props.neighborGrave || null)
const unwatchers = []

/* Resize / DOM helpers */
let _resizeHandler = null
let _resizeObserver = null
let _mutationObserver = null

/* ========== Utilities ========== */
const getItems = () => (Array.isArray(props.polygons) ? props.polygons : (props.polygons?.value || []))
function toLatLng(ring) { return (Array.isArray(ring) ? ring : []).map(([lng, lat]) => [lat, lng]) }
const isRing = (ring) => Array.isArray(ring) && ring.length >= 3 && ring.every(p => Array.isArray(p) && p.length === 2)

/* ======== вычисление соседних могил ======== */
function getNeighborGraves(selectedGrave) {
  if (!selectedGrave) return []
  const items = getItems()
  const row = selectedGrave.row_number
  const num = parseInt(selectedGrave.grave_number)
  if (!row || isNaN(num)) return []
  return items.filter(item =>
      item.row_number === row &&
      (parseInt(item.grave_number) === num + 1 || parseInt(item.grave_number) === num - 1)
  )
}

/* ======== Цвета и стили ======== */
function getFillColor(item, isSelected, isNeighbor) {
  if (isNeighbor && item.status === 'free') return '#007BFFAA'
  if (isNeighbor) return '#FFA500AA'
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

function getStrokeColor(item, isSelected, isNeighbor) {
  if (isNeighbor && item.status === 'free') return '#007BFF'
  if (isNeighbor) return '#FF8C00'
  if (!isSelected) return '#006600'
  return item.status === 'free' ? '#38949B' : 'gray'
}
const strokeWidth = (isSelected) => (isSelected ? 4 : 1)

/* ========== Robust loader for Yandex Maps 2.1 ========== */
async function loadYMaps21(apiKey, lang = 'ru_RU') {
  if (!apiKey) throw new Error('Yandex Maps API key required')
  if (window.ymaps && typeof window.ymaps.Map === 'function') return window.ymaps

  function waitForYmapsReady(timeout = 5000, poll = 150) {
    return new Promise(resolve => {
      const start = Date.now()
      const iv = setInterval(() => {
        if (window.ymaps && (typeof window.ymaps.Map === 'function' || typeof window.ymaps.load === 'function')) {
          clearInterval(iv)
          resolve(true)
          return
        }
        if (Date.now() - start >= timeout) {
          clearInterval(iv)
          resolve(false)
        }
      }, poll)
    })
  }

  const desiredSrc = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(apiKey)}&lang=${lang}`
  await new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = desiredSrc
    s.async = true
    s.defer = true
    s.onload = () => resolve(true)
    s.onerror = () => reject(new Error('Failed to load Yandex Maps API 2.1'))
    document.head.appendChild(s)
  })

  const ok = await waitForYmapsReady(10000, 200)
  if (!ok) throw new Error('Yandex Maps did not initialize correctly')
  return window.ymaps
}

/* ========== Center calculation ========== */
function initialCenter() {
  // Если есть конкретные координаты центра (выбранное кладбище)
  if (Array.isArray(props.centerCoords) && props.centerCoords.length === 2) {
    const [lat, lng] = props.centerCoords
    return [lat, lng]
  }
  
  // Если есть границы кладбища
  const ring = props.cemeteryBoundary?.polygon_data?.coordinates
  if (isRing(ring)) {
    const s = ring.reduce((a, [L, A]) => ({ lng: a.lng + L, lat: a.lat + A }), { lng: 0, lat: 0 })
    return [s.lat / ring.length, s.lng / ring.length]
  }
  
  // Если есть кладбища, центрируем карту чтобы показать все кладбища
  if (props.cemeteries && props.cemeteries.length > 0) {
    const coords = props.cemeteries.map(cemetery => {
      if (cemetery.location_coords && Array.isArray(cemetery.location_coords) && cemetery.location_coords.length === 2) {
        return cemetery.location_coords
      }
      return null
    }).filter(Boolean)
    
    if (coords.length > 0) {
      // Вычисляем центр всех кладбищ
      const centerLat = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length
      const centerLng = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length
      return [centerLat, centerLng]
    }
  }
  
  // Дефолтный центр (Алматы)
  return [43.238949, 76.889709]
}

/* ========== Emit map bounds ========== */
function emitBounds() {
  if (!map) return
  try {
    const bounds = map.getBounds()
    if (Array.isArray(bounds) && bounds.length === 2) {
      const [sw, ne] = bounds
      const payload = {
        southWest: { lat: sw[0], lng: sw[1] },
        northEast: { lat: ne[0], lng: ne[1] },
        northWest: { lat: ne[0], lng: sw[1] },
        southEast: { lat: sw[0], lng: ne[1] },
      }
      emit('mapBoundsChanged', payload)
    }
  } catch (e) {
    console.warn('emitBounds error', e)
  }
}

/* ========== Map initialization ========== */
async function initMap() {
  const cfg = useRuntimeConfig()
  const API_KEY = cfg.public?.yandexMapApiKey || cfg.public?.yandexMaps?.apikey
  if (!API_KEY) throw new Error('public.yandexMapApiKey not found')

  await nextTick()
  const ymaps = await loadYMaps21(API_KEY, 'ru_RU')
  if (!ymaps || typeof ymaps.Map !== 'function') throw new Error('ymaps not ready')

  try { if (map) { map.destroy(); map = null } } catch {}

  const el = mapEl.value
  map = new ymaps.Map(el, {
    center: initialCenter(),
    zoom: props.cemeteryBoundary?.id ? 18 : 12, // зум 12 для общего обзора, 18 для выбранного кладбища
    controls: [],
  }, { suppressMapOpenBlock: true })

  try { map.container.fitToViewport() } catch {}

  _resizeHandler = () => { try { map?.container.fitToViewport() } catch {} }
  window.addEventListener('resize', _resizeHandler)
  try {
    _resizeObserver = new ResizeObserver(() => { try { map?.container.fitToViewport() } catch {} })
    _resizeObserver.observe(mapEl.value)
  } catch {}

  drawCemeteryMarkers()
  // Рисуем границы и могилы только если кладбище выбрано
  if (props.cemeteryBoundary?.id) {
    drawCemetery()
    drawPlots()
  }

  emitBounds()
  map.events.add('boundschange', () => {
    emitBounds()
    // Перерисовываем маркеры при изменении зума
    redrawCemeteryMarkers()
  })

  unwatchers.push(
      watch(() => props.cemeteryBoundary, (newBoundary) => {
        if (newBoundary?.id) {
          redrawCemetery()
          redrawPlots()
        } else {
          // Очищаем границы и могилы при сбросе выбора
          if (cemeteryPolygon) {
            try { map.geoObjects.remove(cemeteryPolygon) } catch {}
            cemeteryPolygon = null
          }
          clearPlots()
        }
        redrawCemeteryMarkers() // перерисовываем маркеры
      }, { deep: true }),
      watch(() => props.polygons, () => {
        if (props.cemeteryBoundary?.id) {
          redrawPlots()
        }
      }, { deep: true }),
      watch(() => props.cemeteries, () => redrawCemeteryMarkers(), { deep: true }),
      watch(() => props.centerCoords, v => {
        if (Array.isArray(v) && v.length === 2 && map) {
          try { map.setCenter([v[0], v[1]], 18) } catch {}
        }
      })
  )
}

/* ========== Cemetery markers ========== */
function clearCemeteryMarkers() {
  if (!map) return
  cemeteryMarkers.forEach(marker => {
    try { if (marker?.marker) map.geoObjects.remove(marker.marker) } catch {}
  })
  cemeteryMarkers = []
  wasShowingMarkers = false
}

function drawCemeteryMarkers() {
  const ymaps = window.ymaps
  if (!map || !ymaps) return
  
  // Показываем маркеры если нет выбранного кладбища или зум меньше 16
  const currentZoom = map.getZoom()
  const shouldShowMarkers = !props.cemeteryBoundary?.id || currentZoom < 16
  
  // Если маркеры начинают показываться и есть выбранное кладбище, сбрасываем выбор
  if (shouldShowMarkers && !wasShowingMarkers && props.cemeteryBoundary?.id) {
    emit('cemeteryDeselected')
  }
  
  // Обновляем состояние
  wasShowingMarkers = shouldShowMarkers
  
  if (!shouldShowMarkers) return
  
  props.cemeteries.forEach(cemetery => {
    if (!cemetery.location_coords || !Array.isArray(cemetery.location_coords) || cemetery.location_coords.length !== 2) {
      return
    }
    
    const [lat, lng] = cemetery.location_coords
    const marker = new ymaps.Placemark([lat, lng], {
      balloonContentHeader: cemetery.name,
      balloonContentBody: `${cemetery.type}<br/>${cemetery.street_name}, ${cemetery.city}`,
      balloonContentFooter: `Свободных мест: ${cemetery.free_spaces || 0}`,
    }, {
      preset: 'islands#circleDotIcon',
      iconColor: '#d1a53f',
      cursor: 'pointer',
    })
    
    marker.events.add('click', () => {
      emit('cemeterySelected', cemetery)
    })
    
    try { map.geoObjects.add(marker) } catch (e) { console.warn('Failed to add cemetery marker', e) }
    cemeteryMarkers.push({ id: cemetery.id, marker, data: cemetery })
  })
}

function redrawCemeteryMarkers() {
  if (!map || !window.ymaps) return
  try {
    clearCemeteryMarkers()
    drawCemeteryMarkers()
  } catch (e) {
    console.warn('Ошибка при перерисовке маркеров кладбищ:', e)
  }
}

/* ========== Cemetery boundary ========== */
function drawCemetery() {
  const ymaps = window.ymaps
  if (!map || !ymaps) return
  
  // Очищаем предыдущие границы
  if (cemeteryPolygon) {
    try { map.geoObjects.remove(cemeteryPolygon) } catch {}
    cemeteryPolygon = null
  }
  
  // Рисуем границы только если кладбище выбрано
  if (!props.cemeteryBoundary?.id) return
  
  const ring = props.cemeteryBoundary?.polygon_data?.coordinates
  if (!isRing(ring)) return
  
  cemeteryPolygon = new ymaps.Polygon([toLatLng(ring)], {}, {
    fillColor: 'rgba(0,0,0,0)',
    strokeColor: '#FF0000',
    strokeWidth: 3,
    zIndex: 1,
    cursor: 'default',
  })
  try { map.geoObjects.add(cemeteryPolygon) } catch {}
}
const redrawCemetery = () => drawCemetery()

/* ========== Plots handling ========== */
function clearPlots() {
  if (!map) return
  plotObjects.forEach(p => {
    try { if (p?.polygon) map.geoObjects.remove(p.polygon) } catch {}
  })
  plotObjects = []
  // Очищаем счетчики кликов при очистке могил
  occupiedGraveClickCounts = {}
}

function drawPlots() {
  const ymaps = window.ymaps
  if (!map || !ymaps) return

  // Рисуем могилы только если кладбище выбрано
  if (!props.cemeteryBoundary?.id) return

  const items = getItems()
  const neighbors = getNeighborGraves(selected.value)

  items.forEach(item => {
    const ring = item?.polygon_data?.coordinates
    if (!isRing(ring)) return
    const isSel = !!(selected.value && selected.value.id === item.id)
    const isNeighbor = neighbors.some(n => n.id === item.id)
    const isNeighborSelected = !!(neighborSelected.value && neighborSelected.value.id === item.id)

    const polygon = new ymaps.Polygon([toLatLng(ring)], {}, {
      fillColor: getFillColor(item, isSel, isNeighbor),
      strokeColor: getStrokeColor(item, isSel || isNeighborSelected, isNeighbor),
      strokeWidth: strokeWidth(isSel || isNeighborSelected),
      zIndex: isSel ? 12 : (isNeighborSelected ? 11 : (isNeighbor ? 10 : 9)),
      cursor: 'pointer',
    })

    polygon.events.add('click', () => {
      if (isNeighbor) selectNeighbor(item)
      else selectPlot(item)
    })

    try { map.geoObjects.add(polygon) } catch (e) { console.warn('Failed to add plot polygon', e) }
    plotObjects.push({ id: item.id, polygon, data: item })
  })
}

function redrawPlots() {
  if (!map || !window.ymaps) return
  try {
    clearPlots()
    drawPlots()
  } catch (e) {
    console.warn('Ошибка при перерисовке могил:', e)
  }
}

/* ========== Selection logic ========== */
function selectPlot(item) {
  if (!item) return
  
  if (item.status === 'occupied') {
    // Обрабатываем клик по занятой могиле
    handleOccupiedGraveClick(item)
    return
  }
  
  if (item.status !== 'free') {
    // нельзя выбрать зарезервированную
    return
  }
  
  if (!map) return
  try {
    selected.value = item
    neighborSelected.value = null
    emit('update:modelValue', item)
    emit('update:neighborGrave', null)
    redrawPlots()
  } catch (e) {
    console.warn('Ошибка при выборе могилы:', e)
  }
}

function handleOccupiedGraveClick(item) {
  // Увеличиваем счетчик кликов для этой могилы
  if (!occupiedGraveClickCounts[item.id]) {
    occupiedGraveClickCounts[item.id] = 0
  }
  occupiedGraveClickCounts[item.id]++
  
  // Отправляем событие с данными могилы и количеством кликов
  emit('occupiedGraveClicked', {
    grave: item,
    clickCount: occupiedGraveClickCounts[item.id]
  })
}

function selectNeighbor(item) {
  if (!map) return
  try {
    neighborSelected.value = item
    emit('update:neighborGrave', item)
    redrawPlots()
  } catch (e) {
    console.warn('Ошибка при выборе соседней могилы:', e)
  }
}

/* ========== Lifecycle ========== */
onMounted(async () => {
  try { await initMap() } catch (e) { console.error('Ошибка при инициализации карты:', e) }
  unwatchers.push(
      watch(() => props.modelValue, v => { selected.value = v; redrawPlots() }),
      watch(() => props.neighborGrave, v => { neighborSelected.value = v; redrawPlots() })
  )
})

onBeforeUnmount(() => {
  unwatchers.forEach(u => { try { u() } catch {} })
  try { _mutationObserver?.disconnect() } catch {}
  try { _resizeObserver?.disconnect() } catch {}
  try { _resizeHandler && window.removeEventListener('resize', _resizeHandler) } catch {}
  try { map?.geoObjects.removeAll(); map?.destroy() } catch {}
  map = null
  cemeteryPolygon = null
  plotObjects = []
  cemeteryMarkers = []
})
</script>
