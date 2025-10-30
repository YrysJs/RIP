<script setup>

import {useUserStore} from "~/store/user.js";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const userStore = useUserStore();


function formatPhoneNumber(phone) {
  if (!/^\d{11}$/.test(phone)) return t('errors.invalidPhone');

  return `+${phone[0]} (${phone.slice(1, 4)}) ${phone.slice(4, 7)} ${phone.slice(7, 9)} ${phone.slice(9, 11)}`;
}

</script>

<template>
  <NuxtLayout name="client">
    <div class="max-sm:min-h-[50vh]">
      <div
        class="flex items-center justify-between border-b border-b-[#2010011F] pb-4 flex-wrap-reverse gap-3"
      >
        <h3 class="w-[500px] font-foglihten text-fluid">{{ $t('client.profile.personalData') }}</h3>
      </div>
      <div class="flex flex-col mt-2 gap-2">
        <div class="flex items-center">
          <div class="w-[150px] h-[38px] text-sm text-[#999] leading-[38px]">
            {{ $t('client.profile.fullName') }}
          </div>
          <div>{{ userStore?.user?.surname }} {{ userStore?.user?.name }} {{ userStore?.user?.patronymic }}</div>
        </div>
        <div class="flex items-center">
          <div class="w-[150px] h-[38px] text-sm text-[#999] leading-[38px]">
            {{ $t('client.profile.iin') }}
          </div>
          <div>{{ userStore?.user?.iin }}</div>
        </div>
        <div class="flex items-center">
          <div class="w-[150px] h-[38px] text-sm text-[#999] leading-[38px]">
            {{ $t('client.profile.phoneNumber') }}
          </div>
          <div>{{ formatPhoneNumber(userStore?.user?.phone) }}</div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.text-fluid {
  font-size: clamp(24px, 3vw, 32px);
}
</style>
