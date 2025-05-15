<script setup>
import { onMounted, watch, toRefs } from 'vue'

const props = defineProps({
  polygons: {
    type: Array,
    required: true,
  },
})

const { polygons } = toRefs(props)

function drawPolygons(data) {
  data.forEach(entry => {
    const poly = DG.polygon(entry.polygon_data.coordinates, {
      color: entry.polygon_data.strokeColor,
      weight: entry.polygon_data.strokeWidth,
      fillColor: entry.polygon_data.color,
      fillOpacity: 0.5,
    }).bindPopup(`
      <strong>${entry.full_name}</strong><br/>
      Статус: ${entry.polygon_data.status}
    `)

    poly.addTo(DG._mapInstance)
  })
}

onMounted(() => {
  if (typeof DG === 'undefined') {
    const script = document.createElement('script')
    script.src = 'https://maps.api.2gis.ru/2.0/loader.js?pkg=full'
    script.onload = () => {
      DG.then(() => {
        initMap()
        drawPolygons(polygons.value)
      })
    }
    document.head.appendChild(script)
  } else {
    DG.then(() => {
      initMap()
      drawPolygons(polygons.value)
    })
  }
})

function initMap() {
  const center = [polygons.value?.[0]?.polygon_data.coordinates[0][0][1] || 25.2, polygons.value?.[0]?.polygon_data.coordinates[0][0][0] || 55.2]

  const map = DG.map('map', {
    center,
    zoom: 15,
  })

  // сохраняем глобально, чтобы использовать позже
  DG._mapInstance = map
}
</script>

<template>
  <div id="map" style="width: 100%; height: 600px;"></div>
</template>
