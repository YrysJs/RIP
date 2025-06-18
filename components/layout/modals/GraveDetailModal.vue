<script setup>
import { defineProps } from 'vue';
const props = defineProps(['grave', 'visible', 'booking', 'images'])

const emit = defineEmits(['close'])

function removeEscapedQuotes(str) {
  return str.replace(/\\"/g, '');
}

const closeModal = () => {
  emit('close')
}
</script>

<template>
  <div v-if="visible" class="modal absolute min-w-full min-h-[100vh] flex justify-center items-center z-50">
    <div class="bg-white rounded-lg max-w-[800px] w-full max-h-[90vh] overflow-y-auto m-4">
      <!-- Header -->
      <div class="flex justify-between items-center pt-6 px-6 pb-0 border-b">
        <h2 class="text-2xl font-bold">{{ booking?.cemetery_name }}</h2>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-2xl">
          &times;
        </button>
      </div>
      
      <!-- Content -->
      <div class="pt-2 px-6 pb-6">
        <!-- Location info -->
        <div class="mb-6">
          <div class="flex gap-1 items-center mb-2">
            <span class="bg-[#E9EDED] rounded-lg px-2 py-1 text-sm">Сектор <span class="font-bold">{{ grave?.sector_number }}</span></span>
            <span class="bg-[#E9EDED] rounded-lg px-2 py-1 text-sm">Место <span class="font-bold">{{ grave?.grave_number }}</span></span>
            <span class="bg-[#E9EDED] rounded-lg px-2 py-1 text-sm">Площадь: <span class="font-bold">{{ grave?.area || '2.5 x 1.5 м' }}</span></span>
          </div>
        </div>

        <!-- Images Gallery -->
        <div v-if="images?.photos_urls?.length" class="mb-6">
          <div class="flex gap-4 overflow-x-scroll">
            <div 
              v-for="(image, index) in images"
              :key="index"
              class="min-w-[330px] h-[221px] aspect-square rounded-lg overflow-hidden bg-gray-100"
            >
              <img 
                :src="removeEscapedQuotes(image)"
                :alt="`Фото ${index + 1}`"
                class="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
              />
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="mb-6">
          <p>
            {{ grave?.description }}
          </p>
        </div>

        <!-- Additional info -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold">Примечание</h3>
          <p class="text-sm text-gray-600">
            {{ grave?.notes }}
          </p>
        </div>

        <!-- Coordinates -->
        <div class="flex items-center justify-between">
          <button 
            v-if="grave?.coordinates" 
            @click="$emit('showCoordinates', grave.coordinates)"
            class="flex items-center gap-1 text-sm font-semibold"
          >
            <img src="/icons/share.svg" alt="share" class="w-4 h-4 mr-1">
            Поделиться координатами
          </button>
          
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal {
  top: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
}
</style> 