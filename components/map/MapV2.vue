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
  cemeteryBoundary: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const mapContainerId = 'map-container'
const mapInstance = ref(null)
const polygonObjects = ref([])
const cemeteryBoundaryObject = ref(null)

const selected = ref(null)

onMounted(() => {
  const checkDG = setInterval(() => {
    if (window.DG) {
      clearInterval(checkDG)
      initializeMap()
    }
  }, 100)
})

// Следим за изменениями границ кладбища
watch(() => props.cemeteryBoundary, (newBoundary) => {
  if (mapInstance.value && newBoundary) {
    drawCemeteryBoundary()
  }
}, { deep: true })

// Следим за изменениями полигонов могил
watch(() => props.polygons, () => {
  if (mapInstance.value) {
    clearPolygons()
    drawPolygons()
  }
}, { deep: true })

function getPolygons() {
  return Array.isArray(props.polygons) ? props.polygons : props.polygons.value
}

function initializeMap() {
  const items = getPolygons()
  let center = [43.238949, 76.889709] // дефолтный центр
  
  // Используем координаты границ кладбища для центрирования карты
  if (props.cemeteryBoundary?.polygon_data?.coordinates?.length > 0) {
    const coords = props.cemeteryBoundary.polygon_data.coordinates[0]
    center = [coords[1], coords[0]]
  } else if (items.length > 0) {
    const first = items[0]?.polygon_data?.coordinates?.[0]
    if (first) {
      center = [first[1], first[0]]
    }
  }

  mapInstance.value = DG.map(mapContainerId, {
    center,
    zoom: 18,
  })

  if (props.cemeteryBoundary) {
    drawCemeteryBoundary()
  }
  
  drawPolygons()
}

function drawCemeteryBoundary() {
  // Удаляем предыдущие границы кладбища
  if (cemeteryBoundaryObject.value) {
    mapInstance.value.removeLayer(cemeteryBoundaryObject.value)
  }

  if (!props.cemeteryBoundary?.polygon_data?.coordinates) return

  const latlngs = props.cemeteryBoundary.polygon_data.coordinates.map(([lng, lat]) => [lat, lng])

  cemeteryBoundaryObject.value = DG.polygon(latlngs, {
    color: '#FF0000', // красная обводка для границ кладбища
    weight: 3,
    fillColor: 'transparent',
    fillOpacity: 0,
  }).addTo(mapInstance.value)
}

function clearPolygons() {
  polygonObjects.value.forEach(({ polygon }) => {
    mapInstance.value.removeLayer(polygon)
  })
  polygonObjects.value = []
}

function drawPolygons() {
  const items = getPolygons()

  items.forEach((item) => {
    if (!item.polygon_data?.coordinates) return
    
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
  if (item.status === 'occupied') return '#939393'
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
