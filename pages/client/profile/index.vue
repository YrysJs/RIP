<script setup>
const userMock = ref({
  "ФИО:": "Алтынбекова Сымбат Ержанкызы",
  "ИИН:": "981218300297",
  "Номер телефона:": "+7 (777) 777-77-77",
});
</script>

<template>
  <NuxtLayout name="client">
    <div class="max-sm:h-[50vh]">
      <div
        class="flex items-center justify-between border-b border-b-[#2010011F] pb-4 flex-wrap-reverse gap-3"
      >
        <h3 class="w-[500px] font-foglihten text-fluid">Личные данные</h3>
        <NuxtLink
          to="/client/profile/edit"
          class="flex bg-[#E9B949] py-[15px] px-5 rounded-lg gap-2 hover:bg-[#D1A53F] active:bg-[#B88F34] transition"
        >
          <img src="/icons/pencil.svg" alt="" />
          Редактировать
        </NuxtLink>
      </div>
      <div class="flex flex-col mt-2 gap-2">
        <div
          v-for="(value, label) in userMock"
          :key="label"
          class="flex items-center"
        >
          <div class="w-[150px] h-[38px] text-sm text-[#999] leading-[38px]">
            {{ label }}
          </div>
          <div>{{ value }}</div>
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
