<script setup>
import CemeteryCard from '@/components/manager/cemetery/CemeteryCard.vue'
import {getCemeteries, getGraves} from "~/services/cemetery"
import CemeteryMap from "~/components/map/CemeteryMap.vue";


const cemeteries = ref([])
const selectedCemetery = ref({})
const isMap = ref(false)
const gravesList = ref([])

definePageMeta({
  middleware: ['auth', 'manager'],
});

const selectCemetery = async (cemetery) => {
  try {
    selectedCemetery.value = cemetery
    const response = await getGraves({ cemetery_id: selectedCemetery.value.id })
    gravesList.value = response.data || []
    isMap.value = true
  } catch (error) {
    gravesList.value = []
  }
}

onMounted((async () => {
  try {
    const response = await getCemeteries()
    cemeteries.value = response.data
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
          @close="() => isMap = false"
      />
    </Teleport>
  </NuxtLayout>

</template>

<style scoped>

</style>