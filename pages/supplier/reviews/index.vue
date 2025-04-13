<script setup>

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
    <NuxtLayout name="supplier">
        <div class="w-full h-[61px] pl-[20px] flex items-center bg-white rounded-[16px] text-lg font-semibold">
            Отзывы и рейтинги
        </div>
        <div class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px]">
            <div class="flex justify-between items-center">
                <div class="font-medium text-lg">Доставка покойного</div>
                <div class="flex items-center gap-[20px]">
                    <span class="text-sm">Заявка на захоронение: #9999999</span>
                    <span class="text-sm p-1 rounded-md text-white font-medium bg-[#339B38]">Выполнен</span>
                </div>
            </div>
            <div class="my-[32px]">
                <div class="flex text-sm"><p class="min-w-[150px]">Кладбище:</p><p>Северное кладбище</p></div>
                <div class="flex text-sm"><p class="min-w-[150px]">Сектор</p><p>11</p></div>
                <div class="flex text-sm"><p class="min-w-[150px]">Место:</p><p>233</p></div>
                <div class="flex text-sm"><p class="min-w-[150px]">Заказчик:</p><p>Беляков Макар Максимович</p></div>
            </div>
            <div class="flex space-x-1">
                <template v-for="n in totalStars" :key="n">
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
            <div class="mt-[2px]">
                <div class="flex justify-between items-center">
                    <div class="font-medium text-normal">Отзыв</div>
                    <div class="text-sm"> 07.06.2023, 10:42</div>
                </div>
                <div class="font-medium text-normal">
                    Огромное спасибо за чуткость и профессионализм. Все было организовано на высшем уровне
                </div>
            </div>
        </div>
        <div class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px]">
            <div class="flex justify-between items-center">
                <div class="font-medium text-lg">Доставка покойного</div>
                <div class="flex items-center gap-[20px]">
                    <span class="text-sm">Заявка на захоронение: #9999999</span>
                    <span class="text-sm p-1 rounded-md text-white font-medium bg-[#339B38]">Выполнен</span>
                </div>
            </div>
            <div class="my-[32px]">
                <div class="flex text-sm"><p class="min-w-[150px]">Кладбище:</p><p>Северное кладбище</p></div>
                <div class="flex text-sm"><p class="min-w-[150px]">Сектор</p><p>11</p></div>
                <div class="flex text-sm"><p class="min-w-[150px]">Место:</p><p>233</p></div>
                <div class="flex text-sm"><p class="min-w-[150px]">Заказчик:</p><p>Беляков Макар Максимович</p></div>
            </div>
            <div class="flex space-x-1">
                <template v-for="n in totalStars" :key="n">
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
            <div class="mt-[2px]">
                <div class="flex justify-between items-center">
                    <div class="font-medium text-normal">Отзыв</div>
                    <div class="text-sm"> 07.06.2023, 10:42</div>
                </div>
                <div class="font-medium text-normal">
                    Огромное спасибо за чуткость и профессионализм. Все было организовано на высшем уровне
                </div>
            </div>
        </div>
    </NuxtLayout>
</template>

<style lang=scss scoped>

</style>