<script setup>
import LayoutSidebarDropDown from './LayoutSidebarDropDown.vue';

const supplierMenu = [
    {
        title: "Активные брони",
        path: "/client/tickets/active",
        count: 0,
        childs: []
    },
    {
        title: "Заявка на захоронение ",
        path: "/client/tickets/burial",
        count: 0,
        childs: []
    },
    {
        title: "Дополнительные услуги",
        path: "/client/services",
        count: 0,
        childs: []
    },
    {
        title: "Цифровой мемориал",
        path: "/client/memorial",
        count: 0,
        childs: []
    },
    {
        title: "Запрос на перезахоронение",
        path: "/client/tickets/active",
        count: 0,
        childs: []
    },
    {
        title: "Обращение в Акимат",
        path: "/client/gover+ment/requests",
        count: 0,
        childs: []
    },
    {
        title: "Обращение в администрацию кладбища",
        path: "/client/tickets/active",
        count: 0,
        childs: []
    }
]

</script>

<template>
    <div class="layout-sidebar bg-white max-w-[375px] w-full max-h-fit py-[36px] px-[12px]">
        <LayoutSidebarDropDown v-for="(item, index) of supplierMenu" :key="index" :title="item.title" :childs="item.childs" :item="item"/>
    </div>
</template>