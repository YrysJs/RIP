<script setup>
import { computed } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { getMemorialById } from "~/services/client";

const router = useRouter();
const route = useRoute();

const memorial = ref(null);
const burial = ref(null);
const images = ref([]);
const videos = ref([]);
const epitaph = ref("");
const aboutPerson = ref("");

const isLoading = ref(true);
const errorMsg = ref("");

// --- helpers ---
const extractYouTubeId = (url) => {
  const regExp =
    /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|[?&]v=)([^#&?]{11}).*/;
  const m = String(url || "").match(regExp);
  return m ? m[1] : null;
};
const normalizeYouTubeUrl = (raw) => {
  const id = extractYouTubeId(raw);
  return id
    ? `https://www.youtube.com/watch?v=${id}`
    : String(raw || "").trim();
};
const uniqueUrls = (arr) => {
  const set = new Set();
  const res = [];
  for (const u of arr) {
    const n = normalizeYouTubeUrl(u);
    if (n && !set.has(n)) {
      set.add(n);
      res.push(n);
    }
  }
  return res;
};

// --- API load ---
onMounted(async () => {
  try {
    const id = route.query.id || route.params.id;
    if (!id) throw new Error("Нет id мемориала в URL");

    const { data } = await getMemorialById(id);
    memorial.value = data;
    epitaph.value = data.epitaph || "";
    aboutPerson.value = data.about_person || "";

    burial.value = {
      cemetery_name: data.cemetery_name,
      sector_number: data.sector_number,
      grave_id: data.grave_id,
      deceased: data.deceased || {},
    };

    // фото
    images.value = (data.photo_urls || []).map((url, i) => ({ id: i, url }));

    // видео
    const rawVideo = Array.isArray(data.video_urls)
      ? data.video_urls
      : data.video_urls
      ? [data.video_urls]
      : [];
    const flattened = rawVideo
      .flatMap((v) => String(v).split(","))
      .map((s) => s.trim())
      .filter(Boolean);
    const clean = uniqueUrls(flattened);
    videos.value = clean
      .map((u, i) => {
        const id = extractYouTubeId(u);
        return id
          ? { id: i, url: u, embedUrl: `https://www.youtube.com/embed/${id}` }
          : null;
      })
      .filter(Boolean);
  } catch (e) {
    console.error(e);
    errorMsg.value = e?.response?.data?.message || e.message;
  } finally {
    isLoading.value = false;
  }
});

// --- computed для UI ---
const gallery = computed(() => images.value.slice(0, 3));
const fullName = computed(() => burial.value?.deceased?.full_name || "");
const lifespan = computed(() => {
  const birth = burial.value?.deceased?.birth_date
    ? new Date(burial.value.deceased.birth_date).toLocaleDateString("ru-RU")
    : "";
  const death = burial.value?.deceased?.death_date
    ? new Date(burial.value.deceased.death_date).toLocaleDateString("ru-RU")
    : "";
  return birth && death ? `${birth} — ${death}` : "";
});

function goBack() {
  router.push("/client/memorial");
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
        <div v-if="isLoading" class="p-4">Загрузка...</div>
        <div v-else-if="errorMsg" class="p-4 text-red-600">{{ errorMsg }}</div>

        <template v-else>
          <!-- Заголовок + Поделиться -->
          <div class="flex justify-between items-center gap-2">
            <div>
              <p class="text-sm text-[#999] max-sm:hidden">Мемориал</p>
              <h1
                class="font-medium font-foglihten text-[clamp(24px,3vw,32px)]"
              >
                {{ fullName }}
              </h1>
            </div>

            <button
              class="flex items-center gap-2 bg-[#00000014] py-[10px] px-4 rounded-[10px] hover:bg-[#AFB5C166] active:bg-[#AFB5C199] transition max-sm:bg-transparent"
            >
              <img
                src="/icons/share.svg"
                alt=""
                class="max-sm:w-5 max-sm:h-5"
              />
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
                <p class="text-xs text-[#666C72]">
                  Дата рождения — Дата смерти
                </p>
              </div>

              <div class="flex flex-col gap-2 mt-2">
                <div class="flex items-center h-[30px] gap-[11px]">
                  <div class="w-[110px] text-base text-[#050202]">
                    Кладбище:
                  </div>
                  <div class="text-sm text-[#999]">
                    {{ burial?.cemetery_name }}
                  </div>
                </div>

                <div class="flex flex-wrap gap-x-6">
                  <div class="flex items-center h-[30px] gap-[11px]">
                    <div class="w-[100px] text-base text-[#050202]">Сектор</div>
                    <div class="text-sm text-[#999]">
                      {{ burial?.sector_number }}
                    </div>
                  </div>
                  <div class="flex items-center h-[30px] gap-[11px]">
                    <div class="w-[100px] text-base text-[#050202]">Место:</div>
                    <div class="text-sm text-[#999]">
                      {{ burial?.grave_id }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center h-11 gap-[11px]">
                  <div class="w-[110px] text-base text-[#050202]">
                    Координаты:
                  </div>
                  <div class="text-sm text-[#999]">{{ burial?.coords }}</div>
                </div>
              </div>
            </aside>
          </div>

          <section class="py-6 px-5 rounded-2xl bg-[#F6F7F8] max-sm:mt-4">
            <!-- Эпитафия -->
            <h3
              class="text-[24px] font-medium pb-[17px] border-b border-b-[#eee]"
            >
              {{ epitaph }}
            </h3>
            <!-- О человеке -->
            <div class="pt-[17px] text-base text-[#222]">
              <p class="whitespace-pre-line">
                {{ aboutPerson }}
              </p>
            </div>
          </section>

          <!-- Видеоматериалы -->
          <section class="my-6 max-sm:my-4">
            <h3 class="text-[18px] font-semibold mb-4">Видеоматериалы:</h3>

            <div v-if="videos.length">
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
                  v-for="v in videos"
                  :key="v.id"
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
            </div>
            <p v-else class="text-sm text-[#6B7280]">Видео не добавлены.</p>
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

              <p
                class="mt-3 text-[15px] font-medium text-[#6B7280] max-sm:mt-2"
              >
                Не выбрано
              </p>
            </section>
          </div>
        </template>
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
