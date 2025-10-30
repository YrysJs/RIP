<script setup>
// import LayoutTop from '~/components/layout/LayoutTop.vue'
import ManagerSidebar from '~/components/layout/ManagerSidebar.vue'
import AppHeader from "~/components/layout/AppHeader.vue";
import AppHeaderManager from "~/components/layout/AppHeaderManager.vue";
import ManagerBottomNav from "~/components/layout/ManagerBottomNav.vue";
</script>

<template>
  <section class="manager">
    <AppHeader type="manager" />
    <AppHeaderManager />

    <div class="manager__wrap">
      <aside class="manager__sidebar">
        <ManagerSidebar :title="$t('manager.sidebar.title')" />
      </aside>

      <main class="manager__content">
        <slot />
      </main>
    </div>
    
    <!-- Bottom Navigation для мобильных устройств -->
    <ManagerBottomNav />
  </section>
</template>

<style lang="scss" scoped>
.manager {
  background: #faf7ef;
  min-height: 100dvh;
  display: flex;
  margin-top: 110px;
  flex-direction: column;

  @media (max-width: 768px) {
    background: #fff;
  }

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

    @media (max-width: 768px) {
      display: none;
    }
  }

  &__content {
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #ece7da;
    padding: 20px;
    color: #1c1c1c;
    min-height: 640px;
    
    /* Отступ снизу для bottom navigation на мобильных */
    @media (max-width: 768px) {
      padding-bottom: 80px;
      border: none;
    }
  }
}

/* Скрыть адаптивный хедер на десктопе */
@media (min-width: 769px) {
  :deep(.mobile-header) {
    display: none !important;
  }
}
</style>
