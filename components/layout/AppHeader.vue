<template>
  <header
    class="app-header desktop-header"
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
          <NuxtLink to="/">{{ $t('header.main') }}</NuxtLink>
          <NuxtLink to="/services">{{ $t('header.services') }}</NuxtLink>
        </nav>

        <div class="flex gap-4 ml-[50px]">
          <button class="reserve__btn" @click="router.push('/reserve')">
            <img src="/icons/pencil.svg" alt="Reserve icon" class="w-5 h-5" />
            {{ $t('header.reservePlace') }}
          </button>
          <template v-if="token">
            <button v-if="isAkimat" class="profile__btn" @click="router.push('/user/tickets')">
              {{ $t('header.akimatCabinet') }}
            </button>
            <button v-if="isManager" class="profile__btn" @click="router.push('/manager/burial')">
              {{ $t('header.managerCabinet') }}
            </button>
            <button v-if="isAdmin" class="profile__btn" @click="router.push('/admin/cemetery')">
              {{ $t('header.adminCabinet') }}
            </button>
            <button class="profile__btn" @click="profileClick">
              <img src="/icons/person.svg" alt="Reserve icon" class="w-5 h-5" />
              {{ userInfo?.name }} {{ userInfo?.surname }}
            </button>
            <div class="relative flex items-center">
              <button @click="toggleDropdown">
                <img src="/icons/menu-new.svg" :alt="$t('alts.menu')" />
              </button>
              <div
                v-if="showDropdownMenu"
                class="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
              >
                <button
                  class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  @click="logout"
                >
                  {{ $t('header.logout') }}
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <button
              class="profile__btn"
              @click="authModalStore.toggleLoginMenu"
            >
              <img src="/icons/person.svg" alt="Reserve icon" class="w-5 h-5" />
              {{ $t('header.login') }}
            </button>
          </template>
        </div>

        <!-- Переключатель языков -->
        <div class="language-switcher">
          <button
            :class="{ active: currentLocale === 'ru' }"
            @click="switchLanguage('ru')"
          >
            РУ
          </button>
          <span class="divider">|</span>
          <button
            :class="{ active: currentLocale === 'kk' }"
            @click="switchLanguage('kk')"
          >
            ҚАЗ
          </button>
        </div>
      </div>
    </div>
  </header>

  <Teleport to="body">
    <!-- Фон для модалок авторизации -->
    <div
      v-if="showAuthModal"
      class="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center"
      @click.self="authModalStore.closeModal"
    >
      <ClientLogin
        v-if="currentAuthModal === 'client'"
        @close="authModalStore.closeModal"
      />
      <SupplierLogin
        v-if="currentAuthModal === 'supplier'"
        @close="authModalStore.closeModal"
      />
    </div>
    <div
      v-if="showLoginMenu"
      class="fixed inset-0 bg-black/40 z-[80] flex items-center justify-center"
      @click.self="authModalStore.closeLoginMenu"
    >
      <div class="bg-white rounded-xl w-[340px] p-6 shadow-xl">
        <div class="flex justify-between items-center mb-4">
          <span class="text-lg font-semibold">{{ $t('header.login') }}</span>
          <button @click="authModalStore.closeLoginMenu">
            <img src="/icons/close.svg" :alt="$t('common.close')" class="w-6 h-6" />
          </button>
        </div>
        <div class="text-gray-400 text-sm mb-2">{{ $t('header.loginAs.clients') }}</div>
        <div
          class="flex items-center gap-2 py-2 cursor-pointer hover:text-[#224C4F]"
          @click="login('client')"
        >
          <img src="/icons/user.svg" class="w-5 h-5" />
          <span class="font-medium">{{ $t('header.loginAs.client') }}</span>
        </div>

        <div class="text-gray-400 text-sm mt-4 mb-2">{{ $t('header.loginAs.partners') }}</div>
        <div
          class="flex items-center gap-2 py-2 cursor-pointer hover:text-[#224C4F]"
          @click="login('supplier')"
        >
          <img src="/icons/shop.svg" class="w-5 h-5" />
          <span class="font-medium">{{ $t('header.loginAs.supplier') }}</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useUserStore } from "~/store/user.js";
import { useAuthModalStore } from "~/store/authModal.js";
import ClientLogin from "~/components/auth/ClientLogin.vue";
import SupplierLogin from "~/components/auth/SupplierLogin.vue";
import Cookies from "js-cookie";
import { parseJwt } from "~/utils/parseJwt";
import { getCurrentUser } from "~/services/login/index.js";
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();
const token = ref(Cookies.get("token"));
const router = useRouter();

// Текущая локаль
const currentLocale = computed(() => locale.value);

// Функция переключения языка
const switchLanguage = async (lang) => {
  const i18n = useNuxtApp().$i18n;
  if (i18n && typeof i18n.setLocale === 'function') {
    await i18n.setLocale(lang);
  } else {
    locale.value = lang;
  }
  // Сохраняем выбранный язык в localStorage
  localStorage.setItem('locale', lang);
};

const userStore = useUserStore();
const authModalStore = useAuthModalStore();

const userInfo = ref(null);

// Computed свойства для безопасного доступа к значениям стора
const showAuthModal = computed(() => {
  return authModalStore.activeModal && authModalStore.activeModal !== "";
});

const currentAuthModal = computed(() => {
  return authModalStore.activeModal || "";
});

const showLoginMenu = computed(() => {
  return authModalStore.showLoginMenu === true;
});

const props = defineProps({
  type: String,
  style: String,
});

const types = computed(() => ({
  manager: t('header.types.manager'),
  suppliar: t('header.types.supplier'),
  akimat: t('header.types.akimat'),
  admin: t('header.types.admin'),
}));

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
      router.push("/client/profile");
      break;
    case "AKIMAT_MANAGER":
      router.push("/client/profile");
      break;
    case "AKIMAT_ADMIN":
      router.push("/client/profile");
      break;
    case "GOVERNMENT":
      router.push("/client/profile");
      break;
    case "CEMETERY_MANAGER":
      router.push("/client/profile");
      break;
    case "USER":
      router.push("/client/profile");
      break;
    case "SUPPLIER":
      router.push("/supplier/tickets/active");
      break;
  }
}

const isAkimat = computed(() => {
  const parsedToken = parseJwt(token.value);
  return parsedToken.role === 'AKIMAT_MANAGER' || parsedToken.role === 'AKIMAT_ADMIN' || parsedToken.role === 'GOVERNMENT'
})

const isManager = computed(() => {
  const parsedToken = parseJwt(token.value);
  return parsedToken.role === 'CEMETERY_MANAGER'
})

const isAdmin = computed(() => {
  const parsedToken = parseJwt(token.value);
  return parsedToken.role === 'ADMIN'
})

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

onMounted(async () => {
  // Восстанавливаем сохраненный язык
  const savedLocale = localStorage.getItem('locale');
  if (savedLocale && (savedLocale === 'ru' || savedLocale === 'kk')) {
    locale.value = savedLocale;
  }

  // навешиваем слушатель сразу
  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });

  // дальше можно грузить пользователя параллельно
  try {
    const response = await getCurrentUser({
      id: localStorage.getItem("user_id"),
    });
    userInfo.value = response.data;
    userStore.setUser(userInfo.value);
  } catch (error) {
    console.error(t('errors.fetchError'), error);
  }
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

@media (max-width: 768px) {
  .desktop-header {
    display: none;
  }
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

.nav-links a:hover {
  color: #c6bfbf;
}

.nav-links a:active {
  color: #9c9595;
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

/* Переключатель языков */
.language-switcher {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.language-switcher button {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 500;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 4px 8px;
  border-radius: 4px;
}

.language-switcher button:hover {
  color: rgba(255, 255, 255, 0.9);
  background-color: rgba(255, 255, 255, 0.1);
}

.language-switcher button.active {
  color: #ffffff;
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.15);
}

.language-switcher .divider {
  color: rgba(255, 255, 255, 0.3);
  font-size: 14px;
  line-height: 1;
}
</style>
