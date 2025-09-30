<script setup>
import { ref } from "vue";
import {
  createMemorial,
  getBurialRequestById,
  getMemorialById,
  getDeceasedById,
  updateMemorial
} from "~/services/client";

const route = useRoute();
const router = useRouter();

const USE_MOCKS = true;

// ===== МОК-ДАННЫЕ =====
const mockBurialsById = {
  1: {
    id: 1,
    cemetery_name: "Кладбище №1",
    sector_number: "Сектор 12",
    grave_id: "Место 45",
    deceased: {
      id: 2,
      full_name: "Иванов Иван Иванович",
      death_date: "2024-03-18T10:00:00Z",
    },
  },
};

const mockDeceasedById = {
  2: {
    id: 2,
    full_name: "Иванов Иван Иванович",
    death_date: "2024-03-18T10:00:00Z",
  },
};

const mockMemorialsById = {
  101: {
    id: 101,
    deceased_id: 2,
    creator_phone: "+7 777 000 11 22",
    is_public: true,
    epitaph: "Светлая память...",
    about_person:
      "Учитель, наставник, отец. Любил походы и книги. Всегда помогал окружающим.",
    created_at: "2025-08-20T09:30:00Z",
    updated_at: "2025-09-10T12:05:00Z",
    photo_urls: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800",
    ],
    achievement_urls: [
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=800",
    ],
    // Можно строкой с запятой или массивом — обе формы поддержаны твоим кодом
    video_urls: [
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ, https://youtu.be/aqz-KE-bpKQ",
    ],
  },
};

// ===== МОК-ФУНКЦИИ (эмулируют API) =====
const mockDelay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const mockGetBurialRequestById = async (id) => {
  await mockDelay();
  const data = mockBurialsById[id] || null;
  if (!data) throw new Error("Mock burial not found");
  return { data };
};

const mockGetDeceasedById = async (id) => {
  await mockDelay();
  const data = mockDeceasedById[id] || null;
  if (!data) throw new Error("Mock deceased not found");
  return { data };
};

const mockGetMemorialById = async (id) => {
  await mockDelay();
  const data = mockMemorialsById[id] || null;
  if (!data) throw new Error("Mock memorial not found");
  return { data };
};

const mockCreateMemorial = async (payload) => {
  await mockDelay(600);
  console.log("MOCK createMemorial payload:", payload);
  // Вернем «созданный/обновлённый» объект
  return {
    data: {
      id: Math.floor(1000 + Math.random() * 9000),
      ...payload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };
};

// Обертки, чтобы легко переключаться на реальный API
const getBurialRequestByIdSafe = async (id) => {
  return getBurialRequestById(id);
};
const getDeceasedByIdSafe = async (id) => {
  return getDeceasedById(id);
};
const getMemorialByIdSafe = async (id) => {
  return getMemorialById(id);
};
const createMemorialSafe = async (payload) => {
  return createMemorial(payload);
};

// Данные захоронения и мемориала
const burial = ref(null);
const memorial = ref(null);
const deceased = ref(null);
const isEditMode = ref(false);

const selectedImages = ref([]);
const imagePreviews = ref([]);

// Состояние для видео
const showVideoInput = ref(false);
const videoUrl = ref("");
const videos = ref([]);

// Состояние для достижений (фото)
const achievementPhotos = ref([]);

// Состояние формы
const epitaph = ref("");
const aboutPerson = ref("");
const isPublic = ref(false);
const isSubmitting = ref(false);

const deceasedId = ref(2);

// Загрузка данных захоронения
const loadBurialData = async () => {
  try {
    if (route.query.id) {
      //   const response = await getBurialRequestById(route.query.id);
      const response = await getBurialRequestByIdSafe(route.query.id);
      burial.value = response.data;
    }
  } catch (error) {
    console.error("Ошибка при загрузке данных захоронения:", error);
  }
};

// Загрузка данных мемориала для редактирования
const loadMemorialData = async () => {
  try {
    if (route.params.id && route.params.id !== "create") {
      //   const response = await getMemorialById(route.params.id);
      const response = await getMemorialByIdSafe(route.params.id);
      memorial.value = response.data;
      isEditMode.value = true;

      // Загружаем данные покойного
      if (memorial.value.deceased_id) {
        await loadDeceasedData(memorial.value.deceased_id);
      }

      // Заполняем поля формы данными мемориала
      fillFormWithMemorialData();
    }
  } catch (error) {
    console.error("Ошибка при загрузке данных мемориала:", error);
  }
};

// Загрузка данных покойного
const loadDeceasedData = async (deceasedId) => {
  try {
    // const response = await getDeceasedById(deceasedId);
    const response = await getDeceasedByIdSafe(deceasedId);
    deceased.value = response.data;
  } catch (error) {
    console.error("Ошибка при загрузке данных покойного:", error);
  }
};

// Заполнение формы данными мемориала
// const fillFormWithMemorialData = () => {
//   if (!memorial.value) return;

//   // Заполняем основные поля
//   epitaph.value = memorial.value.epitaph || "";
//   aboutPerson.value = memorial.value.about_person || "";
//   isPublic.value = memorial.value.is_public || false;
//   deceasedId.value = memorial.value.deceased_id;

//   // Обрабатываем фотографии
//   if (memorial.value.photo_urls && memorial.value.photo_urls.length > 0) {
//     memorial.value.photo_urls.forEach((url, index) => {
//       imagePreviews.value.push({
//         id: Date.now() + index,
//         url: url,
//         isExisting: true, // флаг для отличия существующих фото от новых
//       });
//     });
//   }

//   // Обрабатываем достижения
//   if (
//     memorial.value.achievement_urls &&
//     memorial.value.achievement_urls.length > 0
//   ) {
//     memorial.value.achievement_urls.forEach((url, index) => {
//       achievementPhotos.value.push({
//         id: Date.now() + index + 1000,
//         url: url,
//         isExisting: true,
//       });
//     });
//   }

//   // Обрабатываем видео
//   if (memorial.value.video_urls && memorial.value.video_urls.length > 0) {
//     memorial.value.video_urls.forEach((urlString, index) => {
//       // Видео URL может прийти как строка с запятыми
//       const urls = urlString.includes(",") ? urlString.split(",") : [urlString];

//       urls.forEach((url, urlIndex) => {
//         const trimmedUrl = url.trim();
//         if (trimmedUrl) {
//           const videoId = extractYouTubeId(trimmedUrl);
//           if (videoId) {
//             videos.value.push({
//               id: Date.now() + index + urlIndex + 2000,
//               url: trimmedUrl,
//               embedUrl: `http://www.youtube.com/embed/${videoId}`,
//               title: `Видео ${videos.value.length + 1}`,
//               isExisting: true,
//             });
//           }
//         }
//       });
//     });
//   }
// };

const fillFormWithMemorialData = () => {
  if (!memorial.value) return;
  epitaph.value = memorial.value.epitaph || "";
  aboutPerson.value = memorial.value.about_person || "";
  isPublic.value = !!memorial.value.is_public;
  deceasedId.value = memorial.value.deceased_id;

  // фото
  (memorial.value.photo_urls || []).forEach((url, i) =>
    imagePreviews.value.push({ id: Date.now() + i, url, isExisting: true })
  );

  // достижения
  (memorial.value.achievement_urls || []).forEach((url, i) =>
    achievementPhotos.value.push({
      id: Date.now() + i + 1000,
      url,
      isExisting: true,
    })
  );

  // видео (поддержка строк с запятыми)
  (memorial.value.video_urls || []).forEach((urlString, idx) => {
    const urls = urlString.includes(",") ? urlString.split(",") : [urlString];
    urls.forEach((u, j) => {
      const trimmed = u.trim();
      if (!trimmed) return;
      const vid = extractYouTubeId(trimmed);
      if (vid) {
        videos.value.push({
          id: Date.now() + idx + j + 2000,
          url: trimmed,
          embedUrl: `https://www.youtube.com/embed/${vid}`,
          title: `Видео ${videos.value.length + 1}`,
          isExisting: true,
        });
      }
    });
  });
};

// Загружаем данные при монтировании компонента
onMounted(() => {
  loadBurialData();
  loadMemorialData();
});

const handleImageUpload = (event) => {
  const files = Array.from(event.target.files || []);

  files.forEach((file) => {
    if (!file.type.startsWith("image/")) return;

    if (file && file.type.startsWith("image/")) {
      selectedImages.value.push(file);

      // Создаем URL для превью
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreviews.value.push({
          id: Date.now() + Math.random(), // уникальный ID
          url: e.target.result,
          file: file,
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  });

  // Очищаем input для возможности повторной загрузки
  event.target.value = "";
};

const removeImage = (index) => {
  const preview = imagePreviews.value[index];

  // Если это новый файл (не с сервера), удаляем его также из selectedImages
  if (!preview.isExisting) {
    const fileIndex = selectedImages.value.findIndex(
      (file) => file === preview.file
    );
    if (fileIndex !== -1) {
      selectedImages.value.splice(fileIndex, 1);
    }
  }

  imagePreviews.value.splice(index, 1);
};

const removeAllImages = () => {
  selectedImages.value = [];
  imagePreviews.value = [];
};

// Функции для работы с видео
const showVideoInputField = () => {
  showVideoInput.value = true;
};

const extractYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const addVideo = () => {
  if (videoUrl.value.trim()) {
    const videoId = extractYouTubeId(videoUrl.value);
    if (!videoId) return;
    if (videoId) {
      const newVideo = {
        id: Date.now() + Math.random(),
        url: videoUrl.value,
        embedUrl: `http://www.youtube.com/embed/${videoId}`,
        title: `Видео ${videos.value.length + 1}`,
      };
      videos.value.push(newVideo);
      videoUrl.value = "";
      showVideoInput.value = false;
    }
  }
};

const removeVideo = (index) => {
  videos.value.splice(index, 1);
};

const cancelVideoInput = () => {
  videoUrl.value = "";
  showVideoInput.value = false;
};

// Функции для достижений (фото)
const handleAchievementPhotoUpload = (event) => {
  const files = Array.from(event.target.files);

  files.forEach((file) => {
    if (!file.type.startsWith("image/")) return;

    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        achievementPhotos.value.push({
          id: Date.now() + Math.random(),
          url: e.target.result,
          file: file,
        });
      };
      reader.readAsDataURL(file);
    }
  });

  event.target.value = "";
};

const removeAchievementPhoto = (index) => {
  achievementPhotos.value.splice(index, 1);
};

// Функция создания/обновления мемориала
const submitMemorial = async () => {
  try {
    isSubmitting.value = true;

    // Подготавливаем данные для отправки
    const formData = {
      id: route.query.id,
      deceased_id: isEditMode.value
        ? ''
        : +burial.value?.deceased?.id,
      epitaph: epitaph.value,
      about_person: aboutPerson.value,
      is_public: isPublic.value,
      photos: selectedImages.value, // только новые фото мемориала
      achievements: achievementPhotos.value
        .filter((photo) => !photo.isExisting) // только новые достижения
        .map((photo) => photo.file),
      video_urls: [
        ...(videos.value.filter((v) => !v.isExisting).map((v) => v.url) || []),
        ...(isEditMode.value
          ? videos.value.filter((v) => v.isExisting).map((v) => v.url)
          : []),
      ],
    };

    // В режиме редактирования добавляем существующие URL-ы
    if (isEditMode.value) {
      // Добавляем существующие фото URL-ы (пока нет API для обновления)
      const existingPhotoUrls = imagePreviews.value
        .filter((preview) => preview.isExisting)
        .map((preview) => preview.url);

      const existingAchievementUrls = achievementPhotos.value
        .filter((photo) => photo.isExisting)
        .map((photo) => photo.url);

      const existingVideoUrls = videos.value
        .filter((video) => video.isExisting)
        .map((video) => video.url);

      // Объединяем существующие и новые URL-ы
      const allVideoUrls = [...existingVideoUrls, ...formData.video_urls];
      formData.video_urls = allVideoUrls;
    }

    // const response = await createMemorial(formData);
    if (isEditMode.value) {
      await updateMemorial(formData)
    } else {
      const response = await createMemorialSafe(formData);
    }

    // Успешно создано/обновлено
    useState("burial").value = burial.value;
    useState("imagePreviews").value = imagePreviews.value;
    useState("epitaph").value = epitaph.value;
    useState("aboutPerson").value = aboutPerson.value;
    useState("videos").value = videos.value;

    router.push("/client/memorial/created");

    // Можно перенаправить пользователя
    // await navigateTo('/client/memorials')
  } catch (error) {
    console.error("Error processing memorial:", error);
    const action = isEditMode.value ? "обновлении" : "создании";
    alert(
      `Ошибка при ${action} мемориала: ` +
        (error.response?.data?.message || error.message)
    );
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <NuxtLayout
    name="client"
    content-class="bg-transparent py-0 px-0 max-sm:bg-white"
  >
    <div>
      <button
        class="btn-back mb-6 mr-4 ml-[2px] text-base text-[#B88F34] font-medium flex items-center"
        @click="router.push('/client/memorial')"
      >
        <img
          class="w-4 h-4 mr-[10px]"
          src="/icons/arrow-left-orange.svg"
          alt=""
        />
        Вернуться
      </button>
      <!-- <div class="flex items-center bg-white p-5 rounded-2xl mb-4 bg-[#fff]">
        <h1 class="text-[32px] font-medium">
          {{ isEditMode ? "Редактирование мемориала" : "Создание мемориала" }}
        </h1>
      </div> -->
      <div class="bg-white py-6 px-[18px] rounded-2xl max-sm:p-0">
        <div class="flex justify-between items-center gap-2">
          <div>
            <p class="text-sm text-[#999] max-sm:hidden">Мемориал</p>
            <h3 class="text-fluid font-medium font-foglihten">
              {{
                isEditMode
                  ? deceased?.full_name || `Мемориал ID: ${memorial?.id}`
                  : burial?.deceased?.full_name
              }}
            </h3>
          </div>
          <button
            class="flex items-center gap-2 bg-[#00000014] py-[10px] px-4 rounded-[10px] hover:bg-[#AFB5C166] active:bg-[#AFB5C199] transition max-sm:bg-transparent"
          >
            <img src="/icons/share.svg" alt="" class="max-sm:w-5 max-sm:h-5" />
            <span class="max-sm:hidden">Поделиться</span>
          </button>
        </div>
        <div
          class="grid grid-cols-2 gap-4 my-4 items-stretch max-lg:grid-cols-1"
        >
          <div class="photo-upload-container h-full min-h-[250px]">
            <!-- Область загрузки фото -->
            <div
              v-if="imagePreviews.length === 0"
              class="upload-area min-h-[250px]"
              @click="$refs.fileInput.click()"
            >
              <div class="upload-content">
                <div class="flex justify-center mb-[20px]">
                  <img src="/icons/upload.svg" alt="" class="upload-icon" />
                </div>
                <p class="upload-text">Загрузите фотографии</p>
                <p class="upload-hint">
                  Перетащите файлы или загрузите файлы до N мб в формате: .png,
                  .jpeg
                </p>
                <button
                  class="py-2 px-3 border border-[#D6DADF] bg-white rounded-lg mt-5"
                >
                  Загрузить
                </button>
              </div>
            </div>

            <!-- Галерея превью изображений внутри блока загрузки -->
            <div v-else class="upload-area-with-images min-h-[250px]">
              <div class="gallery-header">
                <h4>Загруженные фото ({{ imagePreviews.length }})</h4>
                <button @click="removeAllImages" class="remove-all-btn">
                  Удалить все
                </button>
              </div>

              <div class="gallery-grid">
                <div
                  v-for="(preview, index) in imagePreviews"
                  :key="preview.id"
                  class="image-preview-container"
                  :class="{ 'existing-item': preview.isExisting }"
                >
                  <img :src="preview.url" alt="Preview" class="image-preview" />
                  <div class="image-overlay">
                    <button @click="removeImage(index)" class="remove-btn">
                      ✕
                    </button>
                  </div>
                  <div class="image-number">{{ index + 1 }}</div>
                  <div v-if="preview.isExisting" class="existing-badge">
                    Существующее
                  </div>
                </div>
              </div>

              <!-- Кнопка добавления еще фото -->
              <button @click="$refs.fileInput.click()" class="add-more-btn">
                + Добавить еще фото
              </button>
            </div>

            <!-- Скрытый input для файлов -->
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              multiple
              @change="handleImageUpload"
              class="hidden"
            />
          </div>
          <div class="memorial-info h-full min-h-[250px] max-sm:min-h-fit">
            <!-- <div class="border-b border-[#EEEEEE] pb-4 font-medium text-base">
              <p v-if="!isEditMode">
                Дата смерти:
                {{
                  new Date(burial?.deceased?.death_date).toLocaleString(
                    "ru-RU",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }
                  )
                }}
              </p>
              <div v-else>
                <p v-if="deceased?.death_date">
                  Дата смерти:
                  {{
                    new Date(deceased.death_date).toLocaleString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  }}
                </p>
                <p>
                  Дата создания мемориала:
                  {{
                    new Date(memorial?.created_at).toLocaleString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }}
                </p>
              </div>
            </div> -->
            <div v-if="!isEditMode" class="bg-[#F4F0E7] p-5 rounded-xl">
              <h3 class="text-[18px] font-medium mb-2">
                Информация о захоронении
              </h3>
              <div class="pb-2 border-b border-b-[#2010011F]">
                <p class="text-lg text-[#1A1C1F]">01.01.1900 - 01.01.2000</p>
                <p class="text-xs text-[#666C72]">
                  Дата рождения - Дата смерти
                </p>
              </div>
              <!-- <div class="flex justify-between text-base font-medium">
                <div>Страна</div>
                <div>Казахстан</div>
              </div>
              <div class="flex justify-between text-base font-medium">
                <div>Город</div>
                <div>Алматы</div>
              </div> -->
              <div class="flex flex-col gap-2">
                <div
                  class="mt-2 h-[30px] flex items-center text-base font-medium gap-[11px]"
                >
                  <div class="w-[100px] text-base text-[#050202]">
                    Кладбище:
                  </div>
                  <div class="text-sm text-[#999]">
                    {{ burial?.cemetery_name }}
                  </div>
                </div>
                <div class="flex">
                  <div
                    class="h-[30px] flex items-center text-base font-medium gap-[11px]"
                  >
                    <div class="w-[100px] text-base text-[#050202]">Сектор</div>
                    <div class="text-sm text-[#999]">
                      {{ burial?.sector_number }}
                    </div>
                  </div>
                  <div
                    class="h-[30px] flex items-center text-base font-medium gap-[11px]"
                  >
                    <div class="w-[100px] text-base text-[#050202]">Место:</div>
                    <div class="text-sm text-[#999]">
                      {{ burial?.grave_id }}
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
                    56.35107309557659, 62.01158847670595
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="bg-[#F4F0E7] p-5 rounded-xl">
              <h3 class="text-[18px] font-medium mb-2">
                Информация о мемориале
              </h3>
              <div class="flex flex-col gap-2">
                <!-- <div
                  class="h-[30px] flex justify-between items-center text-base font-medium"
                >
                  <div class="text-base text-[#050202]">ID покойного:</div>
                  <div class="text-sm text-[#999]">
                    {{ memorial?.deceased_id }}
                  </div>
                </div> -->
                <div
                  class="h-[30px] flex items-center text-base font-medium max-sm:gap-2"
                >
                  <div class="text-base text-[#050202]">Создатель:</div>
                  <div class="text-sm text-[#999]">
                    {{ memorial?.creator_phone }}
                  </div>
                </div>
                <div
                  class="h-[30px] flex items-center text-base font-medium max-sm:gap-2"
                >
                  <div class="text-base text-[#050202]">Публичность:</div>
                  <div class="text-sm text-[#999]">
                    {{ memorial?.is_public ? "Публичный" : "Приватный" }}
                  </div>
                </div>
                <div
                  class="h-[30px] flex items-center text-base font-medium max-sm:gap-2"
                >
                  <div class="text-base text-[#050202]">
                    Последнее обновление:
                  </div>
                  <div class="text-sm text-[#999]">
                    {{
                      new Date(memorial?.updated_at).toLocaleString("ru-RU", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="pb-4 border-b border-b-[#eee] max-sm:border-b-0">
          <h3 class="text-[18px] mb-2">Эпитафия</h3>
          <textarea
            v-model="epitaph"
            class="border border-[#AFB5C166] rounded-lg py-[18px] px-3 w-full focus:outline-none"
            placeholder="Введите эпитафию..."
            rows="4"
          ></textarea>
        </div>
        <div
          class="py-4 border-b border-b-[#eee] max-sm:py-0 max-sm:border-b-0"
        >
          <h3 class="text-[18px] mb-2">Память о человеке:</h3>
          <textarea
            v-model="aboutPerson"
            class="border border-[#AFB5C166] rounded-lg py-[18px] px-3 w-full focus:outline-none"
            placeholder="Расскажите о человеке..."
            rows="4"
          ></textarea>
        </div>
        <div
          class="flex gap-[14px] py-4 border-b border-b-[#eee] max-sm:border-b-0"
        >
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
                class="absolute inset-0 bg-gray-200 rounded-full transition-colors peer-checked:bg-[#E9B949] peer-checked:ring-2 peer-checked:ring-[#E9B949]"
              />
              <span
                class="absolute left-[1px] top-[1px] bg-white w-[21.18px] h-[20.9px] rounded-full shadow-md transition-transform peer-checked:translate-x-[15px]"
              />
            </label>
          </div>

          <div>
            <div class="text-base font-medium">Публичная личность</div>

            <p class="text-sm font-medium text-[#5C6771E6]">
              Цифровой мемориал этого человека приватный и доступен только по
              ссылке
            </p>
          </div>
        </div>
        <div class="py-4 border-b border-b-[#eee]">
          <h3 class="text-[18px] mb-1">Достижения</h3>

          <!-- Кнопка загрузки фото -->
          <div
            @click="$refs.achievementFileInput.click()"
            class="upload-area rounded-lg transition-colors py-4 flex flex-col"
          >
            <div class="flex justify-center mb-2">
              <img
                src="/icons/upload.svg"
                alt=""
                class="w-[17px] h-[18px] m-[3px] mr-1"
              />
            </div>
            <p class="text-base text-[#3F474F]">
              <span class="font-medium text-[#E9B949]">Загрузите файлы</span>
              или перетащите их
            </p>
          </div>

          <!-- Скрытый input для файлов -->
          <input
            ref="achievementFileInput"
            type="file"
            accept="image/*"
            multiple
            @change="handleAchievementPhotoUpload"
            class="hidden"
          />

          <!-- Галерея фото достижений -->
          <div
            v-if="achievementPhotos.length > 0"
            class="achievement-photos-gallery"
          >
            <div class="gallery-header">
              <h4>Фото достижений ({{ achievementPhotos.length }})</h4>
            </div>

            <div class="gallery-grid">
              <div
                v-for="(photo, index) in achievementPhotos"
                :key="photo.id"
                class="image-preview-container"
                :class="{ 'existing-item': photo.isExisting }"
              >
                <img
                  :src="photo.url"
                  alt="Achievement photo"
                  class="image-preview"
                />
                <div class="image-overlay">
                  <button
                    @click="removeAchievementPhoto(index)"
                    class="remove-btn"
                  >
                    ✕
                  </button>
                </div>
                <div class="image-number">{{ index + 1 }}</div>
                <div v-if="photo.isExisting" class="existing-badge">
                  Существующее
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="py-4">
          <h3 class="text-[18px] mb-1">Видеоматериалы</h3>

          <!-- Кнопка добавления видео -->
          <div
            v-if="!showVideoInput"
            @click="showVideoInputField"
            class="upload-area rounded-lg transition-colors py-4 flex flex-col"
          >
            <div class="flex justify-center mb-2">
              <img src="/icons/upload-video.svg" alt="" class="w-6 h-6" />
            </div>
            <p class="text-base text-[#3F474F]">
              <span class="font-medium text-[#E9B949]">Загрузите файлы</span>
              или перетащите их
            </p>
          </div>

          <!-- Поле ввода ссылки -->
          <div v-if="showVideoInput" class="video-input-container">
            <div class="flex gap-2 mb-4">
              <input
                v-model="videoUrl"
                type="text"
                placeholder="Вставьте ссылку на YouTube видео"
                class="flex-1 border border-[#222222] rounded-lg p-3 text-base"
                @keyup.enter="addVideo"
              />
              <button
                @click="addVideo"
                class="bg-[#224C4F] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#1a3a3c] transition-colors"
              >
                Добавить
              </button>
              <button
                @click="cancelVideoInput"
                class="bg-[#EF4444] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#DC2626] transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>

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
                      >Существующее</span
                    >
                  </h5>
                  <button
                    @click="removeVideo(index)"
                    class="text-[#EF4444] hover:text-[#DC2626] font-medium transition-colors text-sm"
                  >
                    Удалить
                  </button>
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
        </div>

        <!-- Кнопка создания мемориала -->
        <div class="flex justify-end">
          <button
            @click="submitMemorial"
            :disabled="isSubmitting"
            class="bg-[#E9B949] text-black px-8 py-4 rounded-lg font-medium text-sm transition-colors hover:bg-[#D1A53F] active:bg-[#B88F34] disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <span v-if="isSubmitting">
              {{
                isEditMode ? "Обновление мемориала..." : "Создание мемориала..."
              }}
            </span>
            <span v-else>
              {{ isEditMode ? "Обновить мемориал" : "Создать мемориал" }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.text-fluid {
  font-size: clamp(24px, 3vw, 32px);
}

.photo-upload-container {
  width: 100%;
  position: relative;
  order: 1;
  @media (max-width: 1023px) {
    order: 2;
  }
}

.memorial-info {
  order: 2;
  @media (max-width: 1023px) {
    order: 1;
  }
}

.upload-area {
  width: 100%;
  background-color: #f3f4f6;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  @media (max-width: 639px) {
    height: 124px;
  }

  &:hover {
    background-color: #e5e7eb;
    border-color: #9ca3af;
  }
}

.upload-content {
  text-align: center;
  padding: 20px;
}

.upload-icon {
  height: 27px;
  width: 25.5px;
  margin: 4.5px;
  margin-right: 6px;
  opacity: 0.6;
  display: block;
}

.upload-text {
  font-size: 16px;
  font-weight: 600;
  color: #000;
}

.upload-hint {
  font-size: 12px;
  font-weight: 500;
  color: #686973;
}

.upload-area-with-images {
  width: 100%;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  background-color: #f9fafb;
}

.add-more-btn {
  width: 100%;
  padding: 12px;
  background-color: #f3f4f6;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 16px;

  &:hover {
    background-color: #e5e7eb;
    border-color: #9ca3af;
    color: #374151;
  }
}

.images-gallery {
  margin-top: 20px;
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #374151;
    margin: 0;
  }
}

.remove-all-btn {
  padding: 6px 12px;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #dc2626;
  }
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.image-preview-container {
  width: 100%;
  height: 120px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;

  .image-preview-container:hover & {
    opacity: 1;
  }
}

.image-number {
  position: absolute;
  top: 4px;
  left: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  min-width: 20px;
  text-align: center;
}

.change-btn,
.remove-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
}

.change-btn {
  background-color: #6366f1;
  color: white;

  &:hover {
    background-color: #5b5bf7;
  }
}

.remove-btn {
  background-color: #ef4444;
  color: white;
  font-size: 18px;
  padding: 4px 8px;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #dc2626;
  }
}

.hidden {
  display: none;
}

// Стили для видео компонентов
.video-input-container {
  margin-top: 16px;
}

.videos-list {
  margin-top: 16px;
}

.videos-header {
  h4 {
    color: #374151;
    margin: 0;
  }
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

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
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

// Стили для галереи достижений
.achievement-photos-gallery {
  margin-top: 16px;
}

// Стили для существующих элементов
.existing-item {
  border: 2px solid #10b981 !important;
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2);
}

.existing-badge {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: #10b981;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
</style>
