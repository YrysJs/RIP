<script setup>
import BookingDetails from '@/components/manager/booking/BookingDetails.vue'

import {getBurialRequestById, getBurialRequestStatus} from '@/services/manager'
import SuccessModal from "~/components/layout/modals/SuccessModal.vue";

const route = useRoute()

const booking = ref({})

onMounted(async () => {
  try {
    const response = await getBurialRequestById(route.params.id)
    booking.value = response.data
  } catch (error) {
    console.error('Ошибка при получении заявок:', error)
  } finally {
    console.log('finally')
  }
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
<!--    <SuccessModal title="Заявка завершена!" text="Заявка завершена!" @close="true"/>-->
    <BookingDetails v-if="booking" :booking="booking" @cancel="cancelRequest" />
  </NuxtLayout>
</template>

<style scoped>

</style>