<script setup lang="ts">
import { useRoute, RouterLink  } from 'vue-router';
import { computed, ref, onMounted } from 'vue';
import { getUnreadNotifications } from "~/services/notifications";
import { useI18n } from 'vue-i18n';
import { useUserStore } from '~/store/user';

const { t } = useI18n();
const props = withDefaults(defineProps<{ title?: string }>(), {
  title: 'Кабинет поставщика услуг'
});

const route = useRoute();
const userStore = useUserStore();
const isActive = (p: string) => computed(() => route.path.startsWith(p));

// Проверяем, должна ли ссылка быть отключена
const isLinkDisabled = (path: string) => {
  if (userStore.supplierIsActive) return false;
  
  // Разрешаем только обращения в акимат (tickets) и уведомления
  const allowedPaths = ['/supplier/tickets', '/supplier/notifications'];
  return !allowedPaths.some(allowed => path.startsWith(allowed));
};

const openA = ref(true);
const openB = ref(true);
const unreadCount = ref(0);

const sectionA = computed(() => [
  { title: t('supplier.layoutSidebar.active'), path: '/supplier/tickets/active', count: 0 },
  { title: t('supplier.layoutSidebar.archive'),    path: '/supplier/tickets/archive' }
]);

const sectionB = computed(() => [
  { title: t('supplier.layoutSidebar.active'),          path: '/supplier/services/active' },
  { title: t('supplier.layoutSidebar.underReview'),   path: '/supplier/services/consideration' },
  { title: t('supplier.layoutSidebar.needsImprovement'), path: '/supplier/services/improvement' },
  { title: t('supplier.layoutSidebar.inactive'),       path: '/supplier/services/inactive' }
]);

const singles = computed(() => [
  { title: t('supplier.layoutSidebar.addProductOrService'), path: '/supplier/services/add-service', kind: 'add' },
  { title: t('supplier.layoutSidebar.reviews'),                     path: '/supplier/reviews' },
  { title: t('supplier.layoutSidebar.reports'),                     path: '/supplier/reports' },
  { title: t('supplier.layoutSidebar.governmentAppeal'),         path: '/supplier/goverment/requests' },
  { title: t('supplier.layoutSidebar.notifications'), path: '/supplier/notifications', count: unreadCount.value > 0 ? unreadCount.value : null },
]);

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
    <div class="sidebar__title">{{ title }}</div>

    <div class="sidebar__block">
      <button class="sidebar__head" @click="openA = !openA">
        <span>{{ $t('supplier.layoutSidebar.myRequests') }}</span>
        <i class="sidebar__chev" :class="{ 'is-open': openA }"/>
      </button>
      <div v-show="openA" class="sidebar__list">
        <RouterLink
            v-for="(it, i) in sectionA"
            :key="i" :to="it.path"
            class="sidebar__link"
            :class="{ 'is-active': isActive(it.path).value, 'is-disabled': isLinkDisabled(it.path) }"
            @click.prevent="!isLinkDisabled(it.path) && $router.push(it.path)"
        >
          <span class="sidebar__text">{{ it.title }}</span>
          <span v-if="it.count" class="sidebar__badge">{{ it.count }}</span>
        </RouterLink>
      </div>
    </div>

    <div class="sidebar__block">
      <button class="sidebar__head" @click="openB = !openB">
        <span>{{ $t('supplier.layoutSidebar.myProductsAndServices') }}</span>
        <i class="sidebar__chev" :class="{ 'is-open': openB }"/>
      </button>
      <div v-show="openB" class="sidebar__list">
        <RouterLink
            v-for="(it, i) in sectionB"
            :key="i" :to="it.path"
            class="sidebar__link"
            :class="{ 'is-active': isActive(it.path).value, 'is-disabled': isLinkDisabled(it.path) }"
            @click.prevent="!isLinkDisabled(it.path) && $router.push(it.path)"
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
          :class="{ 'is-active': isActive(it.path).value, 'is-add': it.kind === 'add', 'is-disabled': isLinkDisabled(it.path) }"
          @click.prevent="isLinkDisabled(it.path) ? null : $router.push(it.path)"
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
    border-top: 2px solid #8b8b8b;
    border-right: 2px solid #8b8b8b;
    transform: rotate(135deg);
    transition: transform .15s ease;
    &.is-open { transform: rotate(-45deg); }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 6px 0 8px;
  }

  &__block &__list {
    margin-left: 16px;
  }

  &__block &__link {
    padding-left: 28px;
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

    &.is-disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
      
      &:hover {
        background: transparent;
        border-color: transparent;
      }
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
