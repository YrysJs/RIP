<script setup>
import { defineProps } from 'vue';
const props = defineProps(['comments', 'visible', 'appeal'])

const emit = defineEmits(['close', 'confirm', 'cancel'])

function formatPhoneNumber(phone) {
  if (!/^\d{11}$/.test(phone)) return 'Неверный формат номера';

  return `+${phone[0]} (${phone.slice(1, 4)}) ${phone.slice(4, 7)} ${phone.slice(7, 9)} ${phone.slice(9, 11)}`;
}

const closeModal = () => {
  emit('close')
}
</script>

<template>
  <div v-if="visible" class="modal fixed min-w-full min-h-[100vh] flex justify-center items-center z-50">
    <div class="bg-white rounded-lg max-w-[800px] w-full h-[500px] overflow-y-auto m-4">
      <!-- Header -->
      <div class="flex justify-between items-center pt-6 px-6 pb-0 border-b">
        <h2 class="text-2xl font-bold">{{ appeal?.type?.nameRu }}</h2>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-2xl">
          &times;
        </button>
      </div>

      <div class="pt-2 px-6 pb-6">

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