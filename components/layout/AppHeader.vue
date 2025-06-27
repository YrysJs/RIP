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
        <template v-if="token">
          <button v-if="type === 'client'" class="icon-btn">
            <img src="/icons/cart.svg" alt="Корзина" />
          </button>
          <div class="icon-btn relative flex items-center gap-2">
            <!-- Кнопка меню -->
            <button @click="toggleDropdown">
              <img src="/icons/menu.svg" alt="Меню" />
            </button>

            <!-- Кнопка профиля -->
            <NuxtLink to="/profile">
              <img src="/icons/user.svg" alt="Профиль" />
            </NuxtLink>

            <!-- Дропдаун меню -->
            <div
                v-if="showDropdownMenu"
                class="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
            >
              <button
                  class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  @click="logout"
              >
                Выйти
              </button>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="login-link cursor-pointer" @click="toggleLoginMenu">Войти</div>
        </template>
      </div>
    </div>




  </header>

  <Teleport to="body">
    <ClientLogin v-if="activeModal === 'client'" @close="activeModal = ''" />
    <ManagerLogin v-if="activeModal === 'manager'" @close="activeModal = ''" />
    <SupplierLogin v-if="activeModal === 'supplier'" @close="activeModal = ''" />
    <AkimatLogin v-if="activeModal === 'akimat'" @close="activeModal = ''" />
    <div
        v-if="showLoginMenu"
        class="fixed inset-0 bg-black/40 z-40 flex items-center justify-center"
        @click.self="closeMenu"
    >
      <div class="bg-white rounded-xl w-[340px] p-6 shadow-xl">
        <div class="flex justify-between items-center mb-4">
          <span class="text-lg font-semibold">Войти</span>
          <button @click="closeMenu">
            <img src="/icons/close.svg" alt="Закрыть" class="w-6 h-6" />
          </button>
        </div>

        <div class="text-gray-400 text-sm mb-2">Клиентам</div>
        <div class="flex items-center gap-2 py-2 cursor-pointer hover:text-[#224C4F]" @click="login('client')">
          <img src="/icons/user.svg" class="w-5 h-5" />
          <span class="font-medium">Войти/Зарегистрироваться</span>
        </div>

        <div class="text-gray-400 text-sm mt-4 mb-2">Партнерам</div>
        <div class="flex items-center gap-2 py-2 cursor-pointer hover:text-[#224C4F]" @click="login('supplier')">
          <img src="/icons/shop.svg" class="w-5 h-5" />
          <span class="font-medium">Войти как поставщик услуг</span>
        </div>

        <div class="text-gray-400 text-sm mt-4 mb-2">Администрация</div>
        <div class="flex items-center gap-2 py-2 cursor-pointer hover:text-[#224C4F]" @click="login('manager')">
          <img src="/icons/home.svg" class="w-5 h-5" />
          <span class="font-medium">Войти как менеджер кладбища</span>
        </div>
        <div class="flex items-center gap-2 py-2 cursor-pointer hover:text-[#224C4F]" @click="login('akimat')">
          <img src="/icons/building.svg" class="w-5 h-5" />
          <span class="font-medium">Кабинет акимата</span>
        </div>
      </div>
    </div>
  </Teleport>

</template>

<script setup>
import { useUserStore } from '~/store/user.js'
import ClientLogin from "~/components/auth/ClientLogin.vue";
import AkimatLogin from "~/components/auth/AkimatLogin.vue";
import ManagerLogin from "~/components/auth/ManagerLogin.vue";
import SupplierLogin from "~/components/auth/SupplierLogin.vue";
import Cookies from 'js-cookie'

const token = Cookies.get('token')
const router = useRouter()
const showLoginMenu = ref(false);
const activeModal = ref('')

const userStore = useUserStore()

const props = defineProps({
  type: String
});

const types = {
  manager: 'Менеджер Кладбища',
  suppliar: 'Поставщик услуг',
  akimat: 'Кабинет Aкимата',
  admin: 'Админ панель'
};

const showDropdownMenu = ref(false)

function toggleDropdown() {
  showDropdownMenu.value = !showDropdownMenu.value
}

function toggleLoginMenu() {
  showLoginMenu.value = !showLoginMenu.value;
}

function closeMenu() {
  showLoginMenu.value = false;
}

function login(type) {
  toggleLoginMenu()
  userStore.setAuthType(type)
  
  activeModal.value = type
}

function logout() {
  toggleDropdown()
  Cookies.remove('token')
  token.value = undefined

  router.push('/')
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
