<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { searchDeceased } from '~/services/client'
import SearchSuccessModal from "~/components/search/SearchSuccessModal.vue";

const router = useRouter();
const { t } = useI18n();
const showSuccessModal = ref(false)

const closeSuccessModal = () => {
  showSuccessModal.value = false
  router.push('/')
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

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toISOString(); // YYYY-MM-DD
};

function extractDigits(phone) {
  return phone.replace(/\D/g, '');
}

const onSubmit = async () => {
  await searchDeceased({
    deceased_name: form.targetFirstName,
    deceased_surname: form.targetLastName,
    deceased_patronym: form.targetMiddleName,
    birth_date: formatDate(form.birthDate),
    death_date: formatDate(form.deathDate),
    additional_info: form.extraInfo,
    applicant_email: form.email,
    applicant_phone: extractDigits(form.phone),
    applicant_name: form.fullName,
    request_type: 'add'
  });
  showSuccessModal.value = true
};

</script>

<template>
  <NuxtLayout name="form">
    <div class="flex items-center bg-white p-5 rounded-2xl mb-4">
      <button class="btn btn-back mr-4" @click="router.back()">
        <img class="w-4 h-4 mr-[10px]" src="/icons/arrow-left-primary.svg" alt="">
        {{ $t('common.back') }}
      </button>
      <h1 class="text-[32px] font-medium">{{ $t('search.pageTitle') }}</h1>
    </div>

    <div class="bg-white p-5 rounded-2xl space-y-4 mb-4">
      <h2 class="text-lg font-medium">
        {{ $t('search.yourData') }}
        <!--        <span class="text-red-500 text-sm">Поля обязательно к заполнению</span>-->
      </h2>

      <div>
        <label class="block text-sm mb-1">{{ $t('search.fullName') }}</label>
        <input type="text" v-model="form.fullName" class="input" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm mb-1">{{ $t('search.email') }}</label>
          <input type="email" v-model="form.email" class="input" />
        </div>
        <div>
          <label class="block text-sm mb-1">{{ $t('search.phone') }}</label>
          <input type="tel" v-mask="'+7 (###) ###-##-##'" v-model="form.phone" class="input" placeholder="+7" />
        </div>
      </div>
    </div>

    <div class="bg-white p-5 rounded-2xl space-y-4 mb-4">
      <h2 class="text-lg font-medium">{{ $t('search.targetData') }}</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm mb-1">{{ $t('search.lastName') }}</label>
          <input type="text" v-model="form.targetLastName" class="input" />
        </div>
        <div>
          <label class="block text-sm mb-1">{{ $t('search.firstName') }}</label>
          <input type="text" v-model="form.targetFirstName" class="input" />
        </div>
        <div>
          <label class="block text-sm mb-1">{{ $t('search.middleName') }}</label>
          <input type="text" v-model="form.targetMiddleName" class="input" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm mb-1">{{ $t('search.birthDate') }}</label>
          <input type="date" v-model="form.birthDate" class="input" />
        </div>
        <div>
          <label class="block text-sm mb-1">{{ $t('search.deathDate') }}</label>
          <input type="date" v-model="form.deathDate" class="input" />
        </div>
      </div>

      <div>
        <label class="block text-sm mb-1">{{ $t('search.additionalData') }}</label>
        <textarea v-model="form.extraInfo" class="input textarea" rows="4" />
      </div>
    </div>

    <div class="bg-white p-5 rounded-2xl mb-4 flex justify-end">
      <button class="btn btn-submit w-full " @click="onSubmit">{{ $t('search.submitRequest') }}</button>
    </div>
    <Teleport to="body">
      <SearchSuccessModal
          v-if="showSuccessModal"
          :title="$t('search.successTitle')"
          :text="$t('search.successText')"
          @close="closeSuccessModal"
      />
    </Teleport>
  </NuxtLayout>
</template>

<style scoped>
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
