<template>
  <NuxtLayout name="user" class="news-form-page">
    <!-- back -->
    <button class="btn-back mb-[16px]" @click="router.push('/user/news')">
      <img src="/icons/arrow-left-primary.svg" class="w-4 h-4 mr-[10px]" />
      {{ $t('newsForm.back') }}
    </button>

    <div class="news-create ">
      <h1 class="page-title">
        {{ isEdit ? $t('newsForm.editTitle') : $t('newsForm.createTitle') }}
      </h1>

      <!-- Категория -->
      <div class="form-group form-group--select mb-[12px]">
        <label class="label">{{ $t('newsForm.selectCategory') }}:</label>
        <div class="select-shell">
          <select class="form-select form-select--narrow" v-model="newsCategory" required>
            <option value="" disabled hidden>{{ $t('common.category') }}</option>
            <option :value="1">{{ $t('user.news.announcements') }}</option>
            <option :value="2">{{ $t('user.news.socialSupport') }}</option>
            <option :value="3">{{ $t('user.news.legislationChanges') }}</option>
          </select>
        </div>
      </div>

      <div class="divider divider--section"></div>

      <!-- Название -->
      <div class="form-group mb-[20px]">
        <label class="label label--dark">{{ $t('newsForm.newsTitle') }}:</label>
        <input type="text" class="form-input" :placeholder="$t('newsForm.enterTitle')" v-model="newsTitle" />
      </div>

      <!-- Обложка -->
      <SixDropzone
        v-model="file"
        :accept="['image/jpeg', 'image/png']"
        class="w-full upload-area mb-[20px] cursor-pointer"
        :label="$t('newsForm.selectFile')"
      >
        <template #default>
          <div class="upload-placeholder">
            <!-- если уже есть обложка и новый файл не выбран — покажем превью -->
            <img
              v-if="coverPreview && !file"
              :src="coverPreview"
              alt="Обложка"
              style="max-width: 260px; max-height: 160px; border-radius: 12px; margin: 0 auto 12px;"
            />
            <div class="upload-icon" aria-hidden>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 10l5-5 5 5M12 5v10"
                      stroke="#6B7280" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="upload-title">{{ $t('newsForm.uploadCoverPhoto') }}</p>
            <p class="upload-hint">
              {{ $t('newsForm.dragOrUpload') }}: <b>.png, .jpeg</b>
            </p>
            <button type="button" class="upload-btn">{{ $t('newsFormDetails.upload') }}</button>
          </div>
        </template>
      </SixDropzone>

      <!-- Текст -->
      <div class="form-group mb-[12px]">
        <label class="label">{{ $t('newsFormDetails.fillMainText') }}:</label>

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
          :placeholder="t('user.news.textPlaceholder')"
        ></textarea>
      </div>

      <div class="char-row">
        <span class="char-counter">{{ charCount }}/{{ CHAR_LIMIT }} {{ $t('common.characters') }}</span>
      </div>

      <!-- Прикрепить файл -->
      <div class="mb-[8px]">
        <h3 class="attach-title">{{ $t('user.news.attachFile') }}</h3>

        <button @click="$refs.achievementFileInput.click()" class="attach-add">
          {{ $t('common.add') }}
        </button>

        <input ref="achievementFileInput" type="file" multiple @change="handleAchievementPhotoUpload" class="hidden" />

        <div v-if="achievementPhotos.length > 0" class="achievement-photos-gallery">
          <div class="gallery-grid">
            <div v-for="(photo, index) in achievementPhotos" :key="photo.id" class="image-preview-container">
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
        <!-- <button type="button" class="copy-link" @click="copyLink">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="7" y="7" width="10" height="10" rx="2" stroke="#6B7280" stroke-width="1.6"/>
            <path d="M7 9H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1"
                  stroke="#6B7280" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Скопировать ссылку на новость
        </button> -->

        <button 
          class="btn btn-submit" 
          :class="{ 'btn-submit--disabled': !isFormValid }"
          :disabled="!isFormValid"
          @click="saveNews"
        >
          {{ isEdit ? $t('common.save') : $t('common.publish') }}
        </button>
      </div>
    </div>

    <Teleport to="body">
      <SuccessModal
        v-if="showSuccessModal"
        :title="isEdit ? $t('user.news.changesSaved') : $t('user.news.newsPublished')"
        :text="$t('common.close')"
        :show-button="true"
        @close="closeSuccessModal"
      />
    </Teleport>
  </NuxtLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createNews, setAkimatFile, updateNews } from '~/services/akimat'
import { useNewsStore } from '~/store/news'
import SuccessModal from '~/components/layout/modals/SuccessModal.vue'
import Cookies from 'js-cookie'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const newsStore = useNewsStore()

// edit mode
const editId = computed(() => Number(route.query.id || 0))
const isEdit = computed(() => !!editId.value)

const newsCategory = ref('')   // 1|2|3
const newsTitle    = ref('')
const newsContent  = ref('')

const coverPreview = ref('')   // URL существующей обложки (если редактируем)
const file         = ref(null) // новый файл с дропзоны

const achievementPhotos = ref([])
const showSuccessModal = ref(false)

const CHAR_LIMIT = 3500
const charCount = computed(() => (newsContent.value || '').length)

// Валидация формы
const isFormValid = computed(() => {
  return newsCategory.value && 
         newsTitle.value.trim() && 
         newsContent.value.trim()
})

// предварительное заполнение при редактировании
onMounted(async () => {
  if (!isEdit.value) return

  // 1) сначала пробуем взять из стора (если открывали карточку перед этим)
  let n = newsStore.selectedNews && String(newsStore.selectedNews.id) === String(editId.value)
    ? newsStore.selectedNews
    : null

  // 2) если в сторе нет — аккуратно дотягиваем напрямую
  if (!n) {
    try {
      // если у тебя есть общий baseURL — можешь заменить на $fetch(`${baseURL}/news/${editId.value}`)
      n = await $fetch(`/news/${editId.value}`)
    } catch (error) {
      // ок, без деталей тоже проживём
      console.log('Failed to fetch news:', error)
    }
  }

  if (n) {
    newsCategory.value = n.category?.id ?? ''
    newsTitle.value    = n.title ?? ''
    newsContent.value  = n.content ?? ''
    coverPreview.value = n.coverImageUrl ?? ''
  }
})

// ------- файлы доп. приложений
const handleAchievementPhotoUpload = (event) => {
  const files = Array.from(event.target.files || [])
  files.forEach((f) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      achievementPhotos.value.push({ id: Date.now() + Math.random(), url: e.target.result, file: f })
    }
    reader.readAsDataURL(f)
  })
  event.target.value = ''
}
const removeAchievementPhoto = (index) => { achievementPhotos.value.splice(index, 1) }

// ------- утилиты
async function convertToBase64(f) {
  if (!f) return ''
  const buf = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(f)
  })
  return String(buf).split(',')[1] || ''
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  router.push('/user/news')
}
async function copyLink() {
  try { 
    await navigator.clipboard.writeText(window.location.href) 
  } catch (error) {
    console.log('Copy failed:', error)
  }
}

// ------- сохранить
const saveNews = async () => {
  try {
    // загрузка прикреплённых файлов (не обложка)
    let filerRes
    if (achievementPhotos.value?.length) {
      const formData = new FormData()
      formData.append('Authorization', Cookies.get('token') || '')
      achievementPhotos.value.forEach((a) => formData.append('files', a.file))
      filerRes = await setAkimatFile(formData)
    }

    // Создаем FormData для основного запроса
    const formData = new FormData()
    
    // Добавляем данные в JSON формате
    const dataPayload = {
      title: newsTitle.value,
      content: newsContent.value,
      categoryId: newsCategory.value || undefined,
      ...(isEdit.value ? {} : { newsStatusId: 1 })
    }
    
    if (filerRes?.data?.success) dataPayload.fileUrl = filerRes.data.files?.[0]?.fileUrl
    
    formData.append('data', JSON.stringify(dataPayload))
    
    // Добавляем файл обложки если есть
    if (file.value) {
      formData.append('coverImage', file.value)
    }

    if (isEdit.value) {
      await updateNews(editId.value, formData)
    } else {
      await createNews(formData)
    }
    
    // Показываем модалку успеха только если запрос прошел успешно
    showSuccessModal.value = true
  } catch (e) {
    console.error('Ошибка при сохранении новости:', e)
    // Показываем тост об ошибке
    const { $toast } = useNuxtApp()
    $toast.error(t('errors.serverError'))
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
  font-family: "Manrope", sans-serif;
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
  display:flex; justify-content: flex-end; align-items:center; gap:12px;
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
.btn-submit--disabled{
  background:#E5E7EB; color:#9CA3AF; cursor:not-allowed;
}
.btn-submit--disabled:hover{ filter:none; }

/* Мобильная адаптация */
@media (max-width: 768px) {
  /* Белый фон для страницы создания новостей */
  :global(.news-form-page) {
    background: #ffffff !important;
  }
  
  :global(.news-form-page .user) {
    background: #ffffff !important;
  }

  /* Добавляем top padding */
  .news-create {
    padding-top: 20px;
  }

  /* Адаптируем кнопку назад */
  .btn-back {
    font-size: 16px;
    padding: 8px 0;
    margin-bottom: 20px;
  }

  /* Адаптируем заголовок */
  .page-title {
    font-size: 24px;
    line-height: 28px;
    margin-bottom: 20px;
    font-family: "Manrope", sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  /* Адаптируем поля формы */
  .form-group {
    margin-bottom: 16px;
  }

  .label {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .label--dark {
    font-size: 16px;
    font-weight: 600;
  }

  /* Адаптируем селект */
  .form-select {
    padding: 12px 16px;
    font-size: 16px;
    border: 1px solid #E5E7EB;
    background: #f9f9f9;
    color: #6B7280;
  }

  .form-select--narrow {
    max-width: 100%;
    padding: 12px 16px;
  }

  /* Адаптируем инпут */
  .form-input {
    padding: 12px 16px;
    font-size: 16px;
    border: 1px solid #E5E7EB;
    background: #f9f9f9;
    color: #6B7280;
  }

  .form-input::placeholder {
    color: #9CA3AF;
  }

  /* Адаптируем область загрузки */
  .upload-area {
    min-height: 200px;
    border: 2px dashed #D1D5DB;
    border-radius: 12px;
    background: #F9FAFB;
  }

  .upload-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .upload-hint {
    font-size: 14px;
    margin-bottom: 16px;
  }

  .upload-btn {
    padding: 12px 24px;
    font-size: 16px;
    border-radius: 12px;
  }

  /* Адаптируем текстовую область */
  .form-textarea {
    min-height: 200px;
    padding: 16px;
    font-size: 16px;
    border: 1px solid #E5E7EB;
    background: #f9f9f9;
    color: #6B7280;
  }

  .char-counter {
    font-size: 14px;
    color: #9CA3AF;
  }

  /* Адаптируем раздел прикрепления файлов */
  .attach-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #111827;
  }

  .attach-add {
    font-size: 14px;
    font-weight: 500;
    border-radius: 8px;
    background: #F9FAFB;
    color: #6B7280;
    border: 1px solid #E5E7EB;
    width: auto;
    display: inline-block;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .attach-add:hover {
    background: #F3F4F6;
    border-color: #D1D5DB;
  }

  /* Адаптируем галерею файлов */
  .gallery-grid {
    gap: 12px;
    margin-top: 16px;
  }

  .image-preview-container {
    width: 80px;
    height: 80px;
    border-radius: 8px;
  }

  .image-preview {
    width: 80px;
    height: 80px;
    object-fit: cover;
  }

  .image-overlay {
    border-radius: 8px;
  }

  .remove-btn {
    width: 24px;
    height: 24px;
    font-size: 14px;
  }

  .image-number {
    font-size: 10px;
    padding: 2px 4px;
  }

  /* Адаптируем нижнюю панель */
  .footer-bar {
    flex-direction: column;
    gap: 16px;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #E5E7EB;
    margin-bottom: 80px;
  }

  .copy-link {
    width: 100%;
    justify-content: center;
    padding: 16px;
    font-size: 16px;
    border-radius: 12px;
  }

  .btn-submit {
    width: 100%;
    height: 56px;
    font-size: 18px;
    font-weight: 700;
    border-radius: 12px;
    background: #F7B500;
    color: #1F2937;
  }

  .btn-submit--disabled {
    background: #E5E7EB;
    color: #9CA3AF;
    cursor: not-allowed;
  }

  /* Скрываем панель редактора на мобильных */
  .editor-toolbar {
    display: none;
  }

  /* Дополнительные стили */
  .text-black {
    margin-top: 20px;
  }
}
</style>
