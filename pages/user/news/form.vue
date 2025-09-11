<template>
  <NuxtLayout name="user">
    <!-- back -->
    <button class="btn-back mb-[16px]" @click="router.push('/user/news')">
      <img src="/icons/arrow-left-primary.svg" class="w-4 h-4 mr-[10px]" />
      Вернуться
    </button>

    <div class="news-create ">
      <h1 class="page-title">СОЗДАНИЕ НОВОСТИ</h1>

      <!-- Категория (узкий селект + плейсхолдер) -->
      <div class="form-group form-group--select mb-[12px]">
        <label class="label">Выберите категорию:</label>
        <div class="select-shell">
          <select class="form-select form-select--narrow" v-model="newsCategory" required>
            <option value="" disabled hidden>Категория</option>
            <option :value="1">Объявления</option>
            <option :value="2">Социальная поддержка</option>
            <option :value="3">Изменения в законодательстве</option>
          </select>
        </div>
      </div>

      <!-- разделительная линия сразу после категории -->
      <div class="divider divider--section"></div>

      <!-- Название новости (лейбл чёрным) -->
      <div class="form-group mb-[20px]">
        <label class="label label--dark">Название новости:</label>
        <input type="text" class="form-input" placeholder="Введите название" v-model="newsTitle" />
      </div>

      <!-- Загрузка обложки -->
      <SixDropzone
        v-model="file"
        :accept="['image/jpeg', 'image/png']"
        class="w-full upload-area mb-[20px] cursor-pointer"
        label="Выбрать файл"
      >
        <template #default>
          <div class="upload-placeholder">
            <div class="upload-icon" aria-hidden>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 10l5-5 5 5M12 5v10"
                      stroke="#6B7280" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="upload-title">Загрузить фото для обложки</p>
            <p class="upload-hint">
              Перетащите файл или загрузите файл до N МБ в формате: <b>.png, .jpeg</b>
            </p>
            <button type="button" class="upload-btn">Загрузить</button>
          </div>
        </template>
      </SixDropzone>

      <!-- Текст новости -->
      <div class="form-group mb-[12px]">
        <label class="label">Заполните основной текст:</label>

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
          :maxlength="CHAR_LIMIT"
          placeholder="Введите текст новости..."
        ></textarea>
      </div>

      <div class="char-row">
        <span class="char-counter">{{ charCount }}/{{ CHAR_LIMIT }} символов</span>
      </div>

      <!-- Прикрепить файл -->
      <div class="mb-[8px]">
        <h3 class="attach-title">Прикрепить файл</h3>

        <button
          @click="$refs.achievementFileInput.click()"
          class="attach-add"
        >
          Добавить
        </button>

        <input
          ref="achievementFileInput"
          type="file"
          multiple
          @change="handleAchievementPhotoUpload"
          class="hidden"
        />

        <div v-if="achievementPhotos.length > 0" class="achievement-photos-gallery">
          <div class="gallery-grid">
            <div
              v-for="(photo, index) in achievementPhotos"
              :key="photo.id"
              class="image-preview-container"
            >
              <img src="/images/doc.png" alt="file" class="image-preview">
              <div class="image-overlay">
                <button @click="removeAchievementPhoto(index)" class="remove-btn">✕</button>
              </div>
              <div class="image-number">{{ index + 1 }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- нижняя панель -->
      <div class="footer-bar">
        <button type="button" class="copy-link" @click="copyLink">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="7" y="7" width="10" height="10" rx="2" stroke="#6B7280" stroke-width="1.6"/>
            <path d="M7 9H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1"
                  stroke="#6B7280" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Скопировать ссылку на новость
        </button>

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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { createNews, setAkimatFile } from '~/services/akimat'
import SuccessModal from '~/components/layout/modals/SuccessModal.vue'
import Cookies from 'js-cookie'

const router = useRouter()

// пустая строка, чтобы показывался плейсхолдер "Категория"
const newsCategory = ref('')

const newsTitle = ref('')
const showSuccessModal = ref(false)
const newsContent = ref('')
const achievementPhotos = ref([])
const file = ref(null)
const base64File = ref('')

const CHAR_LIMIT = 3500
const charCount = computed(() => (newsContent.value || '').length)

async function convertToBase64(file) {
  if (!file) throw new Error('Файл не выбран')
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const handleAchievementPhotoUpload = (event) => {
  const files = Array.from(event.target.files || [])
  files.forEach((f) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      achievementPhotos.value.push({
        id: Date.now() + Math.random(),
        url: e.target.result,
        file: f
      })
    }
    reader.readAsDataURL(f)
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

async function copyLink() {
  try { await navigator.clipboard.writeText(window.location.href) } catch {}
}

const addNews = async () => {
  try {
    const formData = new FormData()
    let filerRes
    formData.append('Authorization', Cookies.get('token'))
    if (achievementPhotos.value) {
      if (Array.isArray(achievementPhotos.value)) {
        achievementPhotos.value.forEach((a) => formData.append('files', a.file))
      } else {
        formData.append('files', achievementPhotos.value.file)
      }
      filerRes = await setAkimatFile(formData)
    }
    base64File.value = await convertToBase64(file.value)
    const payload = {
      title: newsTitle.value,
      content: newsContent.value,
      categoryId: newsCategory.value || undefined, // ← отправим только если выбрана
      coverImageBase64: base64File.value,
      newsStatusId: 1
    }
    if (filerRes?.data?.success) payload.fileUrl = filerRes.data.files[0].fileUrl
    await createNews(payload)
  } catch (e) {
    console.error('Ошибка при услуги:', e)
  } finally {
    showSuccessModal.value = true
  }
}
</script>

<style lang="scss" scoped>
.news-create{
  background:#fff;
}

/* Назад */
.btn-back{
  display:flex; align-items:center;
  color:#B0892E; background:transparent; border:none;
  font-weight:600; font-size:14px; cursor:pointer;
}

/* Заголовок */
.page-title{
  font-family: "FoglihtenNo06", sans-serif;
  text-transform:uppercase; letter-spacing:.02em;
  font-weight:700; font-size:28px; line-height:36px; color:#111827;
}

/* Разделитель */
.divider{ height:1px; background:#E5E7EB; margin:16px 0; }
.divider--section{ margin-top:12px; margin-bottom:16px; }

/* Поля */
.form-group{ display:flex; flex-direction:column; }
.label{ font-size:14px; color:#6B7280; margin-bottom:8px; }
.label--dark{ color:#111827; font-weight:700; }

.select-shell{ position:relative; display:inline-block; }
.select-icon{
  position:absolute; left:12px; top:50%; transform:translateY(-50%);
  color:#6B7280; pointer-events:none;
}
.form-select{
  width:100%; border:1px solid #E6E8EC; border-radius:12px;
  background:#fff; padding:12px 40px 12px 40px;  /* место под иконки */
  font-size:16px; line-height:24px; color:#111827;
  -webkit-appearance:none; -moz-appearance:none; appearance:none;
}
.form-select--narrow{ max-width:320px; padding: 12px 14px;} /* компактно как в макете */
.select-chevron{
  position:absolute; right:12px; top:50%; transform:translateY(-50%);
  pointer-events:none;
}

.form-input{
  width:100%; border:1px solid #E6E8EC; border-radius:12px;
  background:#fff; padding:12px 14px; font-size:16px; line-height:24px; color:#111827;
}
.form-input::placeholder{ color:#9CA3AF; }

/* Upload */
.upload-area{
  width:100%; min-height:260px;
  border:1px dashed #D1D5DB; border-radius:12px;
  background:#F9FAFB; display:flex; align-items:center; justify-content:center;
}
.upload-placeholder{ text-align:center; }
.upload-icon{ display:flex; align-items:center; justify-content:center; margin-bottom:8px; color:#6B7280; }
.upload-title{ color:#111827; font-weight:700; margin-bottom:6px; }
.upload-hint{ font-size:12px; color:#6B7280; margin-bottom:12px; }
.upload-btn{ background:#ECEFF1; color:#224C4F; font-weight:700; padding:8px 14px; border-radius:10px; }

/* Псевдо-редактор */
.editor-toolbar .editor-btn{
  min-width:32px; height:32px; padding:0 8px;
  background:#F3F4F6; color:#374151; border-radius:8px; font-weight:700;
}
.form-textarea{
  width:100%; min-height:220px; resize:vertical;
  border:1px solid #E6E8EC; border-radius:12px;
  padding:12px; font-size:14px; background:#F9FAFB; color:#111827;
}
.char-row{ display:flex; justify-content:flex-end; margin-top:6px; }
.char-counter{ font-size:12px; color:#9CA3AF; }

/* Прикрепить файл */
.attach-title{ font-size:18px; font-weight:600; margin-bottom:8px; }
.attach-add{
  background:#EEEEEE; height:32px; padding:0 14px; border-radius:10px;
  color:#224C4F; font-weight:700;
}
.achievement-photos-gallery{ margin-top:16px; display:flex; flex-wrap:wrap; gap:16px; }
.gallery-grid{ display:flex; flex-wrap:wrap; gap:16px; margin-top:16px; }
.image-preview-container{ width:120px; height:120px; position:relative; border-radius:8px; overflow:hidden; border:2px solid #E5E7EB; }
.image-preview{ width:120px; height:100%; display:block; }
.image-overlay{ position:absolute; inset:0; background:rgba(0,0,0,.7); display:flex; align-items:center; justify-content:center; gap:12px; opacity:0; transition:opacity .3s ease; }
.image-preview-container:hover .image-overlay{ opacity:1; }
.image-number{ position:absolute; top:4px; left:4px; background:rgba(0,0,0,.7); color:#fff; font-size:12px; font-weight:600; padding:2px 6px; border-radius:4px; min-width:20px; text-align:center; }
.remove-btn{ background:#EF4444; color:#fff; font-size:18px; padding:4px 8px; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; }

/* Нижняя панель */
.footer-bar{
  display:flex; justify-content:space-between; align-items:center; gap:12px;
  margin-top:16px; padding-top:12px; border-top:1px solid #F0F2F5;
}
.copy-link{
  display:flex; align-items:center; gap:8px;
  background:#fff; color:#6B7280; font-weight:600;
  border:1px solid #E6E8EC; border-radius:12px; padding:10px 14px;
}
.copy-link:hover{ border-color:#D1D5DB; }

.btn{ border:none; cursor:pointer; }
.btn-submit{
  height:48px; background:#F7B500; color:#1F2937; padding:0 18px; border-radius:12px; font-weight:700;
}
.btn-submit:hover{ filter:brightness(.98); }
</style>
