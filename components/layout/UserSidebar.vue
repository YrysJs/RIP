<script setup>
import UserLayoutSideBar from './UserLayoutSideBar.vue';

const managerMenu = [
  {
    label: "Запросы в акимат",
    to: '/user/tickets',
    icon: '/icons/tickets.svg',
    active: '/icons/tickets-active.svg',
    badge: 5
  },
  {
    label: "Отчеты, статистика",
    to: '/user/reports',
    icon: '/icons/reports.svg',
    active: '/icons/reports-active.svg',
  },
  {
    label: "Новости",
    to: "/user/news",
    icon: '/icons/news.svg',
    active: '/icons/news-active.svg',
  },
  {
    label: "Пользователи и роли",
    to: "/user/users",
    icon: '/icons/users.svg',
    active: '/icons/users-active.svg',
  },
]

</script>

<template>
  <div class="layout-sidebar bg-white max-w-[320px] w-full max-h-fit py-[36px] px-[12px]">
    <UserLayoutSideBar :items="managerMenu"/>
  </div>
</template>