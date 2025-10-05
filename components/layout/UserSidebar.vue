<script setup lang="ts">
import { useRoute, RouterLink } from 'vue-router';
import { computed } from 'vue';

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

// Функция для сокращения названий для мобильной версии
const getShortLabel = (label: string) => {
  const shortLabels: Record<string, string> = {
    'Запросы в Акимат': 'Заявки',
    'Отчеты, статистика': 'Отчеты',
    'Новости': 'Новости',
    'Пользователи и роли': 'Пользователи'
  };
  return shortLabels[label] || label;
};
</script>

<template>
  <div>
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
          >
          <span class="sidebar__text">{{ it.label }}</span>
        </RouterLink>
      </nav>
    </div>

    <!-- Мобильная нижняя навигация -->
    <div class="mobile-bottom-nav">
      <RouterLink
        v-for="(it, i) in items"
        :key="i"
        :to="it.to"
        class="nav-item"
        :class="{ 'nav-item--active': isActive(it.to).value }"
      >
        <div class="nav-icon-wrapper">
          <svg v-if="getShortLabel(it.label) === 'Заявки'" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 19l7-7 3 3-7 7-3-3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="getShortLabel(it.label) === 'Отчеты'" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 3v18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18 17V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13 17V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 17v-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="getShortLabel(it.label) === 'Новости'" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18 14h2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M15 18h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="getShortLabel(it.label) === 'Пользователи'" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="nav-text">{{ getShortLabel(it.label) }}</span>
        <div v-if="isActive(it.to).value" class="nav-indicator"/>
      </RouterLink>
    </div>
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

/* Мобильная нижняя навигация */
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  display: flex;
  justify-content: space-around;
  padding: 8px 0 12px 0;
  z-index: 1000;
  border-top: 1px solid #E5E7EB;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  text-decoration: none;
  color: #9CA3AF;
  transition: color 0.2s ease;
  position: relative;
  min-width: 60px;
  flex: 1;
}

.nav-item--active {
  color: #F7B500;
}

.nav-text {
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  text-align: center;
}

.nav-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.nav-indicator {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: #F7B500;
  border-radius: 50%;
}

/* Скрываем навигацию на десктопе */
@media (min-width: 769px) {
  .mobile-bottom-nav {
    display: none;
  }
}


/* Скрываем боковую панель на мобильных */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
