<script setup>
import { ref, computed, onMounted } from 'vue'
import { getProducts } from '~/services/supplier'

// ---------- state ----------
const products = ref([])
const loading  = ref(true)
const error    = ref(null)

// поддерживаем и массив, и объект c items
const items = computed(() =>
  Array.isArray(products.value) ? products.value : (products.value?.items ?? [])
)

const fetchProducts = async () => {
  try {
    loading.value = true
    error.value = null
    const resp = await getProducts({ status: 'pending' })
    products.value = resp?.data ?? []
  } catch (e) {
    console.error('Ошибка при загрузке продуктов на рассмотрении:', e)
    error.value = 'Ошибка при загрузке данных'
  } finally {
    loading.value = false
  }
}
onMounted(fetchProducts)

// ---------- helpers ----------
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
            <h2 class="page-title">Товары и услуги на рассмотрении</h2>
        </div>

        <!-- состояния -->
        <div v-if="loading" class="state-card">
            <div class="spinner" />
            <p class="muted mt-3">Загрузка товаров и услуг на рассмотрении…</p>
        </div>

        <div v-else-if="error" class="state-card">
            <p class="error">{{ error }}</p>
            <button class="btn btn--primary btn--md mt-3" @click="fetchProducts">Попробовать снова</button>
        </div>

        <div v-else-if="items.length === 0" class="state-card">
            <p class="muted">У вас пока нет товаров и услуг на рассмотрении</p>
        </div>

        <!-- список карточек -->
        <div v-else v-for="product in items" :key="product.id" class="pending-card">
            <!-- media -->
            <div class="pending-card__media">
                <img :src="getImageUrl(product.image_urls)" :alt="product.name">
            </div>

            <!-- body -->
            <div class="pending-card__body">
                <!-- верхняя строка -->
                <div class="pending-card__top">
                    <div class="titlebox">
                        <h3 class="title">{{ product.name }}</h3>
                        <p class="subtitle">{{ product.category?.name || ' ' }}</p>
                    </div>

                    <div class="price-badge">{{ formatPrice(product.price) }} ₸</div>
                </div>

                <!-- мета-инфо -->
                <div class="meta-row">
                    <div class="meta">
                        <!-- pin (жёлтый) -->
                        <svg class="ico ico--yellow" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" fill="currentColor" />
                            <circle cx="12" cy="10" r="2.4" fill="#fff" />
                        </svg>
                        <span>{{ product.country }}, {{ product.city }}</span>
                    </div>

                    <div class="meta">
                        <!-- calendar (жёлтый) -->
                        <svg class="ico ico--yellow" viewBox="0 0 24 24" aria-hidden="true">
                            <g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
                                stroke-linejoin="round">
                                <path d="M7 3v4M17 3v4M4 9h16" />
                                <rect x="4" y="5" width="16" height="15" rx="2" />
                            </g>
                        </svg>
                        <span>
                            Срок выполнения:
                            {{ product.service_time }}
                            {{ String(product.service_time) === '1' ? 'день' : 'дня/дней' }}
                        </span>
                    </div>
                </div>

                <!-- низ карточки -->
                <div class="pending-card__bottom">
                    <!-- в фигме без иконки -->
                    <div class="submitted">
                        Дата и время заявки: {{ formatDateTime(product.created_at) }}
                    </div>

                    <NuxtLink class="btn btn--primary btn--lg" :to="`/supplier/services/add-service/${product.id}`">
                        Редактировать
                    </NuxtLink>
                </div>
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

/* ---------- card ---------- */
.pending-card{
  display:grid;
  grid-template-columns: 320px 1fr;
  gap:16px;
  background:#F7F8FA;         /* мягкий фон как в макете */
  border:1px solid #EAECEE;
  border-radius:16px;
  padding:12px;
  margin-top:16px;
}
.pending-card__media{
  width:100%; height:180px;
  border-radius:12px; overflow:hidden; background:#F2F3F5;
}
.pending-card__media img{
  width:100%; height:100%; object-fit:cover; display:block;
}

.pending-card__body{ display:flex; flex-direction:column; gap:12px; }

/* top */
.pending-card__top{ display:flex; justify-content:space-between; gap:12px; }
.titlebox{ min-width:0; }
.title{ font-weight:800; font-size:18px; color:#111827; margin:0 0 2px 0; }
.subtitle{ font-size:12px; color:#8C8C8C; margin:0; }

.price-badge{
  align-self:flex-start;
  background:#EEF1F4; color:#0F172A;
  padding:8px 12px; border-radius:10px;
  font-weight:800; font-size:14px; white-space:nowrap;
}

/* meta */
.meta-row{ display:flex; flex-wrap:wrap; gap:18px; }
.meta{ display:inline-flex; align-items:center; gap:8px; color:#5C5C5C; font-size:13px; }
.ico{ width:20px; height:20px; flex:0 0 20px; }
.ico--yellow{ color:#F0B32E; }

/* bottom */
.pending-card__bottom{
  display:flex; justify-content:space-between;
  align-items:center; gap:16px; margin-top:40px;
}
.submitted{ color:#7C8794; font-size:14px; line-height:1.2; }

/* buttons */
.btn{
  border:none; border-radius:12px; font-weight:800;
  cursor:pointer; transition:filter .15s ease;
}
.btn--primary{ background:#F7B500; color:#1F2937; }
.btn--md{ height:42px; padding:0 16px; font-size:14px; }
.btn--lg{ height:48px; padding:0 22px; font-size:14px; font-weight: 500;}
.btn--primary:hover{ filter:brightness(.98); }

/* ---------- responsive ---------- */
@media (max-width: 920px){
  .pending-card{
    grid-template-columns: 280px 1fr;
  }
  .pending-card__media{ height:170px; }
}
@media (max-width: 680px){
  .pending-card{
    grid-template-columns: 1fr;
  }
  .pending-card__media{ height:200px; }
  .pending-card__bottom{ flex-direction:column; align-items:flex-start; }
}
</style>
