<script setup>
import {defineProps, ref, watch} from "vue";
import { getReviewById } from '~/services/admin'

const emit = defineEmits(['finish', 'close'])
const props = defineProps(['visible', 'appeal'])

const adminResponse = ref('')
const reviewDetails = ref(null)

function close() {
  emit('close')
}

function approve() {
  emit('finish', {
    status: 'approved',
    admin_response: adminResponse.value
  })
  close()
}

function reject() {
  emit('finish', {
    status: 'rejected', 
    admin_response: adminResponse.value
  })
  close()
}

async function loadReviewDetails() {
  if (props.appeal?.review_id) {
    try {
      const response = await getReviewById(props.appeal.review_id)
      reviewDetails.value = response.data
    } catch (error) {
      console.error('Ошибка при загрузке деталей отзыва:', error)
      reviewDetails.value = null
    }
  }
}

watch(() => props.appeal, (newVal) => {
  adminResponse.value = '';
  reviewDetails.value = null;
  if (newVal) {
    loadReviewDetails();
  }
}, { immediate: true });
</script>

<template>
  <div v-if="visible" class="modal fixed min-w-full min-h-[100vh] flex justify-center items-center z-50">
    <div class="bg-white rounded-md max-w-[500px] w-full p-[24px] relative">
      <button class="absolute right-[24px] top-[24px]" @click="close">&#10005;</button>
      <div class="flex flex-col">
        <h3 class="text-2xl font-bold font-roboto text-left text-[#222222] mb-[8px]">
          {{ $t('moderateAppeal.title') }}
        </h3>
        <div class="mt-[16px] mb-[16px]">
          <p class="text-sm text-gray-600 mb-2">ID: {{ appeal?.id }}</p>
          <p class="text-sm text-gray-600 mb-2">{{ $t('moderateAppeal.supplier') }} {{ appeal?.supplier_phone }}</p>
          <p class="text-sm text-gray-600 mb-2">{{ $t('moderateAppeal.reason') }} {{ appeal?.reason }}</p>
        </div>
        
        <div v-if="reviewDetails" class="mt-[16px] mb-[16px] p-[16px] bg-gray-50 rounded-lg">
          <h4 class="text-lg font-semibold mb-[12px]">{{ $t('moderateAppeal.reviewDetails') }}</h4>
          <div class="mb-[8px]">
            <span class="text-sm font-medium text-gray-700">{{ $t('moderateAppeal.rating') }} </span>
            <span class="text-sm text-gray-600">{{ reviewDetails.rating }}/5</span>
          </div>
          <div class="mb-[8px]">
            <span class="text-sm font-medium text-gray-700">{{ $t('moderateAppeal.comment') }} </span>
            <p class="text-sm text-gray-600 mt-1">{{ reviewDetails.comment }}</p>
          </div>
          <div v-if="reviewDetails.image_urls && reviewDetails.image_urls.length > 0" class="mb-[8px]">
            <span class="text-sm font-medium text-gray-700">{{ $t('moderateAppeal.images') }} </span>
            <div class="flex flex-wrap gap-2 mt-2">
              <img 
                v-for="(imageUrl, index) in reviewDetails.image_urls" 
                :key="index"
                :src="imageUrl"
                :alt="$t('alts.reviewImage')"
                class="w-16 h-16 object-cover rounded border cursor-pointer"
                @click="window.open(imageUrl, '_blank')"
              />
            </div>
          </div>
        </div>
        <textarea 
          v-model="adminResponse" 
          class="border-2 border-[#939393] mt-[24px] pl-[16px] pt-[16px] rounded-lg h-[120px] mb-4 resize-none" 
          :placeholder="$t('moderateAppeal.adminResponsePlaceholder')"
        ></textarea>
        <div class="flex gap-4">
          <button 
            class="h-[51px] rounded-lg !bg-[#3CBF4A] text-white font-semibold font-roboto flex-1" 
            @click="approve"
          >
            {{ $t('moderateAppeal.approve') }}
          </button>
          <button 
            class="h-[51px] rounded-lg !bg-[#E53935] text-white font-semibold font-roboto flex-1" 
            @click="reject"
          >
            {{ $t('moderateAppeal.reject') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang=scss scoped>
.modal {
  background: #0000005b;
  top: 0;
}
</style> 