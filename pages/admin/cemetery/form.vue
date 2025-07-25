<script setup>

import FormMap from "~/components/map/FormMap.vue";
import { CreateCemetery } from '~/services/admin'
import SuccessModal from "~/components/layout/modals/SuccessModal.vue";
import {ref} from "vue";

const showSuccessModal = ref(false)

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

definePageMeta({
  middleware: ['auth', 'admin'],
});

const form = reactive({
  name: 'Северное кладбище',
  description: 'Просторная и ухоженная, разделена на секции по типу захоронений: семейные, одиночные, мемориальные участки и колумбарий.',
  street_name: 'Северное кладбище',
  religion: 'all',
  phone: '',
  status: 'active',
  city: '',
  country: 'Казахстан',
  polygon_data: {
    color: '',
    coordinates: []
  },
  location_coords: [],
  capacity: 0
});

const router = useRouter();

const closeSuccessModal = () => {
  showSuccessModal.value = false
  router.push('/admin/cemetery')
}

const finishDraw = (cords) => {
  form.polygon_data.coordinates = [...cords.points, cords.points[0]]
  form.location_coords = cords.center
}

const create = async () => {
  try {
    const res = await CreateCemetery(form)
    showSuccessModal.value = true
    console.log(res)
  }
  catch (err) {
    console.log(err)
  }
}

</script>

<template>
  <NuxtLayout name="form">
    <div class="flex items-center bg-white p-5 rounded-2xl mb-4">
      <button class="btn btn-back mr-4" @click="router.push('/admin/cemetery')">
        <img class="w-4 h-4 mr-[10px]" src="/icons/arrow-left-primary.svg" alt="">
        Назад
      </button>

      <h1 class="text-[32px] font-medium">Создание кладбища</h1>
    </div>


    <div class="bg-white p-5 rounded-2xl space-y-4 mb-4">
      <h2 class="text-lg font-medium">Данные о кладбище</h2>

      <div>
        <label class="block text-sm mb-1">Название</label>
        <input type="text" v-model="form.name" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">Описание</label>
        <textarea v-model="form.description" rows="3" class="input textarea"></textarea>
      </div>

      <div>
        <label class="block text-sm mb-1">Телефон</label>
        <input type="tel" v-mask="'+7 (###) ###-##-##'" v-model="form.phone" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">Вместимость</label>
        <input type="number" v-model="form.capacity" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">Город</label>
        <select v-model="form.city" class="input">
          <option v-for="city in cities" :key="city" :value="city">{{city}}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm mb-1">Адрес кладбища</label>
        <input type="text" v-model="form.street_name" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">Религия</label>
        <select v-model="form.religion" class="input">
          <option value="all">Все</option>
          <option value="christian">Христианство</option>
          <option value="muslim">Ислам</option>
          <option value="jewish">Иудаизм</option>
        </select>
      </div>
    </div>
    {{form.polygon_data.coordinates}}
    <FormMap @complete="finishDraw" />

    <div class="bg-white p-5 rounded-2xl space-y-4 mb-4">
      <h2 class="text-lg font-medium">Статус кладбища</h2>

      <div class="flex justify-between gap-4">
        <div class="flex justify-center items-center flex-1 h-12 rounded-lg bg-[#EEEEEE] text-center text-[#939393] font-semibold text-sm cursor-pointer" :class="{'!bg-[#224C4F] text-white': form.status === 'active'}" @click="form.status='active'">
          Активен
        </div>
        <div class="flex justify-center items-center flex-1 h-12 rounded-lg bg-[#EEEEEE] text-center text-[#939393] font-semibold text-sm cursor-pointer" :class="{'!bg-[#224C4F] text-white': form.status === 'inactive'}" @click="form.status='inactive'">
          Не активен
        </div>
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
          title="Кладбище создано!"
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