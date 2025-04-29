<script setup>
import UserSidebar from '~/components/layout/UserSidebar.vue'
</script>

<template>
  <section class="supplier bg-[#FAFAFA]">
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
  padding-right: calc((100vw - 1176px)/2);
}

</style>