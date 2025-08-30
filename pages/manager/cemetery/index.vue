<script setup>
import CemeteryCard from '@/components/manager/cemetery/CemeteryCard.vue'
import {getCemeteries, getGraves} from "~/services/cemetery"
import CemeteryMap from "~/components/map/CemeteryMap.vue";
import {getGraveById, getGraveImages} from "~/services/client/index.js";
import GraveDetailModal from "~/components/layout/modals/GraveDetailModal.vue";


const cemeteries = ref([])
const selectedCemetery = ref({})
const isMap = ref(false)
const gravesList = ref([])

const graveDetailModalVisible = ref(false)

const grave = ref({})
const graveImages = ref([])

definePageMeta({
  middleware: ['auth', 'manager'],
});

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
    const response = await getCemeteries()
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