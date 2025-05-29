<script setup>
import Login from '~/components/client/auth/login.vue';
import { useRouter } from "vue-router";
import MapSecond from "~/components/map/MapV2.vue";
import { useCemeteryStore } from '~/store/cemetery.js'
import { getCemeteries } from '~/services/cemetery';

const router = useRouter()
const login = ref(false)

const selectedReligios = ref('Не выбрано')
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
    'muslim',
    'Ислам',
    'Христианство',
    'Иудаизм', 
    'Католицизм',
    'Буддизм'
]

const selectedCity = ref('')
const cityListState = ref(false)
const selectReligiosIndex = ref()
const cemeteryStore = useCemeteryStore()

const selected = ref(null)
const cemetriessList = ref([])
const selectedCemetery = ref({})

const reserve = () => {
  login.value = true
  cemeteryStore.setSelected(selectedCemetery.value)
}

const pickCity = (item) => {
    selectedCity.value = item
    cityListState.value = false
}

async function getCemeteriesReq() {
  try {
    const params = {}
    
    if (selectedCity.value && selectedCity.value !== '') {
      params.city = selectedCity.value
    }
    
    if (selectedReligios.value && selectedReligios.value !== 'Не выбрано') {
      params.religion = selectedReligios.value
    }
    
    const response = await getCemeteries(params)
    cemetriessList.value = response.data || []
  } catch (error) {
    console.log(error)
  }
}

watch(selectedCity, () => {
  getCemeteriesReq()
})

watch(selectedReligios, () => {
  getCemeteriesReq()
})

onMounted(async () => {
  await getCemeteriesReq()
})

</script>

<template>
   <Login v-if="login" @close="login = false"/>
    <div class="bg-[#FAFAFA] py-[24px] min-h-[100vh] rounded-lg flex gap-[24px]">
        <div class="bg-white p-[20px] max-w-[408px] w-full relative">
            <h3 class="text-2xl font-bold font-roboto text-[#222222]">Забронировать место</h3>
            <p class="text-[#222222]">{{ cemetriessList.length }} результатов</p>

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

            <div class="flex flex-col gap-[24px] mt-[24px]">
                <div v-for="(item, index) of cemetriessList" :key="item" class="flex justify-between items-center p-[20px]" :class="{ 'bg-[#224C4F26]' : selectedCemetery.id == item.id}" @click="selectedCemetery = item">
                    <div>
                        <h3 class="text-base font-medium font-roboto text-[#222222]">{{ item.name }}</h3>
                        <h4 class="text-sm font-normal text-[#939393]">{{ item.religion }}</h4>
                        <p class="text-sm font-normal text-[#222222]">{{ item.country }} {{ item.city }}</p>
                    </div>
                    <div class="flex flex-col gap-[14px] justify-end items-end">
                        <img class="w-[24px]" src="/icons/map-pin.svg" alt="">
                        <!-- <p class="text-sm font-normal text-[#222222]">4.67km</p> -->
                    </div>
                </div>
            </div>
        </div>
        <div class="w-full">
            <div class="w-full h-[60vh] rounded-xl overflow-hidden">
              <MapSecond :polygons="selectedCemetery.polygon_data" v-model="selected" />
            </div>
            <div class="bg-[#FFF] p-[24px] mt-[24px] rounded-lg" v-if="selectedCemetery.id">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-medium font-roboto text-[#222222]">{{selectedCemetery.name}}</h3>
                    <div class="flex gap-[12px] items-center">
                        <div class="flex gap-[8px] items-center">
                            <div class="w-[36px] h-[16px] rounded-sm bg-[#43DC4966] border-2 border-[#43DC49]"></div>
                            <p class="font-roboto text-sm">Сводобные места</p>
                        </div>
                        <div class="flex gap-[8px] items-center">
                            <div class="w-[36px] h-[16px] rounded-sm bg-[#DCBA4366] border-2 border-[#DCBA43]"></div>
                            <p class="font-roboto text-sm">Зарезервировано</p>
                        </div>
                        <div class="flex gap-[8px] items-center">
                            <div class="w-[36px] h-[16px] rounded-sm bg-[#93939366] border-2 border-[#939393]"></div>
                            <p class="font-roboto text-sm">Занято</p>
                        </div>
                    </div>
                </div>
                <p class="text-[#939393] font-roboto text-sm mt-[4px] mb-[8px]">{{selectedCemetery.religion}}</p>
                <div class="flex gap-[24px] items-center text-[#222222]">
                    <div class="flex gap-[8px] items-center">
                        <img src="/icons/geo-icon.svg" alt=""> <span class="text-sm font-roboto">{{ selectedCemetery.street_name }}</span>
                    </div>
                    <div class="flex gap-[8px] items-center">
                        <img src="/icons/phone.svg" alt=""> <span class="text-sm font-roboto">{{ selectedCemetery.phone }}</span>
                    </div>
                </div>
                <div class="flex gap-[24px] mt-[16px] mb-[32px]">
                    <span class="text-base font-medium font-roboto">Вместимость: {{ selectedCemetery.capacity }}</span>
                    <span class="text-base font-medium font-roboto">Cвободных мест: {{ selectedCemetery.free_spaces }}</span>
                </div>
                <p class="text-base font-roboto text-[#222222]">
                    {{ selectedCemetery.description }}
                </p>
            </div>
            <div class="bg-[#FFF] p-[24px] mt-[24px] rounded-lg">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-medium font-roboto text-[#222222]">{{selectedCemetery.name}}</h3>
                    <div class="flex gap-[34px] items-center">
                        <button class="flex items-center gap-[8px] text-base font-medium font-roboto text-[#222222]">
                            <img src="/icons/share.svg" alt=""> Отправить
                        </button>
                        <button class="w-[90px] h-[50px] border-2 border-[#224C4F] rounded-lg bg-[#fff] text-[#224C4F] font-roboto text-base font-medium">
                            Отмена
                        </button>
                        <button class="w-[257px] h-[50px] border-2 border-[#224C4F] rounded-lg bg-[#224C4F] text-[#fff] font-roboto text-base font-medium" @click="reserve">
                          Забронировать место
                        </button>
                    </div>
                </div>
                <p class="text-[#939393] font-roboto text-sm mt-[4px] mb-[8px]">{{selectedCemetery.religion}}</p>
                <div class="flex gap-[24px] items-center text-[#222222]">
                    <div class="flex gap-[8px] items-center">
                        <img src="/icons/geo-icon.svg" alt=""> <span class="text-sm font-roboto">Улица Бейсебаева, 148, Алматы (4,6 км от вас)</span>
                    </div>
                    <div class="flex gap-[8px] items-center">
                        <img src="/icons/phone.svg" alt=""> <span class="text-sm font-roboto">+7 777 777 77 77</span>
                    </div>
                </div>
                <div class="flex gap-[24px] mt-[16px] mb-[32px]">
                    <span class="text-base font-medium font-roboto">Вместимость: 55 000</span>
                    <span class="text-base font-medium font-roboto">Cвободных мест: 29 750</span>
                </div>
                <p class="text-base font-roboto text-[#222222]">
                    Крупнейшее кладбище города с общей площадью 20 га. На территории расположены мемориальные зоны, посвященные жертвам войны, и семейные участки. Здесь похоронены несколько известных деятелей культуры и науки.Услуги: организация похорон, аренда мест, благоустройство.
                </p>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>

</style>