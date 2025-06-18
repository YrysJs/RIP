<script setup>

const emit = defineEmits(['close'])

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <div class="modal absolute min-w-full min-h-[100vh] flex justify-center items-center">
    <div class="bg-white text-center rounded-md max-w-[500px] w-full py-[40px]">
      <h2 class="text-lg font-semibold mb-2">Заявка на поиск захоронения отправлена!</h2>
      <p class="text-sm text-gray-800 mb-2">
        Ваша заявка на поиск захоронения принята в обработку. Наши специалисты изучат предоставленные вами данные и свяжутся с вами, как только будет получена необходимая информация.
      </p>
      <p class="text-sm text-gray-600 italic mb-4">С уважением, администрация.</p>
      <div class="text-right">
        <button
            @click="close"
            class="bg-[#38949B] hover:bg-[#2f7c82] text-white text-sm font-semibold py-1.5 px-4 rounded"
        >
          Закрыть
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal {
  background: #0000005b;
}
</style>