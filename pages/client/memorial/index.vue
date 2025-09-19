<script setup>
import { getMemorials } from "~/services/client";

const memorials = ref([]);
const loading = ref(true);

// === МОК-ПЕРЕКЛЮЧАТЕЛЬ ===
const USE_MOCKS = true;

// --- Моки ---
const mockGetMemorials = async () => {
  await new Promise((r) => setTimeout(r, 400));
  return {
    data: [
      {
        id: 101,
        about_person: "Иванов Иван Иванович (1948–2024)",
        is_public: true,
      },
      {
        id: 103,
        about_person: "John Doe (1970–2019)",
        is_public: true,
      },
    ],
  };
};

const getMemorialsSafe = async () => {
  if (USE_MOCKS) return mockGetMemorials();
  // return await getMemorials(); // твой реальный импорт
};

const loadMemorials = async () => {
  try {
    const response = await getMemorialsSafe();
    // const response = await getMemorials();
    memorials.value = response?.data || [];
  } catch (error) {
    console.error("Ошибка при загрузке мемориалов:", error);
    memorials.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadMemorials();
});
</script>

<template>
  <NuxtLayout name="client" content-class="bg-transparent">
    <div class="flex flex-col gap-[24px]">
      <ClientOnly>
        <div
          v-if="loading"
          class="flex justify-center items-center bg-white rounded-[16px] py-[20px] px-[12px]"
        >
          <p>Загрузка...</p>
        </div>
        <div
          v-else-if="memorials.length === 0"
          class="flex justify-center items-center bg-white rounded-[16px] py-[20px] px-[12px]"
        >
          <p>Мемориалы не найдены</p>
        </div>
        <div v-else>
          <h3 class="text-fluid font-foglihten mb-6">Цифровой мемориал</h3>
          <div class="flex flex-col gap-4">
            <div
              v-for="memorial in memorials"
              :key="memorial.id"
              class="memorial flex justify-between items-center bg-white rounded-[16px] p-[20px] gap-[30px] cursor-pointer"
              @click="$router.push(`/client/memorial/${memorial.id}`)"
            >
              <div>
                <h3 class="text-[27px] font-medium">
                  {{ memorial.about_person }}
                </h3>
                <p class="text-sm text-[#999]">
                  {{
                    memorial.is_public
                      ? "Публичный"
                      : "Доступен только по ссылке"
                  }}
                </p>
              </div>
              <!-- <div class="flex gap-4">
                <button
                  class="bg-[#EEEEEE] w-[84px] h-[28px] font-semibold text-[#D63C3C] rounded-lg"
                >
                  Скрыть
                </button>
                <button
                  class="bg-[#EEEEEE] w-[91px] h-[28px] font-semibold text-[#224C4F] rounded-lg"
                >
                  Открыть
                </button> 
              </div> -->
            </div>
          </div>
        </div>
        <template #fallback>
          <div
            class="flex justify-center items-center bg-white rounded-[16px] py-[20px] px-[12px]"
          >
            <p>Загрузка...</p>
          </div>
        </template>
      </ClientOnly>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.text-fluid {
  font-size: clamp(24px, 3vw, 32px);
}

.memorial {
  position: relative;
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 20px;
    transform: translateY(-50%) rotate(-45deg);
    width: 10px;
    height: 10px;
    border-right: 2px solid #001529;
    border-bottom: 2px solid #001529;
    pointer-events: none;
  }
}
</style>
