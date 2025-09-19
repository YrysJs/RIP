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
  <section class="supplier">
    <AppHeader type="supplier" />

    <div class="supplier__wrap">
      <aside class="supplier__sidebar">
        <LayoutSidebar title="Кабинет поставщика услуг" />
      </aside>

      <main class="supplier__content">
        <slot />
      </main>
    </div>
  </section>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.supplier {
  background: #faf7ef;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  margin-top: 110px;

  &__wrap {
    width: 100%;
    max-width: 1160px;
    margin: 24px auto 40px;
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 24px;

    @media (max-width: 1100px) {
      grid-template-columns: 1fr;
    }
  }

  &__sidebar {
    background: #ffffff;
    border: 1px solid #ece7da;
    border-radius: 16px;
    padding: 28px 16px;
    align-self: start;
    position: sticky;
    top: 12px;

    @media (max-width: 1100px) {
      position: static;
    }
  }

  &__content {
    background: #ffffff;
    border: 1px solid #ece7da;
    border-radius: 16px;
    padding: 20px;
    color: #1c1c1c;
    min-height: 640px;
  }
}
</style>
