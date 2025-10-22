<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { updateProduct, getProductById, getCategories, loadProductFiles } from '~/services/supplier'
import { useUserStore } from '~/store/user'
import { useLoadingStore } from '~/store/loading'
import AppLoader from '~/components/loader/AppLoader.vue'

const route = useRoute()
const router = useRouter()
const productId = route.params.id
const userStore = useUserStore()
const loadingStore = useLoadingStore()

// --- форма ---
const form = reactive({
  name: '',
  description: '',
  price: '',
  category_id: '1',
  type: 'service',
  availability: true,
  country: 'Казахстан',
  city: 'Алматы',
  service_time: '1 день'
})

const photos = ref([])            // новые [{ url, file }]
const existingPhotos = ref([])    // существующие [{ url, id }]
const fileInput = ref(null)
const loading = ref(false)
const categories = ref([])
const isLoadingProduct = ref(true)
const product = ref(null)

// --- модалка успеха ---
const success = reactive({
  open: false,
  title: 'Изменения сохранены',
  text: 'на рассмотрение!',
})
const lockScroll = (v) => { document.body.style.overflow = v ? 'hidden' : '' }
function openSuccess(custom = {}) { Object.assign(success, custom, { open: true }); lockScroll(true) }
function closeSuccess() { success.open = false; lockScroll(false); router.push('/supplier/services/consideration') }
const onKey = (e) => { if (e.key === 'Escape' && success.open) closeSuccess() }
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

// --- файлы ---
function selectFile(){ fileInput.value?.click() }
function addFile(file){
  const r = new FileReader()
  r.onload = e => { if (e.target?.result) photos.value.push({ url: e.target.result, file }) }
  r.readAsDataURL(file)
}
function handleFileChange(e){
  const files = e.target.files
  if (files) Array.from(files).forEach(addFile)
  e.target.value = ''
}
function handleDrop(e){
  const files = e.dataTransfer?.files
  if (files) Array.from(files).forEach(addFile)
}
function removePhoto(i){ photos.value.splice(i, 1) }
function removeExistingPhoto(i){ existingPhotos.value.splice(i, 1) }

// --- функции для загрузки файлов ---
// Функция для разделения файлов на мелкие массивы
const chunkFiles = (files, chunkSize = 3) => {
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

// --- helpers ---
function showPreview(){
  const { $toast } = useNuxtApp()
  
  if (!form.name.trim()) {
    $toast.error('Введите название для предпросмотра')
    return
  }
  if (!form.description.trim()) {
    $toast.error('Введите описание для предпросмотра')
    return
  }

  $toast.info(`Предпросмотр:

Название: ${form.name}
Описание: ${form.description}
Цена: ${form.price} ₸
Тип: ${form.type === 'service' ? 'Услуга' : 'Товар'}
Категория: ${getCategoryName(form.category_id)}
Страна: ${form.country}
Город: ${form.city}
Срок: ${form.service_time}
Доступность: ${form.availability ? 'Доступен' : 'Недоступен'}
Существующих фото: ${existingPhotos.value.length}
Новых фото: ${photos.value.length}`)
}
function getCategoryName(id){
  const c = categories.value.find(cat => String(cat.id) === String(id))
  return c ? c.name : 'Неизвестная категория'
}

// --- submit ---
async function submitForm(){
  try{
    const { $toast } = useNuxtApp()
    
    if (!form.name.trim()) {
      $toast.error('Пожалуйста, введите название')
      return
    }
    if (!form.description.trim()) {
      $toast.error('Пожалуйста, введите описание')
      return
    }
    if (!form.price || parseFloat(form.price) <= 0) {
      $toast.error('Введите корректную цену')
      return
    }

    loading.value = true
    loadingStore.startLoading()

    let imageUrls = []
    
    // Загружаем новые файлы, если они есть
    if (photos.value.length > 0) {
      const files = photos.value.map(p => p.file).filter(Boolean)
      console.log('Файлы для загрузки:', files.length)
      console.log('Детали файлов:', files.map(f => ({ name: f.name, size: f.size, type: f.type })))
      
      if (files.length > 0) {
        try {
          const newUrls = await uploadFiles(files)
          console.log('Получены URL новых файлов:', newUrls)
          imageUrls.push(...newUrls)
        } catch (error) {
          console.error('Ошибка при загрузке файлов:', error)
          $toast.error('Ошибка при загрузке файлов')
          return
        }
      }
    } else {
      console.log('Нет новых файлов для загрузки')
    }

    // Добавляем существующие URL (если пользователь их не удалил)
    const existingUrls = existingPhotos.value.map(p => p.url).filter(Boolean)
    if (existingUrls.length > 0) {
      console.log('Сохраняем существующие URL:', existingUrls)
      imageUrls.push(...existingUrls)
    }

    const productData = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: form.price,
      category_id: form.category_id,
      type: form.type,
      availability: form.availability,
      country: form.country,
      city: form.city,
      service_time: form.service_time,
      image_urls: imageUrls
    }

    console.log('Отправляем payload:', productData)

    await updateProduct(productId, productData)
    openSuccess({ title: 'Изменения сохранены', text: 'на рассмотрение!' })
  } catch (error){
    console.error('Ошибка при обновлении товара/услуги:', error)
    const { $toast } = useNuxtApp()
    const msg = error?.response?.data?.message || error?.message || 'Ошибка при обновлении товара/услуги. Попробуйте ещё раз.'
    $toast.error(msg)
  } finally {
    loading.value = false
    loadingStore.stopLoading()
  }
}

// --- загрузка товара и категорий ---
async function loadProduct(){
  try{
    isLoadingProduct.value = true
    const response = await getProductById(productId)
    product.value = response.data

    if (product.value){
      form.name = product.value.name || ''
      form.description = product.value.description || ''
      form.price = product.value.price || ''
      form.category_id = product.value.category_id?.toString() || '1'
      form.type = product.value.type || 'service'
      form.availability = product.value.availability ?? true
      form.country = product.value.country || 'Казахстан'
      form.city = product.value.city || 'Алматы'
      form.service_time = product.value.service_time || '1 день'

      if (Array.isArray(product.value.image_urls)){
        existingPhotos.value = product.value.image_urls.map((url, i) => ({ url, id: i }))
      }
    }
  } finally {
    isLoadingProduct.value = false
  }
}

onMounted(async () => {
  try{
    const [catRes] = await Promise.all([ getCategories(), loadProduct() ])
    categories.value = catRes.data || []
  } catch (e){
    console.error('Ошибка при загрузке данных:', e)
    categories.value = [
      { id: 1, name: 'Ритуальные услуги' },
      { id: 2, name: 'Памятники и мемориалы' },
      { id: 3, name: 'Цветы и венки' },
      { id: 4, name: 'Прочие услуги' }
    ]
  }
})
</script>

<template>
  <NuxtLayout name="form">
    <AppLoader v-if="loadingStore.loading" />
    <!-- Индикатор загрузки -->
    <div v-if="isLoadingProduct" class="flex items-center justify-center bg-white p-8 rounded-2xl mb-4">
      <div class="text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F7B500] mx-auto mb-4"></div>
        <p class="text-gray-600">Загрузка данных товара/услуги...</p>
      </div>
    </div>

    <!-- Основная форма -->
    <template v-else>
      <!-- Шапка -->
      <div class="card header">
        <button class="btn btn-back" @click="router.push('/supplier/services/active')">
          <svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 18l-6-6 6-6" stroke="#1F2937" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Назад</span>
        </button>
        <h1 class="title">Редактирование товара/услуги</h1>
      </div>

      <!-- О товаре/услуге -->
      <div class="card section">
        <h2 class="section-title">О товаре/услуге</h2>

        <div class="field">
          <label class="label">Категория</label>
          <div class="select-shell">
            <select v-model="form.category_id" class="control control--select">
              <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
            </select>
            <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#111827" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </div>

        <!-- Тип -->
        <div class="field">
          <label class="label">Тип</label>
          <div class="segmented">
            <button :class="['seg-btn', form.type==='service' && 'is-active']" @click="form.type='service'">
              <svg class="seg-ic" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8"/>
                <path d="M8.5 12.5l2.5 2.5 4.5-4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Услуга
            </button>
            <button :class="['seg-btn', form.type==='product' && 'is-active']" @click="form.type='product'">
              <svg class="seg-ic" viewBox="0 0 24 24" fill="none">
                <path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Товар
            </button>
          </div>
        </div>

        <div class="field">
          <label class="label">Название</label>
          <input v-model="form.name" type="text" class="control" placeholder="Введите название" />
        </div>

        <div class="field">
          <label class="label">Описание</label>
          <textarea v-model="form.description" rows="3" class="control textarea" placeholder="Введите описание" />
        </div>

        <!-- Цена -->
        <div class="field">
          <label class="label">Цена (KZT)<span class="req">*</span></label>
          <input v-model="form.price" type="number" class="control" placeholder="0" />
        </div>

        <!-- Доступность -->
        <div class="field">
          <label class="label">Доступность</label>
          <div class="segmented">
            <button :class="['seg-btn', form.availability && 'is-active']" @click="form.availability=true">Доступен</button>
            <button :class="['seg-btn', !form.availability && 'is-active']" @click="form.availability=false">Недоступен</button>
          </div>
        </div>
      </div>

      <!-- Фото -->
      <div class="card section">
        <h2 class="section-title">Фото товара</h2>

        <!-- Существующие -->
        <div v-if="existingPhotos.length" class="mb-3">
          <div class="thumbs">
            <div v-for="(photo, index) in existingPhotos" :key="'existing-'+index" class="thumb">
              <img :src="photo.url" alt="" />
              <button class="thumb-remove" @click="removeExistingPhoto(index)">✕</button>
            </div>
          </div>
        </div>

        <!-- Новые -->
        <div v-if="photos.length" class="mb-2">
          <div class="thumbs">
            <div v-for="(photo, index) in photos" :key="'new-'+index" class="thumb">
              <img :src="photo.url" alt="" />
              <button class="thumb-remove" @click="removePhoto(index)">✕</button>
            </div>
          </div>
        </div>

        <!-- Дроп-зона -->
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
            <div v-for="(p,i) in photos" :key="'preview-'+i" class="dz__thumb">
              <img :src="p.url" alt="">
              <button class="thumb-remove" @click.stop="removePhoto(i)">✕</button>
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
              <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#111827" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
          </div>

          <div class="field">
            <label class="label">Город</label>
            <div class="select-shell">
              <select v-model="form.city" class="control control--select">
                <option value="Алматы">Алматы</option>
              </select>
              <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#111827" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
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
            <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#111827" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </div>
      </div>

      <!-- Кнопки -->
      <div class="card actions">
        <button class="btn btn-ghost" :disabled="loading" @click="showPreview">Предпросмотр</button>
        <button class="btn btn-primary" :disabled="loading" @click="submitForm">
          <span v-if="loading">Сохранение...</span>
          <span v-else>Сохранить изменения</span>
        </button>
      </div>
    </template>

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
/* Карточки / заголовки */
.card{ background:#fff; border-radius:16px; padding:20px; }
.header{ display:flex; align-items:center; gap:16px; margin-bottom:16px; }
.section{ display:flex; flex-direction:column; gap:14px; margin-bottom:16px; }
.section-title{ font-size:18px; font-weight:600; }
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

/* Поля/селекты */
.field{ display:flex; flex-direction:column; gap:6px; }
.label{ font-size:14px; color:#6B7280; }
.req{ color:#F7901E; margin-left:2px; }
.control{
  width:100%; height:44px; border:1px solid #E6E8EC; border-radius:12px;
  padding:10px 14px; font-size:16px; color:#111827; background:#fff;
}
.control:focus{ outline:none; border-color:#D0D5DD; box-shadow:0 0 0 3px rgba(247,181,0,.15); }
.textarea{ height:auto; min-height:110px; resize:vertical; }
.select-shell{ position:relative; }
.control--select{ appearance:none; padding-right:38px; }
.chevron{ position:absolute; right:12px; top:50%; transform:translateY(-50%); pointer-events:none; }

/* Две колонки для пар полей */
.row-2{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
@media (max-width: 880px){ .row-2{ grid-template-columns: 1fr; } }

/* Сегменты (тип/доступность) */
.segmented{ display:inline-flex; gap:8px; }
.seg-btn{
  display:flex; align-items:center; gap:8px;
  height:36px; padding:0 14px;
  border-radius:999px; border:1px solid transparent;
  background:#F5F7FA; color:#1F2937; font-weight:700;
}
.seg-btn:hover{ background:#EEF2F6; }
.seg-btn.is-active{ background:#F7B500; color:#1F2937; border-color:#F7B500; box-shadow:0 0 0 3px rgba(247,181,0,.18); }
.seg-ic{ width:18px; height:18px; }

/* Фото */
.thumbs{ display:flex; flex-wrap:wrap; gap:10px; }
.thumb{ position:relative; width:96px; height:96px; border-radius:10px; overflow:hidden; border:1px solid #E5E7EB; background:#fff; }
.thumb img{ width:100%; height:100%; object-fit:cover; }
.thumb-remove{ position:absolute; top:4px; right:4px; width:22px; height:22px; border-radius:50%; background:#EF4444; color:#fff; border:none; font-size:12px; }

/* Дроп-зона */
.dz{ position:relative; min-height:240px; border:1px dashed #D1D5DB; border-radius:12px; background:#F9FAFB; cursor:pointer; overflow:hidden; }
.dz:hover{ background:#F3F4F6; }
.dz__inner{ display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:28px 12px; text-align:center; color:#6B7280; }
.dz__title{ color:#111827; font-weight:700; font-size:22px; }
.dz__hint{ font-size:14px; }
.dz__previews{ position:absolute; left:12px; right:12px; bottom:12px; display:flex; gap:8px; flex-wrap:wrap; }
.dz__thumb{ position:relative; width:72px; height:72px; border-radius:8px; overflow:hidden; border:1px solid #E5E7EB; background:#fff; }
.dz__thumb img{ width:100%; height:100%; object-fit:cover; }

/* скрытый input */
.hidden{ display:none; }
/* === Success modal (фикс размеров и центрирование) === */
.su-modal__overlay{
  position: fixed;
  inset: 0;
  background: rgba(17,24,39,.45);
  display: grid;             /* надёжное центрирование */
  place-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.su-modal{
  width: min(520px, 92vw);    /* фикс ширины */
  background: #fff;
  border-radius: 16px;
  padding: 28px 24px 22px;
  box-shadow: 0 20px 60px rgba(0,0,0,.18);
  text-align: center;
}

/* отключаем ту самую жёлтую подложку снизу */
.su-modal::after{ display: none; }

.su-modal__icon{
  width: 64px;
  height: 64px;
  margin: 0 auto 12px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #ECFDF5;
  border: 1px solid #A7F3D0;
}

/* критично: прибиваем размеры svg, перекрываем глобальные правила */
.su-modal__icon svg{
  width: 36px !important;
  height: 36px !important;
  display: block;
  flex: none;
}

.su-modal__title{ font-size: 20px; font-weight: 700; color:#0F172A; margin: 4px 0; }
.su-modal__text{  font-size: 16px; color:#475569;  margin-bottom: 18px; }
.su-modal__btn{   width: 100%; height: 52px; border-radius: 12px; }

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

  .thumbs {
    gap: 8px;
  }

  .thumb {
    width: 80px;
    height: 80px;
    border-radius: 8px;
  }

  .thumb-remove {
    width: 20px;
    height: 20px;
    font-size: 12px;
    border-radius: 50%;
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
