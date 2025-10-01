<script setup>
import SupplierDetail from "~/components/supplier/supplier-details/SupplierDetail.vue";

const route = useRoute();
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
      Вернуться
    </button>
    <SupplierDetail :ticket-id="route.params.id" />
  </NuxtLayout>
</template>

<style lang="css" scoped></style>
