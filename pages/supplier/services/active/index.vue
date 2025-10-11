<script setup>
import { ref, computed, onMounted, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getProducts, updateProductStatus } from '~/services/supplier'

// -------- router --------
const router = useRouter()

// -------- state --------
const products = ref([])
const loading  = ref(true)
const error    = ref(null)

// поддерживаем и массив, и объект с items
const items = computed(() =>
  Array.isArray(products.value) ? products.value : (products.value?.items ?? [])
)

const fetchProducts = async () => {
  try {
    loading.value = true
    error.value = null
    const resp = await getProducts({ status: 'active' })
    products.value = resp?.data ?? []
  } catch (e) {
    console.error('Ошибка при загрузке активных товаров и услуг:', e)
    error.value = 'Ошибка при загрузке данных'
  } finally {
    loading.value = false
  }
}
onMounted(fetchProducts)

// -------- success modal (UI) --------
const success = reactive({
  open: false,
  title: 'Товар деактивирован',
  text: 'перемещён в «Неактивные».',
})
function lockScroll(v){ document.body.style.overflow = v ? 'hidden' : '' }
function openSuccess(custom = {}){ Object.assign(success, custom, { open: true }); lockScroll(true) }
function closeSuccess(){ success.open = false; lockScroll(false); router.push('/supplier/services/inactive') }

const onKey = (e) => { if (e.key === 'Escape' && success.open) closeSuccess() }
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

// -------- actions --------
const deactivating = ref(new Set())
const deactivateProduct = async (id) => {
  try {
    deactivating.value.add(id)
    await updateProductStatus(id, 'inactive')

    // оптимистично убираем карточку
    if (Array.isArray(products.value)) {
      products.value = products.value.filter(p => p.id !== id)
    } else if (products.value?.items) {
      products.value.items = products.value.items.filter(p => p.id !== id)
    }

    // модалка успеха
    openSuccess({
      title: 'Товар деактивирован',
      text: 'перемещён в «Неактивные».',
    })
  } catch (e) {
    alert('Не удалось деактивировать. Попробуйте ещё раз.')
    console.error(e)
  } finally {
    deactivating.value.delete(id)
  }
}

// -------- helpers --------
const formatPrice = (p) =>
  new Intl.NumberFormat('ru-RU').format(Number(p ?? 0))

const getImageUrl = (urls) =>
  (Array.isArray(urls) && urls[0]) || '/images/test-card-image.jpg'

const pluralDays = (v) => {
  const n = Number(String(v).replace(/\D/g, '')) || 0
  const mod10 = n % 10, mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'день'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'дня'
  return 'дней'
}
</script>

<template>
  <NuxtLayout name="supplier" class="supplier-services-page">
    <!-- заголовок -->
    <div class="page-head">
      <h2 class="page-title">Активные товары и услуги</h2>
    </div>

    <!-- состояния -->
    <div v-if="loading" class="state-card">
      <div class="spinner" />
      <p class="muted mt-3">Загрузка активных товаров и услуг…</p>
    </div>

    <div v-else-if="error" class="state-card">
      <p class="error">{{ error }}</p>
      <button class="btn btn--primary btn--md mt-3" @click="fetchProducts">Попробовать снова</button>
    </div>

    <div v-else-if="items.length === 0" class="state-card">
      <p class="muted">Нет активных заявок</p>
    </div>

    <!-- список карточек -->
    <div v-else v-for="product in items" :key="product.id" class="active-card">
      <!-- media -->
      <div class="active-card__media">
        <img :src="getImageUrl(product.image_urls)" :alt="product.name">
      </div>

      <!-- body -->
      <div class="active-card__body">
        <!-- верх -->
        <div class="active-card__top">
          <div class="titlebox">
            <h3 class="title">{{ product.name }}</h3>
            <p class="subtitle">{{ product.category?.name || ' ' }}</p>
          </div>
          <div class="price-badge">от {{ formatPrice(product.price) }} ₸</div>
        </div>

        <!-- мета -->
        <div class="meta-row">
          <div class="meta">
            <svg class="ico ico--yellow" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" fill="currentColor"/>
              <circle cx="12" cy="10" r="2.4" fill="#fff"/>
            </svg>
            <span>{{ product.country }}, {{ product.city }}</span>
          </div>

          <div class="meta">
            <svg class="ico ico--yellow" viewBox="0 0 24 24" aria-hidden>
              <g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 3v4M17 3v4M4 9h16"/>
                <rect x="4" y="5" width="16" height="15" rx="2"/>
              </g>
            </svg>
            <span>
              Срок выполнения: {{ product.service_time }}
            </span>
          </div>
        </div>

        <!-- низ -->
        <div class="active-card__bottom">
          <button
            class="btn btn--danger btn--lg"
            :disabled="deactivating.has(product.id)"
            @click="deactivateProduct(product.id)"
          >
            <span v-if="deactivating.has(product.id)">Деактивируем…</span>
            <span v-else>Деактивировать</span>
          </button>

          <div class="btn-group">
            <NuxtLink
              class="btn btn--primary btn--lg"
              :to="`/supplier/services/add-service/${product.id}`"
            >
              Редактировать
            </NuxtLink>
            
            <button class="btn btn--delete" @click="deactivateProduct(product.id)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
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
        <button type="button" class="btn btn--primary btn--block su-modal__btn" @click="closeSuccess">
          Перейти в неактивные
        </button>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped lang="scss">
/* ---------- header ---------- */
.page-head{
  display:flex; align-items:center;
  background:#fff; border-radius:16px;
  padding:14px 16px; margin-bottom:12px;
}
.page-title{
  font-family:"FoglihtenNo06", serif;
  font-weight:700; letter-spacing:.02em;
  font-size:22px; line-height:1.15; margin:0; color:#1C140E;
}

/* ---------- states ---------- */
.state-card{
  background:#fff; border-radius:16px;
  padding:24px; text-align:center; margin-top:16px;
}
.muted{ color:#6B7280; }
.error{ color:#D63C3C; }
.spinner{
  width:34px; height:34px; border-radius:50%;
  border:3px solid #e7e9ec; border-top-color:#224C4F;
  animation:spin .9s linear infinite; margin:0 auto;
}
@keyframes spin{ to { transform: rotate(360deg) } }

/* ---------- CARD (горизонтальная для веба) ---------- */
.active-card{
  display:grid;
  grid-template-columns: 320px 1fr;
  gap:16px;
  background:#0000000A;
  border:1px solid #EAECEE;
  border-radius:16px;
  padding:12px;
  margin-top:16px;
}
.active-card__media{
  width:100%; height:180px;
  border-radius:12px; overflow:hidden; background:#F2F3F5;
}
.active-card__media img{ width:100%; height:100%; object-fit:cover; display:block; }

.active-card__body{ display:flex; flex-direction:column; gap:12px; }

.active-card__top{ display:flex; justify-content:space-between; gap:12px; }
.titlebox{ min-width:0; }
.title{ font-weight:800; font-size:18px; color:#111827; margin:0 0 2px 0; }
.subtitle{ font-size:12px; color:#8C8C8C; margin:0; }

.price-badge{
  align-self:flex-start;
  background:#EEF1F4; color:#0F172A;
  padding:8px 12px; border-radius:10px;
  font-weight:800; font-size:14px; white-space:nowrap;
}

/* meta (место + календарь) */
.meta-row{ display:flex; flex-wrap:wrap; gap:18px; }
.meta{ display:inline-flex; align-items:center; gap:8px; color:#5C5C5C; font-size:13px; }
.ico{ width:20px; height:20px; flex:0 0 20px; }
.ico--yellow{ color:#F0B32E; }

/* низ карточки — кнопки справа как в inactive */
.active-card__bottom{
  display:flex; justify-content:flex-end; align-items:center;
  gap:10px; margin-top:40px; flex-wrap:wrap;
}

.btn-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn--delete {
  background: #F3F4F6;
  color: #6B7280;
  border: 1px solid #E5E7EB;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #E5E7EB;
    color: #374151;
  }
}

/* ---------- BUTTONS (такие же размеры/радиусы) ---------- */
.btn{
  border:none; border-radius:12px; font-weight:800;
  cursor:pointer; transition:filter .15s ease, background-color .15s ease;
}
.btn--md{ height:42px; padding:0 16px; font-size:14px; }
.btn--lg{ height:48px; padding:0 22px; font-size:14px; font-weight:500; }

.btn--primary{ background:#F7B500; color:#1F2937; }
.btn--danger{  background:#D63C3C26; color:#D63C3C; }
.btn--outline{ background:transparent; color:#1F2937; border:1px solid #E0E4EA; }
.btn--block{ display:block; width:100%; }

.btn--primary:hover,
.btn--danger:hover,
.btn--outline:hover{ filter:brightness(.98); }

/* ---------- SUCCESS MODAL (широкая кнопка) ---------- */
.su-modal__overlay{
  position:fixed; inset:0; background:rgba(17,24,39,.45);
  display:flex; align-items:center; justify-content:center;
  z-index:1000; backdrop-filter:blur(2px);
}
.su-modal{
  position:relative; width:min(520px,92vw);
  background:#fff; border-radius:16px; padding:28px 24px 22px;
  box-shadow:0 20px 60px rgba(0,0,0,.18); text-align:center;
}
.su-modal__icon{
  width:56px; height:56px; margin:0 auto 12px; display:grid; place-items:center;
  border-radius:50%; background:#ECFDF5; border:1px solid #A7F3D0;
}
.su-modal__icon svg{ width:34px; height:34px; }
.su-modal__title{ font-size:22px; font-weight:800; color:#0F172A; margin:6px 0 4px; }
.su-modal__text{ font-size:16px; color:#475569; margin-bottom:18px; }
.su-modal__btn{
  display: block;      /* важно */
  width: 100%;         /* растягиваем */
  height: 52px;        /* как в макете */
  border-radius: 12px; /* красивая пилюля */
  font-weight: 800; 
}

/* ---------- responsive ---------- */
@media (max-width: 920px){
  .active-card{ grid-template-columns: 280px 1fr; }
  .active-card__media{ height:170px; }
}
@media (max-width: 680px){
  .active-card{ grid-template-columns: 1fr; }
  .active-card__media{ height:200px; }
  .active-card__bottom{ justify-content:flex-start; }
}

/* Мобильные стили для услуг */
@media (max-width: 768px) {
  :global(.supplier-services-page) {
    background: #ffffff !important;
  }

  :global(.supplier-services-page .supplier) {
    background: #ffffff !important;
  }

  .page-head {
    padding: 20px 16px 16px;
    margin-bottom: 16px;
    background: transparent;
    border: none;
    box-shadow: none;
  }

  .page-title {
    font-size: 18px;
    line-height: 1.2;
  }

  .active-card {
    display: flex;
    flex-direction: column;
    background: #0000000A;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    padding: 0;
    margin: 0 16px 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .active-card__media {
    width: 100%;
    height: 180px;
    border-radius: 0;
  }

  .active-card__body {
    padding: 16px;
  }

  .active-card__top {
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }

  .titlebox {
    width: 100%;
  }

  .title {
    font-size: 16px;
    font-weight: 700;
    color: #1C140E;
    margin: 0 0 4px 0;
    line-height: 1.3;
  }

  .subtitle {
    font-size: 14px;
    color: #6B7280;
    margin: 0;
  }

  .price-badge {
    align-self: flex-start;
    background: #F3F4F6;
    color: #1C140E;
    padding: 6px 12px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
  }

  .meta-row {
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }

  .meta {
    color: #6B7280;
    font-size: 13px;
  }

  .ico {
    width: 14px;
    height: 14px;
  }

  .active-card__bottom {
    flex-direction: column;
    gap: 8px;
    margin-top: 0;
  }

  .btn-group {
    display: flex;
    gap: 8px;
    width: 100%;
  }

  .btn--primary {
    flex: 1;
    height: 44px;
    font-size: 14px;
  }

  .btn--lg {
    width: 100%;
    height: 44px;
    font-size: 14px;
  }

  .btn--delete {
    width: 44px;
    height: 44px;
    background: #F3F4F6;
    color: #6B7280;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
  }

  .state-card {
    margin: 0 16px;
    padding: 20px;
    border-radius: 12px;
  }
}
</style>
