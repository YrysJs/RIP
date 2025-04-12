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
                path: "/3",
                count: 0
            },
            {
                title: "На рассмотрении",
                path: "/4",
                count: 0
            },
            {
                title: "Требует дороботки",
                path: "/5",
                count: 0
            },
            {
                title: "Не активные",
                path: "/6",
                count: 0
            }
        ]
    },
    {
        title: "Добавить товар/услугу",
        path: "/7",
        childs: []
    },
    {
        title: "Обзоры и рейтинги",
        path: "/supplier/reviews",
        childs: []
    },
    {
        title: "Уведомления",
        path: "/9",
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
        <LayoutSidebarDropDown v-for="(item, index) of supplierMenu" :key="index" :title="item.title" :childs="item.childs" :item="item"/>
    </div>
</template>