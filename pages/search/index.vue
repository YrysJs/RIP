<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { searchDeceased } from '~/services/client'
import SearchSuccessModal from "~/components/search/SearchSuccessModal.vue";

const router = useRouter();
const showSuccessModal = ref(false)

const closeSuccessModal = () => {
  showSuccessModal.value = false
  navigateTo('/')
}


const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  targetLastName: '',
  targetFirstName: '',
  targetMiddleName: '',
  birthDate: '',
  deathDate: '',
  extraInfo: ''
});

const formatDate = (date: string) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
};

const onSubmit = async () => {
  await searchDeceased({
    name: form.targetFirstName,
    surname: form.targetLastName,
    birth_date: formatDate(form.birthDate),
    death_date: formatDate(form.deathDate),
    additional: form.extraInfo,
    user: {
      fio: form.fullName,
      email: form.email,
      phone: form.phone
    }
  });
  showSuccessModal.value = true
};

</script>

<template>
  <NuxtLayout name="form">
    <div class="flex items-center bg-white p-5 rounded-2xl mb-4">
      <button class="btn btn-back mr-4" @click="router.back()">
        <img class="w-4 h-4 mr-[10px]" src="/icons/arrow-left-primary.svg" alt="">
        Назад
      </button>
      <h1 class="text-[32px] font-medium">Поиск захоронения</h1>
    </div>

    <div class="bg-white p-5 rounded-2xl space-y-4 mb-4">
      <h2 class="text-lg font-medium">
        Укажите свои данные и контакты
        <span class="text-red-500 text-sm">Поля обязательно к заполнению</span>
      </h2>

      <div>
        <label class="block text-sm mb-1">ФИО</label>
        <input type="text" v-model="form.fullName" class="input" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm mb-1">E-mail</label>
          <input type="email" v-model="form.email" class="input" />
        </div>
        <div>
          <label class="block text-sm mb-1">Телефон</label>
          <input type="tel" v-model="form.phone" class="input" placeholder="+7" />
        </div>
      </div>
    </div>

    <div class="bg-white p-5 rounded-2xl space-y-4 mb-4">
      <h2 class="text-lg font-medium">Искомые данные</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm mb-1">Фамилия</label>
          <input type="text" v-model="form.targetLastName" class="input" />
        </div>
        <div>
          <label class="block text-sm mb-1">Имя</label>
          <input type="text" v-model="form.targetFirstName" class="input" />
        </div>
        <div>
          <label class="block text-sm mb-1">Отчество</label>
          <input type="text" v-model="form.targetMiddleName" class="input" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm mb-1">Дата рождения</label>
          <input type="date" v-model="form.birthDate" class="input" />
        </div>
        <div>
          <label class="block text-sm mb-1">Дата смерти</label>
          <input type="date" v-model="form.deathDate" class="input" />
        </div>
      </div>

      <div>
        <label class="block text-sm mb-1">Дополнительные данные</label>
        <textarea v-model="form.extraInfo" class="input textarea" rows="4" />
      </div>
    </div>

    <div class="bg-white p-5 rounded-2xl mb-4 flex justify-end">
      <button class="btn btn-submit w-full " @click="onSubmit">Отправить заявку</button>
    </div>
    <Teleport to="body">
      <SearchSuccessModal
          v-if="showSuccessModal"
          title="Оплата прошла успешно, заявка на захоронения отправлена!"
          text="Отслеживайте статус в личном кабинете"
          @close="closeSuccessModal"
      />
    </Teleport>
  </NuxtLayout>
</template>

<style scoped>
.input {
  @apply w-full border border-gray-300 rounded-lg px-4 py-2;
}

.textarea {
  @apply resize-none;
}

.btn-back {
  height: 40px;
  padding: 12px 16px;
  font-size: 14px;
  color: #224C4F;
  background: #EEEEEE;
}

.btn-submit {
  background: #38949B;
  color: white;
  font-weight: 500;
  padding: 16px 24px;
  font-size: 16px;
  border-radius: 8px;
}
</style>
