<script setup>
import { defineProps } from 'vue';
const props = defineProps(['grave', 'visible', 'booking', 'images'])

const emit = defineEmits(['close', 'confirm', 'cancel'])

function removeEscapedQuotes(str) {
  return str.replace(/\\"/g, '');
}

function formatPhoneNumber(phone) {
  if (!/^\d{11}$/.test(phone)) return 'Неверный формат номера';

  return `+${phone[0]} (${phone.slice(1, 4)}) ${phone.slice(4, 7)} ${phone.slice(7, 9)} ${phone.slice(9, 11)}`;
}

const closeModal = () => {
  emit('close')
}
</script>

<template>
  <div v-if="visible" class="modal fixed min-w-full min-h-[100vh] flex justify-center items-center z-50">
    <div class="bg-white rounded-lg max-w-[800px] w-full max-h-[90vh] overflow-y-auto m-4">
      <!-- Header -->
      <div class="flex justify-between items-center pt-6 px-6 pb-0 border-b">
        <h2 class="text-2xl font-bold">{{ booking?.cemetery_name }}</h2>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-2xl">
          &times;
        </button>
      </div>

      <!-- Content -->
      <div class="pt-2 px-6 pb-6">
        <!-- Location info -->
        <div class="mb-6">
          <div class="flex gap-1 items-center mb-2">
            <span class="bg-[#E9EDED] rounded-lg px-2 py-1 text-sm">Сектор <span class="font-bold">{{ grave?.sector_number }}</span></span>
            <span class="bg-[#E9EDED] rounded-lg px-2 py-1 text-sm">Место <span class="font-bold">{{ grave?.grave_number }}</span></span>
            <span class="bg-[#E9EDED] rounded-lg px-2 py-1 text-sm">Площадь: <span class="font-bold">{{ grave?.area || '2.5 x 1.5 м' }}</span></span>
          </div>
        </div>

        <!-- Images Gallery -->
        <div v-if="images?.photos_urls?.length" class="mb-6">
          <div class="flex gap-4 overflow-x-scroll">
            <div
                v-for="(image, index) in images"
                :key="index"
                class="min-w-[330px] h-[221px] aspect-square rounded-lg overflow-hidden bg-gray-100"
            >
              <img
                  :src="removeEscapedQuotes(image)"
                  :alt="`Фото ${index + 1}`"
                  class="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-between items-start mt-[16px] border-b border-[#EEEEEE] pb-[16px]">
          <div class="flex text-base">
            <p class="min-w-[150px] font-medium">ФИО покойного:</p>
            <p class="font-bold">{{ booking?.deceased?.full_name }}</p>
          </div>

        </div>

        <!-- Заключение о смерти -->
        <div class="flex text-base border-b border-[#EEEEEE] pb-[16px] mt-4">
          <p class="min-w-[150px] max-w-[150px] font-medium">Заключение о смерти:</p>
          <a
              href="/"
              target="_blank"
              class="text-[#007AFF] font-medium hover:underline"
          >
            Открыть
          </a>
        </div>

        <!-- Дата похорон -->
        <div class="flex text-base mt-2">
          <p class="min-w-[150px] max-w-[150px] font-medium">Дата похорон:</p>
          <p v-if="booking?.burial_date" class="font-bold">{{ new Date(booking.burial_date).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) }} {{booking.burial_time}}</p>
        </div>

        <!-- Заказчик -->
        <div class="flex text-base mt-2">
          <p class="min-w-[150px] max-w-[150px] font-medium">Заказчик:</p>
          <p class="font-bold">Бақадыр Нұрбике Бекзатқызыg</p>
        </div>

        <!-- Контакты заказчика -->
        <div class="flex text-base border-b border-[#EEEEEE] pb-[16px] mt-2">
          <p class="min-w-[150px] max-w-[150px] font-medium">Контакты заказчика:</p>
          <p class="font-bold">{{ formatPhoneNumber(booking?.user_phone) }}</p>
        </div>

        <!-- Статус -->
        <div class="flex text-base mt-4 items-center  border-b border-[#EEEEEE] pb-[16px]">
          <p class="min-w-[150px] max-w-[150px] font-medium">Статус:</p>
          <div class="flex gap-2 items-center">
            <span class="bg-[#E5F8EC] text-[#1EB676] px-3 py-1 rounded-md text-sm font-medium">Оплачено</span>
            <span class="bg-[#FDEBC8] text-[#E39827] px-3 py-1 rounded-md text-sm font-medium">Ожидает подтверждения</span>
          </div>
        </div>

        <!-- Кнопки -->
        <div class="flex justify-between mt-6">
          <button class="flex items-center gap-2 px-4 py-2 border rounded-md border-gray-300 hover:bg-gray-100 text-sm">
            <img src="/icons/file-text.svg" alt="чек" class="w-4 h-4" />
            Чек об оплате
          </button>
          <div class="flex gap-[16px]">
            <button class="px-6 py-2 bg-[#FEE2E2] text-[#B91C1C] rounded-md text-sm hover:bg-[#fcbaba]" @click="emit('cancel')">
              Отменить
            </button>
            <button class="px-6 py-2 bg-[#10B981] text-white rounded-md text-sm hover:bg-[#0e9c6e] ml-auto" @click="emit('confirm')">
              Подтвердить захоронение
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal {
  top: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
}
</style>