<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getProducts, updateProductStatus } from '~/services/supplier'

const router   = useRouter()

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
    const resp = await getProducts({ status: 'inactive' })
    products.value = resp?.data ?? []
  } catch (e) {
    const { t } = useI18n();
    console.error(t('supplierInactive.loadError'), e)
    error.value = t('supplierInactive.dataLoadError')
  } finally {
    loading.value = false
  }
}
onMounted(fetchProducts)

const { t } = useI18n();

// -------- success modal --------
const success = reactive({
  open: false,
  title: t('supplierInactive.activated'),
  text: t('supplierInactive.movedToActive')
})
function lockScroll(v){ document.body.style.overflow = v ? 'hidden' : '' }
function openSuccess(custom = {}) {
  Object.assign(success, custom, { open: true })
  lockScroll(true)
}
function closeSuccess() {
  success.open = false
  lockScroll(false)
  router.push('/supplier/services/active')
}
const onKey = (e) => { if (e.key === 'Escape' && success.open) closeSuccess() }
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

// -------- actions --------
const activateProduct = async (id) => {
  try {
    await updateProductStatus(id, 'active')

    // удаляем из списка (стал активным)
    if (Array.isArray(products.value)) {
      products.value = products.value.filter(p => p.id !== id)
    } else if (products.value?.items) {
      products.value.items = products.value.items.filter(p => p.id !== id)
    }

    openSuccess({
      title: 'Товар активирован',
      text: 'перемещён в «Активные».'
    })
  } catch (e) {
    console.error('Ошибка при активации:', e)
    alert('Ошибка при активации товара/услуги')
  }
}

// -------- helpers --------
const formatPrice = (p) =>
  new Intl.NumberFormat('ru-RU').format(Number(p ?? 0))

const getImageUrl = (urls) =>
  (Array.isArray(urls) && urls[0]) || '/images/test-card-image.jpg'

const formatDateTime = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString('ru-RU', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>

<template>
  <NuxtLayout name="supplier">
    <!-- заголовок -->
    <div class="page-head">
      <h2 class="page-title">{{ $t('supplierServices.inactiveProducts') }}</h2>
    </div>

    <!-- состояния -->
    <div v-if="loading" class="state-card">
      <div class="spinner" />
      <p class="muted mt-3">{{ $t('supplierServices.loadingInactive') }}</p>
    </div>

    <div v-else-if="error" class="state-card">
      <p class="error">{{ error }}</p>
      <button class="btn btn--primary btn--md mt-3" @click="fetchProducts">{{ $t('supplierServices.tryAgain') }}</button>
    </div>

    <div v-else-if="items.length === 0" class="state-card">
      <p class="muted">{{ $t('supplierServices.noInactiveProducts') }}</p>
    </div>

    <!-- список карточек -->
    <div v-else v-for="product in items" :key="product.id" class="inactive-card">
      <!-- media -->
      <div class="inactive-card__media">
        <img :src="getImageUrl(product.image_urls)" :alt="product.name">
      </div>

      <!-- body -->
      <div class="inactive-card__body">
        <div class="inactive-card__top">
          <div class="titlebox">
            <h3 class="title">{{ product.name }}</h3>
            <p class="subtitle">{{ product.category?.name || ' ' }}</p>
          </div>
          <div class="price-badge">{{ formatPrice(product.price) }} ₸</div>
        </div>

        <div class="meta-row">
          <div class="meta">
            <svg class="ico ico--yellow" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" fill="currentColor"/>
              <circle cx="12" cy="10" r="2.4" fill="#fff"/>
            </svg>
            <span>{{ product.country }}, {{ product.city }}</span>
          </div>

          <div class="meta">
            <svg class="ico ico--yellow" viewBox="0 0 24 24" aria-hidden="true">
              <g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 3v4M17 3v4M4 9h16"/>
                <rect x="4" y="5" width="16" height="15" rx="2"/>
              </g>
            </svg>
            <span>
              Срок выполнения:
              {{ product.service_time }}
            </span>
          </div>
        </div>

        <div class="inactive-card__bottom">
          <div class="submitted">
            Дата последнего изменения: {{ formatDateTime(product.updated_at || product.created_at) }}
          </div>

          <div class="btn-group">
            <button class="btn btn--primary btn--lg" @click="activateProduct(product.id)">
              Активировать
            </button>
            <NuxtLink class="btn btn--outline btn--lg" :to="`/supplier/services/add-service/${product.id}`">
              Редактировать
            </NuxtLink>
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
        <button type="button" class="btn btn--primary su-modal__btn" @click="closeSuccess">
          Перейти в активные
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
  font-family:"Manrope", serif;
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

/* ---------- card ---------- */
.inactive-card{
  display:grid;
  grid-template-columns: 320px 1fr;
  gap:16px;
  background:#0000000A;
  border:1px solid #EAECEE;
  border-radius:16px;
  padding:12px;
  margin-top:16px;
}
.inactive-card__media{
  width:100%; height:180px;
  border-radius:12px; overflow:hidden; background:#F2F3F5;
}
.inactive-card__media img{ width:100%; height:100%; object-fit:cover; display:block; }
.inactive-card__body{ display:flex; flex-direction:column; gap:12px; }

.inactive-card__top{ display:flex; justify-content:space-between; gap:12px; }
.titlebox{ min-width:0; }
.title{ font-weight:800; font-size:18px; color:#111827; margin:0 0 2px 0; }
.subtitle{ font-size:12px; color:#8C8C8C; margin:0; }

.price-badge{
  align-self:flex-start;
  background:#EEF1F4; color:#0F172A;
  padding:8px 12px; border-radius:10px;
  font-weight:800; font-size:14px; white-space:nowrap;
}

.meta-row{ display:flex; flex-wrap:wrap; gap:18px; }
.meta{ display:inline-flex; align-items:center; gap:8px; color:#5C5C5C; font-size:13px; }
.ico{ width:20px; height:20px; flex:0 0 20px; }
.ico--yellow{ color:#F0B32E; }

/* bottom */
.inactive-card__bottom{
  display:flex; justify-content:space-between;
  align-items:center; gap:16px; margin-top:40px;
}
.submitted{ color:#7C8794; font-size:14px; line-height:1.2; }

.btn-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* buttons */
.btn{
  border:none; border-radius:12px; font-weight:800;
  cursor:pointer; transition:filter .15s ease, background-color .15s ease;
}
.btn--primary{ background:#F7B500; color:#1F2937; }
.btn--outline{ background:transparent; color:#1F2937; border:1px solid #E0E4EA; }
.btn--md{ height:42px; padding:0 16px; font-size:14px; }
.btn--lg{ height:48px; padding:0 22px; font-size:14px; font-weight:500; }
.btn--primary:hover{ filter:brightness(.98); }

/* ---------- success modal ---------- */
.su-modal__overlay{
  position:fixed; inset:0; background:rgba(17,24,39,.45);
  display:flex; align-items:center; justify-content:center;
  z-index:1000; backdrop-filter:blur(2px);
}
.su-modal{
  position:relative; width:min(480px,92vw);
  background:#fff; border-radius:16px; padding:28px 24px 22px;
  box-shadow:0 20px 60px rgba(0,0,0,.18); text-align:center;
}
.su-modal__icon{
  width:56px; height:56px; margin:0 auto 12px; display:grid; place-items:center;
  border-radius:50%; background:#ECFDF5; border:1px solid #A7F3D0;
}
.su-modal__icon svg{ width:34px; height:34px; }
.su-modal__title{ font-size:20px; font-weight:700; color:#0F172A; margin:4px 0; }
.su-modal__text{ font-size:16px; color:#475569; margin-bottom:18px; }
.su-modal__btn{  display: block;      /* важно */
  width: 100%;         /* растягиваем */
  height: 52px;        /* как в макете */
  border-radius: 12px; /* красивая пилюля */
  font-weight: 800; }

/* ---------- responsive ---------- */
@media (max-width: 920px){
  .inactive-card{ grid-template-columns: 280px 1fr; }
  .inactive-card__media{ height:170px; }
}
@media (max-width: 680px){
  .inactive-card{ grid-template-columns: 1fr; }
  .inactive-card__media{ height:200px; }
  .inactive-card__bottom{ flex-direction:column; align-items:flex-start; }
  .btn-group{ width:100%; }
  .btn-group .btn{ width:100%; text-align:center; }
}

/* Мобильные стили для неактивных услуг */
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

  .inactive-card {
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

  .inactive-card__media {
    width: 100%;
    height: 180px;
    border-radius: 0;
  }

  .inactive-card__body {
    padding: 16px;
  }

  .inactive-card__top {
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

  .submitted {
    font-size: 13px;
    color: #6B7280;
    margin-bottom: 12px;
  }

  .inactive-card__bottom {
    flex-direction: column;
    gap: 8px;
    margin-top: 0;
  }

  .btn-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .btn {
    width: 100%;
    height: 44px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
  }

  .btn--primary {
    background: #E9B949;
    color: #1C140E;
  }

  .btn--outline {
    background: #F3F4F6;
    color: #6B7280;
    border: 1px solid #E5E7EB;
  }

  .btn--lg {
    width: 100%;
    height: 44px;
    font-size: 14px;
  }

  .state-card {
    margin: 0 16px;
    padding: 20px;
    border-radius: 12px;
  }
}
</style>
