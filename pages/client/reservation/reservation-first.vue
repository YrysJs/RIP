<script setup>
import { ref, watch, reactive, onMounted } from "vue";
import { createDeceased, createBurialRequest, uploadDeceasedDeathCertificate } from "~/services/client";
import { useRouter } from "vue-router";
import { useCemeteryStore } from "~/store/cemetery";
import { pkbGetDeceasedData } from "~/services/login/index.js";
import { useLoadingStore } from "~/store/loading.js";
import { useAuthModalStore } from "~/store/authModal.js";
import ClientLogin from "~/components/auth/ClientLogin.vue";
import SuccessModal from "~/components/layout/modals/SuccessModal.vue";
import AppHeader from "~/components/layout/AppHeader.vue";
import Cookies from "js-cookie";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const router = useRouter();
const cemeteryStore = useCemeteryStore();
const authModalStore = useAuthModalStore();
const selectedFiles = ref([]);
const deathCertificateFile = ref(null);

const showSuccessModal = ref(false);
const time = ref(3);
let timerId;

const switcher = ref(false);
const inn = ref("");
const fullName = ref("");
const deathDate = ref("");
const burialDate = ref("");
const burialTime = ref("");
const isFcb = ref(false);

const loadingStore = useLoadingStore();

const showLogin = ref(false);
const errors = reactive({
  inn: "",
  fullName: "",
});

watch(inn, async (newValue) => {
  if (newValue.length !== 12) return;

  try {
    loadingStore.startLoading();
    const response = await pkbGetDeceasedData({
      iin: newValue,
    });
    
    // Проверяем успешность запроса
    if (response.data.code === "FDTH_COMPLETED" && response.data.data.resultCode === "0") {
      const personData = response.data.data.actRecords.record[0].person;
      
      // Формируем ФИО из отдельных полей
      const fullNameParts = [
        personData.surname,
        personData.name,
        personData.secondname
      ].filter(Boolean); // убираем пустые значения
      
      isFcb.value = true;
      fullName.value = capitalizeFullName(fullNameParts.join(' '));
      
      // Заполняем дату смерти
      if (personData.deathDate) {
        deathDate.value = personData.deathDate;
      }
    }
    
    loadingStore.stopLoading();
  } catch (err) {
    console.error(t('errors.fetchError'), err);
    const { $toast } = useNuxtApp()
    $toast.error(t('errors.fetchDeceasedData'))
    loadingStore.stopLoading();
  }
});

const closeSuccessModal = () => {
  showSuccessModal.value = false;
};

function capitalizeFullName(str) {
  return str
    .toLowerCase() // всё в нижний регистр
    .split(" ") // разбиваем на слова
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // капиталайз каждого слова
    .join(" "); // склеиваем обратно
}

// Функция для бронирования
const handleBooking = async () => {
  if (!validateRequired()) return;

  // Проверяем наличие токена в куки
  const token = Cookies.get('token');
  if (!token) {
    // Если токена нет, открываем модалку авторизации
    authModalStore.toggleLoginMenu();
    return;
  }

  try {
    // Сначала создаем усопшего

    // Загружаем файл свидетельства о смерти, если он есть
    let deathCertUrl = "";
    if (deathCertificateFile.value) {
      try {
        const fileResponse = await uploadDeceasedDeathCertificate(
            121121,
          deathCertificateFile.value
        );
        deathCertUrl = fileResponse?.data?.files?.[0]?.fileUrl || "";
      } catch (fileError) {
        console.error("Ошибка при загрузке файла:", fileError);
        const { $toast } = useNuxtApp()
        
        // Извлекаем сообщение об ошибке из ответа бэкенда
        let errorMessage = t('errors.uploadDeathCertificateError');
        
        if (fileError.response?.data) {
          errorMessage = fileError.response.data.message || fileError.response.data.error || errorMessage;
        } else if (fileError.message) {
          errorMessage = fileError.message;
        }
        
        $toast.error(errorMessage)
      }
    }

    // Создаем запрос на захоронение с дополнительными полями
    const dataBurial = {
      cemetery_id: cemeteryStore.selectedGrave.cemetery_id,
      full_name: fullName.value,
      inn: inn.value,
      death_date: deathDate.value ? deathDate.value + "T00:00:00Z" : undefined,
      grave_id: cemeteryStore.selectedGrave.id,
      burial_date: burialDate.value ? burialDate.value + "T00:00:00Z" : undefined,
      burial_time: burialTime.value || undefined,
      death_cert_url: deathCertUrl,
    };

    // Добавляем поля для соседней могилы, если она выбрана
    if (cemeteryStore.neighborGrave) {
      dataBurial.adjacent_graves_count = 2;
      dataBurial.reservation_type = "adjacent";
      dataBurial.adjacent_grave_ids = [cemeteryStore.neighborGrave.id];
    }

    await createBurialRequest(dataBurial);
    // showLogin.value = true;
    showSuccessModal.value = true;
    timerId = setInterval(() => {
      time.value--;
      if (time.value <= 0) {
        clearInterval(timerId);
        router.push("/client/tickets/burial");
      }
    }, 1000);
  } catch (error) {
    console.error("Ошибка при отправке данных:", error);
    const { $toast } = useNuxtApp()
    
    // Извлекаем сообщение об ошибке из ответа бэкенда
    let errorMessage = t('errors.serverUnavailable');
    
    if (error.response?.data) {
      // Приоритет отдаем полю message, если его нет - используем error
      errorMessage = error.response.data.message || error.response.data.error || errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    $toast.error(errorMessage)
  }
};

onMounted(() => {
  if (!cemeteryStore.selectedGrave) {
    router.push("/");
  }
});

function validateRequired() {
  errors.inn = inn.value.trim() ? "" : t('errors.requiredField');
  errors.fullName = fullName.value.trim()
    ? ""
    : t('errors.requiredField');
  return !errors.inn && !errors.fullName;
}

const handleFileSelect = (event) => {
  selectedFiles.value = Array.from(event.target.files);
  const file = event.target.files[0];
  deathCertificateFile.value = file;
  // if (file && file.type === "application/pdf") {
  //   deathCertificateFile.value = file;
  // } else {
  //   alert("Пожалуйста, выберите PDF файл");
  //   event.target.value = "";
  // }
};

function formatFileSize(size) {
  if (size < 1024) return size + " B";
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
  return (size / (1024 * 1024)).toFixed(1) + " MB";
}

// Функция для обработки ввода ФИО (только буквы и пробелы)
const handleFullNameInput = (event) => {
  const value = event.target.value;
  // Разрешаем только кириллицу, латиницу и пробелы
  const filteredValue = value.replace(/[^а-яёА-ЯЁa-zA-Z\s]/g, '');
  if (value !== filteredValue) {
    fullName.value = filteredValue;
    event.target.value = filteredValue;
  }
};

// Функция для получения всех мест (основное + дополнительные)
const getAllGraves = () => {
  const places = []
  
  // Основное место
  if (cemeteryStore.selectedGrave?.grave_number) {
    places.push(cemeteryStore.selectedGrave.grave_number)
  }
  
  // Дополнительное место (соседняя могила)
  if (cemeteryStore.neighborGrave?.grave_number) {
    places.push(cemeteryStore.neighborGrave.grave_number)
  }
  
  return places.join(', ')
};
</script>

<template>
  <main class="max-sm:bg-white">
    <AppHeader type="client" />
    <div class="container">
      <div
        class="min-h-[calc(100vh-104px)] mt-[104px] py-5 flex gap-6 max-sm:flex-col max-sm:py-0 max-sm:gap-0"
      >
        <div
          class="bg-white p-[20px] max-w-fluid w-full relative rounded-lg max-sm:max-w-full max-sm:pt-2 max-sm:px-[13px] max-sm:pb-0"
        >
          <NuxtLink
            class="flex items-center gap-2 text-base font-medium text-[#B88F34]"
            to="/reserve"
          >
            <img src="/icons/arrow-left-orange.svg" alt="" /> {{ $t('reserve.backToSelection') }}
          </NuxtLink>
          <div
            class="max-sm:hidden align-center my-6 flex gap-fluid items-baseline"
          >
            <img src="/icons/islam.svg" alt="Islam icon" class="w-6 h-6" />
            <h3
              class="text-2xl text-[#222222] font-medium font-foglihten text-fluid"
            >
              {{ cemeteryStore.selectedCemetery.name }}
            </h3>
          </div>
          <h3
            class="sm:hidden max-sm:flex w-full py-2 items-center text-fluid font-foglihten leading-[48px]"
          >
            {{ $t('reserve.bookingPlace') }}
          </h3>
          <div class="bg-[#F4F0E7] p-5 rounded-xl">
            <div class="sm:hidden max-sm:flex gap-fluid items-start">
              <img src="/icons/islam.svg" alt="Islam icon" class="w-6 h-6" />
              <h3
                class="text-2xl text-[#222222] font-medium font-foglihten text-fluid"
              >
                {{ cemeteryStore.selectedCemetery.name }}
              </h3>
            </div>
            <div
              class="h-9 mb-[14px] border-b border-[#EEEEEE] flex items-center"
            >
              <h4 class="text-base text-[#050202]">{{ $t('reserve.bookingTerm') }}</h4>
              <span class="text-sm text-[#999] ml-[15px] mr-[5px]">{{ $t('reserve.bookingDays') }}</span>
              <img src="/icons/info.svg" alt="" />
            </div>
            <div
              class="h-[38px] flex items-start gap-[27px] border-b border-b-[#2010011F]"
            >
              <div class="flex items-center gap-[11px]">
                <h4 class="text-base text-[#050202]">{{ $t('reserve.sector') }}</h4>
                <span class="text-sm text-[#999]">{{
                  cemeteryStore.selectedGrave?.sector_number ?? "—"
                }}</span>
              </div>
              <div class="flex items-center gap-[11px]">
                <h4 class="text-base text-[#050202]">{{ $t('reserve.place') }}</h4>
                <span class="text-sm text-[#999]">{{
                  getAllGraves() || "—"
                }}</span>
              </div>
            </div>
            <div
              class="min-h-[46px] flex flex-wrap items-center gap-[11px] border-b border-b-[#2010011F]"
            >
              <h4 class="text-base text-[#050202]">{{ $t('reserve.deceasedFullName') }}</h4>
              <span class="text-sm text-[#999]">{{ fullName || "" }}</span>
            </div>
            <div class="h-[38px] flex items-end gap-[11px]">
              <h4 class="text-base text-[#050202]">{{ $t('reserve.burialDateLabel') }}</h4>
              <span
                class="text-sm"
                :class="
                  burialDate
                    ? 'font-bold text-[#222222]'
                    : 'font-light text-[#939393]'
                "
              >
                {{ burialDate || $t('reserve.notSpecified') }} {{ burialTime || "" }}
              </span>
            </div>
          </div>
        </div>

        <div
          class="w-full h-fit bg-white rounded-lg py-6 px-[18px] max-sm:pt-6 max-sm:px-4 max-sm:pb-9"
        >
          <h3
            class="max-sm:hidden w-full pb-4 flex items-center text-fluid font-foglihten border-b border-b-[#eee]"
          >
            {{ $t('reserve.bookingPlace') }}
          </h3>
          <div class="text-4xl font-semibold">
            <div
              class="py-4 flex items-center gap-[10px] max-sm:py-0 max-sm:h-11 max-sm:mb-4"
            >
              <h3 class="text-fluid-27 font-medium text-[#222222]">
                {{ $t('reserve.enterDeceasedData') }}
              </h3>
            </div>
            <div class="grid grid-cols-2 gap-[16px] max-lg:grid-cols-1">
              <div class="flex flex-col">
                <input
                  v-model="inn"
                  type="text"
                  v-mask="'############'"
                  class="py-[18px] px-3 w-[100%] border !border-[#AFB5C166] rounded-lg text-base input focus:outline-none"
                  :class="errors.inn ? '!border-red-500' : ''"
                  :placeholder="$t('reserve.iinPlaceholder')"
                />
                <span v-if="errors.inn" class="text-sm text-[#D63C3C]">{{
                  errors.inn
                }}</span>
              </div>
              <div class="flex flex-col">
                <input
                  v-model="fullName"
                  type="text"
                  class="py-[18px] px-3 w-[100%] !border !border-[#AFB5C166] rounded-lg text-base input focus:outline-none"
                  :class="errors.fullName ? '!border-red-500' : ''"
                  :placeholder="$t('reserve.fullNamePlaceholder')"
                  @input="handleFullNameInput"
                />
                <span v-if="errors.fullName" class="text-sm text-[#D63C3C]">
                  {{ errors.fullName }}</span
                >
              </div>
            </div>
          </div>
          <div
            class="w-full bg-[#fff] rounded-[16px] font-medium text-[#222222] my-4"
          >
            <div class="h-11 flex items-center gap-[24px] text-fluid-27">
              {{ $t('reserve.dates') }}
              <div>
                <label
                  class="relative inline-block w-10 h-6 cursor-pointer select-none align-middle"
                >
                  <input
                    v-model="switcher"
                    type="checkbox"
                    class="sr-only peer input"
                  />
                  <span
                    class="absolute inset-0 bg-gray-200 rounded-full transition-colors peer-checked:bg-blue-500 peer-checked:ring-2 peer-checked:ring-blue-500"
                  />
                  <span
                    class="absolute left-[2px] top-[2px] bg-white w-[21.18px] h-[20.9px] rounded-full shadow-md transition-transform peer-checked:translate-x-[15px]"
                  />
                </label>
              </div>
            </div>
            <div
              v-if="switcher"
              class="switcher-data grid grid-cols-2 gap-4 mt-4 max-lg:grid-cols-1"
            >
              <div>
                <p class="text-sm text-[#222222] font-normal">{{ $t('reserve.deathDateLabel') }}</p>
                <input
                  v-model="deathDate"
                  type="date"
                  class="w-[100%] h-[60px] !border !border-[#AFB5C166] text-[#5C6771E6] rounded-lg pl-[16px] text-base input"
                />
              </div>
              <div>
                <p class="text-sm text-[#222222] font-normal">
                  {{ $t('reserve.deathCertificateLabel') }}
                </p>

                <label
                  v-if="selectedFiles.length === 0"
                  for="file"
                  class="flex items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#9ca3af] hover:bg-[#e5e7eb] transition-all"
                >
                  <img src="/icons/upload.svg" alt="upload" class="w-5 h-5" />
                  <span>
                    <span class="text-[#B88F34]">{{ $t('reserve.uploadFiles') }}</span> {{ $t('reserve.dragFiles') }}
                  </span>
                </label>

                <div
                  v-else
                  class="flex flex-col gap-2 py-2 px-3 border rounded-lg bg-[#f9fafb]"
                >
                  <div
                    v-for="(file, i) in selectedFiles"
                    :key="i"
                    class="text-[#222222] flex justify-between items-center"
                  >
                    <div class="flex gap-3">
                      <img src="/icons/file.svg" alt="" />
                      <div class="flex flex-col">
                        <span class="text-base">{{ file.name }}</span>
                        <span class="text-sm text-[#5C6771E6]">{{
                          formatFileSize(file.size)
                        }}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      class="shrink-0 text-xl text-[#5C6771E6] grid place-items-center rounded-lg"
                      @click="selectedFiles.splice(i, 1)"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <input
                  id="file"
                  type="file"
                  class="hidden"
                  multiple
                  @change="handleFileSelect"
                />
              </div>
              <div>
                <p class="text-sm text-[#222222] font-normal">{{ $t('reserve.burialDateLabel') }}</p>
                <input
                  v-model="burialDate"
                  type="date"
                  class="w-[100%] h-[60px] !border !border-[#AFB5C166] text-[#5C6771E6] rounded-lg pl-[16px] text-base input"
                />
              </div>
              <div>
                <p class="text-sm text-[#222222] font-normal">{{ $t('reserve.burialTime') }}</p>
                <input
                  v-model="burialTime"
                  type="time"
                  class="w-[100%] h-[60px] !border !border-[#AFB5C166] text-[#5C6771E6] rounded-lg pl-[16px] text-base input"
                  placeholder="00:00"
                />
              </div>
            </div>
          </div>
          <button class="reserve__btn max-sm:w-full" @click="handleBooking">
            <img src="/icons/pencil.svg" alt="Reserve icon" class="w-5 h-5" />
            {{ $t('reserve.reservePlaceButton') }}
          </button>
        </div>
      </div>

      <!--    <ClientLogin v-if="showLogin" @close="showLogin = false" />-->
      <Teleport to="body">
        <SuccessModal
          v-if="showSuccessModal"
          :title="$t('reserve.requestSent')"
          :text="$t('reserve.awaitConfirmation')"
          :subtext="$t('reserve.redirectToCabinet') + time"
          @close="closeSuccessModal"
        />
      </Teleport>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.container {
  max-width: 1200px;
  width: 100%;
  margin: auto;
}

.gap-fluid {
  gap: clamp(8px, 2vw, 16px);
}

.text-fluid {
  font-size: clamp(20px, 3vw, 2rem);
}

.text-fluid-27 {
  font-size: clamp(16px, 2vw, 27px);
}

.max-w-fluid {
  max-width: clamp(349px, 3vw, 408px);
  @media (max-width: 640px) {
    max-width: 100%;
  }
}

.reserve__btn {
  padding: 15px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  line-height: 18px;
  border-radius: 8px;
  white-space: nowrap;
  background-color: #e9b949;
  transition: all 0.3 ease;
  &:hover {
    background: #d1a53f;
  }
  &:active {
    background: #b88f34;
  }
}

@media (max-width: 1200px) {
  .switcher-data {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .align-center {
    align-items: center;
  }
}
</style>
