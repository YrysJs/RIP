<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

type NavItem = {
  label: string;
  to: string;
  icon: string;
  active: string;
};

const items: NavItem[] = [
  { label: 'Запросы в Акимат',       to: '/user/tickets',  icon: '/icons/tickets.svg',  active: '/icons/tickets-active.svg' },
  { label: 'Отчеты, статистика',    to: '/user/reports',  icon: '/icons/reports.svg',  active: '/icons/reports-active.svg' },
  { label: 'Новости',               to: '/user/news',     icon: '/icons/news.svg',     active: '/icons/news-active.svg' },
  { label: 'Пользователи и роли',   to: '/user/users',    icon: '/icons/users.svg',    active: '/icons/users-active.svg' }
];

const route = useRoute();
const isActive = (p: string) => computed(() => route.path.startsWith(p));
</script>

<template>
  <div class="sidebar">
    <div class="sidebar__title">Кабинет Акимата</div>

    <nav class="sidebar__list">
      <RouterLink
          v-for="(it, i) in items"
          :key="i"
          :to="it.to"
          class="sidebar__link"
          :class="{ 'is-active': isActive(it.to).value }"
      >
        <img
            class="sidebar__icon"
            :src="isActive(it.to).value ? it.active : it.icon"
            :alt="it.label"
            width="18"
            height="18"
        />
        <span class="sidebar__text">{{ it.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped lang="scss">
.sidebar {
  &__title {
    font-family: "FoglihtenNo06", sans-serif;
    font-size: 24px;
    letter-spacing: .02em;
    color: #1c1c1c;
    margin: 0 8px 18px;
    text-transform: uppercase;
    line-height: 1.1;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    text-decoration: none;
    color: #1c1c1c;
    border: 1px solid transparent;
    transition: background .15s ease, border-color .15s ease;

    &:hover {
      background: #f7f3e8;
      border-color: #ece7da;
    }

    &.is-active {
      background: #f1eada;
      border-color: #ece7da;
    }
  }

  &__icon { display: block; }

  &__text {
    font-size: 14px;
    line-height: 1.35;
    flex: 1 1 auto;
  }
}
</style>
