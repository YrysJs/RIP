<script setup>
import { onMounted, ref, watch, computed } from 'vue'

const props = defineProps({
  polygons: {
    type: [Array, Object], // поддержка ref([]) и обычного []
    required: true,
  },
  modelValue: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const mapContainerId = 'map-container'
const mapInstance = ref(null)
const polygonObjects = ref([])

const selected = ref(null)

onMounted(() => {
  const checkDG = setInterval(() => {
    if (window.DG) {
      clearInterval(checkDG)
      initializeMap()
    }
  }, 100)
})

function getPolygons() {
  return Array.isArray(props.polygons) ? props.polygons : props.polygons.value
}

function initializeMap() {
  const items = getPolygons()
  const first = items[0]?.polygon_data?.coordinates?.[0]
  const center = first ? [first[1], first[0]] : [43.238949, 76.889709]

  mapInstance.value = DG.map(mapContainerId, {
    center,
    zoom: 18,
  })

  drawPolygons()
}

function drawPolygons() {
  const items = getPolygons()

  items.forEach((item) => {
    const latlngs = item.polygon_data.coordinates.map(([lng, lat]) => [lat, lng])

    const isSelected = selected.value?.id === item.id

    const polygon = DG.polygon(latlngs, {
      color: isSelected ? '#0066CC' : '#006600', // обводка
      weight: isSelected ? 3 : 1,
      fillColor: getFillColor(item, isSelected),
      fillOpacity: 0.7,
    }).addTo(mapInstance.value)

    polygon.on('click', () => {
      selectPolygon(item)
    })

    polygonObjects.value.push({
      id: item.id,
      polygon,
      data: item,
    })
  })
}

function getFillColor(item, isSelected) {
  if (isSelected) return '#43DC49CC'
  if (item.status === 'free') return '#66FF99'
  if (item.status === 'reserved') return '#FFD700'
  if (item.status === 'occupied') return '#CC0000'
  return '#999999'
}

function selectPolygon(item) {
  selected.value = item
  emit('update:modelValue', item)

  polygonObjects.value.forEach(({ id, polygon, data }) => {
    const isSel = id === item.id
    polygon.setStyle({
      fillColor: getFillColor(data, isSel),
      color: isSel ? '#38949B' : null,
      weight: isSel ? 3 : 1,
    })
  })
}
</script>

<template>
  <div :id="mapContainerId" style="width: 100%; height: 600px;"></div>
</template>
