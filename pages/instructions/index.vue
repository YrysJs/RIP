<template>
  <div class="relative mt-[60px]">
    <AppHeader type="client" />
    <AppHeaderClient />

    <div
      class="container py-[100px] px-[20px] flex flex-col gap-5 mb-[56px] max-md:pt-5"
    >
      <h1 class="text-2xl font-bold mb-2">Пользователям</h1>

      <a
        v-for="(doc, i) in docs"
        :key="i"
        :href="doc.href"
        target="_blank"
        class="card group flex items-center gap-3 rounded-2xl py-5 px-6 bg-white border border-[#E5E5E5] shadow-sm hover:shadow-lg hover:-translate-y-[3px] transition-all duration-300"
      >
        <img
          src="/icons/pdf.webp"
          alt="pdf"
          class="w-8 h-8 opacity-80 group-hover:opacity-100 transition-opacity duration-300"
        />
        <span
          class="text-base font-medium text-[#201001] group-hover:text-[#B88F34] transition-colors duration-300"
        >
          {{ doc.title }}
        </span>
      </a>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import AppFooter from "~/components/layout/AppFooter.vue";
import AppHeader from "~/components/layout/AppHeader.vue";
import AppHeaderClient from "~/components/layout/AppHeaderClient.vue";

const docs = [
  {
    href: "/docs/Лицензионное_соглашение (1)-2.pdf",
    title: "Лицензионное соглашение",
  },
  {
    href: "/docs/Политика конфиденциальности (1)-2.pdf",
    title: "Политика конфиденциальности",
  },
  {
    href: "/docs/Политика обработка ПД (1).pdf",
    title: "Политика обработки ПД",
  },
  {
    href: "/docs/Пользовательское соглашение-2.pdf",
    title: "Пользовательское соглашение",
  },
  {
    href: "/docs/СОГЛАСИЕ_на_обработку_персональных_данных_при_регистрации_на_платформе.pdf",
    title:
      "Согласие на обработку персональных данных при регистрации на платформе",
  },
];
</script>

<style lang="scss" scoped>
.container {
  max-width: 500px;
  width: 100%;
  margin: auto;
}

.card {
  background: #fff;
  border: 1px solid #e5e5e5;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  &:hover {
    border-color: #b88f34;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  }
}
</style>
