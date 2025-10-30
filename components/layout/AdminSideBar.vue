<script setup>
import LayoutSidebarDropDown from './LayoutSidebarDropDown.vue';

const { t } = useI18n();

const managerMenu = computed(() => [
  {
    title: t('adminMenu.akimats'),
    path: '/admin/akimat',
    childs: []
  },
  {
    title: t('adminMenu.suppliersManagement'),
    path: '/admin/suppliers',
    childs: []
  },
  {
    title: t('adminMenu.managersManagement'),
    path: '/admin/managers',
    childs: []
  },
  {
    title: t('adminMenu.cemeteriesManagement'),
    path: "/admin/cemetery",
    childs: []
  },
  {
    title: t('adminMenu.commentsModeration'),
    path: "/admin/comments",
    childs: []
  },
  {
    title: t('adminMenu.appealsModeration'),
    path: "/admin/comment-appeals",
    childs: []
  },
  {
    title: t('adminMenu.productsModeration'),
    path: "/admin/products",
    childs: []
  },
  {
    title: t('adminMenu.burialSearch'),
    path: "/admin/burial",
    childs: []
  },
])

</script>

<template>
  <div class="layout-sidebar bg-white max-w-[375px] w-full max-h-fit py-[36px] px-[12px]">
    <LayoutSidebarDropDown v-for="(item, index) of managerMenu" :key="index" :title="item.title" :childs="item.childs"
                           :item="item"/>
  </div>
</template>