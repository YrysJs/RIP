<script setup>
import UserSidebar from '~/components/layout/UserSidebar.vue'
import AppHeader from "~/components/layout/AppHeader.vue";
import AppHeaderUser from "~/components/layout/AppHeaderUser.vue";
import UserBottomNav from "~/components/layout/UserBottomNav.vue";

</script>


<template>
  <section class="user">
    <AppHeader type="akimat" />
    
    <!-- Адаптивный хедер для мобильных -->
    <AppHeaderUser />

    <div class="user__wrap">
      <aside class="user__sidebar">
        <UserSidebar />
      </aside>

      <main class="user__content">
        <slot />
      </main>
    </div>

    <!-- Bottom Navigation для мобильных устройств -->
    <UserBottomNav />
  </section>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.user {
  background: #faf7ef;
  min-height: 100dvh;
  margin-top: 110px;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    margin-top: 0;
    padding-top: 40px; /* Уменьшили отступ сверху с 80px до 60px */
    padding-bottom: 80px; /* Отступ для нижней навигации */
    background: #ffffff; /* Белый фон по умолчанию */
  }

  /* Мобильные стили фона */
  @media (max-width: 768px) {
    /* Бежевый фон только для страницы заявок (список) на мобильных */
    :global(.tickets-page) {
      background: #faf7ef !important;
    }
    
    :global(.tickets-page .user) {
      background: #faf7ef !important;
    }

    /* Белый фон для детальной страницы заявки на мобильных */
    :global(.ticket-detail-page) {
      background: #ffffff !important;
    }
    
    :global(.ticket-detail-page .user) {
      background: #ffffff !important;
    }
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

    @media (max-width: 768px) {
      margin: 0;
      padding: 16px; /* Уменьшили отступы с 16px до 8px */
      grid-template-columns: 1fr; /* Полная ширина на мобильных */
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

    @media (max-width: 768px) {
      display: none; /* Скрыть sidebar на мобильных */
    }
  }

  &__content {
    background: #ffffff;
    border: 1px solid #ece7da;
    border-radius: 16px;
    padding: 20px;
    color: #1c1c1c;
    min-height: 640px;

    @media (max-width: 768px) {
      background: transparent;
      border: none;
      border-radius: 0;
      padding: 0;
      min-height: auto;
    }
  }
}

/* Скрыть веб-хедер на мобильных устройствах */
@media (max-width: 768px) {
  :deep(.app-header) {
    display: none !important;
  }
}
</style>
