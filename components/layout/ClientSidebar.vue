<script setup lang="ts">
import { useRoute, RouterLink  } from "vue-router";
import { computed, onMounted, ref } from "vue";
import { getUnreadNotifications } from "~/services/notifications";

const props = withDefaults(defineProps<{ title?: string }>(), {
  title: "ЛИЧНЫЙ КАБИНЕТ",
});

type MenuItem = {
  title: string;
  path: string;
  count?: number | any;
};

const unreadCount = ref(0);

const menu: MenuItem[] = [
  { title: "Личные данные", path: "/client/profile" },
  { title: "Заявка на захоронение", path: "/client/tickets/burial" },
  { title: "История услуг", path: "/client/history" },
  { title: "Цифровой мемориал", path: "/client/memorial" },
  { title: "Запрос на перезахоронение", path: "/client/burial" },
  { title: "Обращение в акимат", path: "/client/government" },
  { title: 'Уведомления', path: '/client/notifications', count: computed(() => unreadCount.value > 0 ? unreadCount.value : null) },
];

const route = useRoute();
const isActive = (path: string) => computed(() => route.path.startsWith(path));

const fetchUnreadCount = async () => {
  try {
    const response = await getUnreadNotifications();
    unreadCount.value = response.data?.total || 0;
  } catch (error) {
    console.error('Ошибка загрузки непрочитанных уведомлений:', error);
  }
};

onMounted(() => {
  fetchUnreadCount();
});
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
        <span v-if="typeof item.count === 'number' ? item.count : item.count?.value" class="sidebar__badge">
          {{ typeof item.count === 'number' ? item.count : item.count?.value }}
        </span>
      </RouterLink>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
.sidebar {
  &__title {
    font-family: "FoglihtenNo06", sans-serif;
    font-size: 32px;
    letter-spacing: 0.02em;
    color: #201001;
    margin-bottom: 24px;
    text-transform: uppercase;
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    font-size: 16px;
    border-radius: 10px;
    text-decoration: none;
    color: #1c1c1c;
    border: 1px solid transparent;
    transition: background 0.15s ease, border-color 0.15s ease;

    &:hover {
      background: #f7f3e8;
      border-color: #ece7da;
    }

    &.is-active {
      background: #afb5c133;
    }
  }

  &__link-text {
    font-size: 16px;
    line-height: 1.35;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 6px;
    border-radius: 999px;
    background: #e9b949;
    color: #fff;
    font-size: 12px;
    line-height: 1;
    font-weight: 600;
  }
}
</style>
