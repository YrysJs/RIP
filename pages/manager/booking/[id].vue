<script setup>
import BookingDetails from '@/components/manager/booking/BookingDetails.vue'

import {getBurialRequestById, getBurialRequestStatus} from '@/services/manager'
import {getGraveById, getGraveImages} from '@/services/client'
import GraveDetailModal from "~/components/layout/modals/GraveDetailModal.vue";

const route = useRoute()

const booking = ref({})
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

const cancelRequest = (id) => {
  getBurialRequestStatus({
    id: id,
    status: 'cancelled'
  })
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
    <BookingDetails v-if="booking" :booking="booking" @cancel="cancelRequest" @details="fetchGraveDetails" />

    <Teleport to="body">
      <GraveDetailModal :visible="graveDetailModalVisible" :grave="grave" :images="graveImages" :booking="booking" @close="graveDetailModalVisible = false" />
    </Teleport>
  </NuxtLayout>
</template>

<style scoped>

</style>