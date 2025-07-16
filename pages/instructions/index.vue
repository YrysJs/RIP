<script setup>
import AppHeader from "~/components/layout/AppHeader.vue";
import AppFooter from "~/components/layout/AppFooter.vue";

</script>

<template>
    <div class="relative">
        <AppHeader type="client" />
        <div class="container py-[100px] flex flex-col gap-[20px] mb-[56px]">
            <h1 class="text-2xl font-bold">Пользователям</h1>
            <a target="_blank" href="/docs/Лицензионное_соглашение (1)-2.pdf" class="card flex items-center gap-[10px] rounded-xl py-4 px-6">
                <img src="/icons/pdf.webp" alt="pdf">Лицензионное соглашение
            </a>
            <a target="_blank" href="/docs/Политика конфиденциальности (1)-2.pdf" class="card flex items-center gap-[10px] rounded-xl py-4 px-6">
                <img src="/icons/pdf.webp" alt="pdf">Политика конфиденциальности
            </a>
            <a target="_blank" href="/docs/Политика обработка ПД (1).pdf" class="card flex items-center gap-[10px] rounded-xl py-4 px-6">
                <img src="/icons/pdf.webp" alt="pdf">Политика обработка ПД
            </a>
            <a target="_blank" href="/docs/Пользовательское соглашение-2.pdf" class="card flex items-center gap-[10px] rounded-xl py-4 px-6">
                <img src="/icons/pdf.webp" alt="pdf">Пользовательское соглашение
            </a>
            <a target="_blank" href="/docs/СОГЛАСИЕ_на_обработку_персональных_данных_при_регистрации_на_платформе.pdf" class="card flex items-center gap-[10px] rounded-xl py-4 px-6">
                <img src="/icons/pdf.webp" alt="pdf">Согласие на обработку персональных данных при регистрации на платформе
            </a>
        </div>
        <AppFooter />
    </div>
</template>

<style lang="scss" scoped>
// .main {
//     background: url('/images/client/banner.jpg');
//     background-size: cover;
//     background-repeat: no-repeat;
// }
.container {
    max-width: 1200px;
    width: 100%;
    margin: auto;
}
.card {
    box-shadow: 0px 4px 10px -5px #000;
}


</style>