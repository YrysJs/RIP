<template>
  <header
    class="app-header"
    :class="{
      'app-header--transparent': props.style === 'landing' && isTop,
      'app-header--solid': !(props.style === 'landing' && isTop),
    }"
  >
    <div class="container">
      <!-- Логотип -->
      <div class="flex items-center">
        <NuxtLink to="/">
          <img src="/icons/logo2.svg" alt="logo" />
        </NuxtLink>
      </div>

      <!-- Правый блок -->
      <div class="right-actions">
        <nav class="nav-links">
          <NuxtLink to="/">Главная</NuxtLink>
          <NuxtLink to="/services">Услуги</NuxtLink>
        </nav>

        <div class="flex gap-4 ml-[100px]">
          <button class="reserve__btn" @click="router.push('/reserve')">
            <img src="/icons/pencil.svg" alt="Reserve icon" class="w-5 h-5" />
            Забронировать место
          </button>
          <template v-if="token">
            <button class="profile__btn" @click="profileClick">
              <img src="/icons/person.svg" alt="Reserve icon" class="w-5 h-5" />
              {{ userInfo?.name }} {{ userInfo?.surname }}
            </button>
            <div class="relative flex items-center">
              <button @click="toggleDropdown">
                <img src="/icons/menu-new.svg" alt="Меню" />
              </button>
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
            <button class="profile__btn" @click="authModalStore.toggleLoginMenu">
              <img src="/icons/person.svg" alt="Reserve icon" class="w-5 h-5" />
              Войти
            </button>
          </template>
        </div>
      </div>
    </div>
  </header>

  <Teleport to="body">
    <ClientLogin v-if="authModalStore.activeModal === 'client'" @close="authModalStore.closeModal" />
    <ManagerLogin v-if="authModalStore.activeModal === 'manager'" @close="authModalStore.closeModal" />
    <SupplierLogin
      v-if="authModalStore.activeModal === 'supplier'"
      @close="authModalStore.closeModal"
    />
    <AkimatLogin v-if="authModalStore.activeModal === 'akimat'" @close="authModalStore.closeModal" />
    <div
      v-if="authModalStore.showLoginMenu"
      class="fixed inset-0 bg-black/40 z-40 flex items-center justify-center"
      @click.self="authModalStore.closeLoginMenu"
    >
      <div class="bg-white rounded-xl w-[340px] p-6 shadow-xl">
        <div class="flex justify-between items-center mb-4">
          <span class="text-lg font-semibold">Войти</span>
          <button @click="authModalStore.closeLoginMenu">
            <img src="/icons/close.svg" alt="Закрыть" class="w-6 h-6" />
          </button>
        </div>

        <div class="text-gray-400 text-sm mb-2">Клиентам</div>
        <div
          class="flex items-center gap-2 py-2 cursor-pointer hover:text-[#224C4F]"
          @click="login('client')"
        >
          <img src="/icons/user.svg" class="w-5 h-5" />
          <span class="font-medium">Войти/Зарегистрироваться</span>
        </div>

        <div class="text-gray-400 text-sm mt-4 mb-2">Партнерам</div>
        <div
          class="flex items-center gap-2 py-2 cursor-pointer hover:text-[#224C4F]"
          @click="login('supplier')"
        >
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
          <span class="font-medium">Кабинет Акимата</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useUserStore } from "~/store/user.js";
import { useAuthModalStore } from "~/store/authModal.js";
import ClientLogin from "~/components/auth/ClientLogin.vue";
import AkimatLogin from "~/components/auth/AkimatLogin.vue";
import ManagerLogin from "~/components/auth/ManagerLogin.vue";
import SupplierLogin from "~/components/auth/SupplierLogin.vue";
import Cookies from "js-cookie";
import { parseJwt } from "~/utils/parseJwt";
import { getCurrentUser } from "~/services/login/index.js";

const token = ref(Cookies.get("token"));
const router = useRouter();

const userStore = useUserStore();
const authModalStore = useAuthModalStore();

const userInfo = ref(null);

const props = defineProps({
  type: String,
  style: String,
});

const types = {
  manager: "Менеджер Кладбища",
  suppliar: "Поставщик услуг",
  akimat: "Кабинет Aкимата",
  admin: "Админ панель",
};

const showDropdownMenu = ref(false);

function toggleDropdown() {
  showDropdownMenu.value = !showDropdownMenu.value;
}

function login(type) {
  userStore.setAuthType(type);
  authModalStore.openModal(type);
}

function profileClick() {
  const parsedToken = parseJwt(token.value);
  switch (parsedToken.role) {
    case "ADMIN":
      router.push("/admin/cemetery");
      break;
    case "AKIMAT_MANAGER":
      router.push("/user/tickets");
      break;
    case "AKIMAT_ADMIN":
      router.push("/user/tickets");
      break;
    case "GOVERNMENT":
      router.push("/user/tickets");
      break;
    case "CEMETERY_MANAGER":
      router.push("/manager/booking");
      break;
    case "USER":
      router.push("/client/profile");
      break;
    case "SUPPLIER":
      router.push("/supplier/tickets/active");
      break;
  }
}

function logout() {
  toggleDropdown();
  Cookies.remove("token");
  token.value = undefined;

  router.push("/");
}

const isTop = ref(true);

const handleScroll = () => {
  isTop.value = (window.scrollY || window.pageYOffset) <= 8;
};

onMounted(() => {
  // навешиваем слушатель сразу
  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });

  // дальше можно грузить пользователя параллельно
  getCurrentUser({ id: localStorage.getItem("user_id") })
    .then((response) => {
      userInfo.value = response.data;
      userStore.setUser(userInfo.value);
    })
    .catch(() => {});
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 104px;
  padding: 0 24px;
  z-index: 50;
  transition: background-color 200ms ease;
}

/* когда вверху */
.app-header.app-header--transparent {
  background-color: transparent;
}

/* когда не вверху (или не landing) */
.app-header.app-header--solid {
  background-color: #201001;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  height: 104px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #224c4f;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 80px;
}

.nav-links a {
  color: white;
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
  color: #224c4f;
  border-radius: 8px;
  background-color: #fafafa;
}

.icon-btn {
  background: #fafafa;
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

.reserve__btn {
  padding: 15px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  line-height: 18px;
  border-radius: 8px;
  white-space: nowrap;
  background-color: #e9b949;
  transition: all 0.3 ease;
}

.reserve__btn:hover {
  background: #d1a53f;
}

.reserve__btn:active {
  background: #b88f34;
}

.profile__btn {
  padding: 15px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  line-height: 18px;
  border-radius: 8px;
  white-space: nowrap;
  color: white;
  background-color: transparent;
  border: 1px solid white;
  transition: all 150ms ease;
}
.profile__btn:hover,
.profile__btn:active {
  filter: brightness(0.5);
}
</style>
