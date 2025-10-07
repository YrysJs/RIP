<script setup>
import {
  getOtp,
  checkOtp,
  getWhatsappOtp,
  checkWhatsappOtp,
  signupSupplier,
  setSupplierFiles,
  getPkbToken,
  getPkbRequest,
  pkbGetData
} from '~/services/login/index.js'
import Cookies from 'js-cookie';
import {ref, defineEmits, watch, onBeforeUnmount} from "vue";
import {useLoadingStore} from "~/store/loading.js";
const emit = defineEmits()
const router = useRouter()

const phone_number = ref('')
const loginId = ref('')
const cityId = ref(0)
const code = ref('')
const bin = ref('')
const check = ref(false)
const step = ref(0)
const name = ref('')
const surname = ref('')
const patronymic = ref('')
const serviceDescription = ('')
const achievementPhotos = ref([])
const vatTypeId = ref(0)
const isFcb = ref(false)
const isWhatsappLogin = ref(false)
const personDataTimeoutId = ref(null)

onBeforeUnmount(() => {
  if (interval) clearInterval(interval);
  if (personDataTimeoutId.value) clearTimeout(personDataTimeoutId.value);
});

function close() {
  emit('close')
}

const loadingStore = useLoadingStore()

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

watch(bin, async (newValue) => {
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
            (res.data?.data?.status_code === "VALID" || res.data?.data?.status_code === "PENDING")
        ) {
          console.log('VALID получен, делаем pkbGetData');

          // вызываем pkbGetData с ожиданием person_data
          const waitForPersonData = async () => {
            const maxAttempts = 30; // максимум 30 попыток (30 секунд)
            let attempts = 0;
            
            const checkData = async () => {
              try {
                const response = await pkbGetData({
                  id: res.data.data.request_id,
                  params: {
                    iin: newValue,
                    requestId: res.data.data.request_id,
                  },
                  data: pkbToken.data.access.hash,
                });
                
                // Проверяем наличие person_data
                if (response?.data?.data?.person_data) {
                  isFcb.value = true;
                  name.value = capitalize(response.data.data.person_data.name);
                  surname.value = capitalize(response.data.data.person_data.surname);
                  patronymic.value = capitalize(response.data.data.person_data.patronymic);
                  loadingStore.stopLoading();
                  return true; // данные получены
                }
                
                return false; // данные еще не готовы
              } catch (error) {
                console.error("Ошибка при получении person_data:", error);
                
                // Проверяем на ошибку таймаута ПКБ
                if (error.response?.data?.message === "Timeout") {
                  const { $toast } = useNuxtApp();
                  $toast.error("Сервис ПКБ не доступен");
                  loadingStore.stopLoading();
                  isFcb.value = true;
                  if (personDataTimeoutId.value) {
                    clearTimeout(personDataTimeoutId.value);
                    personDataTimeoutId.value = null;
                  }
                  return true; // прекращаем попытки
                }
                
                return false;
              }
            };
            
            const pollData = async () => {
              const dataReceived = await checkData();
              
              if (dataReceived) {
                if (personDataTimeoutId.value) {
                  clearTimeout(personDataTimeoutId.value);
                  personDataTimeoutId.value = null;
                }
                return; // данные получены, выходим
              }
              
              attempts++;
              if (attempts < maxAttempts) {
                // Ждем 5 секунд и повторяем попытку
                personDataTimeoutId.value = setTimeout(pollData, 10000);
              } else {
                console.log("Превышено максимальное количество попыток получения person_data");
                isFcb.value = true;
                loadingStore.stopLoading();
                if (personDataTimeoutId.value) {
                  clearTimeout(personDataTimeoutId.value);
                  personDataTimeoutId.value = null;
                }
              }
            };
            
            // Начинаем опрос
            await pollData();
          };
          
          await waitForPersonData();

          // остановить дальнейшие попытки
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }

        } else {
          console.log('Ожидаем VALID, текущий статус:', res?.data?.data?.status_code);
          loadingStore.stopLoading();
          isFcb.value = true;
        }
      } catch (err) {
        console.error('Ошибка при запросе:', err);
        loadingStore.stopLoading();
        isFcb.value = true;
      }
    };

    // запускаем первый вызов
    await poll();

  } catch (error) {
    loadingStore.stopLoading()
    console.error('Ошибка при получении токена:', error);
  }
});

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

async function run () {
  try {
    const formData = new FormData()
    let filerRes
    formData.append('Authorization', Cookies.get('token'))
    if (achievementPhotos.value.length) {
      if (Array.isArray(achievementPhotos.value)) {
        achievementPhotos.value.forEach(achievement => formData.append('files', achievement.file))
      } else {
        formData.append('files', achievementPhotos.value.file)
      }
      filerRes = await setSupplierFiles(formData)
    }

    const data = {
      otpRequest: {
        id: loginId.value,
        code: code.value
      },
      bin: bin.value,
      name: name.value,
      surname: surname.value,
      patronymic: patronymic.value,
      vatTypeId: vatTypeId.value,
      cityId: cityId.value,
      isActive: false,
      docs: ['1111'],
      serviceDescription: serviceDescription.value
    }
    if (filerRes?.data?.success) {
      data.docs = filerRes.data.files.map(file => file.fileUrl)
    }
    const response = await signupSupplier(data)

    Cookies.set('token', response.data.token);
    Cookies.set('role', 'supplier');
    await router.push('/supplier/tickets/active')
    emit('close');
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
    isWhatsappLogin.value = false
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

const loginWhatsapp = async () => {
  try {
    const response = await getWhatsappOtp({phone: extractDigits(phone_number.value)})
    loginId.value = response.data
    isWhatsappLogin.value = true
  } catch (error) {
    console.error('Ошибка при отправке WhatsApp кода:', error)
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

const handleAchievementPhotoUpload = (event) => {
  const files = Array.from(event.target.files)

  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      achievementPhotos.value.push({
        id: Date.now() + Math.random(),
        url: e.target.result,
        file: file
      })
    }
    reader.readAsDataURL(file)
  })
  event.target.value = ''
}

const removeAchievementPhoto = (index) => {
  achievementPhotos.value.splice(index, 1)
}

const otpCheck = async () => {
  try {
    let response
    if (isWhatsappLogin.value) {
      response = await checkWhatsappOtp({
        phone: extractDigits(phone_number.value),
        code: code.value
      })
    } else {
      response = await checkOtp({
        id: loginId.value,
        code: code.value
      })
    }
    Cookies.set('token', response.data.token);
    Cookies.set('role', 'supplier');
    emit('close');
    await router.push('/supplier/tickets/active')
  } catch (error) {
    if (
        error?.response?.status === 500 &&
        error?.response?.data?.description?.includes('Role not found for phone')
    ) {
      step.value = 2;
    }
    console.error('Ошибка при логине:', error)
  } finally {
    console.log('login')
  }

  // setTimeout(() => {
  //     step.value++
  // }, 5000);
}

</script>

<template>
  <div class="bg-white rounded-md max-w-[500px] w-full p-8 relative max-sm:mx-4 max-sm:pt-6 max-sm:px-4 max-sm:pb-12">
      <button class="absolute right-[32px] top-[32px] text-[22px] leading-5 font-semibold" @click="close">&#10005;</button>
      <div v-if="step === 0" class="flex flex-col">
        <h3 class="text-2xl font-extrabold text-left text-[#222222] mb-[32px] max-lg:text-[22px] max-lg:mb-6">
          Войти как поставщик услуг
        </h3>
        <p class="text-lg max-lg:text-base">
          Введите номер мобильного телефона:
        </p>
        <input v-model="phone_number" v-mask="'+7 (###) ###-##-##'" class="border-2 border-[#AFB5C166] mb-[32px] px-3 py-[18px] text-base rounded-lg h-14 max-lg:py-[14px] max-lg:mb-6" type="text" placeholder="Введите номер телефона">
        <button class="bg-[#AFB5C133] py-[18px] rounded-lg text-[#000] font-medium max-lg:py-[15px]" :class="{ '!bg-[#E9B949] text-white': phone_number.length >= 18 }" @click="loginWhatsapp">Получить код в WhatsApp</button>
        <button class="bg-[#AFB5C133] py-[18px] rounded-lg text-[#17212A] font-medium my-4 max-lg:py-[15px] max-lg:mt-2 max-lg:mb-4" :class="{ '!bg-[#E9B949] text-white': phone_number.length >= 18 }" @click="login">Получить код по СМС</button>
      </div>
      <div v-if="step === 1" class="flex flex-col">
        <h3 class="text-2xl font-bold text-left text-[#222222] mb-[8px]">
          Подтвердите номер
        </h3>
        <p class="text-sm">
          Введите код из {{ isWhatsappLogin ? 'WhatsApp' : 'СМС' }}. Мы отправили его на номер<br />
          {{ phone_number }}
        </p>
        <input v-model="code" class="border-2 border-[#939393] mt-[24px] pl-[16px] rounded-lg h-[60px]" type="text" placeholder="Введите код">
        <div class="mt-[24px] mb-[18px]">
          <p v-if="true" class="text-base font-semibold text-[#939393]">Отправить код повторно: через {{ fakeTimer }}</p>
          <button v-else>Отправить еще раз</button>
        </div>
        <button class="bg-[#F7F7F7] h-[51px] rounded-lg text-[#222222] font-semibold" :class="{ '!bg-[#38949B] text-white': code >= 4 }" @click="otpCheck">Подтвердить</button>
      </div>
      <div v-if="step === 2" class="flex flex-col  max-h-[800px] overflow-x-auto">
        <h3 class="text-2xl font-extrabold text-left text-[#222222] mb-[32px] max-lg:text-[22px] max-lg:mb-4">
          Регистрация поставщика услуг
        </h3>
        <div class="flex flex-col gap-[10px] max-lg:gap-2">
          <p class="text-lg max-lg:text-base">
            Для продолжения заполните обязательные данные:
          </p>
          <input
            v-model="phone_number"
            class="w-full border-2 border-[#AFB5C133] bg-[#AFB5C133] px-3 py-[18px] rounded-lg max-lg:py-[14px]"
            type="text"
            placeholder="Номер телефона"
            disabled
          />
          <input
            v-model="bin"
            v-mask="'############'"
            class="w-full border-2 border-[#AFB5C133] px-3 py-[18px] rounded-lg max-lg:py-[14px]"
            type="text"
            placeholder="БИН"
            maxlength="12"
          />
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
        <div class="mt-[24px]">
          <p class="text-sm font-roboto text-[#222222]">Тип НДС</p>
          <select v-model="vatTypeId" class="input select">
            <option :value="1">С НДС</option>
            <option :value="2">Без НДС</option>
          </select>
        </div>
        <div class="mt-[24px]">
          <p class="text-sm font-roboto text-[#222222]">Город оказания услуг</p>
          <select v-model="cityId" class="input select">
            <option v-for="(city, index) in cities" :key="city" :value="index + 1">{{city}}</option>
          </select>
        </div>
        <div class="mt-[24px]">
          <p class="text-sm font-roboto text-[#222222]">Краткое описание услуг</p>
          <textarea v-model="patronymic" class="w-full border-2 border-[#939393] py-[12px] pl-[16px] rounded-lg h-[120px]" type="text" placeholder="Краткое описание услуг" />
        </div>
        <div class="mt-[24px] mb-[24px]">
          <h3 class="text-[18px] font-medium mb-1">
            Прикрепить сертификат
          </h3>

          <!-- Кнопка загрузки фото -->
          <button
              @click="$refs.achievementFileInput.click()"
              class="bg-[#EEEEEE] w-[120px] h-[28px] font-semibold text-[#224C4F] rounded-lg hover:bg-[#DDD] transition-colors mb-4"
          >
            Добавить
          </button>

          <!-- Скрытый input для файлов -->
          <input
              ref="achievementFileInput"
              type="file"
              multiple
              @change="handleAchievementPhotoUpload"
              class="hidden"
          >
          <!-- Галерея фото достижений -->
          <div v-if="achievementPhotos.length > 0" class="achievement-photos-gallery">

            <div class="gallery-grid">
              <div
                  v-for="(photo, index) in achievementPhotos"
                  :key="photo.id"
                  class="image-preview-container"
              >
                <img src="/images/doc.png" alt="Achievement photo" class="image-preview">
                <div class="image-overlay">
                  <button
                      @click="removeAchievementPhoto(index)"
                      class="remove-btn"
                  >
                    ✕
                  </button>
                </div>
                <div class="image-number">{{ index + 1 }}</div>
              </div>
            </div>
          </div>
        </div>
          <div class="flex gap-[10px] items-start mb-[32px]">
            <input class="w-6 h-6" v-model="check" type="checkbox" />
            <p class="text-sm text-[#5C6771E6]">
              Я согласен с&nbsp;правилами использования и&nbsp;политикой
              конфиденциальности
            </p>
          </div>
        </div>
        <button
            type="button"
            class="py-[18px] bg-[#E9B949] rounded-lg text-base text-[#000] font-medium mb-4 flex justify-center"
            :disabled="!bin.length || !check"
            @click="run"
        >
          Зарегистрироваться
        </button>
      </div>
  </div>
</template>

<style lang=scss scoped>
.modal {
  background: #0000005b;
  top: 0;
}


.achievement-photos-gallery {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.gallery-grid {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.image-preview-container {
  width: 120px;
  height: 120px;
  position: relative;

  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #E5E7EB;
}

.image-preview {
  width: 120px;
  height: 100%;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;

  .image-preview-container:hover & {
    opacity: 1;
  }
}

.image-number {
  position: absolute;
  top: 4px;
  left: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  min-width: 20px;
  text-align: center;
}

.change-btn {
  background-color: #6366F1;
  color: white;

  &:hover {
    background-color: #5B5BF7;
  }
}

.remove-btn {
  background-color: #EF4444;
  color: white;
  font-size: 18px;
  padding: 4px 8px;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #DC2626;
  }
}

</style>