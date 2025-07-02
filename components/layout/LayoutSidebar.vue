<script setup>
import LayoutSidebarDropDown from './LayoutSidebarDropDown.vue';

const supplierMenu = [
    {
        title: "Мои заявки",
        childs: [
            {
                title: "Активные",
                path: "/supplier/tickets/active",
                count: 0
            },
            {
                title: "Архив",
                path: "/supplier/tickets/archive",
                count: 0
            }
        ]
    },
    {
        title: "Мои товары и услуги",
        childs: [
            {
                title: "Активные",
                path: "/supplier/services/active",
                count: 0
            },
            {
                title: "На рассмотрении",
                path: "/supplier/services/consideration",
                count: 0
            },
            {
                title: "Требует дороботки",
                path: "/supplier/services/improvement",
                count: 0
            },
            {
                title: "Не активные",
                path: "/supplier/services/inactive",
                count: 0
            }
        ]
    },
    {
        title: "Добавить товар/услугу",
        path: "/supplier/services/add-service",
        childs: []
    },
    {
        title: "Обзоры и рейтинги",
        path: "/supplier/reviews",
        childs: []
    },
    {
        title: "Уведомления",
        path: "/supplier/notifications",
        childs: []
    },
    {
        title: "Отчеты",
        path: "/supplier/reports",
        childs: []
    },
    {
        title: "Обращение в Акимат",
        path: "/supplier/goverment/requests",
        count: 0,
        childs: []
    },
]

</script>

<template>
    <div class="layout-sidebar bg-white max-w-[375px] w-full max-h-fit py-[36px] px-[12px]">
        <LayoutSidebarDropDown v-for="(item, index) of supplierMenu" :key="index" :title="item.title" :childs="item.childs" :item="item"/>
    </div>
</template>