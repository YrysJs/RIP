<script setup>
import { NuxtLink } from "#components";

const props = defineProps({
  title: {
    type: String,
    default: "Успешно!",
  },
  text: {
    type: String,
    default: "Закрыть",
  },
});

const emit = defineEmits(["close"]);

const handleClose = () => {
  emit("close");
};
</script>

<template>
  <div
    class="modal fixed min-w-full min-h-[100vh] flex justify-center items-center"
  >
    <div
      class="bg-white text-center rounded-md max-w-[400px] w-full p-[30px] max-sm:mx-4"
    >
      <img src="/icons/success-modal.svg" alt="" class="w-fit mx-auto block" />
      <h3 class="mt-[32px] font-medium text-xl max-sm:mt-4">
        {{ props.title }}
      </h3>
      <p class="mt-4 mb-6 text-base text-[#17212A] max-sm:mt-2 max-sm:mb-4">
        {{ props.text }}
      </p>
      <p class="text-sm text-[#939393] mb-[13px] max-sm:mb-2">
        Перенаправление в личный кабинет через 3
      </p>
      <NuxtLink
        to="/client/tickets/burial"
        class="block rounded-lg text-black text-sm font-medium bg-[#E9B949] py-[15px] w-full"
      >
        В личный кабинет
      </NuxtLink>
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
