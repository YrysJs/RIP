<template>
  <header
    class="mobile-header"
    :class="{
      'app-header--transparent': props.style === 'landing' && isTop && !open,
      'app-header--solid': !(props.style === 'landing' && isTop) || open,
    }"
  >
    <div
      class="h-[56px] flex items-center justify-between px-4 py-3 text-white"
    >
      <ClientOnly>
        <template #default>
          <NuxtLink
            v-if="hasToken"
            @click.stop="profileClick"
            class="flex items-center gap-2 text-white"
            :key="'auth'"
          >
            <img src="/icons/person.svg" alt="Reserve icon" class="w-5 h-5" />
            <span>{{ userInfo?.name }} {{ userInfo?.surname }}</span>
          </NuxtLink>

          <NuxtLink v-else to="/" :key="'guest'">
            <img src="/icons/logo2.svg" alt="logo" class="h-8" />
          </NuxtLink>
        </template>
      </ClientOnly>

      <button @click="toggleMenu">
        <img src="/icons/menu-new.svg" alt="Меню" class="w-6 h-6" />
      </button>
    </div>

    <!-- Выпадающее меню -->
    <transition name="slide">
      <div v-show="open">
        <!-- Оверлей -->
        <div class="fixed inset-0 bg-black/40 z-40" @click="open = false"></div>

        <!-- Меню -->
        <div
          class="absolute top-[56px] left-0 w-full bg-white shadow-xl z-50 flex flex-col text-[#201001]"
        >
          <template v-if="!token">
            <div class="p-4">
              <div class="text-gray-400 text-sm mb-2">Клиентам</div>
              <div
                class="flex items-center gap-2 py-2 cursor-pointer hover:text-[#224C4F]"
                @click="login('client')"
              >
                <img src="/icons/user.svg" class="w-5 h-5" />
                <span class="font-medium">Войти/Зарегистрироваться</span>
              </div>
            </div>

            <div class="p-4 border-b border-b-[#f2f2f2]">
              <div class="text-gray-400 text-sm mb-2">Партнерам</div>
              <div
                class="flex items-center gap-2 py-2 cursor-pointer hover:text-[#224C4F]"
                @click="login('supplier')"
              >
                <img src="/icons/shop.svg" class="w-5 h-5" />
                <span class="font-medium">Войти как поставщик услуг</span>
              </div>
            </div>
          </template>

          <template v-if="token">
            <NuxtLink to="/client/profile" class="m-link"
              >Профиль</NuxtLink
            ></template
          >

          <NuxtLink to="/" class="m-link">Главная</NuxtLink>
          <NuxtLink to="/services" class="m-link">Услуги</NuxtLink>
          <button class="m-link" @click="router.push('/reserve')">
            Забронировать место
          </button>

          <template v-if="token">
            <button class="m-link text-[#D63C3C]" @click="logout">Выйти</button>
          </template>
        </div>
      </div>
    </transition>
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
  </header>
</template>

<script setup>
import { ref } from "vue";
import Cookies from "js-cookie";
import { useRouter } from "vue-router";
import { useAuthModalStore } from "~/store/authModal";
import { parseJwt } from "~/utils/parseJwt";
import ClientLogin from "../auth/ClientLogin.vue";
import SupplierLogin from "../auth/SupplierLogin.vue";
import { useUserStore } from "~/store/user";
import { getCurrentUser } from "~/services/login";
import { NuxtLink } from "#components";

const router = useRouter();
const authModalStore = useAuthModalStore();

const showAuthModal = computed(() => {
  return authModalStore.activeModal && authModalStore.activeModal !== "";
});

const currentAuthModal = computed(() => {
  return authModalStore.activeModal || "";
});

const props = defineProps({
  type: String,
  style: String,
});

const open = ref(false);
const userInfo = ref(null);
const userStore = useUserStore();

// ✅ SSR-aware и реактивный токен
const token = useCookie("token", { watch: true }); // ref<string | null>
const hasToken = computed(
  () => !!token.value && token.value !== "null" && token.value !== "undefined"
);

function toggleMenu() {
  open.value = !open.value;
}

function login(type) {
  userStore.setAuthType(type);
  authModalStore.openModal(type);
  open.value = true;
}

function logout() {
  token.value = null; // useCookie сам удалит cookie
  open.value = false;
  router.push("/");
}

function profileClick() {
  if (!token.value) return router.push("/");
  const parsedToken = parseJwt(token.value) || {};
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
      router.push("/manager/burial");
      break;
    case "USER":
      router.push("/client/profile");
      break;
    case "SUPPLIER":
      router.push("/supplier/tickets/active");
      break;
  }
}

const isTop = ref(true);

const handleScroll = () => {
  isTop.value = (window.scrollY || window.pageYOffset) <= 8;
};

async function loadUser() {
  if (!Cookies.get("token")) return;
  const { data } = await getCurrentUser({
    id: localStorage.getItem("user_id"),
  });
  userInfo.value = data;
  userStore.setUser(data);
}

onMounted(() => {
  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });
  loadUser();
});

watch(hasToken, (t) => {
  if (t) loadUser();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
.mobile-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 60;
}

@media (min-width: 769px) {
  .mobile-header {
    display: none;
  }
}

.m-link {
  padding: 16px;
  font-size: 16px;
  text-align: left;
  border-bottom: 1px solid #f2f2f2;
}

/* когда вверху */
.mobile-header.app-header--transparent {
  background-color: transparent;
}

/* когда не вверху (или не landing) */
.mobile-header.app-header--solid {
  background-color: #201001;
}

/* .slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateY(-20px);
  opacity: 0;
} */
</style>
