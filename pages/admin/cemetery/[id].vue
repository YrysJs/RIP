<script setup>

import FormMap from "~/components/map/FormMap.vue";
import { UpdateCemetery } from '~/services/admin'
import SuccessModal from "~/components/layout/modals/SuccessModal.vue";
import {ref, reactive} from "vue";
import { useI18n } from 'vue-i18n';
import {getCemeteryById} from "~/services/cemetery";

const { t } = useI18n();
const showSuccessModal = ref(false)
const route = useRoute()

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
    const res = await UpdateCemetery({
      id: route.params.id,
      input: formData
    })
  }
  catch (err) {
    console.log(err)
  }
}
function removeLastElement(arr) {
  if (arr.length) return arr.slice(0, -1);
  else return []
}

onMounted(async () => {
  try {
    const response = await getCemeteryById(route.params.id)
    form.status = response.data.status
    // Используем локализованные поля если доступны, иначе обычные
    form.description = response.data.description_kz || response.data.description
    form.street_name = response.data.street_name
    form.religion = response.data.religion
    form.phone = response.data.phone
    form.name = response.data.name_kz || response.data.name
    form.city = response.data.city
    form.country = response.data.country
    form.polygon_data = response.data.polygon_data
    form.location_coords = response.data.location_coords
    form.capacity = response.data.capacity
    form.burial_price = response.data.burial_price || 0
  } catch (error) {
    console.error(t('cemeteryForm.fetchError'), error)
  } finally {
    console.log('finally')
  }
})

</script>

<template>
  <NuxtLayout name="form">
    <div class="flex items-center bg-white p-5 rounded-2xl mb-4">
      <button class="btn btn-back mr-4" @click="router.push('/admin/cemetery')">
        <img class="w-4 h-4 mr-[10px]" src="/icons/arrow-left-primary.svg" alt="">
        {{ $t('common.back') }}
      </button>

      <h1 class="text-[32px] font-medium">{{ $t('cemeteryForm.editCemetery') }}</h1>
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

    <FormMap :initial-polygon="removeLastElement(form.polygon_data.coordinates)" @complete="finishDraw" />

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
        {{ $t('common.save') }}
      </button>
    </div>
    <Teleport to="body">
      <SuccessModal
          v-if="showSuccessModal"
          :show-button="true"
          :title="$t('cemeteryForm.updatedTitle')"
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