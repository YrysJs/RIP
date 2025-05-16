<script setup>
import {onMounted, ref} from 'vue';
import {useRuntimeConfig} from '#imports';

const props = defineProps({
  polygons: {
    type: Array,
    required: true,
  },
});

const selectedPolygonId = ref(null);
const mapContainerId = 'map-container';
const mapInstance = ref(null);
const polygonObjects = ref([]);

const config = useRuntimeConfig();
const apiKey = config.public.twoGisApiKey;

onMounted(() => {
  const checkMapGL = setInterval(() => {
    if (window.mapgl) {
      clearInterval(checkMapGL);
      initializeMap();
    }
  }, 100);
});

function initializeMap() {
  const firstPolygon = props.polygons[0];
  const center = firstPolygon?.polygon_data?.coordinates[0][0] || [76.889709, 43.238949];

  mapInstance.value = new window.mapgl.Map(mapContainerId, {
    center,
    zoom: 13,
    key: apiKey,
  });

  drawPolygons();
}

function drawPolygons() {
  props.polygons.forEach((item) => {
    const {coordinates, color, strokeColor, strokeWidth} = item.polygon_data;

    const polygon = new window.mapgl.Polygon(mapInstance.value, {
      coordinates,
      color,
      strokeColor,
      strokeWidth,
    });

    polygon.on('click', () => {
      selectPolygon(item.id);
    });

    polygonObjects.value.push({id: item.id, polygon, originalColor: color});
  });
}

function selectPolygon(id) {
  selectedPolygonId.value = id;

  polygonObjects.value.forEach(({id: polygonId, polygon, originalColor}) => {
    const isSelected = polygonId === id;
    polygon.setOptions({
      color: isSelected ? '#00FF00' : originalColor,
    });
  });
}
</script>

<template>
  <div :id="mapContainerId" style="width: 100%; height: 600px;"></div>
</template>
