<script setup>
import {defineProps} from "vue";

const emit = defineEmits(['cancel'])
const props = defineProps(['visible'])

const reason = ref('')

function close() {
  emit('close')
}


</script>

<template>
  <div v-if="visible" class="modal absolute min-w-full min-h-[100vh] flex justify-center items-center z-50">
    <div class="bg-white rounded-md max-w-[500px] w-full p-[24px] relative">
      <button class="absolute right-[24px] top-[24px]" @click="close">&#10005;</button>
      <div class="flex flex-col">
        <h3 class="text-2xl font-bold font-roboto text-left text-[#222222] mb-[8px]">
          Отмена брони
        </h3>
        <p class="text-sm font-roboto">
          Напишите причину отмены
        </p>
        <input v-model="reason" class="border-2 border-[#939393] mt-[24px] pl-[16px] rounded-lg h-[60px] mb-4" type="text" placeholder="Причина">
        <button class="bg-[#F7F7F7] h-[51px] rounded-lg text-[#222222] font-semibold font-roboto" :class="{ '!bg-[#38949B] text-white': reason.length >= 4 }" @click="emit('cancel', reason)">Подтвердить</button>
      </div>
    </div>
  </div>
</template>

<style lang=scss scoped>
.modal {
  background: #0000005b;
}
</style>