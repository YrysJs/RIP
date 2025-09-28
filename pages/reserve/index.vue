<script setup>
import { useRouter } from "vue-router";
import MapSecond from "~/components/map/MapV2.vue";
import { useCemeteryStore } from "~/store/cemetery.js";
import { getCemeteries, getGraves } from "~/services/cemetery";
import ShareCoordModal from "~/components/layout/modals/ShareCoordModal.vue";
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import AppHeader from "~/components/layout/AppHeader.vue";

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
const religios = ["Ислам", "Христианство", "Иудаизм", "Католицизм", "Буддизм"];

const selectedCity = ref("");
const cityListState = ref(false);
const cemeteryStore = useCemeteryStore();

const selected = ref(null);
const cemetriessList = ref([]);
const selectedCemetery = ref({});
const gravesList = ref([]);
const selectedGrave = ref(null);
const showGraveDetails = ref(false);

const showList = computed(() => !(isMobile.value && showInfoMobile.value));

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
      selectedGrave.value
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
  showInfoMobile.value = false;
};

async function getCemeteriesReq() {
  try {
    const params = {};

    if (selectedCity.value && selectedCity.value !== "") {
      params.city = selectedCity.value;
    }

    if (selectedReligios.value && selectedReligios.value !== "Не выбрано") {
      params.religion = selectedReligios.value;
    }

    const response = await getCemeteries(params);
    cemetriessList.value = response?.data?.data ?? [];

    // 🔽 Автовыбор первого кладбища
    if (cemetriessList.value.length) {
      const first = cemetriessList.value[0];

      // если текущее не из нового списка или пусто — выбираем первое
      const stillExists = !!cemetriessList.value.find(
        (c) => c.id === selectedCemetery.value?.id
      );
      if (!stillExists) {
        // тихо выставляем (без мобильного showInfo)
        selectedCemetery.value = first; // триггерит watch(selectedCemetery)
        showInfoMobile.value = false; // чтобы не открывать карточку на мобиле
      }
    } else {
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

async function getGravesReq(cemetery_id) {
  try {
    if (!cemetery_id) return;

    const response = await getGraves({ cemetery_id });
    gravesList.value = response.data.data || [];
  } catch (error) {
    gravesList.value = [];
  }
}

watch(selectedCity, () => {
  getCemeteriesReq();
});

watch(selectedReligios, () => {
  getCemeteriesReq();
});

watch(selectedCemetery, (newCemetery) => {
  if (newCemetery && newCemetery.id) {
    getGravesReq(newCemetery.id);
    // Сохраняем выбранное кладбище в store
    cemeteryStore.setSelected(newCemetery);
    // Очищаем предыдущий выбор могилы при смене кладбища
    if (selectedGrave.value) {
      cancelGraveSelection();
    }
  }
});

watch(selected, (newSelected) => {
  if (newSelected) {
    selectedGrave.value = newSelected;
    showGraveDetails.value = true;
    // Сохраняем выбранную могилу в store
    cemeteryStore.setSelectedGrave(newSelected);
  }
});

onMounted(async () => {
  await getCemeteriesReq();
});

const cancelGraveSelection = () => {
  selectedGrave.value = null;
  showGraveDetails.value = false;
  selected.value = null;
  // Очищаем выбранную могилу из store
  cemeteryStore.clearSelectedGrave();
};

const getGraveStatusText = (status) => {
  switch (status) {
    case "free":
      return "Свободное место";
    case "reserved":
      return "Зарезервировано";
    case "occupied":
      return "Занято";
    default:
      return "Неизвестно";
  }
};

const graveLat = ref(null);
const graveLng = ref(null);

const shareGraveData = () => {
  graveLat.value = selected.value.polygon_data.coordinates[0][1];
  graveLng.value = selected.value.polygon_data.coordinates[0][0];
  shareCoordModalState.value = true;
};

const isMobile = ref(false);
const showInfoMobile = ref(false);

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
</script>

<template>
  <main>
    <AppHeader type="client" />
    <div class="container">
      <div
        class="py-[24px] min-h-[calc(100vh-104px)] mt-[104px] rounded-lg gap-[24px] max-sm:py-0 max-sm:gap-0"
      >
        <div
          class="w-full relative flex max-sm:flex-col-reverse gap-6 max-sm:gap-0"
        >
          <transition name="collapse-fade">
            <div
              v-show="showList"
              class="max-w-fluid w-full bg-white p-5 max-sm:py-6 max-sm:px-4 rounded-lg"
            >
              <h3 class="font-foglihten text-fluid">Забронировать место</h3>

              <div class="reserve__city flex justify-between items-center">
                <div class="flex justify-between items-center">
                  <span class="text-base text-[#050202] mr-[15px]">Город:</span>
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
                  <template v-else> Не выбрано </template>
                </div>
                <button
                  class="bg-[#224C4F26] text-[#224C4F] font-bold py-[8px] px-[12px] rounded-lg"
                  @click="cityListState = true"
                >
                  Выбрать
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
                placeholder="Религия"
                class="w-full border border-[#EEEEEE] rounded-lg py-[8px] px-[12px] input select"
              >
                <option value="" disabled>Религия</option>
                <option v-for="item of religios" :key="item" :value="item">
                  {{ item }}
                </option>
              </select>

              <p class="text-[#222222]">
                {{ cemetriessList.length }} результатов
              </p>

              <!-- Список кладбищ -->

              <div class="flex flex-col gap-[12px] mt-[24px]">
                <template v-if="!cemetriessList.length">
                  <div
                    class="p-[16px] border rounded-lg text-sm text-[#666] bg-[#fafafa]"
                  >
                    Ничего не найдено. Измените фильтры или выберите город.
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
                      <div>{{ item.distance }}км</div>
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
              class="w-full h-[50vh] rounded-xl overflow-hidden max-sm:rounded-none"
            >
              <ClientOnly>
                <MapSecond
                  :polygons="gravesList"
                  :cemetery-boundary="selectedCemetery"
                  :center-coords="selectedCemetery.location_coords"
                  v-model="selected"
                />
                <template #fallback>
                  <div
                    class="w-full h-full flex items-center justify-center text-[#666]"
                  >
                    Загрузка карты…
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
                !showGraveDetails &&
                showInfoMobile
              "
            >
              <transition name="fade-slide">
                <div
                  :key="selectedCemetery?.id"
                  class="bg-[#FFF] py-6 px-[18px] rounded-lg"
                  v-if="selectedCemetery?.id && !showGraveDetails"
                >
                  <div
                    class="relative flex justify-between items-start max-sm:flex-col"
                  >
                    <button
                      class="absolute top-0 right-0"
                      @click="
                        showInfoMobile = false;
                        selectedCemetery = {};
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
                          Сводобные места: {{ selectedCemetery?.free_spaces }}
                        </p>
                      </div>
                      <div class="flex gap-[8px] items-center">
                        <div
                          class="w-[36px] h-[16px] rounded-sm bg-[#DCBA4366] border-2 border-[#DCBA43]"
                        ></div>
                        <p class="text-sm sm:text-[13px]">
                          Зарезервировано: {{ selectedCemetery?.reserved }}
                        </p>
                      </div>
                      <div class="flex gap-[8px] items-center">
                        <div
                          class="w-[36px] h-[16px] rounded-sm bg-[#93939366] border-2 border-[#939393]"
                        ></div>
                        <p class="text-sm sm:text-[13px]">
                          Занято: {{ selectedCemetery?.taken }}
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
                      <span class="text-[#999] text-sm ml-1"
                        >({{ selectedCemetery?.distance }} км от вас)</span
                      >
                    </div>
                    <div class="flex gap-[8px] items-center">
                      <img src="/icons/phone.svg" alt="" />
                      <a
                        :href="`tel:${selectedCemetery?.phone2}`"
                        class="text-[13px]"
                        >{{ selectedCemetery?.phone }}</a
                      >
                    </div>
                  </div>

                  <!-- <div class="flex gap-[24px] mt-[16px] mb-[32px]">
          <span class="text-base font-medium"
            >Вместимость: {{ selectedCemetery?.capacity }}</span
          >
          <span class="text-base font-medium"
            >Cвободных мест: {{ selectedCemetery?.free_spaces }}</span
          >
          <span class="text-base font-medium">Стоимость брони: 10 000₸</span>
        </div> -->
                  <p class="text-base text-[#222] py-4">
                    {{ selectedCemetery?.description }}
                  </p>

                  <button class="reserve__btn w-full" @click="reserve">
                    <img
                      src="/icons/pencil.svg"
                      alt="Reserve icon"
                      class="w-5 h-5"
                    />
                    Забронировать место
                  </button>
                </div>
              </transition>
            </Teleport>

            <!-- Инфо по кладбищу -->
            <div
              class="bg-[#FFF] py-6 px-[18px] mt-2 rounded-lg"
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
                      Сводобные места: {{ selectedCemetery?.free_spaces }}
                    </p>
                  </div>
                  <div class="flex gap-[8px] items-center">
                    <div
                      class="w-[36px] h-[16px] rounded-sm bg-[#DCBA4366] border-2 border-[#DCBA43]"
                    ></div>
                    <p class="text-sm sm:text-[13px]">
                      Зарезервировано: {{ selectedCemetery?.reserved }}
                    </p>
                  </div>
                  <div class="flex gap-[8px] items-center">
                    <div
                      class="w-[36px] h-[16px] rounded-sm bg-[#93939366] border-2 border-[#939393]"
                    ></div>
                    <p class="text-sm sm:text-[13px]">
                      Занято: {{ selectedCemetery?.taken }}
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
                  <span class="text-[#999] text-sm ml-1"
                    >({{ selectedCemetery?.distance }} км от вас)</span
                  >
                </div>
                <div class="flex gap-[8px] items-center">
                  <img src="/icons/phone.svg" alt="" />
                  <a
                    :href="`tel:${selectedCemetery?.phone2}`"
                    class="text-[13px]"
                    >{{ selectedCemetery?.phone }}</a
                  >
                </div>
              </div>

              <!-- <div class="flex gap-[24px] mt-[16px] mb-[32px]">
          <span class="text-base font-medium"
            >Вместимость: {{ selectedCemetery?.capacity }}</span
          >
          <span class="text-base font-medium"
            >Cвободных мест: {{ selectedCemetery?.free_spaces }}</span
          >
          <span class="text-base font-medium">Стоимость брони: 10 000₸</span>
        </div> -->
              <p class="text-base text-[#222] py-4">
                {{ selectedCemetery?.description }}
              </p>

              <button
                v-if="showGraveDetails"
                class="reserve__btn"
                @click="reserve"
              >
                <img
                  src="/icons/pencil.svg"
                  alt="Reserve icon"
                  class="w-5 h-5"
                />
                Забронировать место
              </button>
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
</style>
