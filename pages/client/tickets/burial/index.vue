<script setup>
import { ref, onMounted } from 'vue'
import { getBurialRequests } from '~/services/client'

const burialRequests = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await getBurialRequests({ status: 'paid' })
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
        <div v-if="burialRequests.length === 0" class="flex justify-center items-center p-10">
            <p class="text-xl">Нет оплаченных заявок на захоронение</p>
        </div>
        <template v-else>
            <div v-for="request in burialRequests" :key="request.id" class="w-full bg-white rounded-[16px] py-[20px] px-[12px] mb-4">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-medium">Заявка на захоронение: <span class="text-[#38949B]">{{ request.request_number }}</span></h3>
                    <p class="text-sm">{{ new Date(request.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</p>
                </div>
                <div class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
                    <div class="min-w-[580px] font-medium flex flex-col gap-[10px]">
                        <div class="flex text-base"><p class="min-w-[150px]">Кладбище:</p><p>Северное кладбище</p></div>
                        <div class="flex text-base"><p class="min-w-[150px]">Сектор</p><p>11</p></div>
                        <div class="flex text-base"><p class="min-w-[150px]">Место:</p><p>{{ request.grave_id }}</p></div>
                    </div>
                    <button class="rounded-md w-[140px] h-[30px] text-sm text-[#224C4F] font-semibold bg-[#EEEEEE]">Данные участка</button>
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
                            <p class="p-[4px] rounded-md bg-[#339B38] text-sm font-semibold text-white mr-4">Оплачено</p>
                        </div>
                        <div class="flex text-base">
                            <p class="min-w-[150px] max-w-[150px]">Дополнительные услуги:</p>
                            <p class="p-[4px] rounded-md text-sm font-semibold text-[#939393] mr-4">Отсутсвуют</p>
                        </div>
                    </div>
                </div>
                <div class="flex justify-between mt-[16px]">
                    <button class="h-[51px] text-[#222222] text-base font-semibold flex items-center gap-[10px]">
                        <img src="/icons/share.svg" alt=""> поделиться координатами
                    </button>
                    <div class="flex gap-[10px]">
                        <button class="block w-[225px] h-[51px] rounded-md bg-[#EEEEEE] text-[#224C4F] text-base font-semibold" @click="$router.push('/client/tickets/burial/add-service')">
                            Добавить услуги и товары
                        </button>
                        <button class="block w-[225px] h-[51px] rounded-md bg-[#38949B] text-white text-base font-semibold" @click="$router.push('/client/memorial/create')">
                            Создать мемориал
                        </button>
                    </div>
                </div>
            </div>
        </template>
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