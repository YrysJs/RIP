<script setup>
import LayoutTop from '~/components/layout/LayoutTop.vue'
import ClientSidebar from '~/components/layout/ClientSidebar.vue';
import AppHeader from "~/components/layout/AppHeader.vue";
import { getCurrentUser } from '~/services/login';
import { onMounted } from 'vue';
import { useUserStore } from '~/store/user';

const userStore = useUserStore();

const userInfo = ref(null);

onMounted(async () => {
  const response = await getCurrentUser({
    id: localStorage.getItem('user_id')
  });

  userInfo.value = response.data;

  userStore.setUser(userInfo.value);
})
</script>


<template>
  <section class="client">
    <AppHeader type="client" />

    <div class="client__wrap">
      <aside class="client__sidebar">
        <ClientSidebar title="ЛИЧНЫЙ КАБИНЕТ" />
      </aside>

      <main class="client__content">
        <slot />
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
.client {
  background: #faf7ef;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  margin-top: 76px;

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