<script setup>
import EnnoblementDetails from '~/components/manager/ennoblement/EnnoblementDetails.vue'

const ennoblement = {
  id: 4,
  createdAt: '07.06.2023, 10:42',
  cemetery: 'Северное кладбище',
  sector: 11,
  place: 233,
  deceased: 'Беляков Макар Максимович',
  client: 'Бақадыр Нурбике Бекзатқызығ',
  phone: '+7 777 777 77 77',
  services: [
    { label: 'Облагораживание территории вокруг могилы', checked: true },
    { label: 'Установка ограды', checked: false },
    { label: 'Уборка', checked: true }
  ],
  comment: 'Прошу уточнить детали услуг и сроки выполнения работ в телефонном разговоре.',
  status: 'Ожидает исполнения'
}
</script>

<template>
  <NuxtLayout name="manager">
    <EnnoblementDetails :request="ennoblement" />
  </NuxtLayout>
</template>
