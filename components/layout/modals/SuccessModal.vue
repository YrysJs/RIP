<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'Успешно!'
  },
  text: {
    type: String, 
    default: 'Закрыть'
  }
})

const emit = defineEmits(['close'])

const handleClose = () => {
  emit('close')
}
</script>

<template>
    <div class="modal fixed min-w-full min-h-[100vh] flex justify-center items-center">
        <div class="bg-white text-center rounded-md max-w-[500px] w-full py-[40px]">
            <img src="/icons/success-modal-icon.svg" alt="" class="w-fit mx-auto block">
            <h3 class="mt-[9px] mb-[21px] font-bold text-2xl">{{ props.title }}</h3>
            <button class="rounded-md text-white text-base font-semibold bg-[#38949B] py-[8px] px-[16px]" @click="handleClose">
                {{ props.text }}
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.modal {
  top: 0;
    background: #0000005b;
  z-index: 999;
}
</style>