<script setup>
import CemeteryCard from '@/components/manager/cemetery/CemeteryCard.vue'

const cemeteries = Array(3).fill({
  name: 'Северное кладбище',
  type: 'Мусульманское кладбище',
  address: 'Улица Бейсебаева, 148, Алматы',
  distance: 4.6,
  phone: '+7 777 777 77 77',
  capacity: 55000,
  free: 29750,
})
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