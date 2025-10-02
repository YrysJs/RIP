<script setup>
import { signupGov } from '~/services/login/index.js'

const emit = defineEmits(['close', 'finish'])

const phone_number = ref('')
const iin = ref('')
const name = ref('')
const surname = ref('')
const patronymic = ref('')

function close() {
  emit('close')
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
          Приглашение на регистрацию
        </h3>
        <div class="flex flex-col gap-[10px] max-lg:gap-2">
          <p class="text-lg max-lg:text-base">
            Укажите данные менеджера кладбища:
          </p>
          <input
            v-model="name"
            class="w-full border-2 border-[#AFB5C133] px-3 py-[18px] rounded-lg max-lg:py-[14px]"
            type="text"
            placeholder="Имя"
          />
          <input
            v-model="surname"
            class="w-full border-2 border-[#AFB5C133] px-3 py-[18px] rounded-lg max-lg:py-[14px]"
            type="text"
            placeholder="Фамилия"
          />
          <input
            v-model="patronymic"
            class="w-full border-2 border-[#AFB5C133] px-3 py-[18px] rounded-lg max-lg:py-[14px]"
            type="text"
            placeholder="Отчество"
          />
          <input
            v-model="iin"
            class="w-full border-2 border-[#AFB5C133] px-3 py-[18px] rounded-lg max-lg:py-[14px]"
            type="text"
            placeholder="ИИН"
          />
          <input
            v-model="phone_number"
            v-mask="'+7 (###) ###-##-##'"
            class="w-full border-2 border-[#AFB5C133] px-3 py-[18px] rounded-lg max-lg:py-[14px] mb-[32px]"
            type="text"
            placeholder="Номер телефона"
          />
        </div>
        <button
          type="button"
          class="py-[18px] bg-[#E9B949] rounded-lg text-base text-[#000] font-medium mb-4 flex justify-center"
          :disabled="!iin.length || !name.length || !surname.length || !phone_number.length"
          @click="run"
        >
          Отправить
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