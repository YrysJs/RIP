<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProducts } from '~/services/supplier'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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
    const resp = await getProducts({ status: 'requires_fix' })
    products.value = resp?.data ?? []
  } catch (e) {
    console.error(t('supplier.servicesImprovement.loadError'), e)
    error.value = t('supplier.servicesImprovement.dataLoadError')
  } finally {
    loading.value = false
  }
}
onMounted(fetchProducts)

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
      <h2 class="page-title">{{ $t('supplier.servicesImprovement.title') }}</h2>
    </div>

    <!-- состояния -->
    <div v-if="loading" class="state-card">
      <div class="spinner" />
      <p class="muted mt-3">{{ $t('supplier.servicesImprovement.loading') }}</p>
    </div>

    <div v-else-if="error" class="state-card">
      <p class="error">{{ error }}</p>
      <button class="btn btn--primary btn--md mt-3" @click="fetchProducts">{{ $t('supplier.servicesImprovement.tryAgain') }}</button>
    </div>

    <div v-else-if="items.length === 0" class="state-card">
      <p class="muted">{{ $t('supplier.servicesImprovement.noImprovement') }}</p>
    </div>

    <!-- список карточек -->
    <div
      v-else
      v-for="product in items"
      :key="product.id"
      class="fix-card"
    >
      <!-- media -->
      <div class="fix-card__media">
        <img :src="getImageUrl(product.image_urls)" :alt="product.name">
      </div>

      <!-- body -->
      <div class="fix-card__body">
        <!-- верх -->
        <div class="fix-card__top">
          <div class="titlebox">
            <h3 class="title">{{ product.name }}</h3>
            <p class="subtitle">{{ product.category?.name || ' ' }}</p>
          </div>
          <div class="price-badge">{{ formatPrice(product.price) }} ₸</div>
        </div>

        <!-- мета -->
        <div class="meta-row">
          <div class="meta">
            <!-- pin (жёлтый) -->
            <svg class="ico ico--yellow" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" fill="currentColor"/>
              <circle cx="12" cy="10" r="2.4" fill="#fff"/>
            </svg>
            <span>{{ product.country }}, {{ product.city }}</span>
          </div>

          <div class="meta">
            <!-- calendar (жёлтый) -->
            <svg class="ico ico--yellow" viewBox="0 0 24 24" aria-hidden="true">
              <g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 3v4M17 3v4M4 9h16"/>
                <rect x="4" y="5" width="16" height="15" rx="2"/>
              </g>
            </svg>
            <span>
              {{ $t('supplierActive.serviceTime') }}
              {{ product.service_time }}
            </span>
          </div>
        </div>

        <!-- низ -->
        <div class="fix-card__bottom">
          <div class="submitted">
            {{ $t('supplier.servicesConsideration.requestDateTime') }} {{ formatDateTime(product.created_at) }}
          </div>

          <div class="btn-group">
            <NuxtLink
              class="btn btn--primary btn--lg"
              :to="`/supplier/services/add-service/${product.id}`"
            >
              {{ $t('supplierActive.edit') }}
            </NuxtLink>
          </div>
        </div>

        <!-- предупреждение -->
        <div class="warn">
          <!-- иконка предупреждения -->
          <svg class="warn__ico" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3 2.7 19.5a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L12 3Z" fill="#FEE4D5"/>
            <path d="M12 8v6M12 18h.01" stroke="#DC6E29" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>
            {{ $t('supplier.servicesImprovement.requiresImprovement') }}:
            {{ product?.moderation_comment || $t('supplier.servicesImprovement.defaultComment') }}
          </span>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped lang="scss">
/* header */
.page-head{
  display:flex; align-items:center;
  background:#fff; border-radius:16px;
  padding:14px 16px; margin-bottom:12px;
}
.page-title{
  font-family:"Manrope", serif;
  font-weight:700; letter-spacing:.02em;
  font-size:22px; line-height:1.15; color:#1C140E; margin:0;
}

/* states */
.state-card{
  background:#fff; border-radius:16px;
  padding:24px; text-align:center; margin-top:16px;
}
.muted{ color:#6B7280; }
.error{ color:#D63C3C; }
.spinner{
  width:34px;height:34px;border-radius:50%;
  border:3px solid #e7e9ec;border-top-color:#224C4F;
  animation:spin .9s linear infinite;margin:0 auto;
}
@keyframes spin{ to { transform: rotate(360deg) } }

/* card */
.fix-card{
  display:grid;
  grid-template-columns: 320px 1fr;
  gap:16px;
  background:#0000000A;
  border:1px solid #EAECEE;
  border-radius:16px;
  padding:12px;
  margin-top:16px;
}
.fix-card__media{
  width:100%; height:180px;
  border-radius:12px; overflow:hidden; background:#F2F3F5;
}
.fix-card__media img{ width:100%; height:100%; object-fit:cover; display:block; }
.fix-card__body{ display:flex; flex-direction:column; gap:12px; }

.fix-card__top{ display:flex; justify-content:space-between; gap:12px; }
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

.fix-card__bottom{
  display:flex; justify-content:space-between;
  align-items:center; gap:16px; margin-top:6px;
}
.submitted{ color:#7C8794; font-size:14px; line-height:1.2; }

.btn-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* предупреждение */
.warn{
  display:flex; align-items:center; gap:10px;
  margin-top:10px;
  background:#DC6E2926;         /* как в макете */
  color:#9A5122;
  border-radius:10px;
  padding:10px 12px;
  font-size:14px;
}
.warn__ico{ width:20px; height:20px; flex:0 0 20px; }

/* buttons */
.btn{ border:none; border-radius:12px; font-weight:800; cursor:pointer; transition:filter .15s ease; }
.btn--primary{ background:#F7B500; color:#1F2937; }
.btn--md{ height:42px; padding:0 16px; font-size:14px; }
.btn--lg{ height:48px; padding:0 22px; font-size:16px; }
.btn--primary:hover{ filter:brightness(.98); }

/* responsive */
@media (max-width: 920px){
  .fix-card{ grid-template-columns: 280px 1fr; }
  .fix-card__media{ height:170px; }
}
@media (max-width: 680px){
  .fix-card{ grid-template-columns: 1fr; }
  .fix-card__media{ height:200px; }
  .fix-card__bottom{ flex-direction:column; align-items:flex-start; }
}

/* Мобильные стили для услуг требующих доработки */
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

  .fix-card {
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

  .fix-card__media {
    width: 100%;
    height: 180px;
    border-radius: 0;
  }

  .fix-card__body {
    padding: 16px;
  }

  .fix-card__top {
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

  .warn {
    font-size: 13px;
    padding: 10px 12px;
    margin-bottom: 12px;
    background: #DC6E2926;
    color: #9A5122;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .warn__ico {
    width: 16px;
    height: 16px;
    flex: 0 0 16px;
  }

  .submitted {
    font-size: 13px;
    color: #6B7280;
    margin-bottom: 12px;
  }

  .fix-card__bottom {
    flex-direction: column;
    gap: 8px;
    margin-top: 0;
  }

  .btn-group {
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
