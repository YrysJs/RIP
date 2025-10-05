<script setup lang="ts">
import { useRoute, RouterLink  } from 'vue-router';
import { computed, ref, onMounted } from 'vue';
import { getUnreadNotifications } from "~/services/notifications";

const props = withDefaults(defineProps<{ title?: string }>(), {
  title: 'Кабинет поставщика услуг'
});

const route = useRoute();
const isActive = (p: string) => computed(() => route.path.startsWith(p));

const openA = ref(true);
const openB = ref(true);
const unreadCount = ref(0);

const sectionA = [
  { title: 'Активные', path: '/supplier/tickets/active', count: 0 },
  { title: 'Архив',    path: '/supplier/tickets/archive' }
];

const sectionB = [
  { title: 'Активные',          path: '/supplier/services/active' },
  { title: 'На рассмотрении',   path: '/supplier/services/consideration' },
  { title: 'Требует доработки', path: '/supplier/services/improvement' },
  { title: 'Не активные',       path: '/supplier/services/inactive' }
];

const singles = computed(() => [
  { title: 'Добавить товар или услугу', path: '/supplier/services/add-service', kind: 'add' },
  { title: 'Отзывы',                     path: '/supplier/reviews' },
  { title: 'Отчеты',                     path: '/supplier/reports' },
  { title: 'Обращение в Акимат',         path: '/supplier/goverment/requests' },
  { title: 'Уведомления', path: '/supplier/notifications', count: unreadCount.value > 0 ? unreadCount.value : null },
]);

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

    <div class="sidebar__block">
      <button class="sidebar__head" @click="openA = !openA">
        <span>Мои заявки</span>
        <i class="sidebar__chev" :class="{ 'is-open': openA }"/>
      </button>
      <div v-show="openA" class="sidebar__list">
        <RouterLink
            v-for="(it, i) in sectionA"
            :key="i" :to="it.path"
            class="sidebar__link"
            :class="{ 'is-active': isActive(it.path).value }"
        >
          <span class="sidebar__text">{{ it.title }}</span>
          <span v-if="it.count" class="sidebar__badge">{{ it.count }}</span>
        </RouterLink>
      </div>
    </div>

    <div class="sidebar__block">
      <button class="sidebar__head" @click="openB = !openB">
        <span>Мои товары и услуги</span>
        <i class="sidebar__chev" :class="{ 'is-open': openB }"/>
      </button>
      <div v-show="openB" class="sidebar__list">
        <RouterLink
            v-for="(it, i) in sectionB"
            :key="i" :to="it.path"
            class="sidebar__link"
            :class="{ 'is-active': isActive(it.path).value }"
        >
          <span class="sidebar__text">{{ it.title }}</span>
          <span v-if="it.count" class="sidebar__badge">{{ it.count }}</span>
        </RouterLink>
      </div>
    </div>

    <nav class="sidebar__list">
      <RouterLink
          v-for="(it, i) in singles"
          :key="i" :to="it.path"
          class="sidebar__link"
          :class="{ 'is-active': isActive(it.path).value, 'is-add': it.kind === 'add' }"
        >
          <span class="sidebar__text">{{ it.title }}</span>
          <span v-if="it.count" class="sidebar__badge">{{ it.count }}</span>
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

  &__block { margin-bottom: 12px; }

  &__head {
    width: 100%;
    background: transparent;
    border: 0;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #1c1c1c;
    border-radius: 10px;
    cursor: pointer;

    &:hover { background: #f7f3e8; }
  }

  &__chev {
    width: 8px; height: 8px;
    border-right: 2px solid #8b8b8b;
    border-bottom: 2px solid #8b8b8b;
    transform: rotate(-45deg);
    transition: transform .15s ease;
    &.is-open { transform: rotate(135deg); }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 6px 0 8px;
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

    &.is-add {
      color: #226c72; /* ссылка «+ Добавить» по макету можно подсветить */
    }
  }

  &__text { flex: 1 1 auto; font-size: 14px; line-height: 1.35; }

  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 6px;
    border-radius: 999px;
    background: #d2af5b;
    color: #ffffff;
    font-size: 12px;
    font-weight: 600;
    line-height: 1;
  }
}
</style>
