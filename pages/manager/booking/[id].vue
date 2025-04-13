<script setup>
import BookingDetails from '@/components/manager/booking/BookingDetails.vue'

const booking = {
  id: '0000023',
  date: '07.06.2023',
  client: 'Бақадыр Нурбике Бекзатқызығ',
  phone: '+7 777 777 77 77',
  daysLeft: '3 дня',
  cemetery: 'Северное кладбище',
  sector: 11,
  place: 233,
  deceased: 'Беляков Макар Максимович',
  status: 'Ожидает оплаты',
}
</script>

<template>
  <NuxtLayout name="manager">
    <BookingDetails :booking="booking" />
  </NuxtLayout>
</template>

<style scoped>

</style>