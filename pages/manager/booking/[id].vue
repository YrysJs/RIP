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

const graveNorth = {
  title: 'Северное кладбище',
  sector: 'N',
  place: '233',
  area: '2.5 x 1.5 м',
  images: [
    'https://images.satu.kz/213275582_w600_h600_213275582.jpg',
    'https://sh-rikm.mo.muzkult.ru/media/2022/04/15/1294088537/Burcevo_-_Kachanovskij_-_2021_3.jpeg',
    'https://belgranstil.by/project-105.jpg'
  ],
  description: 'Участок расположен на ровной местности, что обеспечивает устойчивость и простоту в уходе за территорией. Сохранены все необходимые параметры согласно стандартам для индивидуального захоронения. Территория находится в солнечной части кладбища с легким уклоном, обеспечивающим естественный дренаж. Участок доступен для посещения, имеется удобный подъезд.',
  notes: 'Участок расположен в небольшой низине, защищенной от ветров.',
  coordinates: {
    lat: 43.2567,
    lng: 76.9456
  }
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