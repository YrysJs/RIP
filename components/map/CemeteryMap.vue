<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  cemetery: {
    type: Object,
    required: true,
  },
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const mapInstance = ref(null)
const cemeteryBoundaryObject = ref(null)
const mapContainerId = 'map-container'

watch(
    () => props.visible,
    async (visible) => {
      if (visible && props.cemetery?.polygon_data?.coordinates && window.DG) {
        await nextTick()
        destroyMap()
        initializeMap()
      }
    }
)

function destroyMap() {
  if (mapInstance.value) {
    mapInstance.value.remove()
    mapInstance.value = null
    cemeteryBoundaryObject.value = null
  }
}

function initializeMap() {
  const center = getCemeteryCenter()
  const container = document.getElementById(mapContainerId)
  if (!container) {
    console.warn('map container not found')
    return
  }

  mapInstance.value = DG.map(mapContainerId, {
    center,
    zoom: 16,
  })

  drawCemeteryBoundary()
}

function getCemeteryCenter() {
  const coords = props.cemetery?.polygon_data?.coordinates?.[0]
  return coords ? [coords[1], coords[0]] : [43.238949, 76.889709]
}

function drawCemeteryBoundary() {
  const coords = props.cemetery?.polygon_data?.coordinates
  if (!coords) return

  const latlngs = coords.map(([lng, lat]) => [lat, lng])

  cemeteryBoundaryObject.value = DG.polygon(latlngs, {
    color: '#FF0000',
    weight: 3,
    fillColor: 'transparent',
    fillOpacity: 0,
  }).addTo(mapInstance.value)
}

const closeModal = () => emit('close')
</script>

<template>
  <div v-if="visible" class="modal absolute min-w-full min-h-[100vh] flex justify-center items-center z-50">
    <div class="bg-white rounded-lg max-w-[800px] w-full max-h-[90vh] overflow-y-auto m-4 p-4">
      <div class="flex justify-between items-center pt-6 px-6 mb-4 pb-0 border-b">
        <h2 class="text-2xl font-bold">{{ cemetery?.name }}</h2>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-2xl">
          &times;
        </button>
      </div>
      <div :id="mapContainerId" style="width: 100%; height: 600px;"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.modal {
  top: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
}
</style>