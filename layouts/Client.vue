<script setup>
import LayoutTop from "~/components/layout/LayoutTop.vue";
import ClientSidebar from "~/components/layout/ClientSidebar.vue";
import AppHeader from "~/components/layout/AppHeader.vue";
import { getCurrentUser } from "~/services/login";
import { onMounted } from "vue";
import { useUserStore } from "~/store/user";
import AppHeaderClient from "~/components/layout/AppHeaderClient.vue";
import MobileFooter from "~/components/layout/MobileFooter.vue";

const userStore = useUserStore();

const userInfo = ref(null);

const props = defineProps({
  contentClass: {
    type: [String, Array, Object],
    default: "bg-white py-6 px-[18px]",
  },
});

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
    <AppHeader type="client" />
    <AppHeaderClient />
    <div class="container">
      <div
        class="main-mt py-[24px] min-h-[100vh] mt-[104px] rounded-lg flex gap-[24px] max-md:py-0 max-md:gap-0"
      >
        <aside
          class="mob-hidden bg-white p-[20px] max-w-[408px] min-w-[305px] relative rounded-lg"
        >
          <ClientSidebar :title="$t('client.sidebar.title')" />
        </aside>

        <div
          :class="[
            'min-w-0 w-full h-fit flex flex-col gap-10 rounded-lg max-md:pt-6 max-md:px-4 max-md:pb-[106px]',
            props.contentClass,
          ]"
        >
          <slot />
        </div>
      </div>
    </div>
    <MobileFooter />
  </main>
</template>

<style lang="scss" scoped>
.container {
  max-width: 1200px;
  width: 100%;
  margin: auto;
}

@media (max-width: 768px) {
  .main-mt {
    margin-top: 56px;
    padding-top: 0;
    background-color: #fff;
    min-height: calc(100vh - 126px);
  }

  .mob-hidden {
    display: none;
  }
}
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
