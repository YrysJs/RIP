<script setup>
import { ref, watch } from "vue";
import { createDeceased, createBurialRequest } from "~/services/client";
import { useRouter } from "vue-router";
import { useCemeteryStore } from "~/store/cemetery";
import { pkbGetDeceasedData } from "~/services/login/index.js";
import { useLoadingStore } from "~/store/loading.js";

const router = useRouter();
const cemeteryStore = useCemeteryStore();

// Заглушка: включить/выключить одним флагом
const STUB_MODE = true;

const switcher = ref(false);
const inn = ref("");
const fullName = ref("");
const deathDate = ref("");
const burialDate = ref("");
const burialTime = ref("");
const isFcb = ref(false);

const loadingStore = useLoadingStore();

watch(inn, async (newValue) => {
  if (newValue.length !== 12) return;

  try {
    loadingStore.startLoading();
    const response = await pkbGetDeceasedData({
      iin: newValue,
    });
    isFcb.value = true;
    fullName.value = capitalizeFullName(
      response.data.data.person_data.fullName
    );
    loadingStore.stopLoading();
    console.log("Ответ от pkbGetData:", response);
  } catch (err) {
    console.error("Ошибка при запросе:", err);
  }
});

function capitalizeFullName(str) {
  return str
    .toLowerCase() // всё в нижний регистр
    .split(" ") // разбиваем на слова
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // капиталайз каждого слова
    .join(" "); // склеиваем обратно
}

// Функция для бронирования
const handleBooking = async () => {
  if (STUB_MODE) {
    try {
      loadingStore.startLoading();
      // можно проверить минимальные поля (по желанию)
      if (!inn.value || !fullName.value) {
        loadingStore.stopLoading();
        alert("Заглушка: заполните ИИН и ФИО, пожалуйста.");
        return;
      }

      // имитация сетевой задержки
      await new Promise((r) => setTimeout(r, 700));

      // здесь можно записать что-то в консоль, чтобы видеть данные
      console.log("[STUB] Забронировать место:", {
        cemetery_id: cemeteryStore.selectedGrave?.cemetery_id,
        grave_id: cemeteryStore.selectedGrave?.id,
        inn: inn.value,
        full_name: fullName.value,
        death_date: deathDate.value,
        burial_date: burialDate.value,
        burial_time: burialTime.value,
      });

      alert("Заглушка: место успешно забронировано (демо).");
      router.push("/client/tickets/active");
    } finally {
      loadingStore.stopLoading();
    }
    return;
  }

  try {
    loadingStore.startLoading();
    const dataBurial = {
      cemetery_id: cemeteryStore.selectedGrave.cemetery_id,
      full_name: fullName.value,
      inn: inn.value,
      death_date: deathDate.value ? deathDate.value + "T00:00:00Z" : undefined,
      grave_id: cemeteryStore.selectedGrave.id,
    };

    await createBurialRequest(dataBurial);
    router.push("/client/tickets/active");
  } catch (error) {
    console.error("Ошибка при отправке данных:", error);
    alert("Не удалось забронировать место. Попробуйте позже.");
  } finally {
    loadingStore.stopLoading();
  }
};
</script>

<template>
  <main class="max-sm:bg-white">
    <div
      class="min-h-[100vh] py-5 flex gap-6 max-sm:flex-col max-sm:py-0 max-sm:gap-0"
    >
      <div
        class="bg-white p-[20px] max-w-fluid w-full relative rounded-lg max-sm:max-w-full max-sm:pt-2 max-sm:px-[13px] max-sm:pb-0"
      >
        <button
          class="flex items-center gap-2 text-base font-medium text-[#B88F34]"
        >
          <img src="/icons/arrow-left-orange.svg" alt="" /> Вернуться к выбору
        </button>
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
          Бронирование места
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
            <h4 class="text-base text-[#050202]">Срок брони:</h4>
            <span class="text-sm text-[#999] ml-[15px] mr-[5px]">3 дня</span>
            <img src="/icons/info.svg" alt="" />
          </div>
          <div
            class="h-[38px] flex items-start gap-[27px] border-b border-b-[#2010011F]"
          >
            <div class="flex items-center gap-[11px]">
              <h4 class="text-base text-[#050202]">Сектор:</h4>
              <span class="text-sm text-[#999]">{{
                cemeteryStore.selectedGrave?.sector_number ?? "—"
              }}</span>
            </div>
            <div class="flex items-center gap-[11px]">
              <h4 class="text-base text-[#050202]">Место:</h4>
              <span class="text-sm text-[#999]">{{
                cemeteryStore.selectedGrave?.grave_number ?? "—"
              }}</span>
            </div>
          </div>
          <div
            class="h-[46px] flex items-center gap-[11px] border-b border-b-[#2010011F]"
          >
            <h4 class="text-base text-[#050202]">ФИО покойного:</h4>
            <span class="text-sm text-[#999]">{{ fullName || "" }}Someone</span>
          </div>
          <div class="h-[38px] flex items-end gap-[11px]">
            <h4 class="text-base text-[#050202]">Дата похорон:</h4>
            <span
              class="text-sm"
              :class="
                burialDate
                  ? 'font-bold text-[#222222]'
                  : 'font-light text-[#939393]'
              "
            >
              {{ burialDate || "Не указано" }} {{ burialTime || "" }}
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
          Бронирование места
        </h3>
        <div class="text-4xl font-semibold">
          <div
            class="py-4 flex items-center gap-[10px] max-sm:py-0 max-sm:h-11 max-sm:mb-4"
          >
            <h3 class="text-fluid-27 font-medium text-[#222222]">
              Укажите данные покойного
            </h3>
          </div>
          <div class="grid grid-cols-2 gap-[16px] max-lg:grid-cols-1">
            <div class="flex flex-col">
              <input
                v-model="inn"
                type="text"
                class="py-[18px] px-3 w-[100%] !border !border-[#AFB5C166] rounded-lg text-base input"
                placeholder="ИИН"
              />
              <span class="text-sm text-[#D63C3C]"
                >Поле обязательно к заполнению</span
              >
            </div>
            <div class="flex flex-col">
              <input
                v-model="fullName"
                type="text"
                class="py-[18px] px-3 w-[100%] !border !border-[#AFB5C166] rounded-lg text-base input"
                placeholder="ФИО"
              />
              <span class="text-sm text-[#D63C3C]"
                >Поле обязательно к заполнению</span
              >
            </div>
          </div>
        </div>
        <div
          class="w-full bg-[#fff] rounded-[16px] font-medium text-[#222222] my-4"
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
          </div>
          <div
            v-if="switcher"
            class="switcher-data grid grid-cols-2 gap-[12px] gap-y-[24px] mt-4"
          >
            <div>
              <p class="text-sm text-[#222222] font-normal">Дата смерти</p>
              <input
                v-model="deathDate"
                type="date"
                class="w-[100%] h-[60px] !border !border-[#AFB5C166] text-[#5C6771E6] rounded-lg pl-[16px] text-base input"
              />
            </div>
            <div>
              <p class="text-sm text-[#222222] font-normal">
                Заключение о смерти от мед учереждении:
              </p>
              <label
                for="file"
                class="flex items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
              >
                <img src="/icons/upload.svg" alt="upload" class="w-5 h-5" />
                <span>
                  <span class="text-[#B88F34]">Загрузите файлы</span> или
                  перетащите их
                </span>
              </label>
              <input id="file" type="file" class="hidden" multiple />
            </div>
            <div>
              <p class="text-sm text-[#222222] font-normal">Дата похорон</p>
              <input
                v-model="burialDate"
                type="date"
                class="w-[100%] h-[60px] !border !border-[#AFB5C166] text-[#5C6771E6] rounded-lg pl-[16px] text-base input"
              />
            </div>
            <div>
              <p class="text-sm text-[#222222] font-normal">Время похорон</p>
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
          Забронировать место
        </button>
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
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
