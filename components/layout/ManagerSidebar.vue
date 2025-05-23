<script setup>
import LayoutSidebarDropDown from './LayoutSidebarDropDown.vue';

const managerMenu = [
  {
    title: "Бронирование мест",
    path: '/manager/booking',
    childs: []
  },
  {
    title: "Заявки на захоронение",
    path: '/manager/burial',
    childs: []
  },
  {
    title: "Запрос на облагораживание",
    path: "/manager/ennoblement",
    childs: []
  },
  {
    title: "Управление кладбищами",
    path: "/manager/cemetery",
    childs: []
  },
  {
    title: "Отчеты",
    path: "/supplier/reports",
    childs: []
  },
]

</script>

<template>
  <div class="layout-sidebar bg-white max-w-[375px] w-full max-h-fit py-[36px] px-[12px]">
    <LayoutSidebarDropDown v-for="(item, index) of managerMenu" :key="index" :title="item.title" :childs="item.childs"
                           :item="item"/>
  </div>
</template>