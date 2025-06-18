<script setup>
import { defineProps } from 'vue';
const props = defineProps(['title', 'text', 'img'])
</script>

<template>
    <div class="modal absolute min-w-full min-h-[100vh] flex justify-center items-center">
        <div class="bg-white text-center rounded-md max-w-[500px] w-full py-[40px]">
            <img src="/icons/success-modal-icon.svg" alt="" class="w-fit mx-auto block">
            <h3 class="mt-[9px] mb-[21px] font-bold text-2xl">{{ props.title }}</h3>
            <button class="rounded-md text-white text-base font-semibold bg-[#38949B] py-[8px] px-[16px]" @click="$emit('close', false)">
                {{ props.text }}
            </button>
        </div>
    </div>
</template>

<style lang=scss scoped>
.modal {
  top: 0;
    background: #0000005b;
}
</style>