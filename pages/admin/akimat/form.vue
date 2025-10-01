<script setup>
import { CreateAkimat, getCities } from '~/services/admin'
import SuccessModal from "~/components/layout/modals/SuccessModal.vue";
import {ref} from "vue";

const showSuccessModal = ref(false)

definePageMeta({
  middleware: ['auth', 'admin'],
});

const cities = [
  'Алматы',
  'Нур-Султан',
  'Шымкент',
  'Караганда',
  'Тараз',
  'Павлодар',
  'Усть-Каменогорск',
  'Семей',
  'Актобе',
  'Костанай',
  'Кызылорда',
  'Талдыкорган',
  'Тараз',
  'Павлодар',
  'Усть-Каменогорск',
  'Семей',
  'Актобе',
  'Костанай',
  'Кызылорда'
]

const form = reactive({
  address: '',
  phone: '',
  mapUrl: '',
  name: '',
  cityId: 0,
  admin: {
    iin: '',
    name: '',
    surname: '',
    patronymic: '',
    phone: ''
  }
});

function extractDigits(phone) {
  return phone.replace(/\D/g, '');
}

const router = useRouter();

const closeSuccessModal = () => {
  showSuccessModal.value = false
}

const create = async () => {
  try {
    const res = await CreateAkimat({
      address: form.address,
      phone: extractDigits(form.phone),
      mapUrl: form.mapUrl,
      name: form.name,
      cityId: form.cityId,
      employeeRole: '7',
      admin: {
        iin: form.admin.iin,
        name: form.admin.name,
        surname: form.admin.surname,
        patronymic: form.admin.patronymic,
        phone: extractDigits(form.admin.phone)
      }
    })
    showSuccessModal.value = true
  }
  catch (err) {
    console.error(err)
  }
}

onMounted(async () => {
  await getCities()
})

</script>

<template>
  <NuxtLayout name="form">
    <div class="flex items-center bg-white p-5 rounded-2xl mb-4">
      <button class="btn btn-back mr-4" @click="router.push('/')">
        <img class="w-4 h-4 mr-[10px]" src="/icons/arrow-left-primary.svg" alt="">
        Назад
      </button>

      <h1 class="text-[32px] font-medium">Создание Акимата</h1>
    </div>


    <div class="bg-white p-5 rounded-2xl space-y-4 mb-4">
      <h2 class="text-lg font-medium">Данные о Акимате</h2>

      <div>
        <label class="block text-sm mb-1">Название</label>
        <input type="text" v-model="form.name" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">Адрес</label>
        <input type="text" v-model="form.address" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">Телефон</label>
        <input type="tel" v-mask="'+7 (###) ###-##-##'" v-model="form.phone" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">Город</label>
        <select v-model="form.cityId" class="input select">
          <option v-for="(city, index) in cities" :key="city" :value="index + 1">{{city}}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm mb-1">Ссылка на карту</label>
        <input type="text" v-model="form.mapUrl" class="input" />
      </div>

    </div>

    <div class="bg-white p-5 rounded-2xl space-y-4 mb-4">
      <h2 class="text-lg font-medium">Админ</h2>

      <div>
        <label class="block text-sm mb-1">ИИН</label>
        <input type="text" v-model="form.admin.iin" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">Имя</label>
        <input type="text" v-model="form.admin.name" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">Отчество</label>
        <input type="text" v-model="form.admin.patronymic" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">Фамилия</label>
        <input type="text" v-model="form.admin.surname" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">Телефон</label>
        <input type="tel" v-mask="'+7 (###) ###-##-##'" v-model="form.admin.phone" class="input" />
      </div>

    </div>

    <div class="bg-white p-5 rounded-2xl mb-4 flex gap-[10px] justify-end">
      <button class="btn btn-submit" @click="create">
        Создать
      </button>
    </div>
    <Teleport to="body">
      <SuccessModal
          v-if="showSuccessModal"
          title="Акимат создан!"
          @close="closeSuccessModal"
      />
    </Teleport>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.btn-back {
  height: 40px;
  padding: 12px 16px;
  font-size: 14px;
  color: #224C4F;
  background: #EEEEEE;
}

.btn-add {
  background: #224C4F;
  color: #fff;
  font-size: 14px;
  padding: 8px 16px;
}

.btn-preview {
  height: 52px;
  color: #222;
  background: #224C4F26;
  padding: 16px;
}

.btn-submit {
  height: 52px;
  background: #38949B;
  color: #fff;
  padding: 16px;
}
</style>