<script setup>
import { defineProps, computed } from 'vue';
const props = defineProps(['visible', 'dataId'])

const emit = defineEmits(['close'])

const { t } = useI18n()

const closeModal = () => {
  emit('close')
}

const servicesData = computed(() => [
  {
    id: 0,
    title: t('mainPage.services.searchBurial.title'),
    description: t('mainPage.services.searchBurial.description')
  },
  {
    id: 1,
    title: t('mainPage.services.improvement.title'),
    description: t('mainPage.services.improvement.description')
  },
  {
    id: 2,
    title: t('mainPage.services.digitalMemorial.title'),
    description: t('mainPage.services.digitalMemorial.description')
  },
  {
    id: 3,
    title: t('mainPage.services.ritualServices.title'),
    description: t('mainPage.services.ritualServices.description')
  },
  {
    id: 4,
    title: t('mainPage.services.ritualGoods.title'),
    description: t('mainPage.services.ritualGoods.description')
  }
])


</script>

<template>
  <div v-if="visible" class="modal fixed min-w-full min-h-[100vh] flex justify-center items-center z-50">
    <div class="bg-white rounded-lg max-w-[795px] w-full max-h-[90vh] overflow-y-auto m-4">
      <!-- Header -->
      <div class="flex justify-between items-start pt-6 pl-6 pr-6 pb-0 border-b">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <h2 class="text-xl font-bold">{{ servicesData[dataId].title }}</h2>
          </div>
          <div class="text-2xl font-bold">
            
          </div>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-2xl ml-4">
          &times;
        </button>
      </div>
      
      <div class="pt-2 pl-6 pr-6 pb-6">
        <div class="flex gap-[12px]">
            <div class="mb-6">
                <p class="text-base">
                    {{ servicesData[dataId].description }}
                </p>
            </div>
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