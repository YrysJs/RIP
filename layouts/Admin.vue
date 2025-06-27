<script setup>
import AdminSidebar from '~/components/layout/AdminSideBar.vue'
import AppHeader from "~/components/layout/AppHeader.vue";
</script>

<template>
  <section class="supplier bg-[#FAFAFA] relative mt-[77px]">
    <AppHeader type="admin" />
    <!--    <LayoutTop />-->
    <main class="supplier-content max-w-[1175px] mx-auto w-full flex gap-[20px] min-h-[100vh] my-[20px] pt-[20px] rounded-[12px]">
      <AdminSidebar />
      <div class="w-full">
        <slot/>
      </div>
    </main>
  </section>
</template>

<style lang="scss" scoped></style>