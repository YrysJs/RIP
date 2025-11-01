<script setup>
import {defineProps} from "vue";
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const emit = defineEmits(['finish'])
const props = defineProps(['visible', 'comment'])

const reason = ref('')

function close() {
  emit('close')
}

function approve() {
  emit('finish', { reason: reason.value, status: 'approved' })
}

function reject() {
  emit('finish', { reason: reason.value, status: 'rejected' })
}

watch(() => props.comment, (newVal) => {
  reason.value = newVal;
}, { immediate: true });
</script>


<template>
  <div v-if="visible" class="modal fixed min-w-full min-h-[100vh] flex justify-center items-center z-50">
    <div class="bg-white rounded-md max-w-[500px] w-full p-[24px] relative">
      <button class="absolute right-[24px] top-[24px]" @click="close">&#10005;</button>
      <div class="flex flex-col">
        <h3 class="text-2xl font-bold font-roboto text-left text-[#222222] mb-[8px]">
          {{ $t('moderateComment.title') }}
        </h3>
        <input v-model="reason" class="border-2 border-[#939393] mt-[24px] pl-[16px] rounded-lg h-[60px] mb-4" type="text" :placeholder="$t('moderateComment.reason')">
        <div class="flex gap-4">
          <button class="flex-1 h-[51px] rounded-lg !bg-[#38949B] text-white font-semibold font-roboto" @click="approve">
            {{ $t('moderateComment.approve') }}
          </button>
          <button class="flex-1 h-[51px] rounded-lg !bg-[#E53935] text-white font-semibold font-roboto" @click="reject">
            {{ $t('moderateComment.reject') }}
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