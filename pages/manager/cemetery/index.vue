<script setup>
import CemeteryCard from '@/components/manager/cemetery/CemeteryCard.vue'
import {getCemeteries} from "~/services/cemetery"

const cemeteries = [
  {
    id: 1,
    name: "Кладбище 1",
    description: "Новое кладбище",
    country: "Казахстан",
    city: "Алматы",
    street_name: "Рыскулова 25/1",
    location_coords: [
      44.4545,
      73.5656
    ],
    polygon_data: {
      coordinates: [
        [
          55.28770929,
          25.22007825
        ],
        [
          55.28770929,
          25.25687836
        ],
        [
          55.33302789,
          25.25687836
        ],
        [
          55.33302789,
          25.22007825
        ],
        [
          55.28770929,
          25.22007825
        ]
      ],
      color: "#fff",
      width: 5
    },
    religion: "Ислам",
    created_at: "2025-05-23T13:05:50.93428Z",
    updated_at: "2025-05-23T13:05:50.93428Z",
    status: "active",
    capacity: 50000,
    free_spaces: 0
  }
]

//     Array(3).fill({
//   name: 'Северное кладбище',
//   type: 'Мусульманское кладбище',
//   address: 'Улица Бейсебаева, 148, Алматы',
//   distance: 4.6,
//   phone: '+7 777 777 77 77',
//   capacity: 55000,
//   free: 29750,
// })

onMounted(() => {
  getCemeteries()
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