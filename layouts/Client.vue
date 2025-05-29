<script setup>
import LayoutTop from '~/components/layout/LayoutTop.vue'
import ClientSidebar from '~/components/layout/ClientSidebar.vue';
import AppHeader from "~/components/layout/AppHeader.vue";
</script>

<template>
  <section class="supplier bg-[#FAFAFA] relative mt-[77px]">
    <AppHeader type="client" />
    <LayoutTop title="Личный кабинет"/>
    <main class="supplier-content max-w-[1175px] mx-auto w-full flex gap-[20px] min-h-[100vh] my-[20px] rounded-[12px]">
      <ClientSidebar />
      <div class="w-full">
        <slot/>
      </div>
    </main>
  </section>
</template>

<style lang="scss" scoped></style>