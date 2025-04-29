<script setup>
import LayoutTop from '~/components/layout/LayoutTop.vue';

const props = defineProps({
    value: {
        type: Number,
        default: 3.5,
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
    <div class="bg-[#FAFAFA] py-[20px]">
        <div class="container">
            <LayoutTop title="Заказать услуги и товары" :hide="true"/>
            <div class="flex justify-between items-start mt-[20px]">
                <div class="max-w-[376px] w-full">
                    <div class="py-[13px] px-[20px] bg-white rounded-lg flex gap-[15px] text-base font-roboto">
                        <span>Город:</span> 
                        <select id="" name="" placeholder="Город">
                            <option value="1">Алматы</option>
                            <option value="2">Астана</option>
                            <option value="3">Шымкент</option>
                            <option value="4">Тараз</option>
                        </select>
                    </div>
                    <div class="p-[20px] bg-white rounded-lg mt-[20px]">
                        <h3 class="text-xl font-bold text-[#222222]">Фильтры</h3>
                        <div class="mt-[40px]">
                            <h4 class="text-base font-bold font-roboto text-[#222222]">Религия</h4>
                            <div class="flex flex-col gap-[16px] mt-[20px]">
                                <div class="flex justify-between items-center">
                                    <div class="flex justify-between items-center gap-[12px] text-base font-roboto">
                                        <input type="checkbox"> <span>Ислам</span>
                                    </div>
                                    <span class="font-medium">42</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <div class="flex justify-between items-center gap-[12px] text-base font-roboto">
                                        <input type="checkbox"> <span>Ислам</span>
                                    </div>
                                    <span class="font-medium">42</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <div class="flex justify-between items-center gap-[12px] text-base font-roboto">
                                        <input type="checkbox"> <span>Ислам</span>
                                    </div>
                                    <span class="font-medium">42</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <div class="flex justify-between items-center gap-[12px] text-base font-roboto">
                                        <input type="checkbox"> <span>Ислам</span>
                                    </div>
                                    <span class="font-medium">42</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="p-[20px] bg-white rounded-lg mt-[20px]">
                        <h3 class="text-xl font-bold text-[#222222]">Категория</h3>
                        <div class="mt-[40px]">
                            <h4 class="text-base font-bold font-roboto text-[#222222]">Религия</h4>
                            <div class="flex flex-col gap-[16px] mt-[20px]">
                                <div class="flex justify-between items-center">
                                    <div class="flex justify-between items-center gap-[12px] text-base font-roboto">
                                        <input type="checkbox"> <span>Ислам</span>
                                    </div>
                                    <span class="font-medium">42</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <div class="flex justify-between items-center gap-[12px] text-base font-roboto">
                                        <input type="checkbox"> <span>Ислам</span>
                                    </div>
                                    <span class="font-medium">42</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <div class="flex justify-between items-center gap-[12px] text-base font-roboto">
                                        <input type="checkbox"> <span>Ислам</span>
                                    </div>
                                    <span class="font-medium">42</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <div class="flex justify-between items-center gap-[12px] text-base font-roboto">
                                        <input type="checkbox"> <span>Ислам</span>
                                    </div>
                                    <span class="font-medium">42</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="p-[20px] bg-white rounded-lg mt-[20px]">
                        <h3 class="text-xl font-bold text-[#222222] mb-[20px]">Цена</h3>
                        <div class="relative font-semibold text-base">
                            <div class="absolute bottom-[-25px] left-0">0</div>
                            <input type="range" class="w-full">
                            <div class="absolute bottom-[-25px] right-0">750000</div>
                        </div>
                    </div>
                </div>
                <div class="max-w-[770px] w-full mt-[20px]">
                    <div class="w-full bg-white border-1 border-[#EEEEEE] h-[44px] relative">
                        <img class="absolute top-[10px] left-[15px]" src="/icons/search.svg" alt=""> <input class="bg-transparent w-full h-full pl-[45px]" type="text" placeholder="Поиск">
                    </div>
                    <div class="flex flex-wrap gap-[18px]">
                        <div class="p-[9px] rounded-lg max-w-[376px] w-full bg-white">
                            <div>
                                <img class="rounded-lg overflow-hidden w-full h-[189px] object-cover" src="/images/client/banner.jpg" alt="">
                                <h3 class="text-lg font-roboto font-medium text-[#222222] mt-[10px]">Доставка покойного</h3>
                                <h4 class="text-2xl font-roboto font-medium text-[#222222] mb-[4px]">100 000 ₸</h4>
                                <div class="flex items-center mb-[4px]">
                                    <div class="flex space-x-1">
                                        <template v-for="n in totalStars" :key="n">
                                            <div class="relative text-2xl select-none">
                                                <span v-if="getStarClass(n) === 'half'" class="text-gray-300">★</span>
                                                <span 
                                                    v-else :class="{
                                                    'text-orange-400': getStarClass(n) === 'full',
                                                    'text-gray-300': getStarClass(n) === 'empty'
                                                    }"
                                                >
                                                    ★
                                                </span>
                                                <span
                                                    v-if="getStarClass(n) === 'half'"
                                                    class="absolute inset-0 overflow-hidden text-orange-400"
                                                    :style="{ width: '50%' }"
                                                >
                                                    ★
                                                </span>
                                            </div>
                                        </template>
                                    </div>
                                    <span class="font-roboto text-sm text-[#38949B]">(42 отзыва)</span>
                                </div>
                                <div class="flex gap-[12px] text-sm font-roboto text-[#5C5C5C]">
                                    <img src="/icons/calendar-icon.svg" alt=""> <span>Срок выполнения: 1 день</span>
                                </div>
                                <div class="flex gap-[10px] mt-[10px]">
                                    <button class="w-[50%] text-sm rounded-lg bg-[#224C4F26] text-[#224C4F] py-[8px] font-semibold">Подробнее</button>
                                    <button class="w-[50%] text-sm rounded-lg bg-[#224C4F] text-white py-[8px] font-semibold">Добавить</button>
                                </div>
                            </div>
                        </div>
                        <div class="p-[9px] rounded-lg max-w-[376px] w-full bg-white">
                            <div>
                                <img class="rounded-lg overflow-hidden w-full h-[189px] object-cover" src="/images/client/banner.jpg" alt="">
                                <h3 class="text-lg font-roboto font-medium text-[#222222] mt-[10px]">Доставка покойного</h3>
                                <h4 class="text-2xl font-roboto font-medium text-[#222222] mb-[4px]">100 000 ₸</h4>
                                <div class="flex items-center mb-[4px]">
                                    <div class="flex space-x-1">
                                        <template v-for="n in totalStars" :key="n">
                                            <div class="relative text-2xl select-none">
                                                <span v-if="getStarClass(n) === 'half'" class="text-gray-300">★</span>
                                                <span 
                                                    v-else :class="{
                                                    'text-orange-400': getStarClass(n) === 'full',
                                                    'text-gray-300': getStarClass(n) === 'empty'
                                                    }"
                                                >
                                                    ★
                                                </span>
                                                <span
                                                    v-if="getStarClass(n) === 'half'"
                                                    class="absolute inset-0 overflow-hidden text-orange-400"
                                                    :style="{ width: '50%' }"
                                                >
                                                    ★
                                                </span>
                                            </div>
                                        </template>
                                    </div>
                                    <span class="font-roboto text-sm text-[#38949B]">(42 отзыва)</span>
                                </div>
                                <div class="flex gap-[12px] text-sm font-roboto text-[#5C5C5C]">
                                    <img src="/icons/calendar-icon.svg" alt=""> <span>Срок выполнения: 1 день</span>
                                </div>
                                <div class="flex gap-[10px] mt-[10px]">
                                    <button class="w-[50%] text-sm rounded-lg bg-[#224C4F26] text-[#224C4F] py-[8px] font-semibold">Подробнее</button>
                                    <button class="w-[50%] text-sm rounded-lg bg-[#224C4F] text-white py-[8px] font-semibold">Добавить</button>
                                </div>
                            </div>
                        </div>
                        <div class="p-[9px] rounded-lg max-w-[376px] w-full bg-white">
                            <div>
                                <img class="rounded-lg overflow-hidden w-full h-[189px] object-cover" src="/images/client/banner.jpg" alt="">
                                <h3 class="text-lg font-roboto font-medium text-[#222222] mt-[10px]">Доставка покойного</h3>
                                <h4 class="text-2xl font-roboto font-medium text-[#222222] mb-[4px]">100 000 ₸</h4>
                                <div class="flex items-center mb-[4px]">
                                    <div class="flex space-x-1">
                                        <template v-for="n in totalStars" :key="n">
                                            <div class="relative text-2xl select-none">
                                                <span v-if="getStarClass(n) === 'half'" class="text-gray-300">★</span>
                                                <span 
                                                    v-else :class="{
                                                    'text-orange-400': getStarClass(n) === 'full',
                                                    'text-gray-300': getStarClass(n) === 'empty'
                                                    }"
                                                >
                                                    ★
                                                </span>
                                                <span
                                                    v-if="getStarClass(n) === 'half'"
                                                    class="absolute inset-0 overflow-hidden text-orange-400"
                                                    :style="{ width: '50%' }"
                                                >
                                                    ★
                                                </span>
                                            </div>
                                        </template>
                                    </div>
                                    <span class="font-roboto text-sm text-[#38949B]">(42 отзыва)</span>
                                </div>
                                <div class="flex gap-[12px] text-sm font-roboto text-[#5C5C5C]">
                                    <img src="/icons/calendar-icon.svg" alt=""> <span>Срок выполнения: 1 день</span>
                                </div>
                                <div class="flex gap-[10px] mt-[10px]">
                                    <button class="w-[50%] text-sm rounded-lg bg-[#224C4F26] text-[#224C4F] py-[8px] font-semibold">Подробнее</button>
                                    <button class="w-[50%] text-sm rounded-lg bg-[#224C4F] text-white py-[8px] font-semibold">Добавить</button>
                                </div>
                            </div>
                        </div>
                        <div class="p-[9px] rounded-lg max-w-[376px] w-full bg-white">
                            <div>
                                <img class="rounded-lg overflow-hidden w-full h-[189px] object-cover" src="/images/client/banner.jpg" alt="">
                                <h3 class="text-lg font-roboto font-medium text-[#222222] mt-[10px]">Доставка покойного</h3>
                                <h4 class="text-2xl font-roboto font-medium text-[#222222] mb-[4px]">100 000 ₸</h4>
                                <div class="flex items-center mb-[4px]">
                                    <div class="flex space-x-1">
                                        <template v-for="n in totalStars" :key="n">
                                            <div class="relative text-2xl select-none">
                                                <span v-if="getStarClass(n) === 'half'" class="text-gray-300">★</span>
                                                <span 
                                                    v-else :class="{
                                                    'text-orange-400': getStarClass(n) === 'full',
                                                    'text-gray-300': getStarClass(n) === 'empty'
                                                    }"
                                                >
                                                    ★
                                                </span>
                                                <span
                                                    v-if="getStarClass(n) === 'half'"
                                                    class="absolute inset-0 overflow-hidden text-orange-400"
                                                    :style="{ width: '50%' }"
                                                >
                                                    ★
                                                </span>
                                            </div>
                                        </template>
                                    </div>
                                    <span class="font-roboto text-sm text-[#38949B]">(42 отзыва)</span>
                                </div>
                                <div class="flex gap-[12px] text-sm font-roboto text-[#5C5C5C]">
                                    <img src="/icons/calendar-icon.svg" alt=""> <span>Срок выполнения: 1 день</span>
                                </div>
                                <div class="flex gap-[10px] mt-[10px]">
                                    <button class="w-[50%] text-sm rounded-lg bg-[#224C4F26] text-[#224C4F] py-[8px] font-semibold">Подробнее</button>
                                    <button class="w-[50%] text-sm rounded-lg bg-[#224C4F] text-white py-[8px] font-semibold">Добавить</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
</template>

<style lang="css" scoped>
.container {
    max-width: 1170px;
    width: 100%;
    margin: auto;
}
.card {
    box-shadow: 0px 4px 10px -5px #000;
}
</style>