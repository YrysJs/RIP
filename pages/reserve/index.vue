<script setup>
import { useRouter } from "vue-router";
import MapSecond from "~/components/map/MapV2.vue";
import { useCemeteryStore } from '~/store/cemetery.js'
import { getCemeteries, getGraves } from '~/services/cemetery';
import ShareCoordModal from "~/components/layout/modals/ShareCoordModal.vue";

const router = useRouter()

const shareCoordModalState = ref(false)
const selectedReligios = ref('')
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
const gravesList = ref([])
const selectedGrave = ref(null)
const showGraveDetails = ref(false)

const reserve = () => {
  // Сохраняем данные кладбища и выбранной могилы в store
  if (selectedCemetery.value && selectedGrave.value) {
    cemeteryStore.setReservationData(selectedCemetery.value, selectedGrave.value)
  } else {
    cemeteryStore.setSelected(selectedCemetery.value)
  }
  
  router.push('/client/reservation/reservation-first')
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
    cemetriessList.value = response.data.data || []
  } catch (error) {
    console.log(error)
  }
}

async function getGravesReq(cemetery_id) {
  try {
    if (!cemetery_id) return
    
    const response = await getGraves({ cemetery_id })
    gravesList.value = response.data || []
  } catch (error) {
    gravesList.value = []
  }
}

watch(selectedCity, () => {
  getCemeteriesReq()
})

watch(selectedReligios, () => {
  getCemeteriesReq()
})

watch(selectedCemetery, (newCemetery) => {
  if (newCemetery && newCemetery.id) {
    getGravesReq(newCemetery.id)
    // Сохраняем выбранное кладбище в store
    cemeteryStore.setSelected(newCemetery)
    // Очищаем предыдущий выбор могилы при смене кладбища
    if (selectedGrave.value) {
      cancelGraveSelection()
    }
  }
})

watch(selected, (newSelected) => {
  if (newSelected) {
    selectedGrave.value = newSelected
    showGraveDetails.value = true
    // Сохраняем выбранную могилу в store
    cemeteryStore.setSelectedGrave(newSelected)
  }
})

onMounted(async () => {
  await getCemeteriesReq()
})

const cancelGraveSelection = () => {
  selectedGrave.value = null
  showGraveDetails.value = false
  selected.value = null
  // Очищаем выбранную могилу из store
  cemeteryStore.clearSelectedGrave()
}

const getGraveStatusText = (status) => {
  switch(status) {
    case 'free': return 'Свободное место'
    case 'reserved': return 'Зарезервировано'
    case 'occupied': return 'Занято'
    default: return 'Неизвестно'
  }
}

const graveLat = ref(null)
const graveLng = ref(null)

const shareGraveData = () => {
  graveLat.value = selected.value.polygon_data.coordinates[0][1]
  graveLng.value = selected.value.polygon_data.coordinates[0][0]
  shareCoordModalState.value = true
}
</script>

<template>
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

            <div v-if="cityListState" class="absolute bg-white top-0 left-0 w-full p-[20px] flex flex-col gap-[8px] z-10">
                <p v-for="item of sities" :key="item" class="text-base font-roboto text-[#222222] cursor-pointer" @click="pickCity(item)">{{ item }}</p>
            </div>

            <select id="" v-model="selectedReligios" name="" placeholder="Религия" class="w-full border border-[#EEEEEE] rounded-lg py-[8px] px-[12px] input select">
              <option value="" disabled>Религия</option>
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
            <div class="w-full h-[50vh] rounded-xl overflow-hidden">
              <MapSecond 
                :polygons="gravesList" 
                :cemetery-boundary="selectedCemetery" 
                :center-coords="selectedCemetery.location_coords"
                v-model="selected" 
              />
            </div>
            <div class="bg-[#FFF] p-[24px] mt-[24px] rounded-lg" v-if="selectedCemetery.id && !showGraveDetails">
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
                  <span class="text-base font-medium font-roboto">Стоимость брони: 10 000₸</span>
                </div>
                <p class="text-base font-roboto text-[#222222]">
                    {{ selectedCemetery.description }}
                </p>
            </div>
            
            <!-- Блок информации о выбранной могиле -->
            <div class="bg-[#FFF] p-[24px] mt-[24px] rounded-lg" v-if="showGraveDetails && selectedGrave">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-medium font-roboto text-[#222222]">
                        Участок {{ selectedGrave.sector_number }}-{{ selectedGrave.grave_number }}
                    </h3>
                    <div class="flex gap-[34px] items-center">
                        <button class="flex items-center gap-[8px] text-base font-medium font-roboto text-[#222222]" @click="shareGraveData">
                            <img src="/icons/share.svg" alt=""> Отправить
                        </button>
                        <button 
                            class="w-[90px] h-[50px] border-2 border-[#224C4F] rounded-lg bg-[#fff] text-[#224C4F] font-roboto text-base font-medium"
                            @click="cancelGraveSelection"
                        >
                            Отмена
                        </button>
                        <button 
                            v-if="selectedGrave.status == 'free'"
                            class="w-[257px] h-[50px] border-2 border-[#224C4F] rounded-lg bg-[#224C4F] text-[#fff] font-roboto text-base font-medium" 
                            @click="reserve"
                        >
                          Забронировать место
                        </button>
                    </div>
                </div>
                <p class="text-[#939393] font-roboto text-sm mt-[4px] mb-[8px]">
                    {{ getGraveStatusText(selectedGrave.status) }}
                </p>
                <!-- Блок фотографий участка -->
                <div v-if="selectedGrave && selectedGrave.photos_urls && selectedGrave.photos_urls.length > 0" class="mb-6">
                    <div class="flex gap-4 overflow-x-auto pb-2">
                        <div 
                            v-for="(photo, index) in selectedGrave.photos_urls" 
                            :key="index"
                            class="min-w-[200px] h-[150px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0"
                        >
                            <img 
                                :src="photo" 
                                :alt="`Фото участка ${index + 1}`"
                                class="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
                <div v-else class="mb-6">
                  <div class="flex gap-4 overflow-x-scroll">
                    <div 
                      class="w-[752px] h-[221px] aspect-square rounded-lg overflow-hidden bg-gray-100 flex overflow-x-scroll"
                    >
                      <img 
                        src="/images/placeholder.png"
                        alt="Фото"
                        class="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                      <img 
                        src="/images/placeholder.png"
                        alt="Фото"
                        class="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
                
                <div class="flex gap-[24px] items-center text-[#222222]">
                    <div class="flex gap-[8px] items-center">
                        <span class="text-sm font-roboto">Сектор: {{ selectedGrave.sector_number }}</span>
                    </div>
                    <div class="flex gap-[8px] items-center">
                        <span class="text-sm font-roboto">Место: {{ selectedGrave.grave_number }}</span>
                    </div>
                    <div class="flex gap-[8px] items-center">
                        <span class="text-sm font-roboto">Размер: {{ selectedGrave.width }}x{{ selectedGrave.height }} м</span>
                    </div>
                </div>
                <div class="flex gap-[24px] mt-[16px] mb-[32px]">
                    <span class="text-base font-medium font-roboto">Статус: {{ getGraveStatusText(selectedGrave.status) }}</span>
                    <span class="text-base font-medium font-roboto">ID участка: {{ selectedGrave.id }}</span>
                </div>
                <p class="text-base font-roboto text-[#222222]">
                    {{ selectedGrave.description || 'Информация об участке отсутствует' }}
                </p>
            </div>
        </div>
    </div>
    <ShareCoordModal :visible="shareCoordModalState" :lat="graveLat" :lng="graveLng" @close="shareCoordModalState = false" />
</template>

<style lang="scss" scoped>

</style>