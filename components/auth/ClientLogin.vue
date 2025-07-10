<script setup>
import { getOtp, checkOtp, signupClient, getUserData, signupClientFcb, getPkbToken, getPkbRequest, pkbGetData } from '~/services/login/index.js'
import Cookies from 'js-cookie';
import AppLoader from "~/components/loader/AppLoader.vue";
import {useLoadingStore} from "~/store/loading.js";
const emit = defineEmits()
const router = useRouter()

const phone_number = ref('')
const loginId = ref('')
const code = ref('')
const iin = ref('')
const check = ref(false)
const step = ref(0)
const user = ref({})
const isFcb = ref(false)
const name = ref('')
const surname = ref('')
const patronymic = ref('')

const loadingStore = useLoadingStore()

function close() {
    emit('close')
}

watch(iin, async (newValue) => {
  if (newValue.length !== 12) return;

  let timeoutId; // чтобы можно было отменить повторы

  try {
    loadingStore.startLoading()
    const pkbToken = await getPkbToken();

    const poll = async () => {
      try {
        const res = await getPkbRequest({
          params: { iin: newValue },
          data: pkbToken.data.access.hash,
        });

        if (
            res?.data?.code === 'OK' &&
            res.data?.data?.status_code === 'VALID'
        ) {
          console.log('VALID получен, делаем pkbGetData');

          // вызываем pkbGetData
          const response = await pkbGetData({
            id: res.data.data.request_id,
            params: {
              iin: newValue,
              requestId: res.data.data.request_id,
            },
            data: pkbToken.data.access.hash,
          });
          isFcb.value = true
          name.value = capitalize(response.data.data.person_data.name)
          surname.value = capitalize(response.data.data.person_data.surname)
          patronymic.value = capitalize(response.data.data.person_data.patronymic)
          loadingStore.stopLoading()
          console.log('Ответ от pkbGetData:', response);

          // остановить дальнейшие попытки
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }

        } else {
          console.log('Ожидаем VALID, текущий статус:', res?.data?.data?.status_code);
          // запланировать следующий вызов через 10 секунд
          timeoutId = setTimeout(poll, 10000);
        }
      } catch (err) {
        console.error('Ошибка при запросе:', err);
        // запланировать повтор при ошибке
        timeoutId = setTimeout(poll, 10000);
      }
    };

    // запускаем первый вызов
    await poll();

  } catch (error) {
    console.error('Ошибка при получении токена:', error);
  }
});

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

async function run () {
  try {
    let response
    // if (isFcb.value) {
    //   response = await signupClientFcb({
    //     otpRequest: {
    //       id: loginId.value,
    //       code: code.value
    //     },
    //     iin: iin.value,
    //   })
    // }
    // else {
      response = await signupClient({
        otpRequest: {
          id: loginId.value,
          code: code.value
        },
        iin: iin.value,
        name: name.value,
        surname: surname.value,
        patronymic: patronymic.value,
      })
    // }
    Cookies.set('token', response.data.token);
    Cookies.set('role', 'client');
    await router.push('/client/tickets/active')
  } catch (error) {
    console.error('Ошибка при логине:', error)

    if (
        error?.response?.status === 500 &&
        error?.response?.data?.description?.includes('Role not found for phone')
    ) {
      step.value++;
    }
  } finally {
    console.log('login')

  }
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
  } catch (error) {
    console.error('Ошибка при логине:', error)
  }
}

const otpCheck = async () => {
  try {
    const response = await checkOtp({
      id: loginId.value,
      code: code.value
    })
    Cookies.set('token', response.data.token);
    Cookies.set('role', 'client');
    await router.push('/client/tickets/active')
  } catch (error) {
    console.error('Ошибка при логине:', error)

    if (
        error?.response?.status === 500 &&
        error?.response?.data?.description?.includes('Role not found for phone')
    ) {
      step.value++;
    }
  } finally {
    console.log('login')
    // router.push('/client/tickets/active')
  }

    // setTimeout(() => {
    //     step.value++
    // }, 5000);
}
// 041124551140
</script>

<template>
    <div class="modal fixed min-w-full min-h-[100vh] flex justify-center items-center z-50">
        <div class="bg-white rounded-md max-w-[500px] w-full p-[24px] relative">
            <button class="absolute right-[24px] top-[24px]" @click="close">&#10005;</button>
            <div v-if="step == 0" class="flex flex-col">
                <h3 class="text-2xl font-bold font-roboto text-left text-[#222222] mb-[8px]">
                    Войдите или зарегистрируйтесь
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
            <div v-if="step == 2" class="flex flex-col">
                <h3 class="text-2xl font-bold font-roboto text-left text-[#222222] mb-[8px]">
                    Регистрация нового пользователя
                </h3>
                <p class="text-sm font-roboto">
                    Для продолжение заполните обязательные данные
                </p>
                <div class="mt-[24px]">
                    <p class="text-sm font-roboto text-[#222222]">Телефон</p>
                    <input v-model="phone_number" class="w-full border-2 border-[#939393] pl-[16px] rounded-lg h-[60px]" type="text" placeholder="Введите код" disabled>
                </div>
                <div class="mt-[24px]">
                    <p class="text-sm font-roboto text-[#222222]">ИИН</p>
                    <input v-model="iin" class="w-full border-2 border-[#939393] pl-[16px] rounded-lg h-[60px]" type="text" placeholder="Введите ИИН">
                </div>
                <div class="mt-[24px]">
                    <p class="text-sm font-roboto text-[#222222]">Имя</p>
                    <input v-model="name" :disabled="isFcb" class="w-full border-2 border-[#939393] pl-[16px] rounded-lg h-[60px]" type="text" placeholder="Введите ФИО">
                </div>
              <div class="mt-[24px]">
                <p class="text-sm font-roboto text-[#222222]">Фамилия</p>
                <input v-model="surname" :disabled="isFcb" class="w-full border-2 border-[#939393] pl-[16px] rounded-lg h-[60px]" type="text" placeholder="Введите ФИО">
              </div>
              <div class="mt-[24px] mb-[24px]">
                <p class="text-sm font-roboto text-[#222222]">Отчество</p>
                <input v-model="patronymic" :disabled="isFcb" class="w-full border-2 border-[#939393] pl-[16px] rounded-lg h-[60px]" type="text" placeholder="Введите ФИО">
              </div>
                <div class="flex gap-[10px] items-center mb-[24px]">
                    <input v-model="check" type="checkbox"> 
                    <p class="font-roboto text-sm text-[#939393]">
                        Я согласен с правилами использования и политикой конфиденциальности
                    </p>
                </div>
                <button class="bg-[#F7F7F7] h-[51px] rounded-lg text-[#222222] font-semibold font-roboto" :class="{ '!bg-[#38949B] text-white': (iin.length && check) }" @click="run">Зарегистрироваться</button>
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