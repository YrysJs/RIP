<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

const props = withDefaults(defineProps<{ title?: string }>(), {
  title: 'ЛИЧНЫЙ КАБИНЕТ'
});

type MenuItem = {
  title: string
  path: string
  count?: number
};

const menu: MenuItem[] = [
  { title: 'Бронирование мест', path: '/manager/booking' },
  { title: 'Заявки на захоронение', path: '/manager/burial' },
  { title: 'Управление кладбищами', path: '/manager/cemetery' }
];

const route = useRoute();
const isActive = (path: string) => computed(() => route.path.startsWith(path));
</script>

<template>
  <div class="sidebar">
    <div class="sidebar__title">{{ title }}</div>

    <nav class="sidebar__nav">
      <RouterLink
          v-for="(item, i) in menu"
          :key="i"
          :to="item.path"
          class="sidebar__link"
          :class="{ 'is-active': isActive(item.path).value }"
      >
        <span class="sidebar__link-text">{{ item.title }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
.sidebar {
  &__title {
    font-family: "FoglihtenNo06", sans-serif;
    font-size: 24px;
    letter-spacing: 0.02em;
    color: #1c1c1c;
    margin: 0 8px 18px;
    text-transform: uppercase;
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 8px;
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

  &__link-text {
    flex: 1 1 auto;
    font-size: 14px;
    line-height: 1.35;
  }
}
</style>
