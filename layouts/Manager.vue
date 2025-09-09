<script setup>
import LayoutTop from '~/components/layout/LayoutTop.vue'
import ManagerSidebar from '~/components/layout/ManagerSidebar.vue'
import AppHeader from "~/components/layout/AppHeader.vue";
</script>

<template>
  <section class="manager">
    <AppHeader type="manager" />

    <div class="manager__wrap">
      <aside class="manager__sidebar">
        <ManagerSidebar title="ЛИЧНЫЙ КАБИНЕТ" />
      </aside>

      <main class="manager__content">
        <slot />
      </main>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.manager {
  background: #faf7ef;
  min-height: 100dvh;
  display: flex;
  margin-top: 76px;
  flex-direction: column;

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
    border-radius: 16px;
    padding: 28px 16px;
    border: 1px solid #ece7da;
    align-self: start;
    position: sticky;
    top: 12px;

    @media (max-width: 1100px) {
      position: static;
    }
  }

  &__content {
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #ece7da;
    padding: 20px;
    color: #1c1c1c;
    min-height: 640px;
  }
}
</style>
