<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'Вы уверены?'
  },
})

const emit = defineEmits(['close', 'confirm'])

const handleClose = () => {
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<template>
  <div class="modal fixed min-w-full min-h-[100vh] flex justify-center items-center">
    <div class="bg-white text-center rounded-md max-w-[500px] w-full py-[40px]">
      <h3 class="mt-[9px] mb-[21px] font-bold text-2xl">{{ props.title }}</h3>
      <div class="flex justify-around items-center w-full px-12">
        <button class="rounded-md text-[#38949B] text-base font-semibold border bg-white py-[8px] px-[16px]" @click="handleClose">
          Отменить
        </button>
        <button class="rounded-md text-white text-base font-semibold bg-[#38949B] py-[8px] px-[16px]" @click="handleConfirm">
          Подтвердить
        </button>
      </div>

    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal {
  top: 0;
  background: #0000005b;
}
</style>