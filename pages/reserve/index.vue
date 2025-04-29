<script setup>

const selectedReligios = ref('Не выбрано')
const selectedCity = ref('')
const cityListState = ref(false)
const selectReligiosIndex = ref()

const sities = [
    'Алматы',
    'Нур-Султан',
    'Шымкент',
    'Караганда',
    'Тараз',
    'Павлодар',
    'Усть-Каменогорск',
    'Семей',
    'Актобе',
    'Костанай',
    'Кызылорда',
    'Талдыкорган',
    'Тараз',
    'Павлодар',
    'Усть-Каменогорск',
    'Семей',
    'Актобе',
    'Костанай',
    'Кызылорда'
]
const religios = [
    'Ислам',
    'Христианство',
    'Иудаизм', 
    'Католицизм',
    'Буддизм'
]

const islam = [
    {
        title: 'Северное кладбище',
        type: 'Мусульманское кладбище',
        address: '​Улица Сарсенбаева, 187, Алматы'
    },
    {
        title: 'Кен Сай 2',
        type: 'Мусульманское кладбище',
        address: '​Улица Сарсенбаева, 187, Алматы'
    },
    {
        title: 'Центральное кладбище',
        type: 'Мусульманское кладбище',
        address: '​Улица Сарсенбаева, 187, Алматы'
    },
]


const pickCity = (item) => {
    selectedCity.value = item
    cityListState.value = false
}
</script>

<template>
    <div class="bg-[#FAFAFA] py-[24px] min-h-[100vh] rounded-lg flex gap-[24px]">
        <div class="bg-white p-[20px] max-w-[408px] w-full relative">
            <h3 class="text-2xl font-bold font-roboto text-[#222222]">Забронировать место</h3>
            <p class="text-[#222222]">0 результатов</p>

            <div class="flex justify-between items-center my-[24px]">
                <div class="flex justify-between items-center gap-[8px]">
                    <span class="text-base font-roboto text-[#222222]">Город:</span> <span class="text-base font-roboto text-[#224C4F]">{{ selectedCity }}</span>
                </div>
                <button class="bg-[#224C4F26] text-[#224C4F] font-bold font-roboto py-[8px] px-[12px] rounded-lg" @click="cityListState = true">Выбрать</button>
            </div>

            <div v-if="cityListState" class="absolute bg-white top-0 left-0 w-full p-[20px] flex flex-col gap-[8px]">
                <p v-for="item of sities" :key="item" class="text-base font-roboto text-[#222222]" @click="pickCity(item)">{{ item }}</p>
            </div>

            <select id="" v-model="selectedReligios" name="" placeholder="Религия" class="w-full border border-[#EEEEEE] rounded-lg py-[8px] px-[12px]">
                <option v-for="item of religios" :key="item" :value="item">{{ item }}</option>
            </select>

            <div v-if="selectedReligios == 'Ислам'" class="flex flex-col gap-[24px] mt-[24px]">
                <div v-for="(item, index) of islam" :key="item" class="flex justify-between items-center p-[20px]" :class="{ 'bg-[#224C4F26]' : selectReligiosIndex == index}" @click="selectReligiosIndex = index">
                    <div>
                        <h3 class="text-base font-medium font-roboto text-[#222222]">{{ item.title }}</h3>
                        <h4 class="text-sm font-normal text-[#939393]">{{ item.type }}</h4>
                        <p class="text-sm font-normal text-[#222222]">{{ item.address }}</p>
                    </div>
                    <div class="flex flex-col gap-[14px] justify-end items-end">
                        <img class="w-[24px]" src="/icons/map-pin.svg" alt="">
                        <p class="text-sm font-normal text-[#222222]">4.67km</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="w-full">
            <div class="w-full h-[60vh] rounded-xl overflow-hidden">
                <img class="w-full h-[60vh] object-cover" src="/fake-map.png" alt="">
            </div>
            <div>map-bottom</div>
        </div>
    </div>
</template>

<style lang="scss" scoped>

</style>