<script setup>
/**
 * Замена 2ГИС-компонента на Яндекс.Карты (JS API 2.1) с тем же поведением:
 * - Клик по карте добавляет точку (синяя метка) и строит полигон.
 * - "Завершить рисование" — эмитит 'complete' с points (в формате [lng,lat]) и center ([lat,lng]).
 * - Поддержка initialPolygon: если передан (минимум 3 точки [lat,lng]), рисуем его сразу и блокируем добавление точек.
 * - "Очистить карту" — удаляет метки и полигон, снова позволяет клики.
 *
 * Зависимости не требуются: скрипт Yandex Maps 2.1 грузим динамически.
 */
import {ref, reactive, onMounted, onBeforeUnmount, watch} from 'vue'
import {useRuntimeConfig} from '#imports'

const props = defineProps({
  initialPolygon: {
    type: Array,
    default: () => [], // формат: [[lat, lng], ...]
  },
})
const emit = defineEmits(['complete'])

const mapContainer = ref(null)
let mapInstance = null

// точки в формате [lat, lng] — как и в исходном 2ГИС-компоненте
const points = reactive([])

// маркеры — массив ymaps.Placemark
let markers = []

// полигон ymaps.Polygon
let polygon = null

const drawingFinished = ref(false)

/* ============== Loader API 2.1 ============== */
async function loadYMaps21(apiKey, lang = 'ru_RU') {
  if (window.ymaps && typeof window.ymaps.load === 'function') {
    await window.ymaps.load()
    return window.ymaps
  }
  await new Promise((resolve, reject) => {
    const s = document.createElement('script')
    // ключ можно задавать в runtimeConfig.public.yandexMapApiKey
    const keyParam = apiKey ? `apikey=${encodeURIComponent(apiKey)}&` : ''
    s.src = `https://api-maps.yandex.ru/2.1/?${keyParam}lang=${lang}`
    s.async = true
    s.onload = resolve
    s.onerror = () => reject(new Error('Failed to load Yandex Maps API 2.1'))
    document.head.appendChild(s)
  })
  await window.ymaps.load()
  return window.ymaps
}

/* ============== Инициализация карты ============== */
onMounted(async () => {
  const cfg = useRuntimeConfig()
  const apiKey = cfg.public?.yandexMapApiKey || cfg.public?.yandexMaps?.apikey || '' // можно без ключа локально

  const ymaps = await loadYMaps21(apiKey, 'ru_RU')

  mapInstance = new ymaps.Map(mapContainer.value, {
    center: getInitialCenter(), // [lat, lng]
    zoom: props.initialPolygon?.length >= 3 ? 17 : 13,
    controls: [],
  }, {
    suppressMapOpenBlock: true,
  })

  if (props.initialPolygon && props.initialPolygon.length >= 3) {
    drawInitialPolygon()
  } else {
    mapInstance.events.add('click', onMapClick)
  }
})

onBeforeUnmount(() => {
  try {
    if (mapInstance) mapInstance.destroy()
  } catch {
  }
  mapInstance = null
})

/* ============== Вспомогательные ============== */
function getInitialCenter() {
  if (Array.isArray(props.initialPolygon) && props.initialPolygon.length >= 1) {
    const [lat, lng] = props.initialPolygon[0]
    return [lat, lng]
  }
  // дефолт (Алматы)
  return [43.237649, 76.893601]
}

function addMarker(latlng) {
  const ymaps = window.ymaps
  const placemark = new ymaps.Placemark(latlng, {}, {
    preset: 'islands#blueCircleDotIcon',
    iconColor: '#1E90FF',
  })
  mapInstance.geoObjects.add(placemark)
  markers.push(placemark)
}

function buildOrUpdatePolygon() {
  const ymaps = window.ymaps
  if (points.length < 3) return

  const coords = [points.slice()] // Polygon в 2.1 ждёт массив контуров [ [ [lat,lng], ... ] ]

  if (!polygon) {
    polygon = new ymaps.Polygon(coords, {}, {
      fillColor: 'rgba(0,128,0,0.5)',
      strokeColor: '#008000',
      strokeWidth: 2,
      interactivityModel: 'default#geoObject',
      zIndex: 10,
      cursor: 'pointer',
    })
    mapInstance.geoObjects.add(polygon)
  } else {
    polygon.geometry.setCoordinates(coords)
  }
}

/* ============== Первичная отрисовка initialPolygon ============== */
function drawInitialPolygon() {
  if (!Array.isArray(props.initialPolygon) || props.initialPolygon.length < 3) return

  // initialPolygon приходит как [lat,lng] — оставляем как есть (API 2.1 тоже [lat,lng])
  props.initialPolygon.forEach(([lat, lng]) => {
    const latlng = [lat, lng]
    points.push(latlng)
    addMarker(latlng)
  })

  buildOrUpdatePolygon()
  drawingFinished.value = true
}

/* ============== Обработчики ============== */
function onMapClick(e) {
  if (drawingFinished.value) return
  const coords = e.get('coords') // [lat, lng]
  points.push(coords)
  addMarker(coords)

  if (points.length >= 3) {
    buildOrUpdatePolygon()
  }
}

function finishDrawing() {
  if (points.length < 3) return
  drawingFinished.value = true

  // снимаем обработчик клика
  try {
    mapInstance.events.remove('click', onMapClick)
  } catch {
  }

  // центр (среднее)
  const count = points.length
  const centerLat = points.reduce((sum, p) => sum + p[0], 0) / count
  const centerLng = points.reduce((sum, p) => sum + p[1], 0) / count

  // points для сервера — в формате [lng, lat], как в исходном компоненте
  const serverPoints = points.map(([lat, lng]) => [lng, lat])

  emit('complete', {
    points: serverPoints,
    center: [centerLat, centerLng],
  })
}

function clearMap() {
  const ymaps = window.ymaps
  // удалить маркеры
  markers.forEach(m => {
    try {
      mapInstance.geoObjects.remove(m)
    } catch {
    }
  })
  markers = []

  // удалить полигон
  if (polygon) {
    try {
      mapInstance.geoObjects.remove(polygon)
    } catch {
    }
    polygon = null
  }

  // очистить массив точек
  points.splice(0, points.length)

  // снова разрешить рисование
  drawingFinished.value = false
  mapInstance.events.add('click', onMapClick)
}

/* ============== Слежение (на случай динамической смены initialPolygon) ============== */
watch(() => props.initialPolygon, (v) => {
  if (drawingFinished.value) return
  if (Array.isArray(v) && v.length >= 3 && !polygon) {
    drawInitialPolygon()
  }
}, {deep: true})
</script>

<template>
  <div ref="mapContainer" style="width: 100%; height: 400px; margin-bottom: 24px;"></div>

  <button v-if="!drawingFinished" @click="finishDrawing" :disabled="points.length < 3">
    {{ $t('map.finishDrawing') }}
  </button>

  <button v-if="drawingFinished" @click="clearMap">
    {{ $t('map.clearMap') }}
  </button>
</template>
