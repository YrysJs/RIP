<script setup>
import LayoutTop from "~/components/layout/LayoutTop.vue";
import ClientSidebar from "~/components/layout/ClientSidebar.vue";
import AppHeader from "~/components/layout/AppHeader.vue";
import { getCurrentUser } from "~/services/login";
import { onMounted } from "vue";
import { useUserStore } from "~/store/user";

const userStore = useUserStore();

const userInfo = ref(null);

onMounted(async () => {
  const response = await getCurrentUser({
    id: localStorage.getItem("user_id"),
  });

  userInfo.value = response.data;

  userStore.setUser(userInfo.value);
});
</script>

<template>
  <main>
    <!-- <AppHeader type="client" /> -->

    <div
      class="py-[24px] min-h-[100vh] rounded-lg flex gap-[24px] max-sm:flex-col-reverse max-sm:py-0 max-sm:gap-0"
    >
      <aside
        class="bg-white p-[20px] max-w-[408px] min-w-[305px] relative max-sm:max-w-full rounded-lg"
      >
        <ClientSidebar title="ЛИЧНЫЙ КАБИНЕТ" />
      </aside>

      <div
        class="min-w-0 w-full h-fit flex flex-col gap-10 bg-white rounded-lg py-6 px-[18px] max-sm:pt-6 max-sm:px-4 max-sm:pb-9"
      >
        <slot />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
// .client {
//   background: #faf7ef;
//   min-height: 100dvh;
//   display: flex;
//   flex-direction: column;
//   margin-top: 76px;

//   &__sidebar {
//     background: #ffffff;
//     border-radius: 16px;
//     padding: 28px 16px;
//     border: 1px solid #ece7da;
//     align-self: start;
//     position: sticky;
//     top: 12px;

//     @media (max-width: 1100px) {
//       position: static;
//     }
//   }

//   &__content {
//     background: #ffffff;
//     border-radius: 16px;
//     border: 1px solid #ece7da;
//     padding: 20px;
//     color: #1c1c1c;
//     min-height: 640px;
//   }
// }
</style>
