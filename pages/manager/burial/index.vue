<script setup>
// import { useRouter } from 'vue-router'
import {
  getBurialRequestById,
  getBurialRequestStatus,
  burialRequestComplete,
  getManagerBurialRequests
} from '~/services/manager'
import BurialDetailsModal from '~/components/manager/burial/BurialDetailsModal.vue'
import { getGraveById, getGraveImages } from '~/services/client'
import { getCemeteries } from '~/services/cemetery'
import CancelModal from '~/components/manager/booking/CancelModal.vue'

// const router = useRouter()

const burials = ref([])
const cemeteries = ref([])
const burial = ref({})
const search = ref('')
const burialDetailModalVisible = ref(false)
const isCancelModalVisible = ref(false)
const _selectedId = ref(null)
const grave = ref({})
const graveImages = ref([])
const loading = ref(false)

definePageMeta({ middleware: ['auth', 'manager'] })

// скрытые фильтры (оставлены для БЭКа)
const dateFrom = ref('')
const dateTo   = ref('')
const cemeteryId = ref(null)
const toIsoDate = (dateStr) => (dateStr ? `${dateStr}T00:00:00Z` : undefined)

/* Проверка на пустые данные */
const isEmpty = computed(() => !burials.value || burials.value.length === 0)

/* Загрузка */
const fetchBurials = async (params = {  }) => {
  try {
    loading.value = true
    const response = await getManagerBurialRequests(params)
    burials.value = response.data?.data?.data ?? []
  } catch (e) {
    console.error('Ошибка при получении заявок:', e)
    const { $toast } = useNuxtApp()
    $toast.error('Сервер не доступен')
  } finally {
    loading.value = false
  }
}

const fetchBurialDetails = async (id) => {
  try {
    const res = await getBurialRequestById(id)
    burial.value = res.data.data
    const response = await getGraveById(burial.value.grave_id)
    grave.value = response.data
    const images = await getGraveImages(burial.value.grave_id)
    graveImages.value = images.data
    burialDetailModalVisible.value = true
  } catch (e) {
    console.error('Ошибка при услуги:', e)
    const { $toast } = useNuxtApp()
    $toast.error('Сервер не доступен')
  }
}

const cancelRequest = async (comment) => {
  try {
    await getBurialRequestStatus({ id: burial.value?.id, status: 'cancelled', comment })
    isCancelModalVisible.value = false
    fetchBurials()
  } catch (error) {
    console.error('Ошибка при отмене заявки:', error)
    const { $toast } = useNuxtApp()
    $toast.error('Сервер не доступен')
  }
}
const approveRequest = async () => {
  try {
    await getBurialRequestStatus({ id: burial.value?.id, status: 'confirmed', comment: '' })
    burialDetailModalVisible.value = false
    fetchBurials()
  } catch (error) {
    console.error('Ошибка при подтверждении заявки:', error)
    const { $toast } = useNuxtApp()
    $toast.error('Сервер не доступен')
  }
}

const completeRequest = async () => {
  try {
    await burialRequestComplete(burial.value?.id)
    burialDetailModalVisible.value = false
    fetchBurials()
  } catch (error) {
    console.error('Ошибка при подтверждении заявки:', error)
    const { $toast } = useNuxtApp()
    $toast.error('Сервер не доступен')
  }
}
const selectRequest = () => { isCancelModalVisible.value = true }

const handleCardClick = (id) => {
  // На мобильных устройствах карточка кликабельна
  if (window.innerWidth <= 768 && id) {
    fetchBurialDetails(id)
  }
}

const fetchCemeteries = async () => {
  try {
    const response = await getCemeteries()
    cemeteries.value = response.data
  } catch (e) {
    console.error('Ошибка при получении кладбищ:', e)
    const { $toast } = useNuxtApp()
    $toast.error('Сервер не доступен')
  }
}

onMounted(() => { fetchBurials(); fetchCemeteries() })

/* Форматтеры */
const fmtDateTime = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('ru-RU', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
}
const fmtDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('ru-RU', { day:'2-digit', month:'2-digit', year:'numeric' })
}
const statusChip = (status) => {
  if (status === 'pending')   return { text:'Ожидает оплаты', class:'chip chip--orange' }
  if (status === 'paid')      return { text:'Оплачено',       class:'chip chip--blue' }
  if (status === 'cancelled') return { text:'Отменено',       class:'chip chip--red' }
  if (status === 'confirmed') return { text:'Подтверждено',   class:'chip chip--green' }
  return { text: status ?? '—', class:'chip chip--gray' }
}

/* Поиск/фильтры (debounce) */
let timeout
watch(search, (val) => {
  clearTimeout(timeout)
  if (val.length >= 3 || val.length === 0) {
    timeout = setTimeout(() => {
      fetchBurials({
        ...(val.length >= 3 ? { request_number: val } : {}),
        date_from: toIsoDate(dateFrom.value) || undefined,
        date_to:   toIsoDate(dateTo.value)   || undefined,
        cemetery_id: cemeteryId.value || undefined,
      })
    }, 400)
  }
})
watch([dateFrom, dateTo, cemeteryId], () => {
  fetchBurials({
    ...(search.value.length >= 3 ? { request_number: search.value } : {}),
    date_from: toIsoDate(dateFrom.value) || undefined,
    date_to:   toIsoDate(dateTo.value)   || undefined,
    cemetery_id: cemeteryId.value || undefined,
  })
})
</script>

<template>
  <NuxtLayout name="manager">
    <div class="mgr">
      <!-- Поиск -->
      <div class="mgr__search">
        <div class="search">
          <input v-model="search" class="search__input" type="text" placeholder="Поиск по бронированиям">
          <svg class="search__icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" fill="none"/>
            <path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>

      <!-- Пустое состояние -->
      <div v-if="isEmpty && !loading" class="empty-state">
        <div class="empty-state__content">
          <svg class="empty-state__icon" width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          </svg>
          <h3 class="empty-state__title">Заявок пока нет</h3>
          <p class="empty-state__text">Когда появятся новые заявки на захоронение, они отобразятся здесь</p>
        </div>
      </div>

      <!-- Карточки -->
      <div
        v-for="b in burials"
        :key="b.id"
        class="card"
        :class="{ 'card--clickable': true }"
        :style="{ cursor: b.id ? 'pointer' : 'default' }"
        @click="handleCardClick(b.id)"
      >
        <!-- Заголовок + номер + статус + стрелка -->
        <div class="card__row card__row--header">
          <div class="head-left">
            <span class="title">ЗАХОРОНЕНИЕ:</span>
            <span class="num-badge">{{ String(b.request_number).padStart(3,'0') }}</span>
          </div>
          <div class="header-right">
            <span :class="statusChip(b.status).class">{{ statusChip(b.status).text }}</span>
            <svg class="arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <!-- Даты -->
        <div class="card__dates">
          <div class="date-line">Дата брони: <strong>{{ fmtDateTime(b.created_at) }}</strong></div>
          <div class="date-line">Дата похорон: <strong>{{ fmtDate(b.burial_date) }}<span v-if="b.burial_time">&nbsp;{{ b.burial_time }}</span></strong></div>
        </div>

        <!-- Блок информации: ФИО -->
        <div class="info">
          <div class="info-line">
            <span class="label">ФИО покойного:</span>
            <span class="value value--bold">{{ b.deceased?.full_name || '—' }}</span>
          </div>
        </div>

        <!-- Дополнительные могилы -->
        <div
          v-if="b.adjacent_graves_count > 0"
          class="adjacent-graves-section"
        >
          <h4 class="adjacent-graves-title">
            Дополнительные могилы: {{ b.adjacent_graves_count }} мест
            <span v-if="b.reservation_type === 'adjacent'" class="adjacent-type">(соседние)</span>
          </h4>
          <div v-if="b.adjacent_graves && b.adjacent_graves.length > 0" class="graves-preview">
            <span 
              v-for="(grave, index) in b.adjacent_graves.slice(0, 2)" 
              :key="grave.grave_id || index"
              class="grave-chip"
            >
              {{ grave.sector_number }}-{{ grave.grave_number }}
            </span>
            <span v-if="b.adjacent_graves.length > 2" class="more-graves">
              +{{ b.adjacent_graves.length - 2 }} еще
            </span>
          </div>
          <div v-else-if="b.adjacent_grave_ids && b.adjacent_grave_ids.length > 0" class="graves-preview">
            <span 
              v-for="(graveId, index) in b.adjacent_grave_ids.slice(0, 2)" 
              :key="graveId"
              class="grave-chip"
            >
              ID: {{ graveId }}
            </span>
            <span v-if="b.adjacent_grave_ids.length > 2" class="more-graves">
              +{{ b.adjacent_grave_ids.length - 2 }} еще
            </span>
          </div>
        </div>

        <!-- Чипы + кнопка -->
        <div class="card__row card__row--bottom">
          <div class="chips">
            <span class="chip chip--gray">{{ b.cemetery || 'Северное кладбище' }}</span>
            <span v-if="b.sector" class="chip chip--gray">Сектор: {{ b.sector }}</span>
            <span class="chip chip--gray">Место: {{ b.grave_number }}</span>
          </div>
          <button class="btn-more" :disabled="!b.id" @click="fetchBurialDetails(b.id)">Подробнее</button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <BurialDetailsModal
        :visible="burialDetailModalVisible"
        :grave="grave"
        :images="graveImages"
        :booking="burial"
        @cancel="selectRequest"
        @confirm="approveRequest"
        @complete="completeRequest"
        @close="burialDetailModalVisible = false"
      />
      <CancelModal :visible="isCancelModalVisible" @cancel="cancelRequest"  @close="isCancelModalVisible = false" />
    </Teleport>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.mgr{ display:flex; flex-direction:column; gap:16px; }

/* Поиск */
.mgr__search{ background:#fff; border-radius:16px; padding:14px 16px; }
.search{ position:relative; }
.search__input{
  width:100%; height:44px; border:1px solid #E6E8EC; border-radius:12px;
  padding:0 44px 0 14px; font-size:14px; outline:none;
}
.search__icon{
  position:absolute; right:12px; top:50%; transform:translateY(-50%);
  width:20px; height:20px; color:#9AA0A6;
}

/* Карточка */
.card{
  background:#fff; border-radius:16px; padding:16px; box-shadow:0 2px 6px rgba(0,0,0,.05);
  display:flex; flex-direction:column; gap:12px; transition:opacity .15s ease;
}
/* Пустое состояние */
.empty-state{
  display:flex; justify-content:center; align-items:center;
  min-height:300px; background:#fff; border-radius:16px; padding:40px 20px;
}
.empty-state__content{
  text-align:center; max-width:300px;
}
.empty-state__icon{
  color:#9AA0A6; margin:0 auto 16px;
}
.empty-state__title{
  font-size:20px; font-weight:600; color:#1F2937; margin:0 0 8px;
}
.empty-state__text{
  font-size:14px; color:#6B7280; margin:0; line-height:1.5;
}

.card__row{ display:flex; justify-content:space-between; align-items:flex-start; gap:12px; flex-wrap:nowrap; }
.card__row--bottom{ align-items:center; }

/* Заголовок */
.head-left{ display:flex; align-items:baseline; gap:10px; flex-shrink: 1; min-width: 0; }
.title{
  font-family:"FoglihtenNo06", serif;
  font-weight:700; letter-spacing:.02em; color:#1C140E; font-size:24px;
  white-space: nowrap;
}
/* Жёлтый бейдж с номером (не «пилюля») */
.num-badge{
  color:#F7B500; font-weight:700; font-family:"FoglihtenNo06", serif;
 display:inline-block; font-size: 24px;
}

/* Даты — серые */
.card__dates{ text-align:left; color:#8C8C8C; font-size:12px; }
.card__dates .date-line{ line-height:1.2; }

/* Инфо-блок: выравнивание лейблов */
.info{ display:flex; flex-direction:column; gap:6px; }
.info-line{ display:flex; align-items:center; gap:8px; }
.label{
  --w: 150px;           /* ширина колонки лейблов — одинаковая для всех строк */
  width:var(--w); min-width:var(--w);
  color:#6B7280; font-size:14px;
}
.value{ font-size:14px; color:#111827; }
.value--bold{ font-weight:600; }

/* Чипы */
.chips{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
.chip{
  display:inline-flex; align-items:center; height:28px;
  padding:0 10px; border-radius:8px; font-size:13px; font-weight:500;
}
.chip--gray  { background:#E9EDED; color:#111827; }
.chip--green { background:#E6F6EA; color:#1B8A36; }
.chip--orange{ background:#FEF1DE; color:#C66A00; }
.chip--blue  { background:#E6F2FF; color:#1B73E8; }
.chip--red   { background:#FFEBEE; color:#D32F2F; }

/* Правая часть заголовка */
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.arrow-icon{
  display: none;
}
/* Кнопка справа */
.btn-more{
  background:#F7B500; color:#1F2937; border:none;
  height:36px; padding:0 16px; border-radius:10px;
  font-weight:700; cursor:pointer; transition:filter .15s ease, opacity .15s ease;
}
.btn-more:disabled{ opacity:.6; cursor:default; }
.btn-more:not(:disabled):hover{ filter:brightness(.98); }

/* Дополнительные могилы в списке */
.adjacent-graves-section {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
  margin: 8px 0;
}

.adjacent-graves-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e40af;
  margin: 0 0 8px 0;
}

.adjacent-type {
  font-size: 12px;
  color: #6b7280;
  font-weight: 400;
}

.graves-preview {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.grave-chip {
  background: #dbeafe;
  color: #1e40af;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.more-graves {
  color: #6b7280;
  font-size: 12px;
  font-style: italic;
}

/* Мобильные стили */
@media (max-width: 768px) {
  .mgr {
    margin: 0 16px 16px;
    gap: 12px;
  }

  .mgr__search {
    margin: 0 0 16px 0;
    padding: 16px;
    border-radius: 12px;
  }

  .search__input {
    height: 48px;
    font-size: 16px;
    padding: 0 40px 0 16px;
    border-radius: 8px;
    border: 1px solid #E5E7EB;
  }

  .search__icon {
    right: 12px;
    width: 20px;
    height: 20px;
  }

  .empty-state {
    margin: 0 16px;
    min-height: 200px;
    padding: 40px 20px;
    border-radius: 12px;
  }

  .empty-state__title {
    font-size: 18px;
  }

  .empty-state__text {
    font-size: 13px;
  }

  .card {
    background: #F4F0E7;
    padding: 20px;
    border-radius: 12px;
    margin-top: 30px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .card__row {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
  }

  .card__row--header {
    align-items: center;
    margin-bottom: 8px;
    justify-content: space-between;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .arrow-icon {
    color: #6B7280;
    flex-shrink: 0;
    display: block;
  }

  .btn-more {
    display: block;
  }

  /* На мобильных устройствах - показываем стрелку, скрываем кнопку */
  @media (max-width: 768px) {
    .arrow-icon {
      display: block;
    }
    
    .btn-more {
      display: none;
    }
    
    .card--clickable {
      cursor: pointer;
    }
  }

  /* На десктопе - скрываем стрелку, показываем кнопку */
  @media (min-width: 769px) {
    .arrow-icon {
      display: block;
    }
    
    .btn-more {
      display: block;
    }
    
    .card--clickable {
      cursor: default;
    }
  }

  .head-left {
    display: flex;
    align-items: baseline;
    gap: 8px;
    flex-direction: column;
  }

  .title {
    font-size: 18px;
    font-weight: 700;
    color: #1C140E;
    font-family: "FoglihtenNo06", serif;
  }

  .num-badge {
    font-size: 20px;
    color: #F7B500;
    font-weight: 700;
    font-family: "FoglihtenNo06", serif;
  }


  .date-line {
    margin-bottom: 2px;
    font-size: 13px;
    color: #6B7280;
  }

  .date-line strong {
    font-weight: 600;
    color: #1F2937;
  }

  .info {
    gap: 8px;
    margin: 12px 0;
  }

  .info-line {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }

  .label {
    width: auto;
    min-width: auto;
    font-size: 13px;
    color: #6B7280;
    font-weight: 500;
  }

  .value {
    font-size: 14px;
    color: #1F2937;
  }

  .value--bold {
    font-weight: 600;
  }

  .chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
    margin-top: 12px;
  }

  .chip {
    height: 28px;
    padding: 0 10px;
    font-size: 12px;
    border-radius: 6px;
  }

  .card__row--bottom {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }


}
</style>
