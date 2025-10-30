<template>
  <!-- Мобильная нижняя навигация для поставщиков -->
  <div class="mobile-bottom-nav">
    <RouterLink to="/supplier/tickets/active" class="nav-item" :class="{ 'nav-item--active': $route.path.startsWith('/supplier/tickets') }">
      <div class="nav-icon-wrapper">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <span class="nav-text">{{ $t('supplier.sidebar.requests') }}</span>
    </RouterLink>

    <RouterLink to="/supplier/services/active" class="nav-item" :class="{ 'nav-item--active': $route.path.startsWith('/supplier/services') }">
      <div class="nav-icon-wrapper">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <span class="nav-text">{{ $t('supplier.sidebar.productsAndServices') }}</span>
    </RouterLink>

    <RouterLink to="/supplier/services/add-service" class="nav-item nav-item--add">
      <div class="nav-icon-wrapper">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14m-7-7h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <span class="nav-text">{{ $t('supplier.sidebar.add') }}</span>
    </RouterLink>

    <RouterLink to="/supplier/reviews" class="nav-item" :class="{ 'nav-item--active': $route.path.startsWith('/supplier/reviews') }">
      <div class="nav-icon-wrapper">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <span class="nav-text">{{ $t('supplier.sidebar.reviews') }}</span>
    </RouterLink>

    <div class="nav-item nav-item--more" @click="toggleMoreMenu">
      <div class="nav-icon-wrapper">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="1" fill="currentColor"/>
          <circle cx="19" cy="12" r="1" fill="currentColor"/>
          <circle cx="5" cy="12" r="1" fill="currentColor"/>
        </svg>
      </div>
      <span class="nav-text">{{ $t('supplier.sidebar.more') }}</span>
    </div>

    <!-- Dropdown меню -->
    <div v-if="showMoreMenu" class="more-menu" @click.stop>
      <RouterLink to="/supplier/notifications" class="more-menu__item">
        <span>{{ $t('supplier.sidebar.notifications') }}</span>
        <span class="notification-badge">3</span>
      </RouterLink>
      <RouterLink to="/supplier/reports" class="more-menu__item">
        <span>{{ $t('supplier.sidebar.reports') }}</span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showMoreMenu = ref(false)

const toggleMoreMenu = () => {
  showMoreMenu.value = !showMoreMenu.value
}

// Закрываем меню при клике вне его
const handleClickOutside = (event) => {
  if (!event.target.closest('.nav-item--more') && !event.target.closest('.more-menu')) {
    showMoreMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  border-top: 1px solid #E5E7EB;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 0 20px;
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  text-decoration: none;
  color: #6B7280;
  transition: color 0.2s ease;
  position: relative;
  min-width: 60px;
  flex: 1;
}

.nav-item--active {
  color: #F7B500;
}

.nav-item--add {
  color: #226c72;
}

.nav-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.nav-text {
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
  text-align: center;
}

.nav-item--more {
  cursor: pointer;
}

.more-menu {
  position: absolute;
  bottom: 100%;
  right: 16px;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 160px;
  z-index: 1001;
}

.more-menu__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  text-decoration: none;
  color: #1C1C1C;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.more-menu__item:hover {
  background-color: #F9FAFB;
}

.notification-badge {
  background: #F7B500;
  color: #FFFFFF;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

/* Скрываем на десктопе */
@media (min-width: 769px) {
  .mobile-bottom-nav {
    display: none;
  }
}
</style>
