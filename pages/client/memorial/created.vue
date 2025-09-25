<script setup>
import { computed } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const router = useRouter();

// Предполагаем, что эти стейты уже есть у тебя в процессе создания
// Если приходишь с другого роута — прокинь через query/useState/Pinia.
const burial = useState("burial", () => null);
const imagePreviews = useState("imagePreviews", () => []); // [{url}]
const epitaph = useState("epitaph", () => "");
const aboutPerson = useState("aboutPerson", () => "");
const videos = Array.from({ length: 6 }); // пока моковые данные
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
  <NuxtLayout
    name="client"
    content-class="bg-transparent py-0 px-0 max-sm:bg-white"
  >
    <div>
      <button
        class="btn-back mb-6 mr-4 ml-[2px] text-base text-[#B88F34] font-medium flex items-center"
        @click="goBack"
      >
        <img
          class="w-4 h-4 mr-[10px]"
          src="/icons/arrow-left-orange.svg"
          alt=""
        />
        Вернуться
      </button>

      <div class="bg-white py-6 px-[18px] rounded-2xl max-sm:p-0">
        <!-- Заголовок + Поделиться -->
        <div class="flex justify-between items-center gap-2">
          <div>
            <p class="text-sm text-[#999] max-sm:hidden">Мемориал</p>
            <h1 class="font-medium font-foglihten text-[clamp(24px,3vw,32px)]">
              {{ fullName }}
            </h1>
          </div>

          <button
            class="flex items-center gap-2 bg-[#00000014] py-[10px] px-4 rounded-[10px] hover:bg-[#AFB5C166] active:bg-[#AFB5C199] transition max-sm:bg-transparent"
          >
            <img src="/icons/share.svg" alt="" class="max-sm:w-5 max-sm:h-5" />
            <span class="max-sm:hidden">Поделиться</span>
          </button>
        </div>

        <!-- Верхняя сетка: галерея + инфобокс -->
        <div class="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 mt-4">
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
              <div class="flex items-center h-[30px] gap-[11px]">
                <div class="w-[110px] text-base text-[#050202]">Кладбище:</div>
                <div class="text-sm text-[#999]">{{ cemeteryName }}</div>
              </div>

              <div class="flex flex-wrap gap-x-6">
                <div class="flex items-center h-[30px] gap-[11px]">
                  <div class="w-[100px] text-base text-[#050202]">Сектор</div>
                  <div class="text-sm text-[#999]">{{ sector }}</div>
                </div>
                <div class="flex items-center h-[30px] gap-[11px]">
                  <div class="w-[100px] text-base text-[#050202]">Место:</div>
                  <div class="text-sm text-[#999]">{{ place }}</div>
                </div>
              </div>

              <div class="flex items-center h-11 gap-[11px]">
                <div class="w-[110px] text-base text-[#050202]">
                  Координаты:
                </div>
                <div class="text-sm text-[#999]">{{ coords }}</div>
              </div>
            </div>
          </aside>
        </div>

        <section class="py-6 px-5 rounded-2xl bg-[#F6F7F8] max-sm:mt-4">
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
        <section class="my-6 max-sm:my-4">
          <h3 class="text-[18px] font-semibold mb-4">Видеоматериалы:</h3>

          <Swiper
            :modules="[Navigation]"
            :slides-per-view="'auto'"
            :space-between="24"
            :navigation="{
              prevEl: '.btn-prev',
              nextEl: '.btn-next',
            }"
            class="relative overflow-visible"
          >
            <SwiperSlide
              v-for="(v, i) in videos"
              :key="i"
              :style="{ width: '200px', height: '200px' }"
              class="bg-[#F6F7F8] rounded-2xl flex items-center justify-center"
            >
              <button
                class="absolute rounded-full bg-[#374151] flex items-center justify-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <img
                  src="/icons/play.svg"
                  alt=""
                  class="bg-white rounded-full"
                />
              </button>
            </SwiperSlide>
            <!-- Кастомные кнопки -->
            <button
              class="btn-prev absolute -left-[15px] top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center z-10 cursor-pointer"
            >
              <img src="/icons/btn-prev.svg" alt="prev" />
            </button>

            <button
              class="btn-next absolute -right-[15px] top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center z-10 cursor-pointer"
            >
              <img src="/icons/btn-next.svg" alt="next" />
            </button>
          </Swiper>
        </section>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 max-sm:gap-4">
          <!-- Подписки -->
          <section class="bg-[#F6F7F8] rounded-2xl p-6">
            <h3
              class="text-[20px] font-semibold mb-4 max-sm:text-[18px] max-sm:mb-2"
            >
              Подписки
            </h3>

            <ul class="space-y-5 max-sm:space-y-2">
              <li
                v-for="s in subs"
                :key="s.id"
                class="flex items-center justify-between"
              >
                <span class="text-[15px] font-medium text-[#00000085]">{{
                  s.name
                }}</span>

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
            <div class="flex items-center justify-between">
              <h3 class="text-[18px] font-semibold">Одноразовые услуги</h3>

              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-lg border border-[#1E66F5] px-3 py-1.5 text-[14px] font-medium text-[#1E66F5] hover:bg-[#EFF5FF] transition"
              >
                <span class="text-[28px] font-normal leading-3 -mt-[2px]"
                  >+</span
                >
                Добавить
              </button>
            </div>

            <p class="mt-3 text-[15px] font-medium text-[#6B7280] max-sm:mt-2">
              Не выбрано
            </p>
          </section>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
.btn-prev img,
.btn-next img {
  box-shadow: 8px 19px 38px 14px rgba(8, 9, 10, 0.08);
  border-radius: 50%;
}
</style>
