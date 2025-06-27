<script setup>
import MapSecond from "~/components/map/MapV2.vue";
const props = defineProps({
  cemetery: {
    type: Object,
    required: true,
  },
  visible: {
    type: Boolean,
    default: false,
  },
  polygons: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['close', 'grave-click'])

const selected = ref(null)
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
      <MapSecond
          :polygons="polygons"
          :cemetery-boundary="cemetery"
          v-model="selected"
      />
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
