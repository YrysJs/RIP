<script setup>
</script>

<template>
    <NuxtLayout name="supplier">
        <div class="w-full h-[61px] pl-[20px] flex items-center bg-white rounded-[16px] text-lg font-semibold">
            Архив заявок
        </div>
        <div class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px]">
            <div class="rip-table">
                <div class="rip-table__header">
                    <div>Товар/Услуга</div>
                    <div>Заказчик</div>
                    <div>Дата похорон</div>
                    <div>Статус</div>
                </div>
                <nuxt-link to="/supplier/tickets/archive/1" class="rip-table__content">
                    <div class="rip-table__content-val">Доставка покойного</div>
                    <div class="rip-table__content-val">Бақадыр Нұрбике Бекзатқызыg</div>
                    <div class="rip-table__content-val">12.12.2025</div>
                    <div class="rip-table__content-val flex items-center gap-[15px]"><span class="status status-close">Завершена</span> <img src="/icons/link.svg" alt="arrow"> </div>
                </nuxt-link>
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