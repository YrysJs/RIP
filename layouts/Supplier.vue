<script setup>
import LayoutSidebar from "~/components/layout/LayoutSidebar.vue";
import SupplierSidebar from "~/components/layout/SupplierSidebar.vue";
import AppHeader from "~/components/layout/AppHeader.vue";
import AppHeaderSupplier from "~/components/layout/AppHeaderSupplier.vue";
import { getSupplierInfo } from "~/services/supplier";
import { onMounted, computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const supplierInfo = ref(null);

const props = defineProps({
  transparentContent: {
    type: Boolean,
    default: false,
  },
});

// Динамический заголовок страницы
const pageTitle = computed(() => {
  const path = route.path;
  
  if (path.includes('/supplier/tickets/')) {
    if (path.includes('/active')) return 'АКТИВНЫЕ ЗАЯВКИ';
    if (path.includes('/archive')) return 'АРХИВНЫЕ ЗАЯВКИ';
  }
  
  if (path.includes('/supplier/services')) {
    if (path === '/supplier/services') return 'ТОВАРЫ И УСЛУГИ';
    if (path.includes('/active')) return 'АКТИВНЫЕ УСЛУГИ';
    if (path.includes('/consideration')) return 'НА РАССМОТРЕНИИ';
    if (path.includes('/improvement')) return 'ТРЕБУЕТ ДОРАБОТКИ';
    if (path.includes('/inactive')) return 'НЕ АКТИВНЫЕ';
    if (path.includes('/add')) return 'ДОБАВИТЬ УСЛУГУ';
  }
  
  if (path.includes('/supplier/reviews')) return 'ОТЗЫВЫ';
  if (path.includes('/supplier/reports')) return 'ОТЧЕТЫ';
  if (path.includes('/supplier/goverment/requests')) return 'ОБРАЩЕНИЕ В АКИМАТ';
  
  return 'КАБИНЕТ ПОСТАВЩИКА УСЛУГ';
});

onMounted(async () => {
  const response = await getSupplierInfo();

  supplierInfo.value = response.data;
});
</script>

<template>
  <section class="supplier">
    <!-- Десктопный хедер -->
    <AppHeader type="supplier" class="desktop-header" />

    <!-- Мобильный хедер -->
    <AppHeaderSupplier :title="pageTitle" class="mobile-header" />

    <div class="supplier__wrap">
      <aside class="supplier__sidebar">
        <LayoutSidebar title="Кабинет поставщика услуг" />
      </aside>

      <main
        :class="[
          'supplier__content',
          props.transparentContent ? 'supplier__content--transparent' : '',
        ]"
      >
        <slot />
      </main>
    </div>

    <!-- Мобильная нижняя навигация -->
    <SupplierSidebar />
  </section>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.supplier {
  background: #faf7ef;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  margin-top: 110px;

  &__wrap {
    width: 100%;
    max-width: 1160px;
    margin: 24px auto 40px;
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 24px;

    @media (max-width: 1100px) {
      grid-template-columns: 1fr;
    }
  }

  &__sidebar {
    background: #ffffff;
    border: 1px solid #ece7da;
    border-radius: 16px;
    padding: 28px 16px;
    align-self: start;
    position: sticky;
    top: 12px;

    @media (max-width: 1100px) {
      position: static;
    }
  }

  &__content {
    background: #ffffff;
    border: 1px solid #ece7da;
    border-radius: 16px;
    padding: 20px;
    color: #1c1c1c;
    min-height: 640px;

    &--transparent {
      background: transparent;
      border: none;
      padding: 0;
    }
  }

  /* Мобильные стили */
  @media (max-width: 768px) {
    margin-top: 0;
    padding-top: 80px; /* Отступ для мобильного хедера */
    padding-bottom: 80px; /* Отступ для нижней навигации */
    background: #ffffff; /* Белый фон по умолчанию */

    &__wrap {
      margin: 0;
      padding: 0;
      grid-template-columns: 1fr;
      gap: 0;
    }

    &__sidebar {
      display: none; /* Скрываем сайдбар на мобильных */
    }

    &__content {
      border: none;
      border-radius: 0;
      padding: 16px;
      min-height: auto;
      background: #ffffff;

      &--transparent {
        background: transparent;
        padding: 16px;
      }
    }
  }
}

/* Скрытие/показ хедеров */
.desktop-header {
  @media (max-width: 768px) {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    position: absolute !important;
    top: -9999px !important;
    height: 0 !important;
    overflow: hidden !important;
  }
}

.mobile-header {
  display: none;
  
  @media (max-width: 768px) {
    display: block !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    z-index: 10001 !important;
    width: 100% !important;
  }
}

/* Дополнительное скрытие десктопного хедера */
:global(.app-header) {
  @media (max-width: 768px) {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    position: absolute !important;
    top: -9999px !important;
    height: 0 !important;
    overflow: hidden !important;
  }
}
</style>
