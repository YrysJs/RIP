<script setup>
import SupplierDetail from "~/components/supplier/supplier-details/SupplierDetail.vue";

const route = useRoute();
const router = useRouter();
</script>

<template>
  <NuxtLayout name="supplier" :transparent-content="true" class="supplier-ticket-detail-page">
    <button
      class="btn-back mb-[10px] mr-4 ml-[2px] text-base font-medium flex items-center text-[#B88F34]"
      @click="router.go(-1)"
    >
      <img
        class="w-4 h-4 mr-[10px]"
        src="/icons/arrow-left-orange.svg"
        alt=""
      />
      {{ $t('common.back') }}
    </button>
    <SupplierDetail :ticket-id="route.params.id" />
  </NuxtLayout>
</template>

<style lang="css" scoped>
/* ===== МОБИЛЬНЫЕ СТИЛИ ===== */
@media (max-width: 768px) {
  /* Белый фон для страницы детали заявки поставщика */
  :global(.supplier-ticket-detail-page) {
    background: #ffffff !important;
  }
  
  :global(.supplier-ticket-detail-page .supplier) {
    background: #ffffff !important;
  }

  :global(.supplier-ticket-detail-page .supplier__content) {
    background: #ffffff !important;
  }

  /* Стили для кнопки "Вернуться" */
  .btn-back {
    font-size: 16px;
    padding: 12px 0;
    margin-bottom: 16px;
  }

  /* Глобальные стили для предотвращения переполнения */
  :global(body) {
    overflow-x: hidden !important;
  }

  :global(.supplier) {
    overflow-x: hidden !important;
  }

  :global(.supplier__content) {
    overflow-x: hidden !important;
  }
}
</style>
