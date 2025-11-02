<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { getUnreadNotifications } from "~/services/notifications";

import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = withDefaults(defineProps<{ title?: string }>(), {
  title: ''
});

const displayTitle = computed(() => props.title || t('manager.sidebar.title'));

type MenuItem = {
  title: string
  path: string
  count?: number | any
};

const unreadCount = ref(0);

const menu = computed(() => [
  { title: t('manager.sidebar.burialRequests'), path: '/manager/burial' },
  { title: t('manager.sidebar.cemeteriesManagement'), path: '/manager/cemetery' },
  { title: t('manager.sidebar.notifications'), path: '/manager/notifications', count: computed(() => unreadCount.value > 0 ? unreadCount.value : null) },
]);

const route = useRoute();
const isActive = (path: string) => computed(() => route.path.startsWith(path));

const fetchUnreadCount = async () => {
  try {
    const response = await getUnreadNotifications();
    unreadCount.value = response.data?.total || 0;
  } catch (error) {
    console.error(t('errors.fetchError'), error);
  }
};

onMounted(() => {
  fetchUnreadCount();
});
</script>

<template>
  <div class="sidebar">
    <div class="sidebar__title">{{ displayTitle }}</div>

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
    font-family: "Manrope", sans-serif;
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
