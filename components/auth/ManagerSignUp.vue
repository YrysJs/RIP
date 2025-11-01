<script setup>
import { signupGov } from '~/services/login/index.js'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const emit = defineEmits(['close', 'finish'])

const phone_number = ref('')
const iin = ref('')
const name = ref('')
const surname = ref('')
const patronymic = ref('')

function close() {
  emit('close')
}

function handleIinInput(event) {
  // Удаляем все символы кроме цифр
  const value = event.target.value.replace(/\D/g, '')
  // Ограничиваем до 12 символов
  iin.value = value.slice(0, 12)
}

async function run () {
  try {
    await signupGov({
      data: {
        phone: extractDigits(phone_number.value),
        iin: iin.value,
        name: name.value,
        surname: surname.value,
        patronymic: patronymic.value,
      },
      params: {
        roleId: 5
      }
    })
    emit('finish')
  } catch (error) {
    console.error('Ошибка при логине:', error)
    
    const { $toast } = useNuxtApp();
    $toast.error(t('errors.registrationError') || "Произошла ошибка при регистрации");

  } finally {
    console.log('login')

  }
}

function extractDigits(phone) {
  return phone.replace(/\D/g, '');
}


</script>

<template>
  <div class="modal fixed inset-0 min-w-full min-h-[100vh] flex justify-center items-center z-50">
    <div class="bg-white rounded-md max-w-[500px] w-full p-8 relative max-sm:mx-4 max-sm:pt-6 max-sm:px-4 max-sm:pb-12">
      <button class="absolute right-[32px] top-[32px] text-[22px] leading-5 font-semibold" @click="close">&#10005;</button>
      <div class="flex flex-col">
        <h3 class="text-2xl font-extrabold text-left text-[#222222] mb-[32px] max-lg:text-[22px] max-lg:mb-4">
          {{ $t('managerSignUp.title') }}
        </h3>
        <div class="flex flex-col gap-[10px] max-lg:gap-2">
          <p class="text-lg max-lg:text-base">
            {{ $t('managerSignUp.specifyManagerData') }}
          </p>
          <input
            v-model="name"
            class="w-full border-2 border-[#AFB5C133] px-3 py-[18px] rounded-lg max-lg:py-[14px]"
            type="text"
            :placeholder="$t('managerSignUp.namePlaceholder')"
          />
          <input
            v-model="surname"
            class="w-full border-2 border-[#AFB5C133] px-3 py-[18px] rounded-lg max-lg:py-[14px]"
            type="text"
            :placeholder="$t('managerSignUp.surnamePlaceholder')"
          />
          <input
            v-model="patronymic"
            class="w-full border-2 border-[#AFB5C133] px-3 py-[18px] rounded-lg max-lg:py-[14px]"
            type="text"
            :placeholder="$t('managerSignUp.patronymicPlaceholder')"
          />
          <input
            v-model="iin"
            class="w-full border-2 border-[#AFB5C133] px-3 py-[18px] rounded-lg max-lg:py-[14px]"
            type="text"
            :placeholder="$t('managerSignUp.iinPlaceholder')"
            maxlength="12"
            pattern="[0-9]*"
            inputmode="numeric"
            @input="handleIinInput"
          />
          <input
            v-model="phone_number"
            v-mask="'+7 (###) ###-##-##'"
            class="w-full border-2 border-[#AFB5C133] px-3 py-[18px] rounded-lg max-lg:py-[14px] mb-[32px]"
            type="text"
            :placeholder="$t('managerSignUp.phonePlaceholder')"
          />
        </div>
        <button
          type="button"
          class="py-[18px] bg-[#E9B949] rounded-lg text-base text-[#000] font-medium mb-4 flex justify-center"
          :disabled="!iin.length || !name.length || !surname.length || !phone_number.length"
          @click="run"
        >
          {{ $t('managerSignUp.send') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang=scss scoped>
.modal {
  top: 0;
  background: #0000005b;
}
</style>