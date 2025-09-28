<script setup>
import { ref, computed, watch } from 'vue'
import {
  YandexMap,
  YandexMapDefaultSchemeLayer,
  YandexMapDefaultFeaturesLayer,
  YandexMapFeature,
  getCenterFromCoords
} from 'vue-yandex-maps'

const props = defineProps({
  polygons: { type: [Array, Object], required: true },     // список участков
  modelValue: { type: Object, default: null },             // выбранный участок
  cemeteryBoundary: { type: Object, default: null },       // граница кладбища
  centerCoords: { type: Array, default: null },            // [lat, lng]
})
const emit = defineEmits(['update:modelValue'])

const polygonsList = computed(() =>
    Array.isArray(props.polygons) ? props.polygons : (props.polygons && props.polygons.value) || []
)

// ===== центр/зум (ymaps3: [lng, lat]) =====
const DEFAULT_CENTER = [76.889709, 43.238949]
const center = ref(DEFAULT_CENTER)
const zoom = ref(18)

function computeInitialCenter () {
  if (Array.isArray(props.centerCoords) && props.centerCoords.length === 2) {
    const [lat, lng] = props.centerCoords
    return [lng, lat]
  }
  const boundary = props.cemeteryBoundary?.polygon_data?.coordinates
  if (Array.isArray(boundary) && boundary.length) {
    try {
      return getCenterFromCoords(boundary) // возвращает [lng,lat]
    } catch {
      const sum = boundary.reduce((acc, [lng, lat]) => ({ lng: acc.lng + lng, lat: acc.lat + lat }), { lng: 0, lat: 0 })
      return [sum.lng / boundary.length, sum.lat / boundary.length]
    }
  }
  const first = polygonsList.value?.[0]?.polygon_data?.coordinates?.[0]
  if (Array.isArray(first) && first.length === 2) return [first[0], first[1]]
  return DEFAULT_CENTER
}
center.value = computeInitialCenter()
zoom.value = props.centerCoords ? 15 : (props.cemeteryBoundary ? 14 : 5)

watch(() => props.centerCoords, v => {
  if (Array.isArray(v) && v.length === 2) {
    center.value = [v[1], v[0]]
    zoom.value = 15
  }
})

// ===== выбор полигона =====
const selected = ref(props.modelValue || null)
watch(() => props.modelValue, v => { selected.value = v })
function selectPolygon (item) {
  selected.value = item
  emit('update:modelValue', item)
}

// ===== стили =====
function getFillColor (item, isSelected) {
  if (isSelected && item.status === 'free') return 'rgba(67,220,73,0.8)'
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
function getStrokeWidth (isSelected) {
  return isSelected ? 4 : 1
}

// ===== helpers =====
function toPolygonGeometry (coords) {
  if (!Array.isArray(coords) || !coords.length) return undefined
  return { type: 'Polygon', coordinates: [ coords ] } // [[ [lng,lat], ... ]]
}

const cemeteryFeature = computed(() => {
  const coords = props.cemeteryBoundary?.polygon_data?.coordinates
  const geometry = toPolygonGeometry(coords)
  if (!geometry) return null
  return {
    id: 'cemetery-boundary',
    geometry,
    style: {
      fill: 'rgba(0,0,0,0)',
      stroke: [{ color: '#FF0000', width: 3 }]
    }
  }
})

const polygonFeatures = computed(() =>
    polygonsList.value
        .filter(item => Array.isArray(item?.polygon_data?.coordinates) && item.polygon_data.coordinates.length)
        .map(item => {
          const geometry = toPolygonGeometry(item.polygon_data.coordinates)
          const isSel = !!(selected.value && selected.value.id === item.id)
          return {
            id: item.id ?? Math.random(),
            raw: item,
            settings: {
              geometry,
              style: {
                fill: getFillColor(item, isSel),
                stroke: [{ color: getStrokeColor(item, isSel), width: getStrokeWidth(isSel) }]
              }
            }
          }
        })
)
</script>

<template>
  <ClientOnly>
    <YandexMap :settings="{ location: { center, zoom } }" style="width:100%; height:600px;">
      <YandexMapDefaultSchemeLayer />
      <YandexMapDefaultFeaturesLayer />

      <YandexMapFeature v-if="cemeteryFeature" :settings="cemeteryFeature" />

      <YandexMapFeature
          v-for="f in polygonFeatures"
          :key="f.id"
          :settings="f.settings"
          @click="selectPolygon(f.raw)"
      />
    </YandexMap>
  </ClientOnly>
</template>
