<script setup>
import { ref, reactive, onMounted } from 'vue'

const props = defineProps({
  initialPolygon: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['complete'])

const mapContainer = ref(null)
const mapInstance = ref(null)
const points = reactive([])
const markers = []
const polygon = ref(null)
const drawingFinished = ref(false)

function drawInitialPolygon() {
  if (!props.initialPolygon || props.initialPolygon.length < 3) return

  props.initialPolygon.forEach(([lat, lng]) => {
    const marker = DG.circleMarker([lat, lng], { radius: 6, color: 'blue' }).addTo(mapInstance.value)
    markers.push(marker)
    points.push([lat, lng])
  })

  polygon.value = DG.polygon(points, {
    color: 'green',
    fillColor: 'green',
    fillOpacity: 0.5,
  }).addTo(mapInstance.value)

  drawingFinished.value = true
}

function onMapClick(e) {
  if (drawingFinished.value) return
  const latlng = [e.latlng.lat, e.latlng.lng]
  points.push(latlng)
  const marker = DG.circleMarker(latlng, {radius: 6, color: 'blue'}).addTo(mapInstance.value)
  markers.push(marker)

  if (points.length >= 3) {
    if (!polygon.value) {
      polygon.value = DG.polygon(points, {
        color: 'green',
        fillColor: 'green',
        fillOpacity: 0.5,
      }).addTo(mapInstance.value)
    } else {
      polygon.value.addLatLng(latlng)
    }
  }
}

function finishDrawing() {
  if (points.length < 3) return
  drawingFinished.value = true
  mapInstance.value.off('click', onMapClick)
  const count = points.length
  const centerLat = points.reduce((sum, p) => sum + p[0], 0) / count
  const centerLng = points.reduce((sum, p) => sum + p[1], 0) / count
  emit('complete', {
    points: points.map(([lat, lng]) => [lng, lat]),
    center: [centerLat, centerLng]
  })
}

function clearMap() {
  markers.forEach(marker => mapInstance.value.removeLayer(marker))
  markers.length = 0
  if (polygon.value) {
    mapInstance.value.removeLayer(polygon.value)
    polygon.value = null
  }
  points.splice(0)
  drawingFinished.value = false
  mapInstance.value.on('click', onMapClick)
}

onMounted(() => {
  DG.then(() => {
    mapInstance.value = DG.map(mapContainer.value, {
      center: [43.237649, 76.893601],
      zoom: 13,
    })

    if (props.initialPolygon && props.initialPolygon.length >= 3) {
      drawInitialPolygon()
    } else {
      mapInstance.value.on('click', onMapClick)
    }
  })
})
</script>

<template>
  <div ref="mapContainer" style="width: 100%; height: 400px; margin-bottom: 24px;"></div>
  <button v-if="!drawingFinished" @click="finishDrawing" :disabled="points.length < 3">
    Завершить рисование
  </button>
  <button v-if="drawingFinished" @click="clearMap">
    Очистить карту
  </button>
</template>
