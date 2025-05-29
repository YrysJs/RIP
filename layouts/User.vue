<script setup>
import UserSidebar from '~/components/layout/UserSidebar.vue'
import AppHeader from "~/components/layout/AppHeader.vue";
</script>

<template>
  <section class="supplier bg-[#FAFAFA] relative mt-[77px]">
    <AppHeader type="akimat" />
    <main class="supplier-content mx-auto w-full flex gap-[20px] min-h-[100vh] my-[20px] rounded-[12px]">
      <UserSidebar />
      <div class="w-full main">
        <slot/>
      </div>
    </main>
  </section>
</template>

<style lang="scss" scoped>
.main {
  padding-right: calc((100vw - 1176px)/3);
}

</style>