<template>
  <div>
    <button @click="finishDrawing" :disabled="points.length < 3" v-if="!drawingFinished">Завершить рисование</button>
    <button @click="clearMap" v-if="drawingFinished">Очистить карту</button>
  </div>
  <div id="map" style="width: 100%; height: 400px;"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['complete'])
const points = ref([])
let markers = []
let polygon = null
const drawingFinished = ref(false)

function finishDrawing() {
  if (points.value.length < 3) return
  drawingFinished.value = true
  emit('complete', points.value)
}

function clearMap() {
  if (polygon) {
    polygon.remove()
    polygon = null
  }
  markers.forEach(marker => marker.remove())
  markers = []
  points.value = []
  drawingFinished.value = false
}

let map
onMounted(() => {
  DG.then(() => {
    map = DG.map('map', { center: [54.98, 82.89], zoom: 13 })
    map.on('click', e => {
      if (drawingFinished.value) return
      const lat = e.latlng.lat
      const lng = e.latlng.lng
      const marker = DG.circleMarker([lat, lng]).addTo(map)
      markers.push(marker)
      points.value.push([lat, lng])
      if (points.value.length >= 3) {
        if (!polygon) {
          polygon = DG.polygon(points.value, { color: 'green', fillColor: 'green' }).addTo(map)
        } else {
          polygon.addLatLng([lat, lng])
        }
      }
    })
  })
})
</script>
