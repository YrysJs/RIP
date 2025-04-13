<script setup>

import EnnoblementCard from "~/components/manager/ennoblement/EnnoblementCard.vue";
const ennoblements = [
  {
    id: 4,
    date: '07.01.2025, 10:00',
    client: 'Бақадыр Нурбике Бекзатқызығ',
    phone: '+7 777 777 77 77',
    deceased: 'Беляков Макар Максимович',
    cemetery: 'Северное кладбище',
    sector: 11,
    place: 233,
    status: 'pending',
    services: [
      { label: 'Облагораживание территории вокруг могилы', checked: true },
      { label: 'Установка ограды', checked: true },
      { label: 'Уборка', checked: true },
    ]
  },
  {
    id: 5,
    date: '07.01.2025, 10:00',
    client: 'Бақадыр Нурбике Бекзатқызығ',
    phone: '+7 777 777 77 77',
    deceased: 'Беляков Макар Максимович',
    cemetery: 'Северное кладбище',
    sector: 11,
    place: 233,
    status: 'done',
    services: [
      { label: 'Облагораживание территории вокруг могилы', checked: true },
      { label: 'Установка ограды', checked: true },
      { label: 'Уборка', checked: true },
    ]
  }
]
</script>

<template>
  <NuxtLayout name="manager">
    <div class="list">
      <EnnoblementCard v-for="item in ennoblements" :key="item.id" :request="item" />
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.list {
  display: flex;
  flex-direction: column;
  gap: 1rem;

}
</style>
