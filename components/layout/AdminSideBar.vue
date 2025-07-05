<script setup>
import LayoutSidebarDropDown from './LayoutSidebarDropDown.vue';

const managerMenu = [
  {
    title: "Акиматы",
    path: '/admin/akimat',
    childs: []
  },
  {
    title: "Управление поставщиками",
    path: '/admin/suppliers',
    childs: []
  },
  {
    title: "Управление менеджерами",
    path: '/admin/managers',
    childs: []
  },
  {
    title: "Управление кладбищами",
    path: "/admin/cemetery",
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