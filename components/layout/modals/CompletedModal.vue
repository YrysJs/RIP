<script setup>
import { NuxtLink } from "#components";

const emit = defineEmits(["close"]);

const handleClose = () => {
  emit("close");
};
</script>

<template>
  <div
    class="fixed inset-0 z-[999] flex items-center justify-center bg-black/40"
  >
    <div
      class="bg-white text-center rounded-xl max-w-[400px] w-full p-6 shadow-lg mx-4"
    >
      <img src="/icons/success-modal.svg" alt="success" class="mx-auto block" />
      <h3 class="mt-6 font-medium text-xl">Заявка принята</h3>

      <NuxtLink
        class="block rounded-lg text-black text-sm font-medium bg-[#E9B949] py-[15px] w-full mt-6"
        @click="handleClose"
      >
        Закрыть
      </NuxtLink>
    </div>
  </div>
</template>
