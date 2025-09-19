<script setup>
import { computed } from "vue";
const router = useRouter();

// Предполагаем, что эти стейты уже есть у тебя в процессе создания
// Если приходишь с другого роута — прокинь через query/useState/Pinia.
const burial = useState("burial", () => null);
const imagePreviews = useState("imagePreviews", () => []); // [{url}]
const epitaph = useState("epitaph", () => "");
const aboutPerson = useState("aboutPerson", () => "");
const videos = useState("videos", () => []); // [{embedUrl,title}]

// Фолбэки
const gallery = computed(() =>
  (imagePreviews.value?.length
    ? imagePreviews.value
    : [
        { url: "/images/memorial-1.jpg" },
        { url: "/images/memorial-2.jpg" },
        { url: "/images/memorial-3.jpg" },
      ]
  ).slice(0, 3)
);

const fullName = computed(
  () => burial.value?.deceased?.full_name || "ИВАН ИВАНОВ ИВАНОВИЧ"
);

const lifespan = computed(() => {
  const birth = burial.value?.deceased?.birth_date
    ? new Date(burial.value.deceased.birth_date).toLocaleDateString("ru-RU")
    : "01.01.1900";
  const death = burial.value?.deceased?.death_date
    ? new Date(burial.value.deceased.death_date).toLocaleDateString("ru-RU")
    : "01.01.2000";
  return `${birth} — ${death}`;
});

const cemeteryName = computed(
  () => burial.value?.cemetery_name || "Северное кладбище"
);
const sector = computed(() => burial.value?.sector_number || "1");
const place = computed(() => burial.value?.grave_id || "3");
const coords = computed(() => "56.35107309557659, 62.01158847670595");

function goBack() {
  router.push("/client/memorial");
}

const subs = ref([
  { id: 1, name: "Покраска забора", on: true },
  { id: 2, name: "Lorem ipsum", on: true, light: true }, // светло-зелёный
  { id: 3, name: "Lorem ipsum", on: false }, // серый (off)
]);

function toggle(s) {
  s.on = !s.on;
}
</script>

<template>
  <NuxtLayout name="client" content-class="bg-transparent py-0 px-0">
    <div>
      <button
        class="btn-back mb-6 mr-4 ml-[2px] text-base font-medium flex items-center"
        @click="goBack"
      >
        <img
          class="w-4 h-4 mr-[10px]"
          src="/icons/arrow-left-orange.svg"
          alt=""
        />
        Вернуться
      </button>

      <div class="bg-white py-6 px-[18px] rounded-2xl">
        <!-- Заголовок + Поделиться -->
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-[#999]">Мемориал</p>
            <h1 class="font-foglihten text-[clamp(24px,3vw,32px)] font-medium">
              {{ fullName }}
            </h1>
          </div>

          <button
            class="flex items-center gap-2 bg-[#00000014] py-[10px] px-4 rounded-[10px]"
          >
            <img src="/icons/share.svg" alt="" />
            Поделиться
          </button>
        </div>

        <!-- Верхняя сетка: галерея + инфобокс -->
        <div class="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 mt-4">
          <!-- Левая часть: большая картинка + 2 маленькие -->
          <div class="grid grid-cols-2 grid-rows-2 gap-4">
            <!-- Большая картинка на всю высоту слева -->
            <div
              class="row-span-2 rounded-xl overflow-hidden bg-[#F3F4F6] place-items-center"
            >
              <img
                :src="gallery[0]?.url"
                alt=""
                class="w-[360px] h-[250px] object-cover"
              />
            </div>

            <!-- Верхняя маленькая -->
            <div
              class="rounded-xl overflow-hidden bg-[#F3F4F6] place-items-center"
            >
              <img
                :src="gallery[1]?.url"
                alt=""
                class="w-[223px] h-[120px] object-cover"
              />
            </div>

            <!-- Нижняя маленькая -->
            <div
              class="rounded-xl overflow-hidden bg-[#F3F4F6] place-items-center"
            >
              <img
                :src="gallery[2]?.url"
                alt=""
                class="w-[223px] h-[120px] object-cover"
              />
            </div>
          </div>

          <!-- Правая часть: Информация о захоронении -->
          <aside class="bg-[#F4F0E7] p-4 md:p-5 rounded-xl">
            <h3 class="text-[18px] font-medium mb-2">
              Информация о захоронении
            </h3>

            <div class="pb-2 border-b border-b-[#2010011F]">
              <p class="text-lg text-[#1A1C1F]">{{ lifespan }}</p>
              <p class="text-xs text-[#666C72]">Дата рождения — Дата смерти</p>
            </div>

            <div class="flex flex-col gap-2 mt-2">
              <div
                class="flex justify-between items-center h-[30px] gap-[11px]"
              >
                <div class="w-[110px] text-base text-[#050202]">Кладбище:</div>
                <div class="text-sm text-[#999]">{{ cemeteryName }}</div>
              </div>

              <div class="flex flex-wrap gap-x-6">
                <div
                  class="flex justify-between items-center h-[30px] gap-[11px]"
                >
                  <div class="w-[100px] text-base text-[#050202]">Сектор</div>
                  <div class="text-sm text-[#999]">{{ sector }}</div>
                </div>
                <div
                  class="flex justify-between items-center h-[30px] gap-[11px]"
                >
                  <div class="w-[100px] text-base text-[#050202]">Место:</div>
                  <div class="text-sm text-[#999]">{{ place }}</div>
                </div>
              </div>

              <div class="flex justify-between items-center h-11 gap-[11px]">
                <div class="w-[110px] text-base text-[#050202]">
                  Координаты:
                </div>
                <div class="text-sm text-[#999]">{{ coords }}</div>
              </div>
            </div>
          </aside>
        </div>

        <section class="py-6 px-5 rounded-2xl bg-[#F6F7F8]">
          <!-- Эпитафия -->
          <h3
            class="text-[24px] font-medium pb-[17px] border-b border-b-[#eee]"
          >
            {{ epitaph || "Тут будет эпитафия, добавленная вами." }}
          </h3>
          <!-- О человеке -->
          <div class="pt-[17px] text-base text-[#222]">
            <p class="whitespace-pre-line">
              {{
                aboutPerson ||
                `Здесь — длинный текст о человеке: воспоминания семьи, добрые
                слова, истории и важные моменты жизни. Раздел поддерживает
                переносы строк и большие абзацы.`
              }}
            </p>
          </div>
        </section>

        <!-- Видеоматериалы -->
        <section class="my-6">
          <h3 class="text-[16px] md:text-[18px] font-semibold mb-4">
            Видеоматериалы:
          </h3>

          <div class="relative">
            <!-- Лента карточек -->
            <div
              class="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
            >
              <div
                v-for="i in 6"
                :key="i"
                class="min-w-[200px] h-[180px] bg-[#F6F7F8] rounded-2xl flex items-center justify-center"
              >
                <button
                  class="w-12 h-12 rounded-full bg-[#374151] flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="white"
                    viewBox="0 0 24 24"
                    class="w-6 h-6"
                  >
                    <path d="M5.25 4.5l13.5 7.5-13.5 7.5V4.5z" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Стрелка влево -->
            <button
              class="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <!-- Стрелка вправо -->
            <button
              class="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </section>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Подписки -->
          <section class="bg-[#F6F7F8] rounded-2xl p-6">
            <h3 class="text-[20px] font-semibold mb-4">Подписки</h3>

            <ul class="space-y-5">
              <li
                v-for="s in subs"
                :key="s.id"
                class="flex items-center justify-between"
              >
                <span class="text-[16px] text-[#1A1C1F]">{{ s.name }}</span>

                <!-- Тумблер -->
                <button
                  type="button"
                  @click="toggle(s)"
                  class="relative inline-flex h-7 w-[52px] items-center rounded-full transition-colors"
                  :class="[
                    s.on
                      ? s.light
                        ? 'bg-[#A8D18D]'
                        : 'bg-[#5FA938]'
                      : 'bg-[#D1D5DB]',
                  ]"
                  aria-pressed="s.on.toString()"
                >
                  <span
                    class="absolute left-1 h-5 w-5 rounded-full bg-white shadow transition-transform"
                    :class="s.on ? 'translate-x-[22px]' : 'translate-x-0'"
                  />
                </button>
              </li>
            </ul>
          </section>

          <!-- Одноразовые услуги -->
          <section class="bg-[#F6F7F8] rounded-2xl p-6">
            <div class="flex items-start justify-between">
              <h3 class="text-[20px] font-semibold">Одноразовые услуги</h3>

              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg border border-[#1E66F5] px-3 py-1.5 text-[14px] font-medium text-[#1E66F5] hover:bg-[#EFF5FF] transition"
              >
                + Добавить
              </button>
            </div>

            <p class="mt-3 text-[15px] text-[#6B7280]">Не выбрано</p>
          </section>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped></style>
