<script setup>
import SupplierDetail from '~/components/supplier/supplier-details/SupplierDetail.vue';

const route = useRoute()
</script>

<template>
    <NuxtLayout name="supplier">
        <SupplierDetail :ticket-id="route.params.id" />
    </NuxtLayout>
</template>

<style lang="css" scoped>
</style>