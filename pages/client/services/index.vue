<script setup>
import { ref } from 'vue'

const items = Array.from({ length: 5 }, (_, i) => i)

const openItems = ref(items.map(() => false))

function toggle(index) {
    openItems.value[index] = !openItems.value[index]
}
</script>

<template>
    <NuxtLayout name="client">
        <div class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px] flex flex-col gap-[30px]">
            <div v-for="(item, index) in items"  :key="index" class="item">
                <div class="flex justify-between items-center cursor-pointer select-none" @click="toggle(index)">
                    <h3 class="text-2xl font-medium">Доставка покойного</h3>
                    <img src="/icons/dropdown.svg" alt="" :class="{ 'transform rotate-180': openItems[index] }">
                </div>
                <div v-show="openItems[index]" class="drop">
                    <div class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
                        <div class="min-w-[580px] font-medium flex flex-col gap-[10px]">
                            <div class="flex text-base"><p class="min-w-[150px]">Кладбище:</p><p>Северное кладбище</p></div>
                            <div class="flex text-base"><p class="min-w-[150px]">Сектор</p><p>11</p></div>
                            <div class="flex text-base"><p class="min-w-[150px]">Место:</p><p>233</p></div>
                        </div>
                    </div>
                    <div class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
                        <div class="font-medium flex flex-col gap-[10px]">
                            <div class="flex text-base"><p class="min-w-[150px] max-w-[150px]">ФИО покойного:</p><p class="font-bold">Беляков Макар Максимович</p></div>
                            <div class="flex text-base"><p class="min-w-[150px] max-w-[150px]">Дата похорон:</p><p>12.09.2024, 10:00</p></div>
                        </div>
                    </div>
                    <div class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
                        <div class="font-medium flex flex-col gap-[10px]">
                            <div class="flex text-base">
                                <p class="min-w-[150px] max-w-[150px]">Cтатус:</p>
                                <p class="p-[4px] rounded-md bg-[#339B38] text-sm font-semibold text-white mr-4">Выполнен</p>
                                <p class="p-[4px] rounded-md bg-[#DC6E29] text-sm font-semibold text-white mr-4">Выполняется</p>
                            </div>
                            <div class="flex text-base">
                                <p class="min-w-[150px] max-w-[150px]">Время прибытия:</p>
                                <p class="p-[4px]">10:00</p>
                            </div>
                            <div class="flex text-base">
                                <p class="min-w-[150px] max-w-[150px]">Адрес прибытия:</p>
                                <p class="p-[4px]">Улица Бейсебаева, 148, Алматы, д.10, кв 5</p>
                            </div>
                            <div class="flex text-base">
                                <p class="min-w-[150px] max-w-[150px]">Поставщик:</p>
                                <p class="p-[4px]">Ритуальный Центр "Покой и Уважение"</p>
                            </div>
                            <div class="flex text-base">
                                <p class="min-w-[150px] max-w-[150px]">Телефон:</p>
                                <p class="p-[4px]">+7 777 777 77 77</p>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-between mt-[16px]">
                        <button class="h-[51px] text-[#222222] text-base font-semibold flex items-center gap-[10px]">
                            <img src="/icons/check-icon.svg" alt=""> Чек об оплате
                        </button>
                        <button class="block w-[225px] h-[51px] rounded-md bg-[#38949B] text-white text-base font-semibold">
                            Оставить отзыв
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </NuxtLayout>
</template>

<style lang=scss scoped>
.status {
    padding: 4px;
    border-radius: 4px;

    font-family: Roboto;
    font-weight: 600;
    font-size: 14px;
    line-height: 100%;
    letter-spacing: 4.5%;
    color: #fff;

    &-danger {
        background: #DC6E29;
    }
    &-cancel {
        background: #D63C3C;
    }
    &-close {
        background: #339B38;
    }
}

.rip-table {
    &__header, &__content {
        display: grid;
        grid-template-columns: 202px 249px 127px 127px;
        gap: 16px
    }

    &__header {
        font-family: Roboto;
        font-weight: 400;
        font-size: 14px;
        line-height: 100%;
        color: #565656;
        padding-top: 12px;
        padding-bottom: 12px;
    }
    &__content {
        padding-top: 12px;
        padding-bottom: 12px;

        &-val {
            font-family: Roboto;
            font-weight: 400;
            font-size: 14px;
            line-height: 100%;
        }
    }
}
</style>