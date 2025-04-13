<script setup>

const props = defineProps({
    value: {
        type: Number,
        default: 0,
    },

    totalStars: {
        type: Number,
        default: 5,
    },
});


function getStarClass(n) {
    if (props.value >= n) return "full";
    if (props.value >= n - 0.5 && props.value < n) return "half";
    return "empty";
}

</script>

<template>
    <NuxtLayout name="supplier">
        <div class="w-full h-[61px] pl-[20px] flex items-center bg-white rounded-[16px] text-lg font-semibold">
            Требует дороботки
        </div>
        <div class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px]">
            <div class="w-full flex gap-[20px]">
                <div class="min-w-[320px] w-[320px] rounded-lg overflow-hidden">
                    <img class="w-full h-full object-cover" src="/images/test-card-image.jpg" alt="">
                </div>
                <div class="w-full">
                    <div class="flex justify-between items-start mb-[3px]">
                        <div>
                            <h3 class="font-medium text-lg">Уборка могил</h3>
                            <p class="text-sm text-[#939393]">Облагораживание</p>
                        </div>
                        <div class="font-medium text-xl">
                            от 20 000 ₸
                        </div>
                    </div>
                    <div>
                        <div class="flex space-x-1">
                            <template v-for="n in 5" :key="n">
                                <div class="relative text-2xl select-none">
                                    <span v-if="getStarClass(n) === 'half'" class="text-gray-300">★</span>
                                    <span 
                                        v-else :class="{
                                        'text-yellow-400': getStarClass(n) === 'full',
                                        'text-gray-300': getStarClass(n) === 'empty'
                                        }"
                                    >
                                        ★
                                    </span>
                                    <span
                                        v-if="getStarClass(n) === 'half'"
                                        class="absolute inset-0 overflow-hidden text-yellow-400"
                                        :style="{ width: '50%' }"
                                    >
                                        ★
                                    </span>
                                </div>
                            </template>
                        </div>
                        <div class="flex items-center gap-[10px] text-sm font-normal mb-[8px] text-[#5C5C5C] mt-[8px]">
                            <img src="/icons/calendar-icon.svg" alt="calendar-icon"> Срок выполнения: 1 день
                        </div>
                        <div class="flex items-center gap-[10px] text-sm font-normal text-[#224C4F]">
                            <img src="/icons/geo-icon.svg" alt="geo-icon"> Казахстан, Алматы
                        </div>
                    </div>
                    <div class="flex justify-between items-center mt-[40px]">
                        <div class="flex items-center gap-[10px] text-sm font-normal mb-[5px] text-[#5C5C5C]">
                            <img src="/icons/calendar-icon.svg" alt="calendar-icon"> Дата подачи: 27.06.2023
                        </div>
                        <nuxt-link to="/supplier/services/consideration" class="py-[8px] px-[16px] rounded-md bg-[#224C4F] text-white font-semibold">Редактировать</nuxt-link>
                    </div>
                </div>
            </div>
            <div class="bg-[#DC6E2926] p-[10px] rounded-md mt-[10px] flex items-center gap-3 text-base">
                <img src="/icons/attention-icon.svg" alt="icon"> Услуга требует доработки, укажите точное описание и прикрепите фотографии
            </div>
        </div>
        
    </NuxtLayout>
</template>

<style lang=scss scoped>

</style>