<script setup>
import UserSidebar from '~/components/layout/UserSidebar.vue'
import AppHeader from "~/components/layout/AppHeader.vue";

</script>


<template>
  <section class="user">
    <AppHeader type="akimat" />

    <div class="user__wrap">
      <aside class="user__sidebar">
        <UserSidebar />
      </aside>

      <main class="user__content">
        <slot />
      </main>
    </div>
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
    padding-top: 0;
    padding-bottom: 80px; /* Отступ для нижней навигации */
    background: #ffffff; /* Белый фон по умолчанию */
  }

  /* Бежевый фон только для страницы заявок (список) */
  :global(.tickets-page) {
    background: #faf7ef !important;
  }
  
  :global(.tickets-page .user) {
    background: #faf7ef !important;
  }

  /* Белый фон для детальной страницы заявки */
  :global(.ticket-detail-page) {
    background: #ffffff !important;
  }
  
  :global(.ticket-detail-page .user) {
    background: #ffffff !important;
  }

  /* Принудительно устанавливаем бежевый фон для списка заявок */
  :global(.tickets-page) {
    background: #faf7ef !important;
  }
  
  :global(.tickets-page .user) {
    background: #faf7ef !important;
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
      padding: 16px;
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

    @media (max-width: 768px) {
      background: transparent;
      border: none;
      border-radius: 0;
      padding: 0;
      min-height: auto;
    }
  }
}
</style>
