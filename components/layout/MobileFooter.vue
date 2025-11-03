<template>
  <!-- footer bar -->
  <nav
    class="footer-mob fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-t border-black/5"
  >
    <ul class="grid grid-cols-5 items-end text-xs text-[#5C6771]">
      <!-- Заявки -->
      <li>
        <button
          class="footer-btn w-full flex flex-col items-center gap-1 py-2"
          :class="
            isActive('/client/tickets/burial').value
              ? 'text-[#E9B949]'
              : 'text-[#222]'
          "
          @click="go('/client/tickets/burial')"
        >
          <div class="svg">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 22H3C2.59 22 2.25 21.66 2.25 21.25C2.25 20.84 2.59 20.5 3 20.5H21C21.41 20.5 21.75 20.84 21.75 21.25C21.75 21.66 21.41 22 21 22Z"
                fill="currentColor"
              />
              <path
                d="M19.0206 3.48016C17.0806 1.54016 15.1806 1.49016 13.1906 3.48016L11.9806 4.69016C11.8806 4.79016 11.8406 4.95016 11.8806 5.09016C12.6406 7.74016 14.7606 9.86016 17.4106 10.6202C17.4506 10.6302 17.4906 10.6402 17.5306 10.6402C17.6406 10.6402 17.7406 10.6002 17.8206 10.5202L19.0206 9.31016C20.0106 8.33016 20.4906 7.38016 20.4906 6.42016C20.5006 5.43016 20.0206 4.47016 19.0206 3.48016Z"
                fill="currentColor"
              />
              <path
                d="M15.6103 11.5298C15.3203 11.3898 15.0403 11.2498 14.7703 11.0898C14.5503 10.9598 14.3403 10.8198 14.1303 10.6698C13.9603 10.5598 13.7603 10.3998 13.5703 10.2398C13.5503 10.2298 13.4803 10.1698 13.4003 10.0898C13.0703 9.8098 12.7003 9.4498 12.3703 9.0498C12.3403 9.0298 12.2903 8.9598 12.2203 8.8698C12.1203 8.7498 11.9503 8.5498 11.8003 8.3198C11.6803 8.1698 11.5403 7.9498 11.4103 7.7298C11.2503 7.4598 11.1103 7.1898 10.9703 6.9098C10.9491 6.86441 10.9286 6.81924 10.9088 6.77434C10.7612 6.44102 10.3265 6.34358 10.0688 6.60133L4.34032 12.3298C4.21032 12.4598 4.09032 12.7098 4.06032 12.8798L3.52032 16.7098C3.42032 17.3898 3.61032 18.0298 4.03032 18.4598C4.39032 18.8098 4.89032 18.9998 5.43032 18.9998C5.55032 18.9998 5.67032 18.9898 5.79032 18.9698L9.63032 18.4298C9.81032 18.3998 10.0603 18.2798 10.1803 18.1498L15.9016 12.4285C16.1612 12.1689 16.0633 11.7235 15.7257 11.5794C15.6877 11.5632 15.6492 11.5467 15.6103 11.5298Z"
                fill="currentColor"
              />
            </svg>
          </div>

          <span>{{ $t('mobileFooter.requests') }}</span>
        </button>
      </li>

      <!-- Доп. услуги -->
      <li>
        <button
          class="footer-btn w-full flex flex-col items-center gap-1 py-2"
          @click="go('/client/history')"
          :class="
            isActive('/services').value ? 'text-[#E9B949]' : 'text-[#222]'
          "
        >
          <div class="svg">
            <svg
              width="25"
              height="24"
              viewBox="0 0 25 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.5 20V4"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
              <path
                d="M4.5 12L20.5 12"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </div>

          <span>{{ $t('mobileFooter.additionalServices') }}</span>
        </button>
      </li>

      <!-- История -->
      <li>
        <button
          class="footer-btn w-full flex flex-col items-center gap-1 py-2"
          @click="go('/client/history')"
          :class="
            isActive('/client/history').value ? 'text-[#E9B949]' : 'text-[#222]'
          "
        >
          <div class="svg">
            <svg
              width="19"
              height="22"
              viewBox="0 0 19 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.25 1.25H11.75C12.7089 1.25013 13.6286 1.63041 14.3075 2.3075L16.6925 4.6925C17.3696 5.37144 17.7499 6.29114 17.75 7.25V17.75C17.75 18.5456 17.4339 19.3087 16.8713 19.8713C16.3087 20.4339 15.5456 20.75 14.75 20.75H4.25C3.45435 20.75 2.69129 20.4339 2.12868 19.8713C1.56607 19.3087 1.25 18.5456 1.25 17.75V4.25C1.25 3.45435 1.56607 2.69129 2.12868 2.12868C2.69129 1.56607 3.45435 1.25 4.25 1.25V1.25Z"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M11.75 5.75V1.25C12.7089 1.25013 13.6286 1.63041 14.3075 2.3075L16.6925 4.6925C17.3696 5.37144 17.7499 6.29114 17.75 7.25H13.25C12.8522 7.25 12.4706 7.09196 12.1893 6.81066C11.908 6.52936 11.75 6.14782 11.75 5.75Z"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <span>{{ $t('mobileFooter.history') }}</span>
        </button>
      </li>

      <!-- Мемориал -->
      <li>
        <button
          class="footer-btn w-full flex flex-col items-center gap-1 py-2"
          :class="
            isActive('/client/memorial').value
              ? 'text-[#E9B949]'
              : 'text-[#222]'
          "
          @click="go('/client/memorial')"
        >
          <div class="svg">
            <svg
              width="25"
              height="24"
              viewBox="0 0 25 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.88638 13.3466L7.02905 12.66C6.55638 12.1876 6.52105 11.6606 6.54138 11.421C6.55671 11.243 6.47271 9.96896 8.72071 7.79096C8.94698 7.57476 9.14167 7.32778 9.29905 7.05729C9.61438 6.50896 10.203 5.39129 11.0657 3.38063C12.3494 0.387959 13.771 7.43063 13.531 9.44396C13.4997 9.70763 13.2054 11.216 13.161 11.478L12.201 15.0746"
                fill="white"
              />
              <path
                d="M13.1631 15.4266C22.7531 15.1173 19.3498 2.74331 19.0398 4.28998C18.7304 5.83664 9.75976 14.8066 8.83309 13.57C7.90509 12.3326 6.66776 12.0233 6.04909 12.9513C5.43043 13.8793 5.12109 14.1886 5.12109 14.1886C5.12109 14.1886 6.97709 13.8793 7.28643 14.498C7.59576 15.1166 8.57676 17.1466 10.3798 17.282C10.3798 17.282 10.9954 17.492 12.2358 20.066C13.6821 23.0673 19.6591 20.066 17.8024 18.5193C15.9464 16.9726 14.7091 17.5913 13.7824 16.9726C12.8544 16.354 13.1638 15.426 13.1638 15.426L13.1631 15.4266Z"
                fill="white"
              />
              <path
                d="M12.7832 20.3131C12.7955 20.4315 15.9472 20.9308 17.8865 18.5051C17.9408 18.4371 18.1772 18.5641 18.2475 18.5851C18.7102 19.9491 15.6955 21.6751 14.2508 21.2578C13.0225 20.8325 12.7862 20.3128 12.7862 20.3128L12.7832 20.3131ZM13.0632 15.1598C13.0915 14.5725 20.0898 14.1728 19.1232 4.5098C19.0745 4.02313 19.8992 6.65246 19.9278 7.12446C20.4918 12.0111 17.1758 15.8811 13.0645 15.1611L13.0632 15.1598ZM11.3398 12.5731C12.6125 10.7801 12.7408 6.15313 11.6575 2.83313C11.5058 2.36813 12.8158 4.47746 12.9788 4.92146C13.7755 7.13346 13.8695 9.23146 13.1668 11.0515L11.3398 12.5731Z"
                fill="white"
              />
              <path
                d="M8.45936 15.9565C9.25203 15.9599 9.74136 14.8609 9.51536 14.0792C8.4357 12.1272 6.40903 11.5712 5.33203 14.1562C7.28936 13.4962 7.60803 14.6412 8.45936 15.9565Z"
                fill="white"
              />
              <path
                d="M13.263 15.3769C22.7163 15.0719 19.363 2.87355 19.0563 4.40022C18.7497 5.92689 9.90965 14.7669 8.99298 13.5469C8.07832 12.3272 6.85832 12.0222 6.24865 12.9369C5.63898 13.8516 5.33398 14.1566 5.33398 14.1566C5.33398 14.1566 7.16365 13.8516 7.46865 14.4616C7.77365 15.0716 8.74065 17.0726 10.518 17.2059C10.518 17.2059 11.125 17.4129 12.3477 19.9502C13.7733 22.9089 19.6677 19.9502 17.8377 18.4256C16.008 16.9009 14.7883 17.5109 13.8743 16.9009C12.9597 16.2909 13.2643 15.3762 13.2643 15.3762L13.263 15.3769Z"
                stroke="currentColor"
                stroke-miterlimit="10"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M13.2894 8.83675C13.394 6.49709 12.202 0.800087 11.129 3.48342C9.90938 6.53275 9.29938 7.44675 9.29938 7.44675C7.85005 8.82342 7.31371 9.85609 7.12305 10.5008"
                stroke="currentColor"
                stroke-miterlimit="10"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <span>{{ $t('mobileFooter.memorial') }}</span>
        </button>
      </li>

      <!-- Ещё -->
      <li class="relative">
        <button
          ref="moreBtn"
          class="footer-btn w-full flex flex-col items-center gap-1 py-2"
          @click="toggleMenu"
          aria-haspopup="menu"
          :aria-expanded="open ? 'true' : 'false'"
        >
          <div class="svg">
            <svg
              width="15"
              height="4"
              viewBox="0 0 15 4"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.5 0.5C0.671573 0.5 0 1.17157 0 2C0 2.82843 0.671573 3.5 1.5 3.5C2.32843 3.5 3 2.82843 3 2C3 1.17157 2.32843 0.5 1.5 0.5Z"
                fill="#222222"
              />
              <path
                d="M6 2C6 1.17157 6.67157 0.5 7.5 0.5C8.32843 0.5 9 1.17157 9 2C9 2.82843 8.32843 3.5 7.5 3.5C6.67157 3.5 6 2.82843 6 2Z"
                fill="#222222"
              />
              <path
                d="M12 2C12 1.17157 12.6716 0.5 13.5 0.5C14.3284 0.5 15 1.17157 15 2C15 2.82843 14.3284 3.5 13.5 3.5C12.6716 3.5 12 2.82843 12 2Z"
                fill="#222222"
              />
            </svg>
          </div>

          <span>{{ $t('mobileFooter.more') }}</span>
        </button>
      </li>
    </ul>
  </nav>

  <!-- overlay -->
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-40 bg-black/20"
        @click="closeMenu"
      />
    </transition>
  </teleport>

  <!-- dropdown -->
  <teleport to="body">
    <transition name="pop">
      <div
        v-if="open"
        class="fixed z-50 bottom-[64px] right-3 w-[260px] rounded-xl bg-white shadow-xl ring-1 ring-black/5 p-2"
        role="menu"
        @keydown.esc="closeMenu"
      >
        <button
          class="w-full text-left px-3 py-2 rounded-lg hover:bg-black/5 active:bg-black/10"
          :class="
            isActive('/client/profile').value ? 'text-[#E9B949]' : 'text-[#222]'
          "
          role="menuitem"
          @click="go('/client/profile')"
        >
          {{ $t('mobileFooter.profile') }}
        </button>

        <!-- <button
          class="w-full text-left px-3 py-2 rounded-lg hover:bg-black/5 active:bg-black/10"
          :class="
            isActive('/client/reviews').value ? 'text-[#E9B949]' : 'text-[#222]'
          "
          role="menuitem"
          @click="go('/client/reviews')"
        >
          <div class="flex items-center justify-between">
            <span>{{ $t('common.reviews') }}</span>
             <span
              class="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E4A624]/15 text-[#B88F34] text-[11px] px-1"
              >1</span
            > 
          </div>
        </button> -->

        <button
          class="w-full text-left px-3 py-2 rounded-lg hover:bg-black/5 active:bg-black/10"
          :class="
            isActive('/client/burial').value ? 'text-[#E9B949]' : 'text-[#222]'
          "
          role="menuitem"
          @click="go('/client/burial')"
        >
          {{ $t('mobileFooter.reburialRequest') }}
        </button>

        <button
          class="w-full text-left px-3 py-2 rounded-lg hover:bg-black/5 active:bg-black/10"
          :class="
            isActive('/client/government').value
              ? 'text-[#E9B949]'
              : 'text-[#222]'
          "
          role="menuitem"
          @click="go('/client/government')"
        >
          {{ $t('mobileFooter.akimatAppeal') }}
        </button>

        <button
          class="w-full text-left px-3 py-2 rounded-lg hover:bg-black/5 active:bg-black/10 flex items-center gap-2"
          :class="
            isActive('/client/notifications').value
              ? 'text-[#E9B949]'
              : 'text-[#222]'
          "
          role="menuitem"
          @click="go('/client/notifications')"
        >
          {{ $t('mobileFooter.notifications') }}
          <span
            v-if="unreadCount > 0"
            class="inline-flex items-center justify-center min-w-[20px] h-[20px] px-[6px] rounded-full bg-[#E9B949] text-white text-[12px]"
          >
            {{ unreadCount }}
          </span>
        </button>

        <div class="p-2">
          <button
            class="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#E4A624] text-[#201001] font-medium py-2.5 hover:brightness-95 active:brightness-90"
            @click="go('/reserve')"
          >
            <img src="/icons/pencil.svg" alt="Reserve icon" class="w-5 h-5" />
            {{ $t('mobileFooter.reservePlace') }}
          </button>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { getUnreadNotifications } from "~/services/notifications";
import { useI18n } from 'vue-i18n';

const { t: $t } = useI18n();
const router = useRouter();
const route = useRoute();
const open = ref(false);
const unreadCount = ref(0);

const isActive = (path) => computed(() => route.path.startsWith(path));

const toggleMenu = () => {
  open.value = !open.value;
  lockScroll(open.value);
};
const closeMenu = () => {
  open.value = false;
  lockScroll(false);
};
const go = (to) => {
  closeMenu();
  router.push(to);
};

const fetchUnreadCount = async () => {
  try {
    const response = await getUnreadNotifications();
    unreadCount.value = response.data?.total || 0;
  } catch (error) {
    console.error($t('mobileFooter.notificationLoadError'), error);
  }
};

onMounted(() => {
  fetchUnreadCount();
});

const onKey = (e) => {
  if (e.key === "Escape") closeMenu();
};
onMounted(() => document.addEventListener("keydown", onKey));
onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKey);
  lockScroll(false);
});

function lockScroll(state) {
  const el = document.documentElement;
  if (state) el.style.overflow = "hidden";
  else el.style.overflow = "";
}
</script>

<style scoped>
@media (min-width: 769px) {
  .footer-mob {
    display: none;
  }
}

.footer-btn .svg {
  margin-top: 7px;
  margin-bottom: 3px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.pop-enter-active,
.pop-leave-active {
  transition: transform 0.16s ease, opacity 0.16s ease;
}
.pop-enter-from,
.pop-leave-to {
  transform: translateY(6px);
  opacity: 0;
}
</style>
