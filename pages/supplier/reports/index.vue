<script setup>
import { getSalesStats } from '~/services/supplier'

const stats = ref({
    three_months: 0,
    seven_days: 0,
    one_month: 0,
    all_time: 0
})

const isLoading = ref(true)

onMounted(async () => {
    try {
        const response = await getSalesStats()
        stats.value = response.data
    } catch (error) {
        console.error('Ошибка при загрузке статистики:', error)
    } finally {
        isLoading.value = false
    }
})
</script>

<template>
    <NuxtLayout name="supplier">
        <div class="w-full h-[61px] pl-[20px] flex items-center bg-white rounded-[16px] text-lg font-semibold">
            Отчеты
        </div>
        <div class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px]">
            <div v-if="isLoading" class="flex justify-center py-8">
                <div class="text-gray-500">Загрузка...</div>
            </div>
            <div v-else class="rip-table">
                <div class="rip-table__header">
                    <div>3 месяца</div>
                    <div>7 дней</div>
                    <div>1 месяц</div>
                    <div>За все время</div>
                </div>
                <div class="rip-table__content">
                    <div class="rip-table__content-val">{{ stats.three_months }}</div>
                    <div class="rip-table__content-val">{{ stats.seven_days }}</div>
                    <div class="rip-table__content-val">{{ stats.one_month }}</div>
                    <div class="rip-table__content-val">{{ stats.all_time }}</div>
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
        grid-template-columns: 1fr 1fr 1fr 1fr;
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
        padding-left: 12px;
        margin-bottom: 12px;
        background: #c6d3d3;

        font-family: Roboto;
        font-size: 16px;
        line-height: 100%;

        &-val:first-child {
            font-weight: 600;
        }
    }
}
</style>