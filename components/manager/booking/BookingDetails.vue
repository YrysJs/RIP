<template>
  <div class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px]">

    <button class="btn btn-back mr-4" @click="router.push('/manager/booking')">
      <img class="w-4 h-4 mr-[10px]" src="/icons/arrow-left-primary.svg" alt="">
      {{ $t('common.back') }}
    </button>

    <div class="flex justify-between items-center border-b-2 border-[#EEEEEE] pb-[16px] mt-[16px]">
      <h3 class="text-lg font-medium">{{ $t('booking.bookingNumber') }}: <span class="text-[#0091EA]">{{ booking.request_number }}</span></h3>
      <p class="text-sm">{{ new Date(booking.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</p>
    </div>

    <div class="flex justify-between items-start mt-[16px] border-b-1 border-[#EEEEEE] pb-[16px]">
      <div class="min-w-[580px] font-medium flex flex-col gap-[10px] w-full">
        <div class="flex text-base">
          <p class="min-w-[150px]">{{ $t('booking.customer') }}:</p>
          <p class="font-bold">Бақадыр Нұрбике Бекзатқызыg</p>
        </div>
        <div class="flex text-base items-center gap-2 justify-between w-full">
          <div class="flex text-base items-center">
            <p class="min-w-[150px] max-w-[150px]">{{ $t('booking.customerContacts') }}:</p>
            <p class="font-bold">{{ formatPhoneNumber(booking.user_phone) }}</p>
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
          <p class="min-w-[150px]">{{ $t('booking.reservationPeriod') }}:</p>
          <p class="font-bold">{{ $t('booking.remaining') }}: <strong>{{getTimeRemaining(booking.reservation_expires_at)}}</strong></p>
<!--          <img src="/icons/info.svg" class="w-[18px] h-[18px] ml-4" />-->
        </div>
      </div>
    </div>

    <div class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
      <div class="min-w-[580px] font-medium flex flex-col gap-[10px]">
        <div class="flex text-base">
          <p class="min-w-[150px]">{{ $t('client.tickets.active.cemetery') }}</p>
          <p class="font-bold">{{ booking.cemetery_name }}</p>
        </div>
        <div class="flex text-base">
          <p class="min-w-[150px]">{{ $t('client.tickets.active.sector') }}</p>
          <p class="font-bold">{{ booking.sector_number }}</p>
        </div>
        <div class="flex text-base">
          <p class="min-w-[150px]">{{ $t('client.tickets.active.place') }}</p>
          <p class="font-bold">{{ booking.grave_id }}</p>
        </div>
      </div>
      <button class="rounded-md w-[140px] h-[30px] text-sm text-[#224C4F] font-semibold bg-[#EEEEEE]" @click="$emit('details', booking.id)">{{ $t('booking.placeData') }}</button>
    </div>

    <div class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
        <div class="flex text-base">
          <p class="min-w-[150px] font-medium">{{ $t('burial.deceasedFullName') }}:</p>
          <p class="font-bold">{{ booking.deceased?.full_name }}</p>
        </div>

    </div>

    <div class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
      <div class="flex text-base">
        <p class="min-w-[150px] font-medium">{{ $t('burial.burialDateLabel') }}:</p>
        <p v-if="booking.burial_date" class="font-bold">{{ new Date(booking.burial_date).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) }} {{booking.burial_time}}</p>
        <p v-else class="text-sm text-[#DC2626]">{{ $t('burial.burialDateRequired') }}</p>
      </div>
    </div>
    <div class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
      <div class="flex text-base">
        <p class="min-w-[150px] font-medium">{{ $t('common.status') }}:</p>
        <p class="p-[4px] rounded-md bg-[#DC6E29] text-sm font-bold text-white mr-4">
          {{ booking.status === 'pending' ? $t('booking.waitingPayment') : booking.status }}
        </p>
      </div>
    </div>
    <div class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
      <div class="flex text-base items-center">
        <p class="min-w-[150px] max-w-[150px] font-medium">{{ $t('booking.additionalServices') }}</p>
        <p class="text-sm text-[#9CA3AF]">{{ $t('booking.noServices') }}</p>
      </div>
    </div>


    <button class="block w-[225px] h-[51px] rounded-md bg-[#F1F5F9] text-[#1F2937] text-base font-semibold ml-auto mt-[16px]" @click="$emit('cancel', booking.id)">
      {{ $t('booking.cancelBooking') }}
    </button>
  </div>
</template>

<script setup>
defineProps(['booking'])

defineEmits(['cancel', 'details'])

function formatPhoneNumber(phone) {
  if (!/^\d{11}$/.test(phone)) return 'Неверный формат номера';

  return `+${phone[0]} (${phone.slice(1, 4)}) ${phone.slice(4, 7)} ${phone.slice(7, 9)} ${phone.slice(9, 11)}`;
}

function getTimeRemaining(reservation_expires_at) {
  const now = new Date();
  const expiresAt = new Date(reservation_expires_at);

  const diffMs = expiresAt - now;

  if (diffMs <= 0) {
    return 'Срок истёк';
  }

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return `${diffDays} дн. ${diffHours} ч.`;
}

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
