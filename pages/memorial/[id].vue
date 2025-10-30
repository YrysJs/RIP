<script setup>
import { computed } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { getMemorialById, getDeceasedById, getGraveById } from "~/services/client";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const memorial = ref(null);
const burial = ref(null);
const deceased = ref(null);
const grave = ref(null);
const images = ref([]);
const videos = ref([]);
const achievements = ref([]);
const epitaph = ref("");
const aboutPerson = ref("");

const isLoading = ref(true);
const errorMsg = ref("");
const { $toast } = useNuxtApp();

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

// Загрузка данных покойного
const loadDeceasedData = async (deceasedId) => {
  try {
    const response = await getDeceasedById(deceasedId);
    deceased.value = response.data.data;
  } catch (error) {
    console.error(t('errors.fetchError'), error);
  }
};

// Загрузка данных могилы
const loadGraveData = async (graveId) => {
  try {
    const response = await getGraveById(graveId);
    grave.value = response.data;
  } catch (error) {
    console.error(t('errors.fetchError'), error);
  }
};

// --- API load ---
onMounted(async () => {
  try {
    const id = route.params.id;
    if (!id) throw new Error(t('memorialPage.noIdInUrl'));

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

    // Загружаем данные покойного
    if (data.deceased_id) {
      await loadDeceasedData(data.deceased_id);
    }

    // Загружаем данные могилы
    if (deceased.value?.grave_id) {
      await loadGraveData(deceased.value.grave_id);
    }

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

    // достижения
    achievements.value = (data.achievement_urls || []).map((url, i) => ({
      id: i,
      url: url,
      filename: url.split('/').pop() || `Достижение ${i + 1}`
    }));
  } catch (e) {
    console.error(e);
    const errorMessage = e?.response?.data?.error || e?.response?.data?.message || e.message;
    
    // Если мемориал приватный, показываем тост и перенаправляем
    if (errorMessage && errorMessage.includes('приватным')) {
      $toast.error('Мемориал является приватным');
      router.push('/');
      return;
    }
    
    errorMsg.value = errorMessage;
  } finally {
    isLoading.value = false;
  }
});

// --- computed для UI ---
const fullName = computed(() => {
  return deceased.value?.full_name || burial.value?.deceased?.full_name || "";
});
const lifespan = computed(() => {
  const birth = deceased.value?.birth_date
    ? new Date(deceased.value.birth_date).toLocaleDateString("ru-RU")
    : burial.value?.deceased?.birth_date
    ? new Date(burial.value.deceased.birth_date).toLocaleDateString("ru-RU")
    : "";
  const death = deceased.value?.death_date
    ? new Date(deceased.value.death_date).toLocaleDateString("ru-RU")
    : burial.value?.deceased?.death_date
    ? new Date(burial.value.deceased.death_date).toLocaleDateString("ru-RU")
    : "";
  return birth && death ? `${birth} — ${death}` : "";
});

function goBack() {
  router.push("/");
}

// Функция для копирования ссылки
async function shareMemorial() {
  try {
    const currentUrl = window.location.href;
    await navigator.clipboard.writeText(currentUrl);
    $toast.success("Ссылка скопирована");
  } catch (error) {
    console.error("Ошибка при копировании ссылки:", error);
    $toast.error("Не удалось скопировать ссылку");
  }
}

// Функция для открытия файла достижения в новой вкладке
function openAchievement(url, filename) {
  try {
    window.open(url, '_blank');
    $toast.success("Файл открыт в новой вкладке");
  } catch (error) {
    console.error("Ошибка при открытии файла:", error);
    $toast.error("Не удалось открыть файл");
  }
}
</script>

<template>
  <NuxtLayout
    name="default"
    content-class="bg-transparent py-0 px-0 max-sm:bg-white"
  >
    <div class="max-w-[1200px] mx-auto">

      <div class="bg-white py-6 px-[18px] rounded-2xl max-sm:p-0">
        <div v-if="isLoading" class="p-4">{{ $t('common.loading') }}</div>
        <div v-else-if="errorMsg" class="p-4 text-red-600">{{ errorMsg }}</div>

        <template v-else>
          <!-- Заголовок + Поделиться -->
          <div class="flex justify-between items-center gap-2">
            <div>
              <p class="text-sm text-[#999] max-sm:hidden">{{ $t('memorialPage.memorial') }}</p>
              <h1
                class="font-medium font-foglihten text-[clamp(24px,3vw,32px)]"
              >
                {{ fullName }}
              </h1>
            </div>

            <button
              @click="shareMemorial"
              class="flex items-center gap-2 bg-[#00000014] py-[10px] px-4 rounded-[10px] hover:bg-[#AFB5C166] active:bg-[#AFB5C199] transition max-sm:bg-transparent"
            >
              <img
                src="/icons/share.svg"
                alt=""
                class="max-sm:w-5 max-sm:h-5"
              />
              <span class="max-sm:hidden">{{ $t('memorialPage.share') }}</span>
            </button>
          </div>

          <!-- Верхняя сетка: галерея + инфобокс -->
          <div class="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 mt-4">
            <!-- Левая часть: галерея изображений -->
            <div v-if="images.length > 0" class="grid grid-cols-2 grid-rows-2 gap-4">
              <!-- Большая картинка на всю высоту слева -->
              <div
                v-if="images[0]"
                class="row-span-2 rounded-xl overflow-hidden bg-[#F3F4F6] place-items-center"
              >
                <img
                  :src="images[0].url"
                  alt=""
                  class="w-[360px] h-[250px] object-cover"
                />
              </div>

              <!-- Верхняя маленькая -->
              <div
                v-if="images[1]"
                class="rounded-xl overflow-hidden bg-[#F3F4F6] place-items-center"
              >
                <img
                  :src="images[1].url"
                  alt=""
                  class="w-[223px] h-[120px] object-cover"
                />
              </div>

              <!-- Нижняя маленькая -->
              <div
                v-if="images[2]"
                class="rounded-xl overflow-hidden bg-[#F3F4F6] place-items-center"
              >
                <img
                  :src="images[2].url"
                  alt=""
                  class="w-[223px] h-[120px] object-cover"
                />
              </div>
            </div>

            <!-- Если нет изображений, показываем заглушку -->
            <div v-else class="grid grid-cols-2 grid-rows-2 gap-4">
              <div class="row-span-2 rounded-xl bg-[#F3F4F6] flex items-center justify-center">
                <div class="text-center text-gray-500">
                  <p class="text-sm">Нет изображений</p>
                </div>
              </div>
            </div>

            <!-- Правая часть: Информация о захоронении -->
            <aside class="bg-[#F4F0E7] p-5 rounded-xl">
              <h3 class="text-[18px] font-medium mb-2">
                Информация о захоронении
              </h3>
<!--              <div class="pb-2 border-b border-b-[#2010011F]">-->
<!--                <p class="text-lg text-[#1A1C1F]">{{ lifespan }}</p>-->
<!--                <p class="text-xs text-[#666C72]">-->
<!--                  Дата рождения - Дата смерти-->
<!--                </p>-->
<!--              </div>-->
              <div class="flex flex-col gap-2">
                <div
                  class="mt-2 h-[30px] flex items-center text-base font-medium gap-[11px]"
                >
                  <div class="w-[100px] text-base text-[#050202]">
                    Кладбище:
                  </div>
                  <div class="text-sm text-[#999]">
                    {{ grave?.cemetery_name || burial?.cemetery_name }}
                  </div>
                </div>
                <div class="flex">
                  <div
                    class="h-[30px] flex items-center text-base font-medium gap-[11px] mr-2"
                  >
                    <div class="w-[100px] text-base text-[#050202]">{{ $t('client.tickets.active.sector') }}</div>
                    <div class="text-sm text-[#999]">
                      {{ grave?.sector_number || burial?.sector_number }}
                    </div>
                  </div>
                  <div
                    class="h-[30px] flex items-center text-base font-medium gap-[11px]"
                  >
                    <div class="w-[100px] text-base text-[#050202]">{{ $t('memorialDetails.place') }}:</div>
                    <div class="text-sm text-[#999]">
                      {{ grave?.grave_number || burial?.grave_id }}
                    </div>
                  </div>
                </div>
                <div
                  class="h-11 flex items-center text-base font-medium gap-[11px]"
                >
                  <div class="w-[100px] text-base text-[#050202]">
                    Координаты:
                  </div>
                  <div class="text-sm text-[#999]">
                    {{ grave?.polygon_data.coordinates[0][0] + ', ' + grave?.polygon_data.coordinates[0][1] || "Не указаны" }}
                  </div>
                </div>
                <div v-if="grave?.polygon_data.coordinates[0][0] && grave?.polygon_data.coordinates[0][1]" class="mt-2">
                  <a 
                    :href="`https://yandex.ru/maps/?pt=${grave.polygon_data.coordinates[0][0]},${grave.polygon_data.coordinates[0][1]}&z=17&l=map`"
                    target="_blank"
                    class="text-blue-600 hover:text-blue-800 underline cursor-pointer text-sm"
                  >
                    Посмотреть на карте
                  </a>
                </div>
              </div>
            </aside>
          </div>

          <section class="py-6 mt-4 px-5 rounded-2xl bg-[#F6F7F8] max-sm:mt-4">
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
          <section class="py-4">
            <h3 class="text-[18px] mb-1">{{ $t('memorialPage.videos') }}</h3>

            <!-- Список видео плееров -->
            <div v-if="videos.length > 0" class="videos-list">
              <div class="videos-header mb-4">
                <h4 class="text-base font-medium">
                  Добавленные видео ({{ videos.length }})
                </h4>
              </div>

              <div class="videos-grid">
                <div
                  v-for="(video, index) in videos"
                  :key="video.id"
                  class="video-item"
                  :class="{ 'existing-item': video.isExisting }"
                >
                  <div class="flex justify-between items-center mb-3">
                    <h5 class="text-sm font-medium text-gray-700">
                      {{ video.title }}
                      <span v-if="video.isExisting" class="existing-badge-inline"
                        >{{ $t('memorialPage.existing') }}</span
                      >
                    </h5>
                  </div>
                  <div class="video-wrapper">
                    <iframe
                      :src="video.embedUrl"
                      frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen
                      class="video-iframe"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-[#6B7280]">{{ $t('memorialDetails.videosNotAdded') }}</p>
          </section>

          <!-- Достижения -->
          <section v-if="achievements.length > 0" class="py-4">
            <h3 class="text-[18px] mb-1">{{ $t('memorialPage.achievements') }}</h3>

            <div class="achievements-list">
              <div class="achievements-header mb-4">
                <h4 class="text-base font-medium">
                  Документы и награды ({{ achievements.length }})
                </h4>
              </div>

              <div class="achievements-grid">
                <div
                  v-for="achievement in achievements"
                  :key="achievement.id"
                  class="achievement-item"
                >
                  <div class="achievement-content">
                    <div class="achievement-icon">
                      <img src="/icons/file.svg" alt="Файл" class="w-6 h-6" />
                    </div>
                    <div class="achievement-info">
                      <h5 class="achievement-title">{{ achievement.filename }}</h5>
                      <p class="achievement-description">{{ $t('memorialDetails.documentOrAward') }}</p>
                    </div>
                    <button
                      @click="openAchievement(achievement.url, achievement.filename)"
                      class="achievement-download-btn"
                    >
                      Открыть
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
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

/* Стили для видео компонентов */
.videos-list {
  margin-top: 16px;
}

.videos-header h4 {
  color: #374151;
  margin: 0;
}

.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.video-item {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  background-color: #f9fafb;
  transition: all 0.3s ease;
}

.video-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.video-wrapper {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.video-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

/* Стили для существующих элементов */
.existing-item {
  border: 2px solid #10b981 !important;
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2);
}

.existing-badge-inline {
  display: inline-block;
  background: #10b981;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Стили для блока достижений */
.achievements-list {
  margin-top: 16px;
}

.achievements-header h4 {
  color: #374151;
  margin: 0;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.achievement-item {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  background-color: #f9fafb;
  transition: all 0.3s ease;
}

.achievement-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.achievement-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.achievement-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background-color: #f3f4f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.achievement-info {
  flex: 1;
  min-width: 0;
}

.achievement-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.achievement-description {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.achievement-download-btn {
  flex-shrink: 0;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.achievement-download-btn:hover {
  background-color: #2563eb;
}

.achievement-download-btn:active {
  background-color: #1d4ed8;
}
</style>
