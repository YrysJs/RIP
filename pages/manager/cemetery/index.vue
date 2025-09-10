<script setup>
import CemeteryCard from '@/components/manager/cemetery/CemeteryCard.vue'
import {getManagerCemeteries, getGraves} from "~/services/cemetery"
import CemeteryMap from "~/components/map/CemeteryMap.vue";
import {getGraveById, getGraveImages} from "~/services/client/index.js";
import GraveDetailModal from "~/components/layout/modals/GraveDetailModal.vue";
import ManagerProfileCard from '@/components/manager/ManagerProfileCard.vue'

const cemeteries = ref([])
const selectedCemetery = ref({})
const isMap = ref(false)
const gravesList = ref([])

const graveDetailModalVisible = ref(false)

const grave = ref({})
const graveImages = ref([])

const managerProfile = ref({
  fullName: 'Алтынбекова Сымбат Ержанкызы',
  iin: '981231300267',
  phone: '77777777777' // можно и сразу с +7
})
// definePageMeta({
//   middleware: ['auth', 'manager'],
// });

const selectCemetery = async (cemetery) => {
  try {
    selectedCemetery.value = cemetery
    const response = await getGraves({ cemetery_id: selectedCemetery.value.id })
    gravesList.value = response.data.data || []
    isMap.value = true
  } catch (error) {
    gravesList.value = []
  }
}

const fetchGraveDetails = async (id) => {
  try {
    const response = await getGraveById(id)
    grave.value = response.data
    const images = await getGraveImages(id)
    graveImages.value = images.data
    graveDetailModalVisible.value = true

  } catch (error) {
    console.error('Ошибка при услуги:', error)
  }

}

onMounted((async () => {
  try {
    const response = await getManagerCemeteries()
    cemeteries.value = response.data.data
  } catch (error) {
    console.error('Ошибка при получении заявок:', error)
  } finally {
    console.log('finally')
  }
}))
</script>

<template>
  <NuxtLayout name="manager">
<!--   <ManagerProfileCard  -->
<!--      class="mb-1 md:mb-1"-->
<!--      :profile="managerProfile"-->
<!--      @edit="router.push('/manager/profile/edit')"  />-->

    <p class="opacity-0">{{selectedCemetery.id}}</p>
      <CemeteryCard
          v-for="(cemetery, index) in cemeteries"
          :key="index"
          :cemetery="cemetery"
          @open-map="selectCemetery"
      />
    <Teleport to="body">

      <CemeteryMap
          :cemetery="selectedCemetery"
          :polygons="gravesList"
          :visible="isMap"
          @grave-click="fetchGraveDetails"
          @close="() => isMap = false"
      />
      <GraveDetailModal :visible="graveDetailModalVisible" :grave="grave" :images="graveImages" @close=" () => graveDetailModalVisible = false" />
    </Teleport>
  </NuxtLayout>

</template>

<style scoped>

</style>