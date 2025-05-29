<script setup>
import CemeteryCard from '@/components/manager/cemetery/CemeteryCard.vue'
import {getCemeteries} from "~/services/cemetery"

const cemeteries = ref([])

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
      <CemeteryCard
          v-for="(cemetery, index) in cemeteries"
          :key="index"
          :cemetery="cemetery"
      />
  </NuxtLayout>
</template>

<style scoped>

</style>