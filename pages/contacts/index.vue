<script setup>
import AppHeader from "~/components/layout/AppHeader.vue"
import AppFooter from "~/components/layout/AppFooter.vue"

</script>

<template>
  <div class="relative min-h-screen flex flex-col justify-between">
    <AppHeader type="client" />
    <div class="bg-white rounded-[16px] shadow-md p-10 mx-auto max-w-3xl text-gray-800" style="margin-top: 150px">
      <p class="text-xl font-semibold mb-6">ТОО “RIP SERVICE”</p>
      <div class="flex flex-col gap-3 text-base leading-7">
        <p><span class="font-medium">Юр. адрес:</span> ул. Переулок Дружбы, дом 9А, офис 38, Алматы, Казахстан 050060</p>
        <p><span class="font-medium">ИИН/БИН:</span> 150840008856</p>
        <p><span class="font-medium">ИИК:</span> KZ65601A861056514131</p>
        <p><span class="font-medium">КБЕ:</span> 17</p>
        <p><span class="font-medium">Банк:</span> АО «Народный Банк Казахстана»</p>
        <p><span class="font-medium">БИК:</span> HSBKKZKX</p>
        <a href="http://wa.me/77758100110" target="_blank"><span class="font-medium">Телефон:</span> +7 775 810 01 10</a>
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<style lang="scss" scoped>

</style>