<script setup>

const emit = defineEmits(['close'])

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <div class="modal fixed min-w-full min-h-[100vh] flex justify-center items-center">
    <div class="bg-white text-center rounded-md max-w-[500px] w-full py-[40px]">
      <h2 class="text-lg font-semibold mb-2">{{ $t('searchSuccess.title') }}</h2>
      <p class="text-sm text-gray-800 mb-2">
        {{ $t('searchSuccess.message') }}
      </p>
      <p class="text-sm text-gray-600 italic mb-4">{{ $t('searchSuccess.signature') }}</p>
      <div class="text-right flex justify-center">
        <button
            @click="handleClose"
            class="bg-[#38949B] hover:bg-[#2f7c82] text-white text-sm font-semibold py-1.5 px-4 rounded"
        >
          {{ $t('searchSuccess.close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal {
  background: #0000005b;
  top: 0;
}
</style>