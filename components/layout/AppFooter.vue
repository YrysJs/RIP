<template>
    <footer class="app-footer">
        <div class="container">
            <div class="footer-top flex gap-[24px] items-center text-[16px]">
                <nuxt-link to="/">Стать партнером</nuxt-link>
                <nuxt-link to="/">Цены</nuxt-link>
                <nuxt-link to="/">Контакты</nuxt-link>
                <nuxt-link to="/">Вакансии</nuxt-link>
                <nuxt-link to="/">Инструкция для пользователей</nuxt-link>
            </div>
            <div class="footer-center flex items-center gap-[24px]">
                <a href="/">
                    <img src="/icons/inst.svg" alt="">
                </a>
                <a href="/">
                    <img src="/icons/fb.svg" alt="">
                </a>
            </div>
          <div class="footer-bottom flex items-center gap-[24px]">
            <p class="text-[16px]">Пользуясь сервисом ripservice.kz, Вы соглашаетесь с <br/><nuxt-link to="/instructions" class="underline">условиями и политиками</nuxt-link>  предоставления услуги</p>
          </div>
            <div class="footer-bottom flex items-center gap-[24px]">
                <p class="text-[20px]">© 2025 RIP. Все права защищены.</p>
            </div>
        </div>
    </footer>
</template>

<script setup>
</script>

<style scoped>
.app-footer {
    background-color: #224C4F;
    padding-top: 42px;
    padding-bottom: 42px;
}
.container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
    color: #DADADA;
}
</style>
