<script setup>
import LayoutTop from '~/components/layout/LayoutTop.vue'
import ManagerSidebar from '~/components/layout/ManagerSidebar.vue'
</script>

<template>
  <section class="supplier bg-[#FAFAFA]">
    <LayoutTop />
    <main class="supplier-content max-w-[1175px] mx-auto w-full flex gap-[20px] min-h-[100vh] my-[20px] rounded-[12px]">
      <ManagerSidebar />
      <div class="w-full">
        <slot/>
      </div>
    </main>
  </section>
</template>

<style lang="scss" scoped></style>