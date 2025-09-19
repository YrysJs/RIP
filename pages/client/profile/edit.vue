<script setup>
import { ref } from "vue";

const user = ref({
  iin: "981218300297",
  fullName: "Алтынбекова Сымбат Ержанкызы",
  phone: "+7 (777) 777-77-77",
});

const form = ref({ phone: user.value.phone });

function save() {
  // Тут логика обновления (например, через API)
  user.value.phone = form.value.phone;
  // После сохранения можно редиректить обратно
  navigateTo("/client/profile");
}
</script>

<template>
  <NuxtLayout name="client">
    <div>
      <h3 class="font-foglihten text-fluid border-b border-[#2010011F] pb-4">
        Редактирование личных данных
      </h3>

      <div class="flex gap-4 mt-4 flex-wrap">
        <div class="bg-[#F1F2F4] rounded-lg p-4 w-[478px]">
          <div class="text-[#999] text-sm mb-1">ИИН</div>
          <input
            :value="user.iin"
            class="bg-transparent outline-none text-[#5C6771]"
          />
        </div>

        <div class="bg-[#F1F2F4] rounded-lg p-4 w-[478px]">
          <div class="text-[#999] text-sm mb-1">ФИО</div>
          <input
            :value="user.fullName"
            class="bg-transparent outline-none text-[#5C6771] w-full"
          />
        </div>
      </div>

      <div class="mt-4">
        <label class="block mb-2">Отредактировать номер телефона:</label>
        <input
          v-model="form.phone"
          placeholder="Номер телефона"
          class="border border-[#D6DADF] rounded-lg p-4 outline-none w-[478px]"
        />
      </div>

      <button class="mt-6 py-[15px] px-5 rounded-lg bg-[#E9B949]" @click="save">
        Сохранить
      </button>
    </div>
  </NuxtLayout>
</template>

<style scoped>
.text-fluid {
  font-size: clamp(24px, 3vw, 32px);
}
</style>
