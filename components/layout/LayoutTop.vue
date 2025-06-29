<script setup>
const props = defineProps(['title', 'info', 'type'])
</script>

<template>
    <div class="layout-top max-w-[1175px] mx-auto flex items-center justify-between w-full bg-white p-[20px] rounded-[16px]">
        <h3 class="text-[32px] font-medium">{{ props.title }}</h3>
        <div class="text-right" v-if="props.info">
            <template v-if="props.type === 'supplier'">
                <h4 class="text-normal font-semibold">{{ `${props.info?.name} ${props.info?.surname} ${props.info?.patronymic}` }}</h4>
                <h4 class="text-normal font-semibold">{{ `${props.info?.bin}` }}</h4>
            </template>
            <template v-if="props.type === 'client'">
                <h4 class="text-normal font-semibold">{{ `${props.info?.name} ${props.info?.surname} ${props.info?.patronymic}` }}</h4>
                <h4 class="text-normal font-semibold">{{ `${props.info?.iin}` }}</h4>
            </template>
        </div>
    </div>
</template>