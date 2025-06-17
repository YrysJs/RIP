<script setup>
import CemeteryCard from '@/components/manager/cemetery/CemeteryCard.vue'
import {getCemeteries} from "~/services/cemetery"
import CemeteryMap from "~/components/map/CemeteryMap.vue";

const cemeteries = ref([])
const selectedCemetery = ref({})
const isMap = ref(false)

const selectCemetery = (cemetery) => {
  selectedCemetery.value = cemetery
  isMap.value = true
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
          :visible="isMap"
          @close="() => isMap = false"
      />
    </Teleport>
  </NuxtLayout>

</template>

<style scoped>

</style>