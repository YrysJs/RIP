<script setup>
import BookingDetails from '@/components/manager/booking/BookingDetails.vue'

import {getBurialRequestById, getBurialRequestStatus} from '@/services/manager'
import {getGraveById, getGraveImages} from '@/services/client'
import GraveDetailModal from "~/components/layout/modals/GraveDetailModal.vue";
import CancelModal from "~/components/manager/booking/CancelModal.vue";
import {useRouter} from "#vue-router";

const route = useRoute()
const router = useRouter()

const booking = ref({})
const isCancelModalVisible = ref(false)
const selectedRequest = ref()
const graveDetailModalVisible = ref(false)

const grave = ref({})
const graveImages = ref([])

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

const cancelRequest = (comment) => {
  getBurialRequestStatus({
    id: selectedRequest.value,
    status: 'cancelled',
    comment
  }).then(() => {
    router.push('/manager/booking')
  })
}

const selectRequest = (id) => {
  selectedRequest.value = id
  isCancelModalVisible.value = true
}

const fetchGraveDetails = async (id) => {
  try {
    const response = await getGraveById(id)
    grave.value = response.data
    const images = await getGraveImages(id)
    graveImages.value = images.data
  } catch (error) {
    console.error('Ошибка при услуги:', error)
  } finally {
    graveDetailModalVisible.value = true
  }

}

</script>

<template>
  <NuxtLayout name="manager">
    <BookingDetails v-if="booking" :booking="booking" @cancel="selectRequest" @details="fetchGraveDetails" />

    <Teleport to="body">
      <GraveDetailModal :visible="graveDetailModalVisible" :grave="grave" :images="graveImages" :booking="booking" @close="graveDetailModalVisible = false" />
      <CancelModal :visible="isCancelModalVisible" @cancel="cancelRequest" />
    </Teleport>
  </NuxtLayout>
</template>

<style scoped>

</style>