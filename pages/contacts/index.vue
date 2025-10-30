<script setup>
import AppHeader from "~/components/layout/AppHeader.vue"
import AppFooter from "~/components/layout/AppFooter.vue"
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <div class="relative min-h-screen flex flex-col justify-between">
    <AppHeader type="client" />
    <div class="bg-white rounded-[16px] shadow-md p-10 mx-auto max-w-3xl text-gray-800" style="margin-top: 150px">
      <p class="text-xl font-semibold mb-6">{{ $t('contacts.companyName') }}</p>
      <div class="flex flex-col gap-3 text-base leading-7">
        <p><span class="font-medium">{{ $t('contacts.legalAddress') }}</span> ул. Переулок Дружбы, дом 9А, офис 38, Алматы, Казахстан 050060</p>
        <p><span class="font-medium">{{ $t('contacts.iin') }}</span> 150840008856</p>
        <p><span class="font-medium">{{ $t('contacts.iik') }}</span> KZ65601A861056514131</p>
        <p><span class="font-medium">{{ $t('contacts.kbe') }}</span> 17</p>
        <p><span class="font-medium">{{ $t('contacts.bank') }}</span> АО «Народный Банк Казахстана»</p>
        <p><span class="font-medium">{{ $t('contacts.bik') }}</span> HSBKKZKX</p>
        <a href="http://wa.me/77758100110" target="_blank"><span class="font-medium">{{ $t('contacts.phone') }}</span> +7 775 810 01 10</a>
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<style lang="scss" scoped>

</style>