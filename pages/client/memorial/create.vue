<script setup>
import { ref } from "vue";
import { createMemorial, getBurialRequestById } from "~/services/client";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// Данные захоронения
const burial = ref(null);

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

// Загрузка данных захоронения
const loadBurialData = async () => {
  try {
    if (route.query.id) {
      const response = await getBurialRequestById(route.query.id);
      burial.value = response.data.data;
    }
  } catch (error) {
    console.error(t('errors.fetchError'), error);
  }
};

// Загружаем данные при монтировании компонента
onMounted(() => {
  loadBurialData();
});

const handleImageUpload = (event) => {
  const files = Array.from(event.target.files);

  files.forEach((file) => {
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
  });

  // Очищаем input для возможности повторной загрузки
  event.target.value = "";
};

const removeImage = (index) => {
  selectedImages.value.splice(index, 1);
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

// Функция создания мемориала
const submitMemorial = async () => {
  try {
    isSubmitting.value = true;
    // Подготавливаем данные для отправки
    const formData = {
      deceased_id: +burial.value.deceased_id,
      epitaph: epitaph.value,
      about_person: aboutPerson.value,
      is_public: isPublic.value,
      photos: selectedImages.value, // основные фото мемориала
      achievements: achievementPhotos.value.map((photo) => photo.file), // фото достижений
      video_urls: videos.value.map((video) => video.url), // URL видео
    };

    const response = await createMemorial(formData);

    // Успешно создано
    useState("burial").value = burial.value;
    useState("imagePreviews").value = imagePreviews.value;
    useState("epitaph").value = epitaph.value;
    useState("aboutPerson").value = aboutPerson.value;
    useState("videos").value = videos.value;

    const created = response?.data?.data ?? response?.data ?? {};
    const createdId = created.id;

    if (createdId) {
      router.push(`/client/memorial/${createdId}`);
    } else {
      // fallback — если сервер не вернул id
      router.push("/client/memorial");
    }

    // Можно перенаправить пользователя
    // await navigateTo('/client/memorials')
  } catch (error) {
    const { $toast } = useNuxtApp()
    $toast.error("Ошибка при создании мемориала: " +
        (error.response?.data?.error || error.message))
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
        @click="router.go(-1)"
      >
        <img
          class="w-4 h-4 mr-[10px]"
          src="/icons/arrow-left-orange.svg"
          alt=""
        />
        Вернуться
      </button>

      <div class="bg-white py-6 px-[18px] rounded-2xl max-sm:p-0">
        <div class="flex justify-between items-center gap-2">
          <div>
            <p class="text-sm text-[#999] max-sm:hidden">{{ $t('memorialPage.memorial') }}</p>
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
            <span class="max-sm:hidden">{{ $t('memorialPage.share') }}</span>
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
                <p class="upload-text">{{ $t('memorialCreate.uploadPhotos') }}</p>
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
                <button class="remove-all-btn" @click="removeAllImages">
                  Удалить все
                </button>
              </div>

              <div class="gallery-grid">
                <div
                  v-for="(preview, index) in imagePreviews"
                  :key="preview.id"
                  class="image-preview-container"
                >
                  <img :src="preview.url" alt="Preview" class="image-preview" />
                  <div class="image-overlay">
                    <button class="remove-btn" @click="removeImage(index)">
                      ✕
                    </button>
                  </div>
                  <div class="image-number">{{ index + 1 }}</div>
                </div>
              </div>

              <!-- Кнопка добавления еще фото -->
              <button class="add-more-btn" @click="$refs.fileInput.click()">
                + Добавить еще фото
              </button>
            </div>

            <!-- Скрытый input для файлов -->
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              @change="handleImageUpload"
            />
          </div>
          <div class="memorial-info h-full min-h-[250px] max-sm:min-h-fit">
            <!-- <div class="border-b border-[#EEEEEE] pb-4 font-medium text-base">
              <p>
                Дата смерти:
                {{
                  new Date(burial?.deceased?.death_date).toLocaleString(
                    "ru-RU",
                    { day: "2-digit", month: "2-digit", year: "numeric" }
                  )
                }}
              </p>
            </div> -->
            <div class="bg-[#F4F0E7] p-5 rounded-xl">
              <h3 class="text-[18px] font-medium mb-2">
                Информация о захоронении
              </h3>
              <div class="pb-2 border-b border-b-[#2010011F]">
                <p class="text-lg text-[#1A1C1F]">
                  {{
                    burial?.deceased?.birth_date
                      ? new Date(burial.deceased.birth_date).toLocaleDateString(
                          "ru-RU",
                          { day: "2-digit", month: "2-digit", year: "numeric" }
                        )
                      : ""
                  }}
                  -
                  {{
                    burial?.deceased?.death_date
                      ? new Date(burial?.deceased?.death_date).toLocaleString(
                          "ru-RU",
                          { day: "2-digit", month: "2-digit", year: "numeric" }
                        )
                      : ""
                  }}
                </p>
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
                  <div class="flex-1 w-[100px] text-base text-[#050202]">
                    Кладбище:
                  </div>
                  <div class="flex-1 text-sm text-[#999]">
                    {{ burial?.cemetery_name }}
                  </div>
                </div>
                <div class="flex">
                  <div
                    class="flex-1 h-[30px] flex items-center text-base font-medium gap-[11px]"
                  >
                    <div class="w-[100px] text-base text-[#050202]">Сектор</div>
                    <div class="text-sm text-[#999]">
                      {{ burial?.sector_number }}
                    </div>
                  </div>
                  <div
                    class="flex-1 h-[30px] flex items-center text-base font-medium gap-[11px]"
                  >
                    <div class="w-[100px] text-base text-[#050202]">Место:</div>
                    <div class="text-sm text-[#999]">
                      {{ burial?.grave_id }}
                    </div>
                  </div>
                </div>
                <!--                <div-->
                <!--                  class="h-11 flex items-center text-base font-medium gap-[11px]"-->
                <!--                >-->
                <!--                  <div class="flex-1 text-base text-[#050202]">-->
                <!--                    Координаты:-->
                <!--                  </div>-->
                <!--                  <div class="flex-1 text-sm text-[#999]">-->
                <!--                    56.35107309557659, 62.01158847670595-->
                <!--                  </div>-->
                <!--                </div>-->
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
          />
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
          />
        </div>
        <div
          class="flex gap-[14px] py-4 border-b border-b-[#eee] max-sm:border-b-0"
        >
          <div>
            <label
              class="relative inline-block w-10 h-6 cursor-pointer select-none align-middle"
            >
              <input
                v-model="isPublic"
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
            class="upload-area bg-[#E7E8EA] rounded-lg hover:bg-[#DDD] transition-colors py-4 flex flex-col"
            @click="$refs.achievementFileInput.click()"
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
            class="hidden"
            @change="handleAchievementPhotoUpload"
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
              >
                <img
                  :src="photo.url"
                  alt="Achievement photo"
                  class="image-preview"
                />
                <div class="image-overlay">
                  <button
                    class="remove-btn"
                    @click="removeAchievementPhoto(index)"
                  >
                    ✕
                  </button>
                </div>
                <div class="image-number">{{ index + 1 }}</div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h3 class="text-[18px] font-medium mb-1">Видеоматериалы</h3>

          <!-- Кнопка добавления видео -->
<!--          <button-->
<!--            v-if="!showVideoInput"-->
<!--            class="upload-area bg-[#E7E8EA] rounded-lg hover:bg-[#DDD] transition-colors py-4 flex flex-col"-->
<!--            @click="showVideoInputField"-->
<!--          >-->
<!--            <div class="flex justify-center mb-2">-->
<!--              <img src="/icons/upload-video.svg" alt="" class="w-6 h-6" />-->
<!--            </div>-->
<!--            <p class="text-base text-[#3F474F]">-->
<!--              <span class="font-medium text-[#E9B949]">Загрузите файлы</span>-->
<!--              или перетащите их-->
<!--            </p>-->
<!--          </button>-->

          <!-- Поле ввода ссылки -->
          <div class="video-input-container">
            <div class="flex gap-2 mb-4">
              <input
                v-model="videoUrl"
                type="text"
                placeholder="Вставьте ссылку на YouTube видео"
                class="flex-1 border border-[#222222] rounded-lg p-3 text-base"
                @keyup.enter="addVideo"
              />
              <button
                class="bg-[#224C4F] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#1a3a3c] transition-colors"
                @click="addVideo"
              >
                Добавить
              </button>
              <button
                class="bg-[#EF4444] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#DC2626] transition-colors"
                @click="cancelVideoInput"
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
              >
                <div class="flex justify-between items-center mb-3">
                  <h5 class="text-sm font-medium text-gray-700">
                    {{ video.title }}
                  </h5>
                  <button
                    class="text-[#EF4444] hover:text-[#DC2626] font-medium transition-colors text-sm"
                    @click="removeVideo(index)"
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
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопка создания мемориала -->
        <div class="flex justify-end">
          <button
            :disabled="isSubmitting"
            class="bg-[#E9B949] text-black px-8 py-4 rounded-lg font-medium text-sm transition-colors disabled:bg-gray-400 hover:bg-[#D1A53F] active:bg-[#B88F34]"
            @click="submitMemorial"
          >
            <span v-if="isSubmitting">Создание мемориала...</span>
            <span v-else>Создать мемориал</span>
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
  margin-bottom: 20px;

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
  margin-bottom: 20px;
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
</style>
