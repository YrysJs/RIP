<template>
  <NuxtLayout name="user">
    <div class="news-create bg-white rounded-[16px] p-[24px] mt-[20px] w-full">
      <!-- Назад и заголовок -->
      <button class="btn-back mb-[16px]" @click="router.push('/user/news')">
        <img src="/icons/arrow-left-primary.svg" class="w-4 h-4 mr-[10px]" />
        Назад
      </button>

      <h1 class="text-2xl font-semibold mb-[24px]">Создание новости</h1>

      <!-- Выбор категории -->
      <div class="form-group mb-[24px]">
        <label class="label">Выберите категорию</label>
        <select class="form-select" v-model="newsCategory">
          <option :value="1">Объявления</option>
          <option :value="2">Социальная поддержка</option>
          <option :value="3">Изменения в законодательстве</option>
        </select>
      </div>

      <!-- Название новости -->
      <div class="form-group mb-[24px]">
        <label class="label">Название новости</label>
        <input type="text" class="form-input" placeholder="Введите название" v-model="newsTitle" />
      </div>

      <!-- Загрузка обложки -->
      <SixDropzone
          v-model="file"
          :accept="['image/jpeg', 'image/png']"
          class="w-full h-[200px] upload-area mb-[24px] cursor-pointer"
          label="Выбрать файл"
      >
        <template #default>
              <div class="upload-placeholder text-center">
                <p class="text-[#38949B] font-semibold mb-2">Загрузите обложку новости</p>
                <p class="text-xs text-[#6B7280] leading-relaxed">
                  Оптимальный размер: 1200х630 пикселей. <br/>
                  Минимальное разрешение: 600х315 пикселей.<br/>
                  Формат: JPEG, PNG.<br/>
                  Пропорции: Соотношение сторон 16:9<br/>
                  Размер файла: Не превышать 1–2 MB.
                </p>
              </div>
        </template>

      </SixDropzone>


      <!-- Текст новости -->
      <div class="form-group mb-[24px]">
        <label class="label">Заполните основной текст новости</label>
<!--        <ClientOnly>-->
<!--        <QuillEditor v-model:content="newsContent" theme="snow" toolbar="full" content-type="html" />-->
<!--        </ClientOnly>-->

        <div class="editor-toolbar flex gap-2 mb-2">
          <button class="editor-btn">B</button>
          <button class="editor-btn">I</button>
          <button class="editor-btn">U</button>
          <button class="editor-btn">•</button>
          <button class="editor-btn">1.</button>
          <button class="editor-btn">🅣</button>
        </div>

        <textarea
            v-model="newsContent"
            class="form-textarea"
            placeholder="Введите текст новости..."
        ></textarea>
      </div>


      <div>
        <h3 class="text-[18px] font-medium mb-1">
          Прикрепить файл
        </h3>

        <!-- Кнопка загрузки фото -->
        <button
            @click="$refs.achievementFileInput.click()"
            class="bg-[#EEEEEE] w-[120px] h-[28px] font-semibold text-[#224C4F] rounded-lg hover:bg-[#DDD] transition-colors mb-4"
        >
          Добавить
        </button>

        <!-- Скрытый input для файлов -->
        <input
            ref="achievementFileInput"
            type="file"
            multiple
            @change="handleAchievementPhotoUpload"
            class="hidden"
        >
        <!-- Галерея фото достижений -->
        <div v-if="achievementPhotos.length > 0" class="achievement-photos-gallery">

          <div class="gallery-grid">
            <div
                v-for="(photo, index) in achievementPhotos"
                :key="photo.id"
                class="image-preview-container"
            >
              <img src="/images/doc.png" alt="Achievement photo" class="image-preview">
              <div class="image-overlay">
                <button
                    @click="removeAchievementPhoto(index)"
                    class="remove-btn"
                >
                  ✕
                </button>
              </div>
              <div class="image-number">{{ index + 1 }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl mb-4 flex gap-[10px] justify-end">
        <button class="btn btn-submit" @click="addNews">
          Опубликовать
        </button>
      </div>
    </div>

    <Teleport to="body">
      <SuccessModal
          v-if="showSuccessModal"
          title="Новость опубликована!"
          @close="closeSuccessModal"
      />
    </Teleport>
  </NuxtLayout>
</template>

<script setup>
// import {QuillEditor} from "@vueup/vue-quill";
import { ref } from 'vue';
import { createNews, setAkimatFile } from '~/services/akimat'
import SuccessModal from "~/components/layout/modals/SuccessModal.vue";
import Cookies from "js-cookie";
const router = useRouter();

const newsCategory = ref(0);
const newsTitle = ref('');
const showSuccessModal = ref(false)
const newsContent = ref('');
const achievementPhotos = ref([])
const file = ref(null)
const base64File = ref('');

// definePageMeta({
//   middleware: ['auth', 'akimat'],
// });

async function convertToBase64(file) {
  if (!file) throw new Error('Файл не выбран')

  return await new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const result = reader.result
      const clean = result.split(',')[1]
      resolve(clean)
    }

    reader.onerror = (error) => {
      reject(error)
    }

    reader.readAsDataURL(file)
  })
}

const handleAchievementPhotoUpload = (event) => {
  const files = Array.from(event.target.files)

  files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        achievementPhotos.value.push({
          id: Date.now() + Math.random(),
          url: e.target.result,
          file: file
        })
      }
      reader.readAsDataURL(file)
  })
  event.target.value = ''
}

const removeAchievementPhoto = (index) => {
  achievementPhotos.value.splice(index, 1)
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  navigateTo('/user/news')
}

const addNews = async () => {

  try {

    const formData = new FormData()
    let filerRes
    formData.append('Authorization', Cookies.get('token'))
    if (achievementPhotos.value) {
      if (Array.isArray(achievementPhotos.value)) {
        achievementPhotos.value.forEach(achievement => formData.append('files', achievement.file))
      } else {
        formData.append('files', achievementPhotos.value.file)
      }
      filerRes = await setAkimatFile(formData)
    }
    base64File.value = await convertToBase64(file.value)
    const temp = {
      title: newsTitle.value,
      content: newsContent.value,
      categoryId: newsCategory.value,
      coverImageBase64: base64File.value,
      newsStatusId: 1
    }
    if (filerRes?.data?.success) {
      temp.fileUrl = filerRes.data.files[0].fileUrl
    }
    await createNews(temp)
  } catch (error) {
    console.error('Ошибка при услуги:', error)
  } finally {
    showSuccessModal.value = true
  }

}

</script>

<style lang="scss" scoped>
.news-create {
  background: #ffffff;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.04);
  border-radius: 16px;
}

.btn-back {
  @apply flex items-center bg-[#EEEEEE] text-[#224C4F] rounded-md px-[16px] py-[10px] font-medium text-sm;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 6px;
}

.form-select, .form-input {
  border: none;
  border-bottom: 1px solid #d1d5db;
  padding: 8px 0;
  font-size: 16px;
  background: transparent;
  outline: none;

  &:focus {
    border-color: #224C4F;
  }
}

.upload-area {
  width: 100%;
  min-height: 300px;
  border: 1px dashed #38949B;
  border-radius: 8px;
  background: #F9FAFB;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
}

.upload-placeholder {
  text-align: center;
}

.editor-toolbar {
  button {
    @apply bg-[#F3F4F6] text-[#374151] rounded-md p-2 text-sm font-bold;
    min-width: 32px;
    height: 32px;
  }
}

.form-textarea {
  width: 100%;
  min-height: 200px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 12px;
  resize: vertical;
  font-size: 14px;
  background: #F9FAFB;
}

.btn-submit {
  height: 52px;
  background: #38949B;
  color: #fff;
  padding: 16px;
}

.achievement-photos-gallery {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.gallery-grid {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.image-preview-container {
  width: 120px;
  height: 120px;
  position: relative;

  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #E5E7EB;
}

.image-preview {
  width: 120px;
  height: 100%;
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

.change-btn {
  background-color: #6366F1;
  color: white;

  &:hover {
    background-color: #5B5BF7;
  }
}

.remove-btn {
  background-color: #EF4444;
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
    background-color: #DC2626;
  }
}

</style>
