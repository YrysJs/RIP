<script setup>
import { useCemeteryStore } from '~/store/cemetery'

const cemeteryStore = useCemeteryStore()

const switcher = ref(false)

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
            <div class="flex gap-[12px] mt-[24px]">
              <div>
                <p class="text-sm text-[#222222] font-roboto font-normal">ИИН</p>
                <input type="text" class="w-[100%] h-[60px] !border !border-[#222222] rounded-lg">
              </div>
              <div>
                <p class="text-sm text-[#222222] font-roboto font-normal">ФИО</p>
                <input type="text" class="w-[100%] h-[60px] !border !border-[#222222] rounded-lg">
              </div>
            </div>
          </div>
          <div class="w-full p-[20px] bg-[#fff] rounded-[16px] text-2xl font-medium font-roboto text-[#222222] mt-[24px]">
            <div class="flex items-center gap-[24px]">
                Даты 
                <div>
                  <label class="relative inline-block w-14 h-8 cursor-pointer select-none">
                    <input v-model="switcher" type="checkbox" class="sr-only peer">
                    <span
                      class="absolute inset-0 bg-gray-200 rounded-full transition-colors
                            peer-focus:ring-2 peer-focus:ring-blue-500
                            peer-checked:bg-blue-500"/>
                    <span
                      class="absolute left-0 top-0 bg-white w-8 h-8 rounded-full shadow-md transition-transform
                            peer-checked:translate-x-6"/>
                  </label>
                </div>
                <span class="text-sm text-[#D63C3C] font-roboto">Необходимо указать даты похорон</span>
            </div>
            <div v-if="switcher" class="grid grid-cols-2 gap-[12px] gap-y-[24px] mt-[24px]">
              <div>
                <p class="text-sm text-[#222222] font-roboto font-normal">Дата смерти</p>
                <input type="date" class="w-[100%] h-[60px] !border !border-[#222222] rounded-lg pl-[16px] text-base">
              </div>
              <div>
                <p class="text-sm text-[#222222] font-roboto font-normal">Заключение о смерти от мед учереждении:</p>
                <input type="text" class="w-[100%] h-[60px] !border !border-[#222222] rounded-lg pl-[16px] text-base">
              </div>
              <div>
                <p class="text-sm text-[#222222] font-roboto font-normal">Дата похорон</p>
                <input type="date" class="w-[100%] h-[60px] !border !border-[#222222] rounded-lg pl-[16px] text-base">
              </div>
              <div>
                <p class="text-sm text-[#222222] font-roboto font-normal">Время похорон</p>
                <input type="text" class="w-[100%] h-[60px] !border !border-[#222222] rounded-lg pl-[16px] text-base" placeholder="00:00">
              </div>
            </div>
          </div>
          <div class="mt-[24px]">
            <h3 class="text-[#222222] font-medium text-xl font-roboto">Дополнительные услуги</h3>
            <div class="grid grid-cols-2 gap-[12px] mt-[24px]">
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
        <div class="p-[20px] bg-white rounded-lg max-w-[376px] h-fit">
          <button class="bg-[#EEEEEE] py-[6px] px-[12px] rounded-lg flex items-center gap-[12px] text-sm font-semibold text-[#224C4F]">
            <img src="/icons/back-icon-blue.svg" alt=""> Вернуться к выбору
          </button>
          <h3 class="text-2xl text-[#222222] font-medium my-[16px]">
            Северное кладбище
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
            <span class="text-base font-bold font-roboto text-[#222222]">11</span>
          </div>
          <div class="border-b border-[#EEEEEE] pb-[16px] pt-[16px] flex items-center">
            <h4 class="text-base font-medium font-roboto text-[#222222] w-[105px]">
              Место:
            </h4>
            <span class="text-base font-bold font-roboto text-[#222222]">233 222</span>
          </div>
          <div class="border-b border-[#EEEEEE] pb-[16px] pt-[16px] flex items-center">
            <h4 class="text-base font-medium font-roboto text-[#222222] w-[105px]">
              ФИО покойного:
            </h4>
            <span class="text-base font-bold font-roboto text-[#222222]">Беляков Макар Максимович</span>
          </div>
          <div class="border-b border-[#EEEEEE] pb-[16px] pt-[16px] flex items-center">
            <h4 class="text-base font-medium font-roboto text-[#222222] w-[105px]">
              Дата похорон:
            </h4>
            <span class="text-base font-light font-roboto text-[#939393]">Не указано</span>
          </div>
          <button class="text-base font-semibold font-roboto w-full h-[51px] rounded-lg bg-[#224C4F] text-white">
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
