<!-- LoginPhoneModal.vue -->
<template>
  <div v-if="visible" class="modal-wrapper">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="text-[24px] bold">Вход в кабинет Акимата</h2>
        <button class="modal-close" @click="emit('close')">
          <img src="/icons/close.svg" alt="X" />
        </button>
      </div>
      <p class="modal-sub">Введите номер мобильного телефона - мы пришлем код</p>


    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const props = defineProps(['visible'])
const emit = defineEmits(['close'])

const phone = ref('');
</script>

<style scoped>
.modal-wrapper {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}
.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  padding: 24px;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-sub {
  font-size: 14px;
  margin-top: 6px;
  margin-bottom: 20px;
}
.input {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #999;
  margin-bottom: 16px;
}
.btn {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  background: #f3f4f6;
  font-weight: bold;
  margin-bottom: 12px;
  border: none;
  cursor: pointer;
}
.btn-filled {
  background-color: #38949B;
  color: white;
}
.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.modal-close {
  background: transparent;
  border: none;
  cursor: pointer;
}
</style>
