<script setup>
import LayoutSidebarDropDown from './LayoutSidebarDropDown.vue';

const managerMenu = [
  {
    title: "Бронирование мест",
    path: '/1',
    childs: []
  },
  {
    title: "Заявки на захоронение",
    path: '/1',
    childs: []
  },
  {
    title: "Запрос на облагораживание",
    path: "/7",
    childs: []
  },
  {
    title: "Управление кладбищами",
    path: "/supplier/reviews",
    childs: [
      {
        title: "Кладбище",
        path: "/3",
        count: 4
      },
      {
        title: "На рассмотрении",
        path: "/4",
        count: 1
      },
      {
        title: "Требует дороботки",
        path: "/5",
        count: 1
      },
      {
        title: "Не активные",
        path: "/6",
        count: 0
      }
    ]
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
    <LayoutSidebarDropDown v-for="(item, index) of managerMenu" :key="index" :title="item.title" :childs="item.childs" :item="item"/>
  </div>
</template>