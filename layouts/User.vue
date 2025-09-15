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
  margin-top: 76px;
  display: flex;
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
