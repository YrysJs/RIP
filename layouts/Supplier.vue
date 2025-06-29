<script setup>
import LayoutTop from '~/components/layout/LayoutTop.vue'
import LayoutSidebar from '~/components/layout/LayoutSidebar.vue'
import SuccessModal from '~/components/layout/modals/SuccessModal.vue';
import AppHeader from "~/components/layout/AppHeader.vue";
import { getSupplierInfo } from '~/services/supplier';
import { onMounted } from 'vue';

const supplierInfo = ref(null);

onMounted(async () => {
    const response = await getSupplierInfo();

    supplierInfo.value = response.data;
})
</script>

<template>
    <section class="supplier bg-[#FAFAFA] relative mt-[77px]">
      <AppHeader type="supplier" />
        <!-- <SuccessModal title="Заявка завершена!" text="Заявка завершена!" @close="true"/> -->
        <LayoutTop title="Кабинет Поставщика Услуг" :hide="false" :info="supplierInfo" type="supplier"/>
        <main class="supplier-content max-w-[1175px] mx-auto w-full flex gap-[20px] min-h-[100vh] my-[20px] rounded-[12px]">
            <LayoutSidebar />
            <div class="w-full">
                <slot/>
            </div>
        </main>
    </section>
</template>

<style lang="scss" scoped></style>