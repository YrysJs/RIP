<script setup>
import SupplierDetail from "~/components/supplier/supplier-details/SupplierDetail.vue";
import { useI18n } from 'vue-i18n';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
</script>

<template>
  <NuxtLayout name="supplier" :transparent-content="true">
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

<style lang="css" scoped></style>
