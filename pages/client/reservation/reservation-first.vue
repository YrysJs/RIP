<script setup>
import { ref, watch } from 'vue'
import { createDeceased, createBurialRequest } from '~/services/client'
import { useRouter } from 'vue-router'
import { useCemeteryStore } from '~/store/cemetery'
import {pkbGetDeceasedData} from "~/services/login/index.js";
import {useLoadingStore} from "~/store/loading.js";

const router = useRouter()
const cemeteryStore = useCemeteryStore()

const switcher = ref(false)
const inn = ref('')
const fullName = ref('')
const deathDate = ref('')
const burialDate = ref('')
const burialTime = ref('')
const isFcb = ref(false)

const loadingStore = useLoadingStore()

watch(inn, async (newValue) => {
  if (newValue.length !== 12) return;

  try {
    loadingStore.startLoading()
    const response = await pkbGetDeceasedData({
        iin: newValue,
    });
    isFcb.value = true
    fullName.value = capitalizeFullName(response.data.data.person_data.fullName)
    loadingStore.stopLoading()
    console.log('Ответ от pkbGetData:', response);
  } catch (err) {
    console.error('Ошибка при запросе:', err);
  }

})

function capitalizeFullName(str) {
  return str
      .toLowerCase() // всё в нижний регистр
      .split(' ') // разбиваем на слова
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // капиталайз каждого слова
      .join(' '); // склеиваем обратно
}

// Функция для бронирования
const handleBooking = async () => {
  try {
    const dataBurial = {
      cemetery_id: cemeteryStore.selectedGrave.cemetery_id,
      full_name: fullName.value,
      inn: inn.value,
      death_date: deathDate.value ? deathDate.value+'T00:00:00Z' : undefined,
      grave_id: cemeteryStore.selectedGrave.id
    }

    const burialRequest = await createBurialRequest(dataBurial)

    router.push('/client/tickets/active')
  } catch (error) {
    console.error('Ошибка при отправке данных:', error)
  }
}
</script>

<template>
  <div class="bg-[#FAFAFA] min-h-[100vh] py-[70px]">
      <div class="container flex gap-[24px]">
        <div class="max-w-[777px] w-full">
          <div class="w-full h-[61px] p-[20px] flex items-center bg-[#fff] rounded-[16px] text-4xl font-semibold">
            Бронирование 
          </div>
          <div class="w-full p-[20px] bg-[#fff] rounded-[16px] text-4xl font-semibold mt-[24px]">
            <div class="flex items-center gap-[10px]">
              <h3 class="text-2xl font-medium font-roboto text-[#222222]">Укажите данные покойного</h3> <span class="text-sm text-[#D63C3C] font-roboto">Поля обязательно к заполнению</span>
            </div>
            <div class="grid grid-cols-2 gap-[12px] mt-[24px]">
              <div>
                <p class="text-sm text-[#222222] font-roboto font-normal">ИИН</p>
                <input v-model="inn" type="text" class="pl-4 w-[100%] h-[60px] !border !border-[#222222] rounded-lg text-lg input">
              </div>
              <div>
                <p class="text-sm text-[#222222] font-roboto font-normal">ФИО</p>
                <input v-model="fullName" type="text" class="pl-4 w-[100%] h-[60px] !border !border-[#222222] rounded-lg text-lg input">
              </div>
            </div>
          </div>
          <div class="w-full p-[20px] bg-[#fff] rounded-[16px] text-2xl font-medium font-roboto text-[#222222] mt-[24px]">
            <div class="flex items-center gap-[24px]">
                Даты 
                <div>
                  <label class="relative inline-block w-14 h-8 cursor-pointer select-none">
                    <input v-model="switcher" type="checkbox" class="sr-only peer input">
                    <span
                      class="absolute inset-0 bg-gray-200 rounded-full transition-colors
                            peer-focus:ring-2 peer-focus:ring-blue-500
                            peer-checked:bg-blue-500"/>
                    <span
                      class="absolute left-0 top-0 bg-white w-8 h-8 rounded-full shadow-md transition-transform
                            peer-checked:translate-x-6"/>
                  </label>
                </div>
            </div>
            <div v-if="switcher" class="grid grid-cols-2 gap-[12px] gap-y-[24px] mt-[24px]">
              <div>
                <p class="text-sm text-[#222222] font-roboto font-normal">Дата смерти</p>
                <input v-model="deathDate" type="date" class="w-[100%] h-[60px] !border !border-[#222222] rounded-lg pl-[16px] text-base input">
              </div>
              <div>
                <p class="text-sm text-[#222222] font-roboto font-normal">Заключение о смерти от мед учереждении:</p>
                <input type="text" class="w-[100%] h-[60px] !border !border-[#222222] rounded-lg pl-[16px] text-base input">
              </div>
              <div>
                <p class="text-sm text-[#222222] font-roboto font-normal">Дата похорон</p>
                <input v-model="burialDate" type="date" class="w-[100%] h-[60px] !border !border-[#222222] rounded-lg pl-[16px] text-base input">
              </div>
              <div>
                <p class="text-sm text-[#222222] font-roboto font-normal">Время похорон</p>
                <input v-model="burialTime" type="time" class="w-[100%] h-[60px] !border !border-[#222222] rounded-lg pl-[16px] text-base input" placeholder="00:00">
              </div>
            </div>
          </div>
        </div>
        <div class="p-[20px] bg-white rounded-lg max-w-[376px] h-fit">
          <button class="bg-[#EEEEEE] py-[6px] px-[12px] rounded-lg flex items-center gap-[12px] text-sm font-semibold text-[#224C4F]">
            <img src="/icons/back-icon-blue.svg" alt=""> Вернуться к выбору
          </button>
          <h3 class="text-2xl text-[#222222] font-medium my-[16px]">
            {{ cemeteryStore.selectedCemetery.name }}
          </h3>
          <div class="border-b border-[#EEEEEE] pb-[16px] flex items-center">
            <h4 class="text-base font-medium font-roboto text-[#222222] w-[105px]">
              Срок брони:
            </h4>
            <span class="text-base font-bold font-roboto text-[#222222]">3 дня</span>
            <img class="ml-[16px]" src="/icons/info.svg" alt="">
          </div>
          <div class="border-b border-[#EEEEEE] pb-[16px] pt-[16px] flex items-center">
            <h4 class="text-base font-medium font-roboto text-[#222222] w-[105px]">
              Сектор:
            </h4>
            <span class="text-base font-bold font-roboto text-[#222222]">{{ cemeteryStore.selectedGrave.sector_number }}</span>
          </div>
          <div class="border-b border-[#EEEEEE] pb-[16px] pt-[16px] flex items-center">
            <h4 class="text-base font-medium font-roboto text-[#222222] w-[105px]">
              Место:
            </h4>
            <span class="text-base font-bold font-roboto text-[#222222]">{{ cemeteryStore.selectedGrave.grave_number }}</span>
          </div>
          <div class="border-b border-[#EEEEEE] pb-[16px] pt-[16px] flex items-center">
            <h4 class="text-base font-medium font-roboto text-[#222222] w-[105px]">
              ФИО покойного:
            </h4>
            <span class="text-base font-bold font-roboto text-[#222222]">{{ fullName || '' }}</span>
          </div>
          <div class="border-b border-[#EEEEEE] pb-[16px] pt-[16px] flex items-center">
            <h4 class="text-base font-medium font-roboto text-[#222222] w-[105px]">
              Дата похорон:
            </h4>
            <span class="text-base" :class="burialDate ? 'font-bold text-[#222222]' : 'font-light text-[#939393]'">
              {{ burialDate || 'Не указано' }} {{ burialTime || '' }}
            </span>
          </div>
          <button @click="handleBooking" class="text-base font-semibold font-roboto w-full h-[51px] rounded-lg bg-[#224C4F] text-white">
            Забронировать 
          </button>
        </div>
      </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  max-width: 1170px;
  width: 100%;
  margin: auto;
}
</style>
