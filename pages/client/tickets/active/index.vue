<script setup>
</script>

<template>
    <NuxtLayout name="client">
        <div class="w-full bg-white rounded-[16px] py-[20px] px-[12px]">
            <div class="flex justify-between items-center  ">
                <h3 class="text-2xl font-medium">Бронирование: <span class="text-[#38949B]">0000023</span></h3>
                <p class="text-sm">07.06.2023, 10:42</p>
            </div>
            <div class="border-b-2 border-[#EEEEEE] mt-[16px] pb-[16px] ">
                <div class="flex text-base font-medium"><p class="min-w-[150px]">Срок брони:</p><p>Осталось: 3 дня</p></div>
            </div>
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
                    <div class="flex text-base"><p class="min-w-[150px] max-w-[150px]">Дата похорон:</p><p class="text-[#D63C3C]">Необходимо указать даты похорон</p></div>
                </div>
            </div>
            <div class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
                <div class="font-medium flex flex-col gap-[10px]">
                    <div class="flex text-base">
                        <p class="min-w-[150px] max-w-[150px]">Cтатус:</p>
                        <!-- <p class="p-[4px] rounded-md bg-[#339B38] text-sm font-semibold text-white mr-4">Ожидает оплаты</p> -->
                        <p class="p-[4px] rounded-md bg-[#DC6E29] text-sm font-semibold text-white mr-4">Ожидает оплаты</p>
                    </div>
                    <div class="flex text-base">
                        <p class="min-w-[150px] max-w-[150px]">Дополнительные услуги:</p>
                        <!-- <p class="p-[4px] rounded-md bg-[#339B38] text-sm font-semibold text-white mr-4">Ожидает оплаты</p> -->
                        <p class="p-[4px] rounded-md text-sm font-semibold text-[#939393] mr-4">Отсутсвуют</p>
                    </div>
                </div>
            </div>
            <button class="block w-[225px] h-[51px] rounded-md bg-[#38949B] text-white text-base font-semibold ml-auto mt-[16px]" @click="$router.push('/client/tickets/active/1')">
                Завершить оформление
            </button>
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