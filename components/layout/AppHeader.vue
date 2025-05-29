<template>
  <header class="app-header">
    <div class="container">
      <!-- Логотип -->
      <div class="flex items-center">
        <NuxtLink to="/" class="mr-[22px]" :class="{'mr-[80px]': type === 'client'} ">
          <img src="/icons/logo.svg" alt="logo" />
        </NuxtLink>

        <nav v-if="type === 'client'" class="nav-links">
          <NuxtLink to="/reserve">Забронировать место</NuxtLink>
          <NuxtLink to="/services">Заказать услуги / товары</NuxtLink>
        </nav>

        <div v-else class="type-badge">
          {{types[type]}}
        </div>

      </div>


      <!-- Правый блок -->
      <div class="right-actions">
        <template v-if="isAuth">
          <button v-if="type === 'client'" class="icon-btn">
            <img src="/icons/cart.svg" alt="Корзина" />
          </button>
          <button class="icon-btn">
            <img src="/icons/menu.svg" alt="Меню" />
            <img src="/icons/user.svg" alt="Профиль" />
          </button>
        </template>

        <template v-else>
          <NuxtLink to="/login" class="login-link">Войти</NuxtLink>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
const props = defineProps({
  isAuth: Boolean,
  type: String
});

const types = {
  manager: 'Менеджер Кладбища',
  suppliar: 'Поставщик услуг',
  akimat: 'Кабинет Aкимата'
}

</script>

<style scoped>
.app-header {
  background-color: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 24px;
  z-index: 2;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #224C4F;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-links a {
  color: #111827;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.right-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.type-badge {
  padding: 10px 8px;
  font-size: 16px;
  font-weight: 700;
  color: #224C4F;
  border-radius: 8px;
  background-color: #FAFAFA;
}

.icon-btn {
  background: #FAFAFA;
  border: none;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
}

.icon-btn img {
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.login-link {
  color: #111827;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
}
</style>
