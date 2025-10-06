<template>
  <div class="mobile-header">
    <div class="header-content">
      <div class="user-info">
        <div class="user-avatar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="user-name">{{ userName }}</span>
      </div>
      
      <button 
        class="menu-toggle"
        @click="toggleMenu"
        :class="{ active: isMenuOpen }"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <!-- Dropdown Menu -->
    <div v-if="isMenuOpen" class="dropdown-menu">
      <div class="menu-content">
        <!-- Мои заявки -->
        <div class="menu-section">
          <h3 class="section-title">Мои заявки</h3>
          <ul class="menu-list">
            <li>
              <NuxtLink 
                to="/supplier/tickets/active" 
                class="menu-item"
                :class="{ active: $route.path === '/supplier/tickets/active' }"
                @click="closeMenu"
              >
                Активные
              </NuxtLink>
            </li>
            <li>
              <NuxtLink 
                to="/supplier/tickets/archive" 
                class="menu-item"
                :class="{ active: $route.path === '/supplier/tickets/archive' }"
                @click="closeMenu"
              >
                Архив
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Мои товары и услуги -->
        <div class="menu-section">
          <h3 class="section-title">Мои товары и услуги</h3>
          <ul class="menu-list">
            <li>
              <NuxtLink 
                to="/supplier/services/active" 
                class="menu-item"
                :class="{ active: $route.path === '/supplier/services/active' }"
                @click="closeMenu"
              >
                Активные
              </NuxtLink>
            </li>
            <li>
              <NuxtLink 
                to="/supplier/services/consideration" 
                class="menu-item"
                :class="{ active: $route.path === '/supplier/services/consideration' }"
                @click="closeMenu"
              >
                На рассмотрении
              </NuxtLink>
            </li>
            <li>
              <NuxtLink 
                to="/supplier/services/improvement" 
                class="menu-item"
                :class="{ active: $route.path === '/supplier/services/improvement' }"
                @click="closeMenu"
              >
                Требует доработки
              </NuxtLink>
            </li>
            <li>
              <NuxtLink 
                to="/supplier/services/inactive" 
                class="menu-item"
                :class="{ active: $route.path === '/supplier/services/inactive' }"
                @click="closeMenu"
              >
                Не активные
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Дополнительные разделы -->
        <div class="menu-section">
          <ul class="menu-list">
            <li>
              <NuxtLink 
                to="/supplier/services/add-service" 
                class="menu-link-add"
                @click="closeMenu"
              >
                Добавить товар или услугу
              </NuxtLink>
            </li>
            <li>
              <NuxtLink 
                to="/supplier/reviews" 
                class="menu-item"
                :class="{ active: $route.path === '/supplier/reviews' }"
                @click="closeMenu"
              >
                Отзывы
              </NuxtLink>
            </li>
            <li>
              <NuxtLink 
                to="/supplier/reports" 
                class="menu-item"
                :class="{ active: $route.path === '/supplier/reports' }"
                @click="closeMenu"
              >
                Отчеты
              </NuxtLink>
            </li>
            <li>
              <NuxtLink 
                to="/supplier/goverment/requests" 
                class="menu-item"
                :class="{ active: $route.path === '/supplier/goverment/requests' }"
                @click="closeMenu"
              >
                Обращение в Акимат
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getCurrentUser } from '~/services/login/index.js'

const isMenuOpen = ref(false)
const userInfo = ref(null)

// Формируем имя пользователя как в AppHeader
const userName = computed(() => {
  if (userInfo.value?.name && userInfo.value?.surname) {
    return `${userInfo.value.surname} ${userInfo.value.name.charAt(0)}.`
  }
  return userInfo.value?.name || 'Пользователь'
})

const toggleMenu = (event) => {
  event.stopPropagation()
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

// Загружаем данные пользователя как в AppHeader
onMounted(async () => {
  try {
    const response = await getCurrentUser({ id: localStorage.getItem("user_id") })
    userInfo.value = response.data
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error)
  }
})

// Обработка клика вне меню
onMounted(() => {
  const handleClickOutside = (event) => {
    const menuElement = document.querySelector('.dropdown-menu')
    const toggleButton = document.querySelector('.menu-toggle')
    
    if (menuElement && toggleButton && 
        !menuElement.contains(event.target) && 
        !toggleButton.contains(event.target)) {
      closeMenu()
    }
  }
  
  document.addEventListener('click', handleClickOutside)
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>

<style scoped lang="scss">
.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10001;
  width: 100%;
  background: #201001;
  color: white;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name {
  font-weight: 500;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.menu-toggle {
  background: transparent;
  border: none;
  color: white;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  position: relative;
  min-width: 40px;
  min-height: 40px;
  pointer-events: auto;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &.active {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(0.95);
  }

  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.1);
  }

  &:active {
    background: rgba(255, 255, 255, 0.2);
  }
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 10002;
  max-height: 75vh;
  overflow-y: auto;
  animation: slideDown 0.3s ease-out;
  border: 1px solid #e5e7eb;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-content {
  padding: 24px 20px;
}

.menu-section {
  margin-bottom: 28px;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #4B5563;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;

  &::after {
    content: '›';
    font-size: 14px;
    color: #9CA3AF;
    font-weight: 400;
  }
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  display: block;
  padding: 14px 12px;
  color: #374151;
  text-decoration: none;
  font-weight: 500;
  font-size: 15px;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
  margin-bottom: 4px;

  &:hover {
    background: #f8fafc;
    color: #1f2937;
    transform: translateX(4px);
  }

  &.active {
    background: #fef3c7;
    color: #92400e;
    font-weight: 600;
    border-left: 3px solid #f59e0b;
    padding-left: 9px;
  }
}

.menu-link-add {
  display: block;
  padding: 14px 12px;
  color: #059669;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  border-radius: 8px;
  transition: all 0.2s ease;
  margin-bottom: 4px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;

  &:hover {
    background: #dcfce7;
    color: #047857;
    transform: translateX(4px);
    border-color: #86efac;
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .mobile-header {
    padding: 14px 16px;
  }

  .user-name {
    font-size: 15px;
  }

  .menu-content {
    padding: 20px 16px;
  }

  .menu-item, .menu-link-add {
    font-size: 14px;
    padding: 12px 10px;
  }

  .section-title {
    font-size: 12px;
    margin-bottom: 14px;
  }

  /* Дополнительные мобильные стили для хэдера */
  .mobile-header {
    padding: 12px 16px;
  }

  .header-content {
    gap: 8px;
  }

  .user-info {
    gap: 8px;
  }

  .user-avatar {
    width: 28px;
    height: 28px;
  }

  .user-name {
    font-size: 13px;
    font-weight: 500;
    line-height: 1.2;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  .menu-toggle {
    padding: 6px;
  }

  .menu-toggle svg {
    width: 20px;
    height: 20px;
  }
}
</style>