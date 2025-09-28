<script setup>
import {
  getOtp,
  checkOtp,
  getWhatsappOtp,
  checkWhatsappOtp,
  signupClient,
  getUserData,
  signupClientFcb,
  getPkbToken,
  getPkbRequest,
  pkbGetData,
} from "~/services/login/index.js";
import Cookies from "js-cookie";
import AppLoader from "~/components/loader/AppLoader.vue";
import { useLoadingStore } from "~/store/loading.js";
import { NuxtLink } from "#components";
import { ref, watch, onBeforeUnmount } from "vue";
const emit = defineEmits();
const router = useRouter();

const phone_number = ref("");
const loginId = ref("");
const code = ref("");
const iin = ref("");
const check = ref(false);
const step = ref(0);
const user = ref({});
const isFcb = ref(false);
const name = ref("");
const surname = ref("");
const patronymic = ref("");
const fio = ref("");
const isWhatsappLogin = ref(false);

const loadingStore = useLoadingStore();

const currentModal = ref("form");
const showOverlay = ref(true); // фон-оверлей со спиннером (по желанию)
const processing = ref(false); // состояние загрузки в оверлее
const overlayMessage = ref(""); // текст в оверлее
const isSubmitting = ref(false);
let pollTimeoutId = null;
let fakeTimeoutId1 = null;
let fakeTimeoutId2 = null;

onBeforeUnmount(() => {
  if (interval) clearInterval(interval);
  if (pollTimeoutId) clearTimeout(pollTimeoutId);
  if (fakeTimeoutId1) clearTimeout(fakeTimeoutId1);
  if (fakeTimeoutId2) clearTimeout(fakeTimeoutId2);
});

function close() {
  emit("close");
}

// watch(iin, (val) => {
//   if (val.length !== 12) return;
//
//   processing.value = true;
//   overlayMessage.value =
//     "Вам придет смс от 1414, подтвердите согласие на передачу данных!";
//
//   // ⚠️ Оставляем только ОДИН фейковый поток
//   fakeTimeoutId1 = setTimeout(() => {
//     overlayMessage.value = "Нашли данные. Заполняем…";
//     fakeTimeoutId2 = setTimeout(() => {
//       fio.value = "Иван Иванов Иванович";
//       phone_number.value = "+7 (777) 610-98-28";
//       processing.value = false;
//       currentModal.value = "form"; // модалка с формой на месте
//     }, 1500);
//   }, 2000);
// });

watch(iin, async (newValue) => {
  if (newValue.length !== 12) return;

  let timeoutId; // чтобы можно было отменить повторы

  try {
    loadingStore.startLoading();
    const pkbToken = await getPkbToken();

    const poll = async () => {
      try {
        const res = await getPkbRequest({
          params: { iin: newValue },
          data: pkbToken.data.access.hash,
        });

        if (
          res?.data?.code === "OK" &&
          res.data?.data?.status_code === "VALID"
        ) {
          console.log("VALID получен, делаем pkbGetData");

          // вызываем pkbGetData
          const response = await pkbGetData({
            id: res.data.data.request_id,
            params: {
              iin: newValue,
              requestId: res.data.data.request_id,
            },
            data: pkbToken.data.access.hash,
          });
          isFcb.value = true;
          name.value = capitalize(response.data.data.person_data.name);
          surname.value = capitalize(response.data.data.person_data.surname);
          patronymic.value = capitalize(
            response.data.data.person_data.patronymic
          );
          loadingStore.stopLoading();
          console.log("Ответ от pkbGetData:", response);

          // остановить дальнейшие попытки
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
        } else {
          console.log(
            "Ожидаем VALID, текущий статус:",
            res?.data?.data?.status_code
          );
          // запланировать следующий вызов через 10 секунд
          timeoutId = setTimeout(poll, 10000);
        }
      } catch (err) {
        console.error("Ошибка при запросе:", err);
        // запланировать повтор при ошибке
        timeoutId = setTimeout(poll, 10000);
      }
    };

    // запускаем первый вызов
    await poll();
  } catch (error) {
    loadingStore.stopLoading();
    console.error("Ошибка при получении токена:", error);
  }
});

// function capitalize(str) {
//   if (!str) return "";
//   return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
// }

async function run() {
  try {
    let response;
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
        code: code.value,
      },
      iin: iin.value,
      name: name.value,
      surname: surname.value,
      patronymic: patronymic.value,
    });
    // }
    Cookies.set("token", response.data.token);
    Cookies.set("role", "client");
    await router.push("/client/profile");
  } catch (error) {
    console.error("Ошибка при логине:", error);

    if (
      error?.response?.status === 500 &&
      error?.response?.data?.description?.includes("Role not found for phone")
    ) {
      step.value++;
    }
  } finally {
    console.log("login");
  }
}

// async function run() {
//   console.log("[run] click");
//   if (isSubmitting.value) return;
//
//   try {
//     isSubmitting.value = true;
//     console.log("[run] submitting...");
//
//     // ⛳️ ФЕЙК вместо signupClient — просто подождём
//     await new Promise((r) => setTimeout(r, 1200));
//
//     // важно: снимаем оверлей, переключаем модалку
//     processing.value = false;
//     currentModal.value = "success";
//     console.log("[run] switched to", currentModal.value);
//   } catch (e) {
//     console.error("[run] error", e);
//   } finally {
//     isSubmitting.value = false;
//   }
// }

function goToTickets() {
  router.push("/client/profile");
}

function buildFio(surname, name, patronymic) {
  return [surname, name, patronymic]
    .filter(Boolean)
    .map(toTitleCase)
    .join(" ")
    .trim();
}

function toTitleCase(s = "") {
  return s.toLowerCase().replace(/(^|\s|-)\S/g, (m) => m.toUpperCase());
}

const fakeTimer = ref(10);
let interval = null;

function extractDigits(phone) {
  return phone.replace(/\D/g, "");
}

const login = async () => {
  try {
    const response = await getOtp({ phone: extractDigits(phone_number.value) });
    loginId.value = response.data;
    isWhatsappLogin.value = false;
    step.value++;
    fakeTimer.value = 60;

    if (interval) {
      clearInterval(interval);
    }

    interval = setInterval(() => {
      if (fakeTimer.value > 0) {
        fakeTimer.value -= 1;
      } else {
        clearInterval(interval);
        interval = null;
      }
    }, 1000);
  } catch (error) {
    console.error("Ошибка при логине:", error);
  }
};

const loginWhatsapp = async () => {
  try {
    const response = await getWhatsappOtp({ phone: extractDigits(phone_number.value) });
    loginId.value = response.data;
    isWhatsappLogin.value = true;
    step.value++;
    fakeTimer.value = 60;

    if (interval) {
      clearInterval(interval);
    }

    interval = setInterval(() => {
      if (fakeTimer.value > 0) {
        fakeTimer.value -= 1;
      } else {
        clearInterval(interval);
        interval = null;
      }
    }, 1000);
  } catch (error) {
    console.error("Ошибка при отправке WhatsApp кода:", error);
  }
};

const otpCheck = async () => {
  try {
    let response;
    if (isWhatsappLogin.value) {
      response = await checkWhatsappOtp({
        phone: extractDigits(phone_number.value),
        code: code.value,
      });
    } else {
      response = await checkOtp({
        id: loginId.value,
        code: code.value,
      });
    }
    
    Cookies.set("token", response.data.token);
    Cookies.set("role", "client");
    await router.push("/client/profile");
  } catch (error) {
    console.error("Ошибка при логине:", error);

    if (
      error?.response?.status === 500 &&
      error?.response?.data?.description?.includes("Role not found for phone")
    ) {
      step.value++;
    }
  } finally {
    console.log("login");
    // router.push('/client/profile')
  }

  // setTimeout(() => {
  //     step.value++
  // }, 5000);
};
// 041124551140
</script>

<template>
  <div
    v-if="showOverlay"
    class="modal fixed inset-0 min-w-full min-h-[100vh] flex justify-center items-center z-50"
  >
    <transition name="fade">
      <div
        v-if="processing"
        class="overlay-msg absolute inset-0 flex items-center justify-center"
        aria-live="polite"
      >
        <div class="msg-box flex flex-col items-center gap-4">
          <div class="dots flex gap-2">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
          <p>{{ overlayMessage }}</p>
        </div>
      </div>
    </transition>
    <transition name="scale" mode="out-in">
      <div
        v-if="!processing"
        :key="currentModal"
        class="bg-white rounded-md max-w-[500px] w-full p-8 relative max-sm:mx-4 max-sm:pt-6 max-sm:px-4 max-sm:pb-12"
        role="dialog"
        aria-modal="true"
      >
        <template v-if="currentModal === 'form'">
          <button
            class="absolute right-[32px] top-[32px] text-[22px] leading-5 font-semibold"
            @click="close"
          >
            &#10005;
          </button>
          <div v-if="step == 0" class="flex flex-col">
            <h3
              class="text-2xl font-extrabold text-left text-[#222222] mb-[32px] max-lg:text-[22px] max-lg:mb-6"
            >
              Вход в личный кабинет
            </h3>
            <p class="text-lg max-lg:text-base">
              Введите номер мобильного телефона:
            </p>
            <input
              v-model="phone_number"
              v-mask="'+7 (###) ###-##-##'"
              class="border-2 border-[#AFB5C166] mb-[32px] px-3 py-[18px] text-base rounded-lg h-14 max-lg:py-[14px] max-lg:mb-6"
              type="text"
              placeholder="Введите номер телефона"
            />
            <button
              class="bg-[#AFB5C133] py-[18px] rounded-lg text-[#000] font-medium max-lg:py-[15px]"
              :class="{ '!bg-[#E9B949] text-white': phone_number.length >= 18 }"
              @click="loginWhatsapp"
            >
              Получить код в WhatsApp
            </button>
            <button
              class="bg-[#AFB5C133] py-[18px] rounded-lg text-[#17212A] font-medium my-4 max-lg:py-[15px] max-lg:mt-2 max-lg:mb-4"
              :class="{ '!bg-[#E9B949] text-white': phone_number.length >= 18 }"
              @click="login"
            >
              Получить код по СМС
            </button>
            <p class="text-[#7D7D7D] text-base max-lg:text-[15px]">
              Еще нет аккаунта ?
              <NuxtLink
                to=""
                class="text-black font-semibold"
                @click.prevent="step = 2"
                >Зарегистрироваться</NuxtLink
              >
            </p>
          </div>
          <div v-if="step == 1" class="flex flex-col">
            <h3 class="text-2xl font-bold text-left text-[#222222] mb-[8px]">
              Подтвердите номер
            </h3>
            <p class="text-sm">
              Введите код из {{ isWhatsappLogin ? 'WhatsApp' : 'СМС' }}. Мы отправили его на номер
              {{ phone_number }}
            </p>
            <input
              v-model="code"
              class="border-2 border-[#939393] mt-[24px] pl-[16px] rounded-lg h-[60px]"
              type="text"
              placeholder="Введите код"
            />
            <div class="mt-[24px] mb-[18px]">
              <p v-if="true" class="text-base font-semibold text-[#939393]">
                Отправить код повторно: через {{ fakeTimer }}
              </p>
              <button v-else>Отправить еще раз</button>
            </div>
            <button
              class="bg-[#F7F7F7] h-[51px] rounded-lg text-[#222222] font-semibold"
              :class="{ '!bg-[#38949B] text-white': code >= 4 }"
              @click="otpCheck"
            >
              Подтвердить
            </button>
          </div>

          <div v-if="step == 2" class="flex flex-col">
            <h3
              class="text-2xl font-extrabold text-left text-[#222222] mb-[32px] max-lg:text-[22px] max-lg:mb-4"
            >
              Регистрация
            </h3>
            <div class="flex flex-col gap-[10px] max-lg:gap-2">
              <p class="text-lg max-lg:text-base">
                Введите номер мобильного телефона:
              </p>
              <div
                class="relative w-full border-2 border-[#AFB5C133] rounded-lg"
              >
                <input
                  v-model="iin"
                  id="iin"
                  type="text"
                  placeholder=" "
                  class="peer w-full px-3 pt-[28px] pb-2 placeholder-transparent opacity-0 focus:outline-none focus:opacity-100"
                />
                <label
                  for="iin"
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-[#AFB5C1] text-base transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#AFB5C1] peer-focus:top-[15px] peer-focus:text-sm peer-focus:text-[#5C6771E6]"
                >
                  ИИН
                </label>
              </div>
              <input
                v-model="phone_number"
                class="w-full border-2 border-[#AFB5C133] bg-[#AFB5C133] px-3 py-[18px] rounded-lg max-lg:py-[14px]"
                type="text"
                placeholder="Номер телефона"
                disabled
              />
              <input
                v-model="fio"
                :disabled="isFcb"
                class="w-full border-2 border-[#AFB5C133] bg-[#AFB5C133] px-3 py-[18px] rounded-lg max-lg:py-[14px]"
                type="text"
                placeholder="ФИО"
              />
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
              :disabled="isSubmitting"
              @click="run"
            >
              <template v-if="!isSubmitting"> Зарегистрироваться </template>
              <template v-else>
                <div class="dots flex gap-2">
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </div>
              </template>
            </button>
            <p class="text-base text-[#7D7D7D] max-lg:text-[15px]">
              Уже есть аккаунт ?
              <span class="font-semibols text-black">Войти</span>
            </p>
          </div>
        </template>
        <template v-else>
          <div class="text-center">
            <img
              class="mx-auto mb-8 max-sm:h-12 max-sm:w-12 max-sm:mb-6"
              src="/icons/success-modal.svg"
              alt=""
            />
            <h3
              class="text-xl font-medium text-[#1A1C1F] mb-4 max-sm:text-xl max-sm:font-bold max-sm:mb-2"
            >
              Запрос отправлен
            </h3>
            <p class="text-base text-[#17212A] mb-6 max-sm:mb-4">
              Ожидайте подтверждения ...
            </p>
            <p class="text-sm text-[#939393] mb-[13px] max-sm:mb-2">
              Перенаправление в личный кабинет через 3
            </p>
            <button
              class="w-full bg-[#E9B949] py-[15px] rounded-lg text-[#000] font-medium max-lg:py-[15px]"
              @click="goToTickets"
            >
              Продолжить
            </button>
          </div>
        </template>
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.modal {
  background: #0000005b; /* оверлей всегда активен */
}

.msg-box {
  max-width: 459px;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  text-align: center;

  @media (max-width: 540px) {
    max-width: 344px;
  }
}

.dots {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.dot {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #bbb;
  animation: stretch 1.2s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}
.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes stretch {
  0%,
  80%,
  100% {
    transform: scaleY(1);
    background: #bbb;
  }
  40% {
    transform: scaleY(1.7);
    background: #fff;
  }
}

/* простые анимации */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: transform 0.18s ease, opacity 0.18s ease;
}
.scale-enter-from,
.scale-leave-to {
  transform: scale(0.98);
  opacity: 0;
}
</style>
