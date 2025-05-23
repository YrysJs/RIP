<script setup>
import BookingDetails from '@/components/manager/booking/BookingDetails.vue'

import { getBurialRequestById, getBurialRequestStatus } from '@/services/manager'

const route = useRoute()

const booking = {
  id: 36,
  request_number: "BR-1748007385-1",
  cemetery_id: 1,
  grave_id: 5,
  deceased_id: 39,
  deceased: {
    id: 39,
    grave_id: 5,
    full_name: "Testov3 Test Testovich",
    inn: "661212301297",
    death_date: null,
    created_at: "2025-05-23T13:36:25.821755Z",
    updated_at: "2025-05-23T13:37:46.5552Z"
  },
  burial_date: "2025-10-10T00:00:00Z",
  burial_time: "10:00",
  user_phone: "77777318243",
  status: "pending",
  is_complete: false,
  created_at: "2025-05-23T13:36:25.821755Z",
  updated_at: "2025-05-23T13:37:46.549021Z"
}

//     {
//   id: '0000023',
//   date: '07.06.2023',
//   client: 'Бақадыр Нурбике Бекзатқызығ',
//   phone: '+7 777 777 77 77',
//   daysLeft: '3 дня',
//   cemetery: 'Северное кладбище',
//   sector: 11,
//   place: 233,
//   deceased: 'Беляков Макар Максимович',
//   status: 'Ожидает оплаты',
// }

onMounted(() => {
  getBurialRequestById(route.params.id)
})

const cancelRequest = (id) => {
  getBurialRequestStatus({
    id: id,
    status: 'cancelled'
  })
}

</script>

<template>
  <NuxtLayout name="manager">
    <BookingDetails :booking="booking" @cancel="cancelRequest" />
  </NuxtLayout>
</template>

<style scoped>

</style>