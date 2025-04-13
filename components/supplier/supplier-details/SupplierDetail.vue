<script setup>
const props = defineProps(['ticketId'])

console.log(props.ticketId);

</script>

<template>
    <div class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px]">
        <button tybe="button" class="bg-[#EEEEEE] rounded-md px-[21px] py-[10px] flex items-center gap-[10px] font-semibold text-sm text-[#224C4F]" @click="$router.go(-1)">
            <img src="/icons/back-blue.svg" alt="" class=""> Назад
        </button>
        <div class="flex justify-between items-center border-b-2 border-[#EEEEEE] pb-[16px] mt-[16px]">
            <h3 class="text-2xl font-medium">Доставка покойного</h3>
            <p class="text-sm">Дата и время заявки: 07.06.2023, 10:42</p>
        </div>
        <div class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
            <div class="min-w-[580px] font-medium flex flex-col gap-[10px]">
                <div class="flex text-base"><p class="min-w-[150px]">Кладбище:</p><p>Северное кладбище</p></div>
                <div class="flex text-base"><p class="min-w-[150px]">Сектор</p><p>11</p></div>
                <div class="flex text-base"><p class="min-w-[150px]">Место:</p><p>233</p></div>
                <div class="flex text-base"><p class="min-w-[150px]">Заказчик:</p><p>Беляков Макар Максимович</p></div>
            </div>
            <button class="rounded-md w-[140px] h-[30px] text-sm text-[#224C4F] font-semibold bg-[#EEEEEE]">Данные участка</button>
        </div>
        <div class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
            <div class="font-medium flex flex-col gap-[10px]">
                <div class="flex text-base"><p class="min-w-[150px] max-w-[150px]">Дата похорон:</p><p>12.09.2024, 10:00</p></div>
                <div class="flex text-base"><p class="min-w-[150px] max-w-[150px]">Заказчик:</p><p>Бақадыр Нұрбике Бекзатқызыg</p></div>
                <div class="flex text-base"><p class="min-w-[150px] max-w-[150px]">Контакты заказчика:</p><p>+7 777 777 77 77</p></div>
                <div class="flex text-base"><p class="min-w-[150px] max-w-[150px]">Адрес прибытия:</p><p>Улица Бейсебаева, 148, Алматы, д.10, кв 5</p></div>
                <div class="flex text-base"><p class="min-w-[150px] max-w-[150px]">Время прибытия:</p><p>09:00</p></div>
            </div>
        </div>
        <div class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
            <div class="font-medium flex flex-col gap-[10px]">
                <div class="flex text-base">
                    <p class="min-w-[150px] max-w-[150px]">Cтатус:</p>
                    <p class="p-[4px] rounded-md bg-[#339B38] text-sm font-semibold text-white mr-4">Оплачено</p>
                    <p class="p-[4px] rounded-md bg-[#DC6E29] text-sm font-semibold text-white mr-4">Ожидает</p>
                </div>
            </div>
        </div>
        <button class="block w-[225px] h-[51px] rounded-md bg-[#38949B] text-white text-base font-semibold ml-auto mt-[16px]">
            Подтвердить исполнение
        </button>
    </div>
</template>

<style lang="css" scoped>
</style>