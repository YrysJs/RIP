<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { createProduct, getCategories, loadProductFiles } from '~/services/supplier'
import { useUserStore } from '~/store/user'
import { useLoadingStore } from '~/store/loading'
import AppLoader from '~/components/loader/AppLoader.vue'

const router = useRouter()
const userStore = useUserStore()
const loadingStore = useLoadingStore()

// форма
const form = reactive({
  name: '',
  description: '',
  price: '',
  category_id: '1',
  type: 'service',      // 'service' | 'product'
  availability: true,
  country: 'Казахстан',
  city: 'Алматы',
  service_time: '1 день',
  unit: ''              // ед. измерения (только товар)
})
const isProduct = computed(() => form.type === 'product')

const { t } = useI18n()

// справочники
const unitOptions = computed(() => [
  { value: 'Штука', label: t('productUnits.piece') },
  { value: 'Комплект', label: t('productUnits.set') },
  { value: 'Упаковка', label: t('productUnits.package') },
  { value: 'Килограмм', label: t('productUnits.kg') },
  { value: 'Литр', label: t('productUnits.liter') },
  { value: 'Метр', label: t('productUnits.meter') }
])
const categories = ref([])
onMounted(async () => {
  try {
    const res = await getCategories()
    categories.value = res.data || []
    if (categories.value.length) form.category_id = String(categories.value[0].id)
  } catch {
    categories.value = [
      { id: 1, name: t('productCategories.ritualServices') },
      { id: 2, name: t('productCategories.monuments') },
      { id: 3, name: t('productCategories.flowers') },
      { id: 4, name: t('productCategories.other') }
    ]
  }
})

// ---- success modal (UI) ----
const success = reactive({
  open: false,
  title: t('serviceAdd.requestSent'),
  text: t('serviceAdd.underReview'),
})
function lockScroll(v) { document.body.style.overflow = v ? 'hidden' : '' }
function openSuccess(custom = {}) { Object.assign(success, custom, { open: true }); lockScroll(true) }
function closeSuccess() { success.open = false; lockScroll(false); router.push('/supplier/services/consideration') }

const onKey = (e) => { if (e.key === 'Escape' && success.open) closeSuccess() }
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
// ----------------------------

// фото
const photos = ref([])      // [{url, file}]
const fileInput = ref(null)
const selectFile = () => fileInput.value?.click()
const addFile = (file) => {
  // Проверяем размер файла (максимум 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB в байтах
  if (file.size > maxSize) {
    const { $toast } = useNuxtApp()
    $toast.error(`${t('common.file')} "${file.name}" ${t('serviceAdd.fileTooLarge')}`)
    return
  }
  
  const r = new FileReader()
  r.onload = e => e.target?.result && photos.value.push({ url: e.target.result, file })
  r.readAsDataURL(file)
}
const handleFileChange = e => { Array.from(e.target.files || []).forEach(addFile); e.target.value = '' }
const handleDrop = e => { Array.from(e.dataTransfer?.files || []).forEach(addFile) }
const removePhoto = i => photos.value.splice(i, 1)

// Функция для разделения файлов на мелкие массивы
const chunkFiles = (files, chunkSize = 2) => {
  const chunks = []
  for (let i = 0; i < files.length; i += chunkSize) {
    chunks.push(files.slice(i, i + chunkSize))
  }
  return chunks
}

// Функция для загрузки файлов
const uploadFiles = async (files) => {
  const phone = userStore.user?.phone
  if (!phone) {
    throw new Error('Номер телефона не найден')
  }

  console.log('Начинаем загрузку файлов:', files.length, 'файлов')
  console.log('Номер телефона:', phone)

  const fileChunks = chunkFiles(files)
  const uploadedUrls = []

  for (const chunk of fileChunks) {
    try {
      console.log('Загружаем чанк файлов:', chunk.length, 'файлов')
      const response = await loadProductFiles(phone, chunk)
      console.log('Ответ от сервера:', response.data)
      console.log('Полный ответ:', response)
      console.log('Есть ли массив files?', !!response.data?.files)
      console.log('Количество файлов в ответе:', response.data?.files?.length || 0)
      
      // Обрабатываем ответ API - URL находятся в fileUrl внутри объектов файлов
      let urls = []
      
      if (response.data?.files && Array.isArray(response.data.files)) {
        // Извлекаем URL из массива files
        urls = response.data.files
          .map(file => file.fileUrl)
          .filter(url => url) // убираем пустые URL
        console.log('URL из массива files:', urls)
      } else {
        // Попробуем извлечь URL из числовых ключей (0, 1, 2, ...)
        const numericKeys = Object.keys(response.data).filter(key => !isNaN(key))
        if (numericKeys.length > 0) {
          urls = numericKeys
            .map(key => response.data[key]?.fileUrl)
            .filter(url => url) // убираем пустые URL
          console.log('URL из числовых ключей:', urls)
        }
      }
      
      if (urls.length > 0) {
        uploadedUrls.push(...urls)
        console.log('Добавлены URL:', urls)
      } else {
        console.warn('URL не найдены в ответе')
        console.log('Структура ответа:', response.data)
      }
    } catch (error) {
      console.error('Ошибка загрузки файлов:', error)
      throw error
    }
  }

  console.log('Всего загружено URL:', uploadedUrls.length)
  return uploadedUrls
}

// сабмит
const loading = ref(false)
const submitForm = async () => {
  try {
    const { $toast } = useNuxtApp()
    
    if (!form.name.trim()) {
      $toast.error('Введите название')
      return
    }
    if (!form.description.trim()) {
      $toast.error('Введите описание')
      return
    }
    if (!form.price || Number(form.price) <= 0) {
      $toast.error('Введите корректную цену')
      return
    }
    if (isProduct.value && !form.unit) {
      $toast.error('Выберите единицу измерения')
      return
    }

    loading.value = true
    loadingStore.startLoading()

    let imageUrls = []
    
    // Загружаем файлы, если они есть
    if (photos.value.length > 0) {
      const files = photos.value.map(p => p.file).filter(Boolean)
      console.log('Файлы для загрузки:', files.length)
      console.log('Детали файлов:', files.map(f => ({ name: f.name, size: f.size, type: f.type })))
      
      if (files.length > 0) {
        try {
          imageUrls = await uploadFiles(files)
          console.log('Получены URL файлов:', imageUrls)
        } catch (error) {
          console.error('Ошибка при загрузке файлов:', error)
          const { $toast } = useNuxtApp()
          $toast.error('Ошибка при загрузке файлов')
          return
        }
      }
    } else {
      console.log('Нет файлов для загрузки')
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: form.price,
      category_id: form.category_id,
      type: form.type,
      availability: form.availability,
      country: form.country,
      city: form.city,
      service_time: form.service_time,
      image_urls: imageUrls,
      ...(isProduct.value ? { unit: form.unit } : {})
    }

    console.log('Отправляем payload:', payload)

    await createProduct(payload)

    // раньше был alert+router.push — теперь красивый модал
    openSuccess({
      title: 'Заявка отправлена',
      text: 'на рассмотрение!',
    })
  } catch (e) {
    const { $toast } = useNuxtApp()
    $toast.error(e?.response?.data?.message || e?.message || 'Ошибка при создании')
  } finally {
    loading.value = false
    loadingStore.stopLoading()
  }
}
</script>

<template>
  <NuxtLayout name="form">
    <AppLoader v-if="loadingStore.loading" />
    <!-- Шапка -->
    <div class="card header">
      <button class="btn btn-back" @click="router.push('/supplier/services/active')">
        <svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M15 18l-6-6 6-6" stroke="#1F2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Назад</span>
      </button>
      <h1 class="title">Добавление товара/услуги</h1>
    </div>

    <!-- О товаре/услуге -->
    <div class="card section">
      <h2 class="section-title">О товаре/услуге</h2>

      <div class="field">
        <label class="label">Категория</label>
        <div class="select-shell">
          <select v-model="form.category_id" class="control control--select">
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
          <svg class="chevron" width="18" height="18" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="#111827" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>

      <!-- Тип -->
      <div class="field">
        <label class="label">Тип</label>
        <div class="segmented">
          <button :class="['seg-btn', form.type==='service' && 'is-active']" @click="form.type='service'">
            <svg class="seg-ic" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8"/>
              <path d="M8.5 12.5l2.5 2.5 4.5-4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Услуга
          </button>

          <button :class="['seg-btn', form.type==='product' && 'is-active']" @click="form.type='product'">
            <svg class="seg-ic" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Товар
          </button>
        </div>
      </div>

      <div class="field">
        <label class="label">Название</label>
        <input v-model="form.name" type="text" class="control" placeholder="Введите название">
      </div>

      <div class="field">
        <label class="label">Описание</label>
        <textarea v-model="form.description" rows="3" class="control textarea" placeholder="Введите описание"/>
      </div>

      <!-- Цена + Ед. измерения -->
      <div class="row-2">
        <div class="field">
          <label class="label">Цена (KZT)<span class="req">*</span></label>
          <input v-model="form.price" type="number" class="control" placeholder="0">
        </div>

        <div v-if="isProduct" class="field">
          <label class="label">Ед. измерения</label>
          <div class="select-shell">
            <select v-model="form.unit" class="control control--select">
              <option value="" disabled hidden>Выберите</option>
              <option v-for="u in unitOptions" :key="u.value" :value="u.value">{{ u.label }}</option>
            </select>
            <svg class="chevron" width="18" height="18" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="#111827" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </div>
      </div>

      <!-- Доступность -->
      <div class="field">
        <label class="label">Доступность</label>
        <div class="segmented">
          <button :class="['seg-btn', form.availability && 'is-active']" @click="form.availability = true">
            <svg class="seg-ic" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8"/>
              <path d="M8.5 12.5l2.5 2.5 4.5-4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Доступен
          </button>

          <button :class="['seg-btn', !form.availability && 'is-active']" @click="form.availability = false">
            <svg class="seg-ic" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8"/>
              <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
            Недоступен
          </button>
        </div>
      </div>
    </div>

    <!-- Фото -->
    <div class="card section">
      <h2 class="section-title">Фото товара</h2>

      <div class="photos">
        <div class="dz" @click="selectFile" @dragover.prevent @drop.prevent="handleDrop">
          <div class="dz__inner">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 10l5-5 5 5M12 5v10"
                    stroke="#6B7280" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div class="dz__title">Загрузить фото</div>
            <div class="dz__hint">Перетащите файл или загрузите .png, .jpeg</div>
            <button type="button" class="btn btn-ghost">Загрузить</button>
          </div>

          <div v-if="photos.length" class="dz__previews">
            <div v-for="(p,i) in photos" :key="i" class="dz__thumb">
              <img :src="p.url" alt="">
              <button class="thumb-remove" @click.stop="removePhoto(i)">✕</button>
            </div>
          </div>
        </div>

        <input ref="fileInput" type="file" class="hidden" accept="image/*" multiple @change="handleFileChange" />
      </div>
    </div>

    <!-- Местоположение -->
    <div class="card section">
      <h2 class="section-title">Местоположение оказания услуг</h2>

      <div class="row-2">
        <div class="field">
          <label class="label">Страна</label>
          <div class="select-shell">
            <select v-model="form.country" class="control control--select">
              <option value="Казахстан">Казахстан</option>
              <option value="Узбекистан">Узбекистан</option>
            </select>
            <svg class="chevron" width="18" height="18" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="#111827" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </div>

        <div class="field">
          <label class="label">Город</label>
          <div class="select-shell">
            <select v-model="form.city" class="control control--select">
              <option value="Алматы">Алматы</option>
            </select>
            <svg class="chevron" width="18" height="18" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="#111827" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Доп информация -->
    <div class="card section">
      <h2 class="section-title">Доп информация</h2>
      <div class="field">
        <label class="label">Время оказания услуги/товара</label>
        <div class="select-shell">
          <select v-model="form.service_time" class="control control--select">
            <option value="Менее 1 дня">Менее 1 дня</option>
            <option value="1 день">1 день</option>
            <option value="от 1 до 3 дней">от 1 до 3 дней</option>
            <option value="неделя">неделя</option>
            <option value="1 час">1 час</option>
          </select>
          <svg class="chevron" width="18" height="18" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="#111827" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
      </div>
    </div>

    <!-- Кнопки -->
    <div class="card actions">
      <button class="btn btn-ghost" :disabled="loading" @click="() => { const { $toast } = useNuxtApp(); $toast.info('Временно без предпросмотра') }">Предпросмотр</button>
      <button class="btn btn-primary" :disabled="loading" @click="submitForm">
        <span v-if="loading">Создание…</span>
        <span v-else>Опубликовать</span>
      </button>
    </div>

    <!-- Success Modal -->
    <div v-if="success.open" class="su-modal__overlay" @click.self="closeSuccess">
      <div class="su-modal" role="dialog" aria-modal="true" aria-labelledby="su-modal-title">
        <div class="su-modal__icon">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="10" stroke="#22C55E" stroke-width="1.6" fill="white"/>
            <path d="M7.5 12.5l3 3 6-6" stroke="#22C55E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3 id="su-modal-title" class="su-modal__title">{{ success.title }}</h3>
        <p class="su-modal__text">{{ success.text }}</p>
        <button type="button" class="btn btn-primary su-modal__btn" @click="closeSuccess">Закрыть</button>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
/* Карточки */
.card{ background:#fff; border-radius:16px; padding:20px; }
.header{ display:flex; align-items:center; gap:16px; margin-bottom:16px; }
.section{ display:flex; flex-direction:column; gap:14px; margin-bottom:16px; }
.section-title{ font-size:18px; font-weight:600; }

/* Заголовок */
.title{ font-size:32px; font-weight:500; }

/* Кнопки */
.btn{ border:none; cursor:pointer; border-radius:12px; font-weight:700; transition:.15s; }
.btn-back{ height:40px; padding:8px 14px; display:flex; align-items:center; gap:8px; background:#F7B500; color:#1F2937; }
.btn-back:hover{ filter:brightness(.98); }
.btn-primary{ height:52px; padding:0 18px; background:#F7B500; color:#1F2937; }
.btn-primary:hover{ filter:brightness(.98); }
.btn-ghost{ height:52px; padding:0 16px; background:transparent; color:#1F2937; border:1px solid #F7B500; }
.btn-ghost:hover{ background:rgba(247,181,0,.08); }
.actions{ display:flex; justify-content:flex-end; gap:10px; }
.icon{ width:18px; height:18px; }

/* Поля */
.field{ display:flex; flex-direction:column; gap:6px; }
.label{ font-size:14px; color:#6B7280; }
.req{ color:#F7901E; margin-left:2px; }
.control{ width:100%; height:44px; border:1px solid #E6E8EC; border-radius:12px; padding:10px 14px; font-size:16px; color:#111827; background:#fff; }
.control:focus{ outline:none; border-color:#D0D5DD; box-shadow:0 0 0 3px rgba(56,148,155,.12); }
.textarea{ height:auto; min-height:110px; resize:vertical; }

/* Селекты с «chevron» */
.select-shell{ position:relative; }
.control--select{ appearance:none; padding-right:38px; }
.chevron{ position:absolute; right:12px; top:50%; transform:translateY(-50%); pointer-events:none; }

/* Две колонки */
.row-2{ display:grid; grid-template-columns: 1fr 220px; gap:12px; align-items:end; }
@media (max-width: 880px){ .row-2{ grid-template-columns: 1fr; } }

/* Сегмент-переключатели */
.segmented{ display:inline-flex; gap:6px; padding:4px; border-radius:12px; background:#F9FAFB; border:1px solid #E6E8EC; }
.seg-btn{ display:flex; align-items:center; gap:8px; min-width:120px; height:36px; padding:0 14px; border-radius:8px; background:transparent; color:#374151; font-weight:700; }
.seg-btn.is-active{ background:#F7B500; color:#1F2937; }
.seg-ic{ width:18px; height:18px; }

/* Фото */
.photos{ display:block; }
.dz{ position:relative; min-height:260px; border:1px dashed #D1D5DB; border-radius:12px; background:#F9FAFB; cursor:pointer; overflow:hidden; }
.dz:hover{ background:#F3F4F6; }
.dz__inner{ display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:28px 12px; text-align:center; color:#6B7280; }
.dz__title{ color:#111827; font-weight:700; font-size:22px; }
.dz__hint{ font-size:14px; }
.dz__previews{ position:absolute; left:12px; right:12px; bottom:12px; display:flex; gap:8px; flex-wrap:wrap; }
.dz__thumb{ position:relative; width:72px; height:72px; border-radius:8px; overflow:hidden; border:1px solid #E5E7EB; background:#fff; }
.dz__thumb img{ width:100%; height:100%; object-fit:cover; }
.thumb-remove{ position:absolute; top:4px; right:4px; width:20px; height:20px; border-radius:50%; background:#EF4444; color:#fff; border:none; font-size:12px; }

/* Success modal */
.su-modal__overlay{ position:fixed; inset:0; background:rgba(17,24,39,.45); display:flex; align-items:center; justify-content:center; z-index:1000; backdrop-filter:blur(2px); }
.su-modal{ position:relative; width:min(480px, 92vw); background:#fff; border-radius:16px; padding:28px 24px 22px; box-shadow:0 20px 60px rgba(0,0,0,.18); text-align:center; }
.su-modal::after{display: none }
.su-modal__icon{ width:56px; height:56px; margin:0 auto 12px; display:grid; place-items:center; border-radius:50%; background:#ECFDF5; border:1px solid #A7F3D0; }
.su-modal__icon svg{ width:34px; height:34px; }
.su-modal__title{ font-size:20px; font-weight:700; color:#0F172A; margin:4px 0; }
.su-modal__text{ font-size:16px; color:#475569; margin-bottom:18px; }
.su-modal__btn{ width:100%; }

/* скрытый input */
.hidden{ display:none; }

/* Мобильные стили */
@media (max-width: 768px) {
  :global(.form-page) {
    background: #ffffff !important;
  }

  :global(.form-page .supplier) {
    background: #ffffff !important;
  }

  .card {
    margin: 0;
    padding: 0;
    border-radius: 0;
    box-shadow: none;
    background: transparent;
  }

  .header {
    margin: 0 16px 16px;
    padding: 16px;
    background: transparent;
    border-radius: 0;
  }

  .title {
    font-size: 18px;
    font-weight: 600;
    line-height: 1.2;
    color: #1C140E;
    margin: 0;
  }

  .btn-back {
    height: 36px;
    padding: 6px 12px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 8px;
  }

  .section {
    gap: 12px;
    margin: 0 16px 16px;
    padding: 16px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #1C140E;
  }

  .field {
    gap: 6px;
    margin-bottom: 12px;
  }

  .label {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 2px;
  }

  .control {
    height: 44px;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 16px;
    border: 1px solid #E5E7EB;
    background: #ffffff;
  }

  .control:focus {
    border-color: #F7B500;
    box-shadow: 0 0 0 3px rgba(247, 181, 0, 0.1);
  }

  .textarea {
    min-height: 100px;
    padding: 10px 14px;
    resize: vertical;
  }

  .row-2 {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .segmented {
    width: 100%;
    gap: 4px;
    padding: 4px;
    background: #F3F4F6;
    border: 1px solid #E5E7EB;
  }

  .seg-btn {
    flex: 1;
    min-width: 0;
    height: 44px;
    padding: 0 12px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 6px;
  }

  .seg-ic {
    width: 16px;
    height: 16px;
  }

  .dz {
    min-height: 160px;
    border-radius: 8px;
    border: 2px dashed #D1D5DB;
    background: #F9FAFB;
  }

  .dz:hover {
    background: #F3F4F6;
    border-color: #F7B500;
  }

  .dz__inner {
    padding: 20px 12px;
    gap: 8px;
  }

  .dz__title {
    font-size: 16px;
    font-weight: 600;
    color: #1C140E;
  }

  .dz__hint {
    font-size: 12px;
    color: #6B7280;
  }

  .dz__previews {
    left: 12px;
    right: 12px;
    bottom: 12px;
    gap: 8px;
  }

  .dz__thumb {
    width: 64px;
    height: 64px;
    border-radius: 8px;
    border: 1px solid #E5E7EB;
  }

  .thumb-remove {
    width: 20px;
    height: 20px;
    font-size: 12px;
    border-radius: 50%;
  }

  .actions {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin: 0 16px 16px;
  }

  .btn-primary,
  .btn-ghost {
    width: 100%;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 8px;
  }

  .btn-ghost {
    order: 1;
    background: #ffffff;
    color: #374151;
    border: 1px solid #E5E7EB;
  }

  .btn-primary {
    order: 2;
    background: #F7B500;
    color: #1C140E;
  }

  .su-modal {
    margin: 16px;
    padding: 24px 20px 20px;
    border-radius: 12px;
  }

  .su-modal__title {
    font-size: 18px;
    font-weight: 700;
  }

  .su-modal__text {
    font-size: 14px;
    color: #6B7280;
  }

  .su-modal__btn {
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 8px;
  }
}
</style>
