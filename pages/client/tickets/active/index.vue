<script setup>
import { ref, onMounted } from 'vue'
import { getBurialRequests } from '~/services/client'

const burialRequests = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await getBurialRequests({ status: 'pending' })
    burialRequests.value = response.data
  } catch (error) {
    console.error('Ошибка при получении заявок:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
    <NuxtLayout name="client">
        <template v-if="burialRequests && burialRequests.length > 0">
            <div  v-for="request in burialRequests" :key="request.id" class="w-full bg-white rounded-[16px] py-[20px] px-[12px] mb-4">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-medium">Бронирование: <span class="text-[#38949B]">{{ request.request_number }}</span></h3>
                    <p class="text-sm">{{ new Date(request.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</p>
                </div>
                <div class="border-b-2 border-[#EEEEEE] mt-[16px] pb-[16px]">
                    <div class="flex text-base font-medium"><p class="min-w-[150px]">Срок брони:</p><p>Осталось: 3 дня</p></div>
                </div>
                <div class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
                    <div class="min-w-[580px] font-medium flex flex-col gap-[10px]">
                        <div class="flex text-base"><p class="min-w-[150px]">Кладбище:</p><p>Северное кладбище</p></div>
                        <div class="flex text-base"><p class="min-w-[150px]">Сектор</p><p>11</p></div>
                        <div class="flex text-base"><p class="min-w-[150px]">Место:</p><p>{{ request.grave_id }}</p></div>
                    </div>
                </div>
                <div class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
                    <div class="font-medium flex flex-col gap-[10px]">
                        <div class="flex text-base"><p class="min-w-[150px] max-w-[150px]">ФИО покойного:</p><p class="font-bold">{{ request.deceased?.full_name }}</p></div>
                        <div class="flex text-base"><p class="min-w-[150px] max-w-[150px]">Дата похорон:</p>
                            <p v-if="request.burial_date">{{ new Date(request.burial_date).toLocaleDateString('ru-RU') }}, {{ request.burial_time }}</p>
                            <p v-else class="text-[#D63C3C]">Необходимо указать даты похорон</p>
                        </div>
                    </div>
                </div>
                <div class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
                    <div class="font-medium flex flex-col gap-[10px]">
                        <div class="flex text-base">
                            <p class="min-w-[150px] max-w-[150px]">Cтатус:</p>
                            <p class="p-[4px] rounded-md bg-[#DC6E29] text-sm font-semibold text-white mr-4">Ожидает оплаты</p>
                        </div>
                        <div class="flex text-base">
                            <p class="min-w-[150px] max-w-[150px]">Дополнительные услуги:</p>
                            <p class="p-[4px] rounded-md text-sm font-semibold text-[#939393] mr-4">Отсутсвуют</p>
                        </div>
                    </div>
                </div>
                <button class="block w-[225px] h-[51px] rounded-md bg-[#38949B] text-white text-base font-semibold ml-auto mt-[16px]" @click="$router.push(`/client/tickets/active/${request.id}`)">
                    Завершить оформление
                </button>
            </div>
        </template>
        <div v-else class="w-full bg-white rounded-[16px] py-[20px] px-[12px] text-center">
            <p class="text-lg">Нет активных заявок</p>
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