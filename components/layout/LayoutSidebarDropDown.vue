<script setup>
import { ref } from 'vue'
const props = defineProps(['title', 'childs', 'item'])
const isDroped = ref(false)
</script>

<template>
    <div 
        class="h-[43px] border-b-2 border-[#EEEEEE] overflow-hidden mb-[15px]" 
        :class="{ 'h-fit': isDroped && props.childs.length, 'overflow-visible': isDroped && props.childs.length }" 
        @click="isDroped = !isDroped"
    >
        <div v-if="props.childs.length" class="flex justify-between items-center">
            <h4 class="text-normal font-semibold" :class="{ 'text-[#38949B]': isDroped }">
                {{ props.title }}
            </h4>
            <img v-if="props.childs.length" src="/icons/dropdown.svg" alt="dropdown" :class="{ '-rotate-180' : isDroped }">
        </div>
        <nuxt-link v-else :to="props.item.path" class="flex justify-between items-center">
            <h4 class="text-normal font-semibold">
                {{ props.title }}
            </h4>
        </nuxt-link>
        <div class="my-[15px]">
            <div v-for="link in props.childs" :key="link" class="flex justify-between items-center px-[10px]" :class="{ 'bg-[#224C4F0D]': isDroped }">
                <nuxt-link :to="link.path" class="py-[6px] text-normal" :class="{ 'text-[#38949B]': isDroped }">{{ link.title }}</nuxt-link>
                <span>{{ link.count }}</span>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
</style>
