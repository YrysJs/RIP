<script setup>

import FormMap from "~/components/map/FormMap.vue";
import { CreateCemetery } from '~/services/admin'
import SuccessModal from "~/components/layout/modals/SuccessModal.vue";
import {ref, reactive} from "vue";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

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
  name: t('cemeteryDefaults.northernCemetery'),
  description: t('cemeteryDefaults.description'),
  street_name: t('cemeteryDefaults.northernCemetery'),
  religion: 'all',
  phone: '',
  status: 'active',
  city: '',
  country: t('cities.kazakhstan'),
  polygon_data: {
    color: '',
    coordinates: []
  },
  location_coords: [],
  capacity: 0,
  burial_price: 0
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
    // Убеждаемся, что burial_price отправляется как число
    const formData = {
      ...form,
      burial_price: Number(form.burial_price) || 0
    }
    const res = await CreateCemetery(formData)
    showSuccessModal.value = true
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
        {{ $t('common.back') }}
      </button>

      <h1 class="text-[32px] font-medium">{{ $t('cemeteryForm.createCemetery') }}</h1>
    </div>


    <div class="bg-white p-5 rounded-2xl space-y-4 mb-4">
      <h2 class="text-lg font-medium">{{ $t('cemeteryForm.cemeteryData') }}</h2>

      <div>
        <label class="block text-sm mb-1">{{ $t('cemeteryForm.name') }}</label>
        <input type="text" v-model="form.name" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">{{ $t('cemeteryForm.description') }}</label>
        <textarea v-model="form.description" rows="3" class="input textarea"></textarea>
      </div>

      <div>
        <label class="block text-sm mb-1">{{ $t('cemeteryForm.phone') }}</label>
        <input type="tel" v-mask="'+7 (###) ###-##-##'" v-model="form.phone" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">{{ $t('cemeteryForm.capacity') }}</label>
        <input type="number" v-model="form.capacity" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">{{ $t('cemeteryForm.burialPrice') }}</label>
        <input 
          type="number" 
          v-model.number="form.burial_price" 
          class="input" 
          :placeholder="$t('cemeteryForm.enterPrice')"
        />
      </div>

      <div>
        <label class="block text-sm mb-1">{{ $t('cemeteryForm.city') }}</label>
        <select v-model="form.city" class="input">
          <option v-for="city in cities" :key="city" :value="city">{{city}}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm mb-1">{{ $t('cemeteryForm.address') }}</label>
        <input type="text" v-model="form.street_name" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">{{ $t('cemeteryForm.religion') }}</label>
        <select v-model="form.religion" class="input">
          <option value="all">{{ $t('cemeteryForm.all') }}</option>
          <option value="christian">{{ $t('cemeteryForm.christianity') }}</option>
          <option value="muslim">{{ $t('cemeteryForm.islam') }}</option>
          <option value="jewish">{{ $t('cemeteryForm.judaism') }}</option>
        </select>
      </div>
    </div>
    <FormMap @complete="finishDraw" />

    <div class="bg-white p-5 rounded-2xl space-y-4 mb-4">
      <h2 class="text-lg font-medium">{{ $t('cemeteryForm.cemeteryStatus') }}</h2>

      <div class="flex justify-between gap-4">
        <div class="flex justify-center items-center flex-1 h-12 rounded-lg bg-[#EEEEEE] text-center text-[#939393] font-semibold text-sm cursor-pointer" :class="{'!bg-[#224C4F] text-white': form.status === 'active'}" @click="form.status='active'">
          {{ $t('common.active') }}
        </div>
        <div class="flex justify-center items-center flex-1 h-12 rounded-lg bg-[#EEEEEE] text-center text-[#939393] font-semibold text-sm cursor-pointer" :class="{'!bg-[#224C4F] text-white': form.status === 'inactive'}" @click="form.status='inactive'">
          {{ $t('common.inactive') }}
        </div>
      </div>

    </div>

    <div class="bg-white p-5 rounded-2xl mb-4 flex gap-[10px] justify-end">
      <button class="btn btn-submit" @click="create">
        {{ $t('cemeteryForm.createButton') }}
      </button>
    </div>
    <Teleport to="body">
      <SuccessModal
          v-if="showSuccessModal"
          :show-button="true"
          :title="$t('cemeteryForm.createdTitle')"
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