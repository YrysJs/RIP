<script setup>
import { useCemeteryStore } from "~/store/cemetery";
import { getBurialRequestById } from "~/services/manager";
import PaymentModal from "~/components/layout/modals/PaymentModal.vue";
import SuccessModal from "~/components/layout/modals/SuccessModal.vue";
import AppHeader from "~/components/layout/AppHeader.vue";

const cemeteryStore = useCemeteryStore();
const switcher = ref(false);
const route = useRoute();
const selectedFiles = ref([]);

const paymentModalVisible = ref(false);
const deathCertificateFile = ref(null);
const showSuccessModal = ref(false);

// Реактивные данные для захоронения
const burialDate = ref(null);
const loading = ref(true);
const error = ref(null);
const burialData = ref(null);

// Локальные реактивные переменные для дат
const deathDate = ref("");

// Функция для конвертации даты в формат YYYY-MM-DD
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
};

// Функция для загрузки данных захоронения
const loadBurialData = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await getBurialRequestById(route.params.id);
    burialData.value = response.data.data;

    // Инициализируем локальные значения дат
    deathDate.value = formatDateForInput(
      burialData?.value?.deceased?.death_date
    );
    burialDate.value = formatDateForInput(burialData?.value?.burial_date);

    // Устанавливаем switcher в true если есть даты
    if (
      burialData?.value?.burial_date ||
      burialData?.value?.deceased?.death_date
    ) {
      switcher.value = true;
    }
  } catch (err) {
    error.value = "Ошибка при загрузке данных";
    console.error("Error loading burial data:", err);
  } finally {
    loading.value = false;
  }
};

// Функция для обновления данных
const refresh = () => {
  loadBurialData();
};

watch(
  () => route.params.id,
  () => refresh()
);

// Отслеживаем изменения дат и обновляем burialData
watch(deathDate, (newDate) => {
  const deceased = burialData.value && burialData.value.deceased
  if (deceased) {
    deceased.death_date = newDate
  }
})

watch(burialDate, (newDate) => {
  const bd = burialData.value
  if (bd) {
    bd.burial_date = newDate
  }
})

// инициализация локальных дат, когда пришли данные
watch(
  burialData,
  (val) => {
    if (!val) return;
    deathDate.value = formatDateForInput(val?.deceased?.death_date);
    burialDate.value = formatDateForInput(val?.burial_date);
    if (val?.burial_date || val?.deceased?.death_date) switcher.value = true;
  },
  { immediate: true }
);

// Функция для обработки выбора файла
const handleFileSelect = (event) => {
  selectedFiles.value = Array.from(event.target.files);
  const file = event.target.files[0];
  if (file && file.type === "application/pdf") {
    deathCertificateFile.value = file;
  } else {
    alert("Пожалуйста, выберите PDF файл");
    event.target.value = "";
  }
};

function formatFileSize(size) {
  if (size < 1024) return size + " B";
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
  return (size / (1024 * 1024)).toFixed(1) + " MB";
}

// Функция для открытия модалки оплаты
const openPaymentModal = () => {
  paymentModalVisible.value = true;
};

// Функция для обработки успешной оплаты
const handlePaymentSuccess = () => {
  showSuccessModal.value = true;
  // Через 5 секунд делаем редирект
  setTimeout(() => {
    navigateTo("/client/tickets/burial");
  }, 5000);
};

// Функция для закрытия SuccessModal
const closeSuccessModal = () => {
  showSuccessModal.value = false;
  navigateTo("/client/tickets/burial");
};

// Загружаем данные при монтировании компонента
onMounted(() => {
  loadBurialData();
});

// Computed property для отображения даты похорон
const displayBurialDate = computed(() => {
  if (burialData?.value?.burial_date) {
    const date = new Date(burialData?.value.burial_date).toLocaleDateString();
    const time = burialData?.value.burial_time
      ? ` ${burialData?.value.burial_time}`
      : "";
    return `${date}${time}`;
  }
  return "Не указано";
});

// Computed property для класса цвета даты похорон
const burialDateClass = computed(() => {
  return burialData?.value?.burial_date ? "text-[#222222]" : "text-[#939393]";
});
</script>

<template>
  <main class="max-sm:bg-white">
    <AppHeader type="client" />
    <div class="container">
      <div class="py-[20px] max-sm:py-0 mt-[104px]">
        <div
          v-if="loading"
          class="flex justify-center items-center min-h-[400px]"
        >
          <div class="text-xl text-[#38949B]">Загрузка...</div>
        </div>

        <div
          v-else-if="error"
          class="flex justify-center items-center min-h-[400px]"
        >
          <div class="text-xl text-red-500">{{ error }}</div>
        </div>

        <div
          v-else
          class="flex gap-[24px] max-sm:flex-col max-sm:py-0 max-sm:gap-0"
        >
          <div
            class="bg-white p-[20px] max-w-fluid w-full relative rounded-lg max-sm:max-w-full max-sm:pt-3 max-sm:px-[16px] max-sm:pb-0 sm:min-h-[100vh]"
          >
            <button
              class="flex items-center gap-2 text-base font-medium text-[#B88F34]"
              @click="$router.go(-1)"
            >
              <img src="/icons/arrow-left-orange.svg" alt="" /> Вернуться
            </button>
            <div
              class="max-sm:hidden align-center my-6 flex gap-fluid items-baseline"
            >
              <img src="/icons/islam.svg" alt="Islam icon" class="w-6 h-6" />
              <h3
                class="text-2xl text-[#222222] font-medium font-foglihten text-fluid"
              >
                {{ burialData?.cemetery_name || "Кладбище" }}
              </h3>
            </div>
            <div class="sm:hidden max-sm:flex max-sm:flex-col w-full pt-2 pb-4">
              <h3
                class="items-center text-fluid-24 font-foglihten leading-[48px]"
              >
                Бронирование:
                <span class="text-[#B88F34]">{{
                  burialData?.request_number || "N/A"
                }}</span>
              </h3>
              <span class="text-sm text-[#999]">{{
                burialData?.reservation_expires_at
                  ? new Date(
                      burialData?.reservation_expires_at
                    ).toLocaleDateString()
                  : "Не указано"
              }}</span>
            </div>
            <div class="bg-[#F4F0E7] p-5 rounded-xl">
              <div class="sm:hidden max-sm:flex gap-fluid items-start">
                <img src="/icons/islam.svg" alt="Islam icon" class="w-6 h-6" />
                <h3
                  class="text-2xl text-[#222222] font-medium font-foglihten text-fluid"
                >
                  {{ burialData?.cemetery_name || "Кладбище" }}
                </h3>
              </div>
              <div
                class="h-10 mb-[14px] border-b border-[#EEEEEE] flex items-center"
              >
                <h4 class="text-base text-[#050202]">Срок брони:</h4>
                <span class="text-sm text-[#999] ml-[15px] mr-[5px]">{{
                  burialData?.reservation_expires_at
                    ? new Date(
                        burialData?.reservation_expires_at
                      ).toLocaleDateString()
                    : "Не указано"
                }}</span>
                <img src="/icons/info.svg" alt="" />
              </div>
              <div
                class="h-[38px] flex items-start gap-[27px] border-b border-b-[#2010011F]"
              >
                <div class="flex items-center gap-[11px]">
                  <h4 class="text-base text-[#050202]">Сектор:</h4>
                  <span class="text-sm text-[#999]">{{
                    burialData?.sector_number || "Не указано"
                  }}</span>
                </div>
                <div class="flex items-center gap-[11px]">
                  <h4 class="text-base text-[#050202]">Место:</h4>
                  <span class="text-sm text-[#999]">{{
                    burialData?.grave_id || "Не указано"
                  }}</span>
                </div>
              </div>
              <div
                class="h-[46px] flex items-center gap-[11px] border-b border-b-[#2010011F]"
              >
                <h4 class="text-base text-[#050202]">ФИО покойного:</h4>
                <span class="text-sm text-[#999]">{{
                  burialData?.deceased?.full_name || "Не указано"
                }}</span>
              </div>
              <div class="h-[46px] flex items-center gap-[11px]">
                <h4 class="text-base text-[#050202]">Дата похорон:</h4>
                <span
                  class="text-sm"
                  :class="
                    burialDate
                      ? 'font-bold text-[#222222]'
                      : 'font-light text-[#939393]'
                  "
                >
                  {{ displayBurialDate }}
                </span>
              </div>
              <div
                class="border-b border-[#EEEEEE] pb-[16px] pt-[16px] flex items-center"
              >
                <h4 class="text-base font-medium text-[#222222] w-[105px]">
                  Статус:
                </h4>
                <span
                  class="text-base font-bold"
                  :class="{
                    'text-green-600': burialData?.status === 'approved',
                    'text-yellow-600': burialData?.status === 'pending',
                    'text-red-600': burialData?.status === 'rejected',
                    'text-[#222222]': !burialData?.status,
                  }"
                >
                  {{
                    burialData?.status === "pending"
                      ? "В ожидании"
                      : burialData?.status === "approved"
                      ? "Одобрено"
                      : burialData?.status === "rejected"
                      ? "Отклонено"
                      : "Не указано"
                  }}
                </span>
              </div>
              <div
                class="border-b border-[#EEEEEE] pb-[16px] pt-[16px] flex items-center"
              >
                <h4 class="text-base font-medium text-[#222222] w-[105px]">
                  Телефон кладбища:
                </h4>
                <span class="text-base font-bold text-[#222222]">{{
                  burialData?.cemetery_phone || "Не указано"
                }}</span>
              </div>
            </div>
          </div>

          <div
            class="w-full h-fit bg-white rounded-lg py-6 px-[18px] max-sm:py-0 max-sm:px-4 max-sm:mt-2"
          >
            <h3
              class="max-sm:hidden w-full pb-4 flex items-center text-fluid font-foglihten border-b border-b-[#eee]"
            >
              Бронирование места:&nbsp;
              <span class="text-[#B88F34]">{{
                burialData?.request_number || "N/A"
              }}</span>
            </h3>
            <div class="text-4xl font-semibold">
              <div
                class="py-4 flex items-center gap-[10px] max-sm:py-0 max-sm:h-11"
              >
                <h3
                  class="text-fluid-27 font-medium text-[#222222] max-sm:font-semibold"
                >
                  Укажите данные покойного
                </h3>
              </div>
              <div class="grid grid-cols-2 gap-[16px] max-lg:grid-cols-1">
                <div class="flex flex-col">
                  <input
                    type="text"
                    v-if="burialData?.deceased"
                    v-model="burialData.deceased.inn"
                    class="w-[100%] h-[60px] !border !border-[#AFB5C166] rounded-lg pl-[16px] text-lg input"
                    placeholder="ИИН"
                    readonly
                  />
                </div>
                <div class="flex flex-col">
                  <input
                    type="text"
                    v-model="burialData.deceased.full_name"
                    class="w-[100%] h-[60px] !border !border-[#AFB5C166] rounded-lg pl-[16px] text-lg input"
                    placeholder="ФИО"
                    readonly
                  />
                </div>
              </div>
            </div>
            <div
              class="w-full bg-[#fff] rounded-[16px] font-medium text-[#222222] my-4 max-sm:mb-[43px]"
            >
              <div class="h-11 flex items-center gap-[24px] text-fluid-27">
                Даты
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
                      class="absolute left-[1px] top-[1px] bg-white w-[21.18px] h-[20.9px] rounded-full shadow-md transition-transform peer-checked:translate-x-[15px]"
                    />
                  </label>
                </div>
                <span
                  v-if="
                    !burialData?.burial_date &&
                    !burialData?.deceased?.death_date
                  "
                  class="text-sm text-[#D63C3C]"
                  >Необходимо указать даты похорон</span
                >
              </div>
              <div
                v-if="switcher"
                class="switcher-data grid grid-cols-2 max-sm:gap-4 gap-4 mt-[24px]"
              >
                <div>
                  <p class="text-sm text-[#222222] font-normal">Дата смерти</p>
                  <input
                    type="date"
                    v-model="deathDate"
                    class="w-[100%] h-[60px] !border !border-[#AFB5C166] rounded-lg pl-[16px] text-base input"
                  />
                </div>
                <div>
                  <p class="text-sm text-[#222222] font-normal">
                    Заключение о смерти от мед учереждении:
                  </p>

                  <label
                    v-if="selectedFiles.length === 0"
                    for="file"
                    class="flex items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#9ca3af] hover:bg-[#e5e7eb] transition-all"
                  >
                    <img src="/icons/upload.svg" alt="upload" class="w-5 h-5" />
                    <span>
                      <span class="text-[#B88F34]">Загрузите файлы</span> или
                      перетащите их
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
                  <p class="text-sm text-[#222222] font-normal">Дата похорон</p>
                  <input
                    type="date"
                    v-model="burialDate"
                    class="w-[100%] h-[60px] !border !border-[#AFB5C166] rounded-lg pl-[16px] text-base input"
                  />
                </div>
                <div>
                  <p class="text-sm text-[#222222] font-normal">
                    Время похорон
                  </p>
                  <input
                    type="time"
                    v-model="burialData.burial_time"
                    class="w-[100%] h-[60px] !border !border-[#AFB5C166] rounded-lg pl-[16px] text-base input"
                    placeholder="00:00"
                  />
                </div>
              </div>
              <div class="mt-16 max-sm:h-[44px] max-sm:mt-4 max-sm:mb-2">
                <h3
                  class="text-fluid font-medium text-[#222222] mb-[38px] max-sm:mb-0"
                >
                  К оплате: {{burialData.burial_price}} ₸
                </h3>
              </div>
              <button
                class="text-base py-[18px] px-[28px] rounded-lg bg-[#E9B949] text-black max-sm:w-full hover:bg-[#D1A53F] active:bg-[#B88F34] transition"
                :disabled="burialData?.status !== 'pending'"
                :class="{
                  'opacity-50 cursor-not-allowed':
                    burialData?.status !== 'pending',
                }"
                @click="openPaymentModal"
              >
                Оплатить сбор
              </button>
            </div>
          </div>
        </div>
        <Teleport to="body">
          <PaymentModal
            :visible="paymentModalVisible"
            :burial-data="burialData"
            :death-certificate-file="deathCertificateFile"
            @close="paymentModalVisible = false"
            @success="handlePaymentSuccess"
          />
        </Teleport>
        <Teleport to="body">
          <SuccessModal
            v-if="showSuccessModal"
            title="Оплата прошла успешно, заявка на захоронения отправлена!"
            text="Отслеживайте статус в личном кабинете"
            @close="closeSuccessModal"
          />
        </Teleport>
      </div>
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

.text-fluid-24 {
  font-size: clamp(24px, 3vw, 2rem);
}

.text-fluid {
  font-size: clamp(20px, 3vw, 2rem);
}

.text-fluid-27 {
  font-size: clamp(17px, 2vw, 27px);
}

.max-w-fluid {
  max-width: clamp(349px, 3vw, 408px);
  @media (max-width: 640px) {
    max-width: 100%;
  }
}

.switcher-data {
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
  @media (max-width: 640px) {
    padding-bottom: 16px;
    border-bottom: 1px solid #eee;
  }
}
</style>
