<template>
  <div class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px]">
    <button class="btn btn-back mr-4" @click="router.push('/manager/booking')">
      <img class="w-4 h-4 mr-[10px]" src="/icons/arrow-left-primary.svg" alt="">
      Назад
    </button>

    <div class="flex justify-between items-center border-b-2 border-[#EEEEEE] pb-[16px] mt-[16px]">
      <h3 class="text-lg font-medium">Бронирование: <span class="text-[#0091EA]">{{ booking.id }}</span></h3>
      <p class="text-sm">{{ booking.date }}</p>
    </div>

    <div class="flex justify-between items-start mt-[16px] border-b-1 border-[#EEEEEE] pb-[16px]">
      <div class="min-w-[580px] font-medium flex flex-col gap-[10px] w-full">
        <div class="flex text-base">
          <p class="min-w-[150px]">Заказчик:</p>
          <p class="font-bold">{{ booking.client }}</p>
        </div>
        <div class="flex text-base items-center gap-2 justify-between w-full">
          <div class="flex text-base items-center">
            <p class="min-w-[150px] max-w-[150px]">Контакты заказчика:</p>
            <p class="font-bold">{{ booking.phone }}</p>
          </div>

          <div class="flex gap-1">
            <div class="flex justify-center items-center p-1 bg-[#224C4F26] rounded cursor-pointer">
              <img src="/icons/phone-primary.svg" class="w-[24px] h-[24px]" />
            </div>
            <div class="flex justify-center items-center p-1 bg-[#224C4F26] rounded cursor-pointer">
              <img src="/icons/whatsapp.svg" class="w-[24px] h-[24px]" />
            </div>
          </div>



        </div>
        <div class="flex text-base items-center gap-1">
          <p class="min-w-[150px]">Срок брони:</p>
          <p class="font-bold">Осталось: <strong>{{ booking.daysLeft }}</strong></p>
          <img src="/icons/info.svg" class="w-[18px] h-[18px] ml-4" />
        </div>
      </div>
    </div>

    <div class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
      <div class="min-w-[580px] font-medium flex flex-col gap-[10px]">
        <div class="flex text-base">
          <p class="min-w-[150px]">Кладбище:</p>
          <p class="font-bold">{{ booking.cemetery }}</p>
        </div>
        <div class="flex text-base">
          <p class="min-w-[150px]">Сектор</p>
          <p class="font-bold">{{ booking.sector }}</p>
        </div>
        <div class="flex text-base">
          <p class="min-w-[150px]">Место:</p>
          <p class="font-bold">{{ booking.place }}</p>
        </div>
      </div>
      <button class="rounded-md w-[140px] h-[30px] text-sm text-[#224C4F] font-semibold bg-[#EEEEEE]">Данные участка</button>
    </div>

    <div class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
        <div class="flex text-base">
          <p class="min-w-[150px] font-medium">ФИО покойного:</p>
          <p class="font-bold">{{ booking.deceased }}</p>
        </div>

    </div>

    <div class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
      <div class="flex text-base">
        <p class="min-w-[150px] font-medium">Дата похорон:</p>
        <p class="text-sm text-[#DC2626]">Необходимо указать даты похорон</p>
      </div>
    </div>
    <div class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
      <div class="flex text-base">
        <p class="min-w-[150px] font-medium">Статус:</p>
        <p class="p-[4px] rounded-md bg-[#DC6E29] text-sm font-bold text-white mr-4">
          {{ booking.status }}
        </p>
      </div>
    </div>
    <div class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
      <div class="flex text-base items-center">
        <p class="min-w-[150px] max-w-[150px] font-medium">Дополнительные услуги:</p>
        <p class="text-sm text-[#9CA3AF]">Отсутствуют</p>
      </div>
    </div>


    <button class="block w-[225px] h-[51px] rounded-md bg-[#F1F5F9] text-[#1F2937] text-base font-semibold ml-auto mt-[16px]">
      Отменить бронь
    </button>
  </div>
</template>

<script setup>
defineProps(['booking'])

const router = useRouter();
</script>

<style scoped>
.btn-back {
  height: 40px;
  padding: 12px 16px;
  font-size: 14px;
  color: #224C4F;
  background: #EEEEEE;
}
</style>
