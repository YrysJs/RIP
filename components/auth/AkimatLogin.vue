<script setup>
import { getOtp, checkOtp } from '~/services/login/index.js'
import Cookies from 'js-cookie';
const emit = defineEmits()
const router = useRouter()

const phone_number = ref('')
const loginId = ref('')
const code = ref('')
const step = ref(0)

function close() {
  emit('close')
}

const fakeTimer = ref(10)
let interval = null

function extractDigits(phone) {
  return phone.replace(/\D/g, '');
}

const login = async () => {
  try {
    const response =  await getOtp({phone: extractDigits(phone_number.value)})
    loginId.value = response.data
  } catch (error) {
    console.error('Ошибка при логине:', error)
  } finally {
    step.value++
    fakeTimer.value = 60

    if (interval) {
      clearInterval(interval)
    }

    interval = setInterval(() => {
      if (fakeTimer.value > 0) {
        fakeTimer.value -= 1
      } else {
        clearInterval(interval)
        interval = null
      }
    }, 1000)
  }
}

const otpCheck = async () => {
  try {
    const response = await checkOtp({
      id: loginId.value,
      code: code.value
    })
    Cookies.set('token', response.data.token);
    Cookies.set('role', 'user');
    router.push('/user/tickets')
  } catch (error) {
    console.error('Ошибка при логине:', error)
  } finally {
    console.log('login')

  }

}

</script>

<template>
  <div class="modal fixed min-w-full min-h-[100vh] flex justify-center items-center z-50">
    <div class="bg-white rounded-md max-w-[500px] w-full p-[24px] relative">
      <button class="absolute right-[24px] top-[24px]" @click="close">&#10005;</button>
      <div v-if="step == 0" class="flex flex-col">
        <h3 class="text-2xl font-bold font-roboto text-left text-[#222222] mb-[8px]">
          Вход в кабинет Акимата
        </h3>
        <p class="text-sm font-roboto">
          Введите  номер мобильного телефона - мы пришлем код
        </p>
        <input v-model="phone_number" v-mask="'+7 (###) ###-##-##'" class="border-2 border-[#939393] mt-[24px] pl-[16px] rounded-lg h-[60px]" type="text" placeholder="Введите номер телефона">
        <!-- <button class="bg-[#F7F7F7] h-[51px] rounded-lg text-[#222222] font-semibold font-roboto my-[21px]" :class="{ '!bg-[#38949B] text-white': phone_number.length >= 18 }" @click="step++">Получить код в WhatsApp </button> -->
        <button class="bg-[#F7F7F7] h-[51px] rounded-lg text-[#222222] font-semibold font-roboto my-[21px]" :class="{ '!bg-[#38949B] text-white': phone_number.length >= 18 }" @click="login">Получить код по СМС</button>
      </div>
      <div v-if="step == 1" class="flex flex-col">
        <h3 class="text-2xl font-bold font-roboto text-left text-[#222222] mb-[8px]">
          Подтвердите номер
        </h3>
        <p class="text-sm font-roboto">
          Введлите код из СМС. Мы отправили его на номер
          {{ phone_number }}
        </p>
        <input v-model="code" class="border-2 border-[#939393] mt-[24px] pl-[16px] rounded-lg h-[60px]" type="text" placeholder="Введите код">
        <div class="mt-[24px] mb-[18px]">
          <p v-if="true" class="text-base font-semibold font-roboto text-[#939393]">Отправить код повторно: через {{ fakeTimer }}</p>
          <button v-else>Отправить еще раз</button>
        </div>
        <button class="bg-[#F7F7F7] h-[51px] rounded-lg text-[#222222] font-semibold font-roboto" :class="{ '!bg-[#38949B] text-white': code >= 4 }" @click="otpCheck">Подтвердить</button>
      </div>
    </div>
  </div>
</template>

<style lang=scss scoped>
.modal {
  background: #0000005b;
  top: 0;
}
</style>