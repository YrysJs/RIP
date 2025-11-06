<script setup>
import { CreateAkimat, getCities } from '~/services/admin'
import SuccessModal from "~/components/layout/modals/SuccessModal.vue";
import {ref, reactive} from "vue";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const showSuccessModal = ref(false)

definePageMeta({
  middleware: ['auth', 'admin'],
});

const cities = ref([])

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

// Функция для загрузки городов
async function loadCities() {
  try {
    const response = await getCities();
    const citiesData = response?.data?.data ?? response?.data ?? [];
    cities.value = Array.isArray(citiesData) ? citiesData : [];
  } catch (error) {
    console.error('Ошибка при загрузке городов:', error);
    cities.value = [];
  }
}

onMounted(async () => {
  await loadCities()
})

</script>

<template>
  <NuxtLayout name="form">
    <div class="flex items-center bg-white p-5 rounded-2xl mb-4">
      <button class="btn btn-back mr-4" @click="router.push('/admin/akimat')">
        <img class="w-4 h-4 mr-[10px]" src="/icons/arrow-left-primary.svg" alt="">
        {{ $t('common.back') }}
      </button>

      <h1 class="text-[32px] font-medium">{{ $t('akimatCreate.title') }}</h1>
    </div>


    <div class="bg-white p-5 rounded-2xl space-y-4 mb-4">
      <h2 class="text-lg font-medium">{{ $t('akimatCreate.akimatData') }}</h2>

      <div>
        <label class="block text-sm mb-1">{{ $t('common.name') }}</label>
        <input type="text" v-model="form.name" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">{{ $t('common.address') }}</label>
        <input type="text" v-model="form.address" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">{{ $t('common.phone') }}</label>
        <input type="tel" v-mask="'+7 (###) ###-##-##'" v-model="form.phone" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">{{ $t('common.city') }}</label>
        <select v-model="form.cityId" class="input select">
          <option v-for="city in cities" :key="city.id" :value="city.id">{{city.name}}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm mb-1">{{ $t('akimatCreate.mapLink') }}</label>
        <input type="text" v-model="form.mapUrl" class="input" />
      </div>

    </div>

    <div class="bg-white p-5 rounded-2xl space-y-4 mb-4">
      <h2 class="text-lg font-medium">{{ $t('akimatCreate.admin') }}</h2>

      <div>
        <label class="block text-sm mb-1">{{ $t('akimatCreate.iin') }}</label>
        <input 
          type="text" 
          v-model="form.admin.iin" 
          v-mask="'############'"
          maxlength="12"
          class="input" 
        />
      </div>

      <div>
        <label class="block text-sm mb-1">{{ $t('search.firstName') }}</label>
        <input type="text" v-model="form.admin.name" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">{{ $t('search.middleName') }}</label>
        <input type="text" v-model="form.admin.patronymic" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">{{ $t('search.lastName') }}</label>
        <input type="text" v-model="form.admin.surname" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">{{ $t('common.phone') }}</label>
        <input type="tel" v-mask="'+7 (###) ###-##-##'" v-model="form.admin.phone" class="input" />
      </div>

    </div>

    <div class="bg-white p-5 rounded-2xl mb-4 flex gap-[10px] justify-end">
      <button class="btn btn-submit" @click="create">
        {{ $t('akimatCreate.create') }}
      </button>
    </div>
    <Teleport to="body">
      <SuccessModal
          v-if="showSuccessModal"
          :show-button="true"
          :title="$t('akimatCreate.successTitle')"
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