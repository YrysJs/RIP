<script setup>
import { useRouter } from "vue-router";
import MapSecond from "~/components/map/MapV2.vue";
import { useCemeteryStore } from "~/store/cemetery.js";
import { getCemeteries, getGraves, getGravesByCoords } from "~/services/cemetery";
import { getGraveById } from "~/services/client";
import ShareCoordModal from "~/components/layout/modals/ShareCoordModal.vue";
import GraveDetailModal from "~/components/layout/modals/GraveDetailModal.vue";
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import AppHeader from "~/components/layout/AppHeader.vue";
import AppHeaderClient from "~/components/layout/AppHeaderClient.vue";
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

// Функция для получения локализованного имени кладбища
const getCemeteryName = (cemetery) => {
  if (!cemetery) return ''
  if (locale.value === 'kk' && cemetery.name_kz) {
    return cemetery.name_kz
  }
  return cemetery.name || ''
}

// Функция для получения локализованного описания кладбища
const getCemeteryDescription = (cemetery) => {
  if (!cemetery) return ''
  if (locale.value === 'kk' && cemetery.description_kz) {
    return cemetery.description_kz
  }
  return cemetery.description || ''
}
const router = useRouter();

const shareCoordModalState = ref(false);
const selectedReligios = ref("");
const sities = [
  "Алматы",
  "Нур-Султан",
  "Шымкент",
  "Караганда",
  "Тараз",
  "Павлодар",
  "Усть-Каменогорск",
  "Семей",
  "Актобе",
  "Костанай",
  "Кызылорда",
  "Талдыкорган",
  "Тараз",
  "Павлодар",
  "Усть-Каменогорск",
  "Семей",
  "Актобе",
  "Костанай",
  "Кызылорда",
];
const religios = computed(() => [
  t('religions.islam'),
  t('religions.christianity'),
  t('religions.judaism'),
  t('religions.catholicism'),
  t('religions.buddhism')
]);

const selectedCity = ref("");
const cityListState = ref(false);
const cemeteryStore = useCemeteryStore();

const selected = ref(null);
const cemetriessList = ref([]);
const selectedCemetery = ref({});
const gravesList = ref([]);
const selectedGrave = ref(null);
const showGraveDetails = ref(false);
const isMobile = ref(false);
const showInfoMobile = ref(false);

// Переменная для соседней могилы (приходит с карты)
const neighborGrave = ref(null);

// Переменные для кэширования данных могил
const graveDataCache = ref({}); // кэш данных могил

// Переменные для тултипа с информацией об умершем
const showDeceasedTooltip = ref(false);
const deceasedTooltipData = ref(null);
const tooltipPosition = ref({ x: 0, y: 0 });

// Переменные для второго тултипа (больший)
const showSecondTooltip = ref(false);
const secondTooltipData = ref(null);
let tooltipTimeout = null;

// Переменные для модального окна
const showGraveModal = ref(false);
const graveModalData = ref(null);


const showList = computed(() => !(isMobile.value && showInfoMobile.value && !showGraveDetails.value));

const religionIconMap = {
  ислам: "/icons/islam.svg",
  христианство: "/icons/christian.svg",
  католицизм: "/icons/catholic.svg",
  иудаизм: "/icons/judaism.svg",
  буддизм: "/icons/buddhism.svg",
};

const reserve = () => {
  // Сохраняем данные кладбища и выбранной могилы в store
  if (selectedCemetery.value && selectedGrave.value) {
    cemeteryStore.setReservationData(
      selectedCemetery.value,
      selectedGrave.value,
      neighborGrave.value // передаем соседнюю могилу
    );
  } else {
    cemeteryStore.setSelected(selectedCemetery.value);
  }

  router.push("/client/reservation/reservation-first");
};

const pickCity = (item) => {
  selectedCity.value = item;
  cityListState.value = false;
  selectedCemetery.value = {};
  gravesList.value = []; // очищаем список могил
  showInfoMobile.value = false;
};

async function getCemeteriesReq() {
  try {
    const params = {};

    if (selectedCity.value && selectedCity.value !== "") {
      params.city = selectedCity.value;
    }

    if (selectedReligios.value && selectedReligios.value !== t('reserve.notSelected')) {
      params.religion = selectedReligios.value;
    }

    const response = await getCemeteries(params);
    cemetriessList.value = response?.data?.data ?? [];

    // 🔽 Убираем автовыбор первого кладбища
    if (!cemetriessList.value.length) {
      // Пустой результат — сбрасываем выбор
      selectedCemetery.value = {};
      gravesList.value = [];
      selectedGrave.value = null;
      showInfoMobile.value = false;
    }
  } catch (error) {
    console.log(error);
  }
}

// Старый запрос на могилы - закомментирован
// async function getGravesReq(cemetery_id) {
//   try {
//     if (!cemetery_id) return;

//     const response = await getGraves({ cemetery_id });
//     gravesList.value = response.data.data || [];
//   } catch (error) {
//     gravesList.value = [];
//   }
// }

watch(selectedCity, () => {
  getCemeteriesReq();
});

watch(selectedReligios, () => {
  getCemeteriesReq();
});

watch(selectedCemetery, (newCemetery) => {
  if (newCemetery && newCemetery.id) {
    // getGravesReq(newCemetery.id); // Старый запрос - закомментирован
    // Сохраняем выбранное кладбище в store
    cemeteryStore.setSelected(newCemetery);
    // Очищаем предыдущий выбор могилы при смене кладбища
    if (selectedGrave.value) {
      cancelGraveSelection();
    }
    // Очищаем список могил - теперь он будет загружаться через mapMoved
    gravesList.value = [];
    // Очищаем кэш данных могил при смене кладбища
    graveDataCache.value = {};
  }
});

watch(selected, (newSelected) => {
  if (newSelected) {
    selectedGrave.value = newSelected;
    showGraveDetails.value = true;
    // Сохраняем выбранную могилу в store
    cemeteryStore.setSelectedGrave(newSelected);
  } else {
    // Очищаем соседнюю могилу при сбросе выбора
    neighborGrave.value = null;
  }
});

watch([isMobile, selectedCemetery], ([mobile, cem]) => {
  if (mobile && cem?.id && !showInfoMobile.value) {
    showInfoMobile.value = true; // чтобы крестик точно появился
  }
});

// Добавляем watcher для показа мобильной информации при выборе могилы
watch([isMobile, selected], ([mobile, grave]) => {
  if (mobile && grave && !showInfoMobile.value) {
    showInfoMobile.value = true;
  }
});

const mapMoved = async (coords) => {
  // Не делаем запрос могил пока не выбрано кладбище
  if (!selectedCemetery.value?.id) {
    return;
  }
  
  try {
    // Извлекаем параметры из объекта координат
    const min_x = coords.southWest.lng; // минимальная долгота
    const max_x = coords.northEast.lng; // максимальная долгота
    const min_y = coords.southWest.lat; // минимальная широта
    const max_y = coords.northEast.lat; // максимальная широта
    
    // Параметры для запроса
    const params = {
      min_x,
      max_x,
      min_y,
      max_y
    };
    
    // Добавляем cemetery_id если кладбище выбрано
    if (selectedCemetery.value?.id) {
      params.cemetery_id = selectedCemetery.value.id;
    }

    
    // Вызываем запрос
    const response = await getGravesByCoords(params);
    
    // Обновляем список могил с новыми данными
    if (response?.data) {
      gravesList.value = response.data;
    }
    
  } catch (error) {
    console.error('Ошибка при загрузке могил по координатам:', error);
  }
}

onMounted(async () => {
  await getCemeteriesReq();
});

const cancelGraveSelection = () => {
  selectedGrave.value = null;
  showGraveDetails.value = false;
  selected.value = null;
  neighborGrave.value = null;
  // Очищаем выбранную могилу из store
  cemeteryStore.clearSelectedGrave();
  // На мобиле скрываем информацию если нет выбранного кладбища
  if (isMobile.value && !selectedCemetery.value?.id) {
    showInfoMobile.value = false;
  }
};

const getGraveStatusText = (status) => {
  switch (status) {
    case "free":
      return t('reserve.freePlace');
    case "reserved":
      return t('reserve.reserved');
    case "occupied":
      return t('reserve.occupied');
    default:
      return t('reserve.unknown');
  }
};

const graveLat = ref(null);
const graveLng = ref(null);

const shareGraveData = () => {
  graveLat.value = selected.value.polygon_data.coordinates[0][1];
  graveLng.value = selected.value.polygon_data.coordinates[0][0];
  shareCoordModalState.value = true;
};

function updateIsMobile() {
  isMobile.value = window.matchMedia("(max-width: 640px)").matches;
}

onMounted(() => {
  updateIsMobile();
  window.addEventListener("resize", updateIsMobile);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateIsMobile);
});

function selectCemetery(item) {
  selectedCemetery.value = item;
  if (isMobile.value) {
    showInfoMobile.value = true;
    // плавный скролл к вставке
    const anchor = document.querySelector("#mobile-info-anchor");
    if (anchor) {
      window.scrollTo({ top: anchor.offsetTop - 12, behavior: "smooth" });
    }
  }
}


function getReligionIcon(item) {
  const raw = (item?.religion ?? item?.type ?? "")
    .toString()
    .trim()
    .toLowerCase();

  // Прямое попадание
  if (religionIconMap[raw]) return religionIconMap[raw];

  // Евристики на случай разных формулировок в бэке
  if (raw.includes("ислам") || raw.includes("мусульман"))
    return religionIconMap["ислам"];
  if (raw.includes("православ") || raw.includes("христиан"))
    return religionIconMap["христианство"];
  if (raw.includes("катол")) return religionIconMap["католицизм"];
  if (raw.includes("иуда") || raw.includes("еврей"))
    return religionIconMap["иудаизм"];
  if (raw.includes("будд")) return religionIconMap["буддизм"];

  // Фолбэк
  return "/icons/cemetery-generic.svg";
}

// Обработка выбора кладбища с карты
function onCemeterySelected(cemetery) {
  selectedCemetery.value = cemetery;
  if (isMobile.value) {
    showInfoMobile.value = true;
    // плавный скролл к вставке
    const anchor = document.querySelector("#mobile-info-anchor");
    if (anchor) {
      window.scrollTo({ top: anchor.offsetTop - 12, behavior: "smooth" });
    }
  }
}

// Обработка сброса выбора кладбища при отдалении карты
function onCemeteryDeselected() {
  selectedCemetery.value = {};
  gravesList.value = [];
  selectedGrave.value = null;
  neighborGrave.value = null;
  showInfoMobile.value = false;
  // Очищаем выбранную могилу из store
  cemeteryStore.clearSelectedGrave();
  // Очищаем кэш данных могил
  graveDataCache.value = {};
}

// Обработка клика по занятой могиле
async function onOccupiedGraveClicked(data) {
  // Используем реальный ID могилы
  const graveId = data.grave.id;
  
  try {
    let graveData = null;
    
    // Проверяем, есть ли уже данные в кэше
    if (!graveDataCache.value[graveId]) {
      // Вызываем запрос getGraveById с реальным ID могилы
      const graveResponse = await getGraveById(graveId);
      graveDataCache.value[graveId] = graveResponse.data;
      graveData = graveResponse.data;
    } else {
      graveData = graveDataCache.value[graveId];
    }
    
    // Проверяем наличие данных об умершем
    if (graveData && graveData.deceased && graveData.deceased.length > 0) {
      const deceased = graveData.deceased[0]; // берем первого умершего
      // Получаем фото из мемориала, если он есть
      const images = deceased?.memorial?.photo_urls || [];
      
      // Очищаем предыдущий таймер
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
        tooltipTimeout = null;
      }
      
      // Проверяем количество кликов
      if (data.clickCount === 1) {
        // Первый клик - показываем маленький тултип
        showDeceasedTooltip.value = true;
        showSecondTooltip.value = false;
        showGraveModal.value = false;
        deceasedTooltipData.value = {
          grave: graveData,
          deceased: deceased,
          images: images
        };
      } else if (data.clickCount === 2) {
        // Второй клик - показываем большой тултип и закрываем маленький
        showDeceasedTooltip.value = false;
        showSecondTooltip.value = true;
        showGraveModal.value = false;
        secondTooltipData.value = {
          grave: graveData,
          deceased: deceased,
          images: images
        };
      } else if (data.clickCount >= 3) {
        // Третий клик и далее - показываем модальное окно и закрываем тултипы
        showDeceasedTooltip.value = false;
        showSecondTooltip.value = false;
        showGraveModal.value = true;
        graveModalData.value = {
          grave: graveData,
          deceased: deceased,
          images: images
        };
        // Очищаем таймер, так как модальное окно не закрывается автоматически
        if (tooltipTimeout) {
          clearTimeout(tooltipTimeout);
          tooltipTimeout = null;
        }
        return; // Не устанавливаем новый таймер для модального окна
      }
      
      // Устанавливаем таймер на 5 секунд для автоматического закрытия
      tooltipTimeout = setTimeout(() => {
        showDeceasedTooltip.value = false;
        showSecondTooltip.value = false;
        deceasedTooltipData.value = null;
        secondTooltipData.value = null;
        tooltipTimeout = null;
      }, 5000);
      
    } else {
      // Показываем toast с сообщением об отсутствии данных
      const { $toast } = useNuxtApp();
      $toast.error(t('errors.noDeceasedData'));
    }
    
  } catch (error) {
    console.error('Ошибка при получении данных могилы:', error);
    const { $toast } = useNuxtApp();
    $toast.error(t('errors.errorLoadingGrave'));
  }
}

// Функция для закрытия тултипа
function closeDeceasedTooltip() {
  showDeceasedTooltip.value = false;
  showSecondTooltip.value = false;
  showGraveModal.value = false;
  deceasedTooltipData.value = null;
  secondTooltipData.value = null;
  graveModalData.value = null;
  
  // Очищаем таймер
  if (tooltipTimeout) {
    clearTimeout(tooltipTimeout);
    tooltipTimeout = null;
  }
}

// Функция для открытия маршрута в Яндекс.Картах
function openRoute() {
  const tooltipData = deceasedTooltipData.value || secondTooltipData.value;
  
  if (!tooltipData?.grave?.polygon_data?.coordinates) {
    const { $toast } = useNuxtApp();
    $toast.error(t('errors.coordinatesNotFound'));
    return;
  }
  
  // Берем первую координату из полигона могилы
  const coordinates = tooltipData.grave.polygon_data.coordinates[0];
  const [lng, lat] = coordinates; // координаты в формате [долгота, широта]
  
  // Формируем ссылку на Яндекс.Карты с пином
  const yandexMapsUrl = `https://yandex.ru/maps/?pt=${lng},${lat}&z=18&l=map`;
  
  // Открываем ссылку в новой вкладке
  window.open(yandexMapsUrl, '_blank');
}

// Функция для форматирования телефона с маской
function formatPhone(phone) {
  if (!phone) return '';
  
  // Убираем все нецифровые символы
  const cleaned = phone.toString().replace(/\D/g, '');
  
  // Если номер начинается с 7 или 8, убираем первую цифру и добавляем +7
  let formatted = cleaned;
  if (formatted.startsWith('7')) {
    formatted = formatted.substring(1);
  } else if (formatted.startsWith('8')) {
    formatted = formatted.substring(1);
  }
  
  // Применяем маску +7 (###) ###-##-##
  if (formatted.length >= 10) {
    const code = formatted.substring(0, 3);
    const part1 = formatted.substring(3, 6);
    const part2 = formatted.substring(6, 8);
    const part3 = formatted.substring(8, 10);
    return `+7 (${code}) ${part1}-${part2}-${part3}`;
  }
  
  return phone; // Возвращаем как есть, если не удалось отформатировать
}

// Функция для создания WhatsApp ссылки
function getWhatsAppLink(phone) {
  if (!phone) return '#';
  
  // Убираем все нецифровые символы
  let cleaned = phone.toString().replace(/\D/g, '');
  
  // Если номер начинается с 7, оставляем как есть, если с 8 - заменяем на 7
  if (cleaned.startsWith('8')) {
    cleaned = '7' + cleaned.substring(1);
  } else if (!cleaned.startsWith('7')) {
    cleaned = '7' + cleaned;
  }
  
  // Формируем WhatsApp ссылку
  return `https://wa.me/${cleaned}`;
}

// Функция для открытия WhatsApp
function openWhatsApp(phone) {
  const link = getWhatsAppLink(phone);
  if (link !== '#') {
    window.open(link, '_blank');
  }
}
</script>

<template>
  <main>
    <AppHeader type="client" />
    <AppHeaderClient />
    <div class="container">
      <div
        class="main-mt py-[24px] min-h-[calc(100vh-104px)] mt-[104px] rounded-lg gap-[24px] max-sm:py-0 max-sm:gap-0"
      >
        <div
          class="w-full relative flex max-sm:flex-col-reverse gap-6 max-sm:gap-0"
        >
          <transition name="collapse-fade">
            <div
              v-show="showList"
              class="max-w-fluid w-full bg-white p-5 max-sm:py-6 max-sm:px-4 rounded-lg"
            >
              <h3 class="font-foglihten text-fluid">{{ $t('reserve.pageTitle') }}</h3>

              <div class="reserve__city flex justify-between items-center">
                <div class="flex justify-between items-center">
                  <span class="text-base text-[#050202] mr-[15px]">{{ $t('reserve.city') }}</span>
                  <template v-if="selectedCity">
                    <img
                      src="/icons/pin.svg"
                      alt="icon"
                      class="w-4 h-5 mr-[9px]"
                    />
                    <span class="text-sm text-[#999999]">
                      {{ selectedCity }}</span
                    >
                  </template>
                  <template v-else> {{ $t('reserve.notSelected') }} </template>
                </div>
                <button
                  class="bg-[#224C4F26] text-[#224C4F] font-bold py-[8px] px-[12px] rounded-lg"
                  @click="cityListState = true"
                >
                  {{ $t('common.select') }}
                </button>
              </div>

              <div
                v-if="cityListState"
                class="absolute bg-white top-0 left-0 w-full p-[20px] flex flex-col gap-[8px] z-10"
              >
                <p
                  v-for="item of sities"
                  :key="item"
                  class="text-base text-[#222222] cursor-pointer"
                  @click="pickCity(item)"
                >
                  {{ item }}
                </p>
              </div>

              <select
                id=""
                v-model="selectedReligios"
                name=""
                :placeholder="$t('reserve.religion')"
                class="w-full border border-[#EEEEEE] rounded-lg py-[8px] px-[12px] input select"
              >
                <option value="" disabled>{{ $t('reserve.religion') }}</option>
                <option v-for="item of religios" :key="item" :value="item">
                  {{ item }}
                </option>
              </select>

              <p class="text-[#222222]">
                {{ cemetriessList.length }} {{ $t('reserve.results') }}
              </p>

              <!-- Список кладбищ -->

              <div class="flex flex-col gap-[12px] mt-[24px]">
                <template v-if="!cemetriessList.length">
                  <div
                    class="p-[16px] border rounded-lg text-sm text-[#666] bg-[#fafafa]"
                  >
                    {{ $t('reserve.nothingFound') }}
                  </div>
                </template>

                <div
                  v-else
                  v-for="item in cemetriessList"
                  :key="item.id"
                  class="cemetry__item flex justify-between items-center p-[20px] gap-3 rounded-xl cursor-pointer"
                  :class="
                    selectedCemetery?.id === item.id
                      ? 'bg-[#F4E4BE]'
                      : 'bg-[#F4F0E7]'
                  "
                  @click="selectCemetery(item)"
                >
                  <img
                    :src="getReligionIcon(item)"
                    :alt="item.religion || item.type || 'cemetery'"
                    class="w-6 h-6"
                  />
                  <div class="w-full">
                    <div
                      class="flex justify-between text-base font-medium text-[#050202]"
                    >
                      <h3>
                        {{ item.name }}
                      </h3>
                    </div>
                    <h4 class="text-sm font-normal text-[#939393]">
                      {{ item.type }}
                    </h4>
                    <p class="text-[13px] font-normal text-[#5C6771]">
                      {{ item.street_name }}, {{ item.city }}
                    </p>
                  </div>
                  <div class="flex flex-col gap-[14px] justify-end items-end">
                    <div class="w-[24px] h-[24px] relative">
                      <span class="arrow"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </transition>

          <div class="w-full">
            <div
              class="w-full min-h-[50vh] rounded-xl overflow-hidden max-sm:rounded-none"
            >
              <ClientOnly>
                <MapSecond
                  :key="selectedCemetery?.id || 'none'"
                  :polygons="gravesList"
                  :neighbor-grave="neighborGrave"
                  :cemetery-boundary="selectedCemetery"
                  :center-coords="selectedCemetery.location_coords"
                  :cemeteries="cemetriessList"
                  v-model="selected"
                  @update:neighbor-grave="neighborGrave = $event"
                  @map-bounds-changed="mapMoved"
                  @cemetery-selected="onCemeterySelected"
                  @cemetery-deselected="onCemeteryDeselected"
                  @occupied-grave-clicked="onOccupiedGraveClicked"
                />
                <template #fallback>
                  <div
                    class="w-full h-full flex items-center justify-center text-[#666]"
                  >
                    {{ $t('reserve.loadingMap') }}
                  </div>
                </template>
              </ClientOnly>
            </div>


            <div id="mobile-info-anchor" class="hidden max-sm:block"></div>

            <Teleport
              to="#mobile-info-anchor"
              v-if="
                isMobile &&
                selectedCemetery?.id &&
                showInfoMobile
              "
            >
              <transition name="fade-slide">
                <div
                  :key="selectedCemetery?.id"
                  class="bg-[#FFF] py-6 px-[18px] rounded-lg"
                  v-if="selectedCemetery?.id"
                >
                  <div
                    class="relative flex justify-between items-start max-sm:flex-col"
                  >
                    <button
                      class="absolute top-0 right-0"
                      @click="
                        showInfoMobile = false;
                        selectedCemetery = {};
                        gravesList = [];
                      "
                    >
                      <img src="/icons/x.svg" alt="Exit button" />
                    </button>

                    <div>
                      <div class="flex gap-fluid items-center max-lg:leading-6">
                        <img
                          src="/icons/islam.svg"
                          alt="Islam icon"
                          class="w-6 h-6"
                        />
                        <h3 class="text-fluid text-[#201001] font-foglihten">
                          {{ getCemeteryName(selectedCemetery) }}
                        </h3>
                      </div>
                      <p class="text-[#939393] text-sm mt-[4px] mb-[8px]">
                        {{ selectedCemetery?.type }}
                      </p>
                    </div>
                    <div
                      class="flex gap-4 items-center max-lg:flex-col my-[14.5px] max-lg:items-start max-lg:gap-[6px] max-lg:my-0"
                    >
                      <div class="flex gap-[8px] items-center">
                        <div
                          class="w-[36px] h-[16px] rounded-sm bg-[#43DC4966] border-2 border-[#43DC49]"
                        ></div>
                        <p class="text-sm sm:text-[13px]">
                          {{ $t('reserve.freePlaces') }} {{ selectedCemetery?.free_spaces }}
                        </p>
                      </div>
                      <div class="flex gap-[8px] items-center">
                        <div
                          class="w-[36px] h-[16px] rounded-sm bg-[#DCBA4366] border-2 border-[#DCBA43]"
                        ></div>
                        <p class="text-sm sm:text-[13px]">
                          {{ $t('reserve.reservedPlaces') }} {{ selectedCemetery?.reserved_spaces }}
                        </p>
                      </div>
                      <div class="flex gap-[8px] items-center">
                        <div
                          class="w-[36px] h-[16px] rounded-sm bg-[#93939366] border-2 border-[#939393]"
                        ></div>
                        <p class="text-sm sm:text-[13px]">
                          {{ $t('reserve.occupiedPlaces') }} {{ selectedCemetery?.occupied_spaces }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    class="flex items-center gap-[26px] pb-4 border-b border-b-[#eee] leading-10 max-lg:flex-col max-lg:gap-0 max-lg:items-start"
                  >
                    <div class="flex items-center max-lg:h-8 max-lg:mt-2">
                      <img src="/icons/pin.svg" alt="" class="mr-2" />
                      <span class="text-sm text-[#201001]">{{
                        selectedCemetery?.street_name
                      }}</span>
                    </div>
                    <div class="flex gap-[8px] items-center cursor-pointer" @click="openWhatsApp(selectedCemetery?.phone2 || selectedCemetery?.phone)">
                      <img src="/icons/whatsapp1.svg" alt="WhatsApp" />
                      <span class="text-[13px]">{{ formatPhone(selectedCemetery?.phone2 || selectedCemetery?.phone) }}</span>
                    </div>
                  </div>

                  <!-- <div class="flex gap-[24px] mt-[16px] mb-[32px]">
          <span class="text-base font-medium"
            >{{ $t('reserve.capacity') }} {{ selectedCemetery?.capacity }}</span
          >
          <span class="text-base font-medium"
            >Cвободных мест: {{ selectedCemetery?.free_spaces }}</span
          >
          <span class="text-base font-medium">{{ $t('reserve.bookingCost') }}</span>
        </div> -->
                  <p class="text-base text-[#222] py-4">
                    {{ getCemeteryDescription(selectedCemetery) }}
                  </p>

                  <!-- Информация о выбранной могиле -->
                  <div
                    v-if="selectedGrave"
                    class="bg-[#F4F0E7] p-4 rounded-lg my-4 border border-[#E9B949]"
                  >
                    <h4 class="text-base font-medium text-[#201001] mb-2">
                      {{ $t('reserve.selectedPlace') }}
                    </h4>
                    <div class="flex gap-4 text-sm">
                      <div class="flex items-center gap-2">
                        <span class="text-[#666]">{{ $t('reserve.sector') }}</span>
                        <span class="font-medium text-[#201001]">{{ selectedGrave.sector_number }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-[#666]">{{ $t('reserve.place') }}</span>
                        <span class="font-medium text-[#201001]">{{ selectedGrave.grave_number }}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-2 mt-2">
                      <span class="text-[#666] text-sm">{{ $t('reserve.status') }}</span>
                      <span 
                        class="text-sm font-medium px-2 py-1 rounded"
                        :class="{
                          'bg-green-100 text-green-800': selectedGrave.status === 'free',
                          'bg-yellow-100 text-yellow-800': selectedGrave.status === 'reserved',
                          'bg-gray-100 text-gray-800': selectedGrave.status === 'occupied'
                        }"
                      >
                        {{ getGraveStatusText(selectedGrave.status) }}
                      </span>
                    </div>
                  </div>

                  <!-- Информация о выбранной соседней могиле -->
                  <div
                    v-if="neighborGrave"
                    class="bg-[#E3F2FD] p-4 rounded-lg my-4 border border-[#2196F3]"
                  >
                    <h4 class="text-base font-medium text-[#1976D2] mb-2">
                      {{ $t('reserve.selectedNeighborGrave') }}
                    </h4>
                    <div class="flex gap-4 text-sm">
                      <div class="flex items-center gap-2">
                        <span class="text-[#666]">{{ $t('reserve.sector') }}</span>
                        <span class="font-medium text-[#1976D2]">{{ neighborGrave.sector_number }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-[#666]">{{ $t('reserve.place') }}</span>
                        <span class="font-medium text-[#1976D2]">{{ neighborGrave.grave_number }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-[#666]">{{ $t('reserve.row') }}</span>
                        <span class="font-medium text-[#1976D2]">{{ neighborGrave.row_number }}</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-2 mt-2">
                      <span class="text-[#666] text-sm">{{ $t('reserve.status') }}</span>
                      <span 
                        class="text-sm font-medium px-2 py-1 rounded"
                        :class="{
                          'bg-green-100 text-green-800': neighborGrave.status === 'free',
                          'bg-yellow-100 text-yellow-800': neighborGrave.status === 'reserved',
                          'bg-gray-100 text-gray-800': neighborGrave.status === 'occupied'
                        }"
                      >
                        {{ getGraveStatusText(neighborGrave.status) }}
                      </span>
                    </div>
                  </div>

                  <button
                    class="reserve__btn w-full mt-4"
                    :disabled="selectedGrave?.status !== 'free'"
                    @click="reserve"
                  >
                    <img
                      src="/icons/pencil.svg"
                      alt="Reserve icon"
                      class="w-5 h-5"
                    />
                    {{ $t('reserve.reservePlaceButton') }}
                  </button>
                </div>
              </transition>
            </Teleport>

            <!-- Инфо по кладбищу -->
            <div
              class="bg-[#FFF] py-6 px-[18px] mt-2 rounded-lg relative"
              v-if="selectedCemetery?.id && !(isMobile && showInfoMobile)"
            >
              <div class="flex justify-between items-start flex-wrap">
                <div>
                  <div
                    class="align-c flex gap-fluid items-baseline max-lg:leading-6"
                  >
                    <img
                      :src="getReligionIcon(selectedCemetery)"
                      :alt="
                        selectedCemetery?.religion ||
                        selectedCemetery?.type ||
                        'cemetery'
                      "
                      class="w-6 h-6"
                    />
                    <h3 class="text-fluid text-[#201001] font-foglihten">
                      {{ selectedCemetery?.name }}
                    </h3>
                  </div>
                  <p class="text-[#939393] text-sm mt-[4px] mb-[8px]">
                    {{ selectedCemetery?.type }}
                  </p>
                </div>
                <div
                  class="flex gap-4 items-center max-lg:flex-col my-[14.5px] max-lg:items-start max-lg:gap-[6px] max-lg:my-0"
                >
                  <div class="flex gap-[8px] items-center">
                    <div
                      class="w-[36px] h-[16px] rounded-sm bg-[#43DC4966] border-2 border-[#43DC49]"
                    ></div>
                    <p class="text-sm sm:text-[13px]">
                      {{ $t('reserve.freePlaces') }} {{ selectedCemetery?.free_spaces }}
                    </p>
                  </div>
                  <div class="flex gap-[8px] items-center">
                    <div
                      class="w-[36px] h-[16px] rounded-sm bg-[#DCBA4366] border-2 border-[#DCBA43]"
                    ></div>
                    <p class="text-sm sm:text-[13px]">
                      {{ $t('reserve.reservedPlaces') }} {{ selectedCemetery?.reserved_spaces }}
                    </p>
                  </div>
                  <div class="flex gap-[8px] items-center">
                    <div
                      class="w-[36px] h-[16px] rounded-sm bg-[#93939366] border-2 border-[#939393]"
                    ></div>
                    <p class="text-sm sm:text-[13px]">
                      {{ $t('reserve.occupiedPlaces') }} {{ selectedCemetery?.occupied_spaces }}
                    </p>
                  </div>
                </div>
              </div>
              <div
                class="flex items-center gap-[26px] pb-4 border-b border-b-[#eee] leading-10 max-lg:flex-col max-lg:gap-0 max-lg:items-start"
              >
                <div class="flex items-center max-lg:h-8 max-lg:mt-2">
                  <img src="/icons/pin.svg" alt="" class="mr-2" />
                  <span class="text-sm text-[#201001]">{{
                    selectedCemetery?.street_name
                  }}</span>
                </div>
                <div class="flex gap-[8px] items-center cursor-pointer" @click="openWhatsApp(selectedCemetery?.phone2 || selectedCemetery?.phone)">
                  <img src="/icons/whatsapp1.svg" alt="WhatsApp" />
                  <span class="text-[13px]">{{ formatPhone(selectedCemetery?.phone2 || selectedCemetery?.phone) }}</span>
                </div>
              </div>

              <p class="text-base text-[#222] py-4">
                {{ selectedCemetery?.description }}
              </p>
              <!-- Информация о выбранной могиле -->
              <div
                v-if="selectedGrave"
                class="bg-[#F4F0E7] p-4 rounded-lg my-4 border border-[#E9B949]"
              >
                <h4 class="text-base font-medium text-[#201001] mb-2">
                  {{ $t('reserve.selectedPlace') }}
                </h4>
                <div class="flex gap-6 text-sm">
                  <div class="flex items-center gap-2">
                    <span class="text-[#666]">{{ $t('reserve.sector') }}</span>
                    <span class="font-medium text-[#201001]">{{ selectedGrave.sector_number }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-[#666]">{{ $t('reserve.place') }}</span>
                    <span class="font-medium text-[#201001]">{{ selectedGrave.grave_number }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-[#666]">{{ $t('reserve.row') }}</span>
                    <span class="font-medium text-[#201001]">{{ selectedGrave.row_number }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2 mt-2">
                  <span class="text-[#666] text-sm">{{ $t('reserve.status') }}</span>
                  <span 
                    class="text-sm font-medium px-2 py-1 rounded"
                    :class="{
                      'bg-green-100 text-green-800': selectedGrave.status === 'free',
                      'bg-yellow-100 text-yellow-800': selectedGrave.status === 'reserved',
                      'bg-gray-100 text-gray-800': selectedGrave.status === 'occupied'
                    }"
                  >
                    {{ getGraveStatusText(selectedGrave.status) }}
                  </span>
                </div>
              </div>

              <!-- Информация о выбранной соседней могиле -->
              <div
                v-if="neighborGrave"
                class="bg-[#E3F2FD] p-4 rounded-lg my-4 border border-[#2196F3]"
              >
                <h4 class="text-base font-medium text-[#1976D2] mb-2">
                  {{ $t('reserve.selectedNeighborGrave') }}
                </h4>
                <div class="flex gap-6 text-sm">
                  <div class="flex items-center gap-2">
                    <span class="text-[#666]">{{ $t('reserve.sector') }}</span>
                    <span class="font-medium text-[#1976D2]">{{ neighborGrave.sector_number }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-[#666]">{{ $t('reserve.place') }}</span>
                    <span class="font-medium text-[#1976D2]">{{ neighborGrave.grave_number }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-[#666]">{{ $t('reserve.row') }}</span>
                    <span class="font-medium text-[#1976D2]">{{ neighborGrave.row_number }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2 mt-2">
                  <span class="text-[#666] text-sm">{{ $t('reserve.status') }}</span>
                  <span 
                    class="text-sm font-medium px-2 py-1 rounded"
                    :class="{
                      'bg-green-100 text-green-800': neighborGrave.status === 'free',
                      'bg-yellow-100 text-yellow-800': neighborGrave.status === 'reserved',
                      'bg-gray-100 text-gray-800': neighborGrave.status === 'occupied'
                    }"
                  >
                    {{ getGraveStatusText(neighborGrave.status) }}
                  </span>
                </div>
              </div>

              <div v-if="selectedGrave" class="flex gap-[24px] mt-[16px] mb-[32px]">
                <span class="text-base font-medium">{{ $t('reserve.bookingCost') }} {{ neighborGrave ? selectedCemetery?.burial_price*2 : selectedCemetery?.burial_price }} ₸</span>
              </div>

              <button
                v-if="showGraveDetails"
                class="reserve__btn"
                :disabled="selectedGrave?.status !== 'free'"
                @click="reserve"
              >
                <img
                  src="/icons/pencil.svg"
                  alt="Reserve icon"
                  class="w-5 h-5"
                />
                {{ $t('reserve.reservePlaceButton') }}
              </button>
              
              <!-- Тултип с информацией об умершем -->
              <div
                v-if="showDeceasedTooltip && deceasedTooltipData"
                class="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm max-sm:fixed max-sm:bottom-4 max-sm:left-4 max-sm:right-4 max-sm:max-w-none z-50"
              >
                <button
                  @click="closeDeceasedTooltip"
                  class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
                
                <div class="flex flex-col gap-3">
                  <!-- Фото умершего или заглушка -->
                  <div class="w-full h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      v-if="deceasedTooltipData.images && deceasedTooltipData.images.length > 0"
                      :src="deceasedTooltipData.images[0]"
                      :alt="deceasedTooltipData.deceased.full_name"
                      class="w-full h-full object-contain"
                    />
                    <div v-else class="text-gray-400 text-center">
                      <svg class="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
                      </svg>
                      <p class="text-sm">{{ $t('reserve.noPhoto') }}</p>
                    </div>
                  </div>
                  
                  <!-- Информация об умершем -->
                  <div>
                    <h4 class="font-semibold text-gray-900 text-lg">
                      {{ deceasedTooltipData.deceased.full_name }}
                    </h4>
                    <div class="text-sm text-gray-600 mt-1">
                      <p v-if="deceasedTooltipData.deceased.death_date">
                        {{ $t('reserve.deathDate') }} {{ new Date(deceasedTooltipData.deceased.death_date).toLocaleDateString('ru-RU') }}
                      </p>
                      <p v-if="deceasedTooltipData.grave.sector_number && deceasedTooltipData.grave.grave_number">
                        {{ $t('reserve.placeLabel') }} {{ deceasedTooltipData.grave.sector_number }}-{{ deceasedTooltipData.grave.grave_number }}
                      </p>
                    </div>
                  </div>
                  
                  <!-- Кнопка маршрута -->
                  <button 
                    @click="openRoute"
                    class="w-full text-white py-2 px-4 rounded-lg transition-colors"
                    style="background-color: #d1a53f;"
                    :style="{ 'background-color': '#d1a53f' }"
                    @mouseover="$event.target.style.backgroundColor = '#b88f34'"
                    @mouseout="$event.target.style.backgroundColor = '#d1a53f'"
                  >
                    {{ $t('reserve.route') }}
                  </button>
                </div>
              </div>
              
              <!-- Второй тултип (больший) с информацией об умершем -->
              <div
                v-if="showSecondTooltip && secondTooltipData"
                class="absolute bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-md max-sm:fixed max-sm:bottom-4 max-sm:left-4 max-sm:right-4 max-sm:top-auto max-sm:max-w-none max-sm:z-50 max-sm:p-4"
                :style="isMobile ? { top: 'auto', right: 'auto' } : { top: '-300px', right: '-200px' }"
              >
                <button
                  @click="closeDeceasedTooltip"
                  class="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
                
                <div class="flex flex-col gap-4">
                  <!-- Фото умершего или заглушка -->
                  <div class="w-full h-48 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      v-if="secondTooltipData.images && secondTooltipData.images.length > 0"
                      :src="secondTooltipData.images[0]"
                      :alt="secondTooltipData.deceased.full_name"
                      class="w-full h-full object-contain"
                    />
                    <div v-else class="text-gray-400 text-center">
                      <svg class="w-16 h-16 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
                      </svg>
                      <p class="text-base">{{ $t('reserve.noPhoto') }}</p>
                    </div>
                  </div>
                  
                  <!-- Информация об умершем -->
                  <div>
                    <h4 class="font-semibold text-gray-900 text-xl mb-2">
                      {{ secondTooltipData.deceased.full_name }}
                    </h4>
                    <div class="text-base text-gray-600 space-y-1">
                      <p v-if="secondTooltipData.deceased.death_date">
                        <span class="font-medium">{{ $t('reserve.deathDate') }}</span> {{ new Date(secondTooltipData.deceased.death_date).toLocaleDateString('ru-RU') }}
                      </p>
                      <p v-if="secondTooltipData.grave.sector_number && secondTooltipData.grave.grave_number">
                        <span class="font-medium">{{ $t('reserve.placeLabel') }}</span> {{ secondTooltipData.grave.sector_number }}-{{ secondTooltipData.grave.grave_number }}
                      </p>
                      <p v-if="secondTooltipData.grave.cemetery_name">
                        <span class="font-medium">{{ $t('reserve.cemetery') }}</span> {{ secondTooltipData.grave.cemetery_name }}
                      </p>
                    </div>
                  </div>
                  
                  <!-- Кнопка маршрута -->
                  <button 
                    @click="openRoute"
                    class="w-full text-white py-3 px-6 rounded-lg transition-colors text-lg font-medium"
                    style="background-color: #d1a53f;"
                    :style="{ 'background-color': '#d1a53f' }"
                    @mouseover="$event.target.style.backgroundColor = '#b88f34'"
                    @mouseout="$event.target.style.backgroundColor = '#d1a53f'"
                  >
                    {{ $t('reserve.route') }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Блок информации о выбранной могиле -->
            <!--        <div-->
            <!--          class="bg-[#FFF] p-[24px] mt-[24px] rounded-lg"-->
            <!--          v-if="showGraveDetails && selectedGrave"-->
            <!--        >-->
            <!--          <div class="flex justify-between items-center">-->
            <!--            <h3 class="text-2xl font-medium text-[#222222]">-->
            <!--              Участок {{ selectedGrave.sector_number }}-{{-->
            <!--                selectedGrave.grave_number-->
            <!--              }}-->
            <!--            </h3>-->
            <!--            <div class="flex gap-[34px] items-center">-->
            <!--              <button-->
            <!--                class="flex items-center gap-[8px] text-base font-medium text-[#222222]"-->
            <!--                @click="shareGraveData"-->
            <!--              >-->
            <!--                <img src="/icons/share.svg" alt="" /> Отправить-->
            <!--              </button>-->
            <!--              <button-->
            <!--                class="w-[90px] h-[50px] border-2 border-[#224C4F] rounded-lg bg-[#fff] text-[#224C4F] text-base font-medium"-->
            <!--                @click="cancelGraveSelection"-->
            <!--              >-->
            <!--                Отмена-->
            <!--              </button>-->
            <!--              <button-->
            <!--                v-if="selectedGrave.status == 'free'"-->
            <!--                class="w-[257px] h-[50px] border-2 border-[#224C4F] rounded-lg bg-[#224C4F] text-[#fff] text-base font-medium"-->
            <!--                @click="reserve"-->
            <!--              >-->
            <!--                Забронировать место-->
            <!--              </button>-->
            <!--            </div>-->
            <!--          </div>-->
            <!--          <p class="text-[#939393] text-sm mt-[4px] mb-[8px]">-->
            <!--            {{ getGraveStatusText(selectedGrave.status) }}-->
            <!--          </p>-->
            <!--          &lt;!&ndash; Блок фотографий участка &ndash;&gt;-->
            <!--          <div-->
            <!--            v-if="-->
            <!--              selectedGrave &&-->
            <!--              selectedGrave.photos_urls &&-->
            <!--              selectedGrave.photos_urls.length > 0-->
            <!--            "-->
            <!--            class="mb-6"-->
            <!--          >-->
            <!--            <div class="flex gap-4 overflow-x-auto pb-2">-->
            <!--              <div-->
            <!--                v-for="(photo, index) in selectedGrave.photos_urls"-->
            <!--                :key="index"-->
            <!--                class="min-w-[200px] h-[150px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0"-->
            <!--              >-->
            <!--                <img-->
            <!--                  :src="photo"-->
            <!--                  :alt="`Фото участка ${index + 1}`"-->
            <!--                  class="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"-->
            <!--                />-->
            <!--              </div>-->
            <!--            </div>-->
            <!--          </div>-->
            <!--          <div v-else class="mb-6">-->
            <!--            <div class="flex gap-4 overflow-x-scroll">-->
            <!--              <div-->
            <!--                class="w-[752px] h-[221px] aspect-square rounded-lg overflow-hidden bg-gray-100 flex overflow-x-scroll"-->
            <!--              >-->
            <!--                <img-->
            <!--                  src="/images/placeholder.png"-->
            <!--                  alt="Фото"-->
            <!--                  class="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"-->
            <!--                />-->
            <!--                <img-->
            <!--                  src="/images/placeholder.png"-->
            <!--                  alt="Фото"-->
            <!--                  class="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"-->
            <!--                />-->
            <!--              </div>-->
            <!--            </div>-->
            <!--          </div>-->

            <!--          <div class="flex gap-[24px] items-center text-[#222222]">-->
            <!--            <div class="flex gap-[8px] items-center">-->
            <!--              <span class="text-sm"-->
            <!--                >Сектор: {{ selectedGrave.sector_number }}</span-->
            <!--              >-->
            <!--            </div>-->
            <!--            <div class="flex gap-[8px] items-center">-->
            <!--              <span class="text-sm"-->
            <!--                >Место: {{ selectedGrave.grave_number }}</span-->
            <!--              >-->
            <!--            </div>-->
            <!--            <div class="flex gap-[8px] items-center">-->
            <!--              <span class="text-sm"-->
            <!--                >Размер: {{ selectedGrave.width }}x{{-->
            <!--                  selectedGrave.height-->
            <!--                }}-->
            <!--                м</span-->
            <!--              >-->
            <!--            </div>-->
            <!--          </div>-->
            <!--          <div class="flex gap-[24px] mt-[16px] mb-[32px]">-->
            <!--            <span class="text-base font-medium"-->
            <!--              >Статус: {{ getGraveStatusText(selectedGrave.status) }}</span-->
            <!--            >-->
            <!--            <span class="text-base font-medium"-->
            <!--              >ID участка: {{ selectedGrave.id }}</span-->
            <!--            >-->
            <!--          </div>-->
            <!--          <p class="text-base text-[#222222]">-->
            <!--            {{-->
            <!--              selectedGrave.description || "Информация об участке отсутствует"-->
            <!--            }}-->
            <!--          </p>-->
            <!--        </div>-->
          </div>
        </div>
      </div>
    </div>
    <ShareCoordModal
      :visible="shareCoordModalState"
      :lat="graveLat"
      :lng="graveLng"
      @close="shareCoordModalState = false"
    />
    
    <!-- Модальное окно с детальной информацией о могиле -->
    <GraveDetailModal 
      :visible="showGraveModal" 
      :grave="graveModalData?.grave" 
      :images="graveModalData?.images" 
      @close="showGraveModal = false" 
    />
  </main>
</template>

<style lang="scss" scoped>
.container {
  max-width: 1200px;
  width: 100%;
  margin: auto;
}

.reserve__city {
  margin-bottom: clamp(8px, 2vw, 14px);
}

.cemetry__item {
  padding: clamp(12px, 3vw, 32px) 20px;
  transition: all 0.4 ease;
  &:hover {
    background-color: #f4e4be;
  }
}

.arrow {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-right: 1px solid #201001;
  border-bottom: 1px solid #201001;
  transform: rotate(-45deg);
}

.gap-fluid {
  gap: clamp(8px, 2vw, 16px);
}

.text-fluid {
  font-size: clamp(20px, 3vw, 2rem);
}

.max-w-fluid {
  max-width: clamp(300px, 31vw, 408px);
  @media (max-width: 640px) {
    max-width: 100%;
    margin-top: -10px;
    position: relative;
    z-index: 10;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    box-shadow: 0px 14px 37px 0px rgba(0, 0, 0, 0.1);
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
  transition: all 150ms ease;
}

.reserve__btn:hover {
  background: #d1a53f;
}

.reserve__btn:active {
  background: #b88f34;
}

.reserve__btn:disabled {
  color: #999999;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* плавное появление/скрытие со сменой display через v-show */
.collapse-fade-enter-active,
.collapse-fade-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease, transform 0.3s ease;
  overflow: hidden;
}
.collapse-fade-enter-from,
.collapse-fade-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-6px);
}
.collapse-fade-enter-to,
.collapse-fade-leave-from {
  max-height: 900px; /* достаточно больше реального контента */
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 930px) {
  .align-c {
    align-items: center;
  }
}

@media (max-width: 768px) {
  .main-mt {
    margin-top: 56px;
  }
}

/* Стили для блока информации о выбранной могиле */
.grave-info-block {
  background: linear-gradient(135deg, #F4F0E7 0%, #F9F7F0 100%);
  border: 2px solid #E9B949;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
  box-shadow: 0 2px 8px rgba(233, 185, 73, 0.1);
  transition: all 0.3s ease;
}

.grave-info-block:hover {
  box-shadow: 0 4px 12px rgba(233, 185, 73, 0.15);
  transform: translateY(-1px);
}

.grave-info-title {
  color: #201001;
  font-weight: 600;
  margin-bottom: 12px;
  font-size: 16px;
}

.grave-info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.grave-info-label {
  color: #666;
  font-weight: 500;
}

.grave-info-value {
  color: #201001;
  font-weight: 600;
}

.grave-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.grave-status-free {
  background-color: #D1FAE5;
  color: #065F46;
}

.grave-status-reserved {
  background-color: #FEF3C7;
  color: #92400E;
}

.grave-status-occupied {
  background-color: #F3F4F6;
  color: #374151;
}
</style>
