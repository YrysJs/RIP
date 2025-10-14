<script setup>
import { ref, onMounted } from 'vue'
import {getMyAppeals} from '~/services/client'

const router = useRouter()
const appeals = ref([])
const isLoading = ref(true)

// Фильтры
const search = ref('')
const appealType = ref('')

// Debounce для поиска
let searchTimeout = null
const onSearchInput = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchAppeals()
  }, 350)
}

// Получение обращений
async function fetchAppeals() {
  try {
    isLoading.value = true
    const response = await getMyAppeals({
      search: search.value || undefined,
      type: appealType.value || undefined,
    })
    appeals.value = response.data?.items ?? response.data ?? []
  } catch (error) {
    console.error('Ошибка при загрузке обращений:', error)
  } finally {
    isLoading.value = false
  }
}

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  })
}

// Получение имени заявителя
const getApplicantName = (appeal) => {
  const user = appeal?.applicant || appeal?.user
  if (user) {
    if (user.fullName) return user.fullName
    if (user.fio) return user.fio
    const name = [user.surname, user.name, user.patronymic].filter(Boolean).join(' ').trim()
    if (name) return name
  }
  return '—'
}

// Функция для получения класса типа обращения
const getTypeClass = (type) => {
  switch (type) {
    case 'COMPLAINT':
      return 'appeal-card__type--complaint'
    case 'OFFER':
      return 'appeal-card__type--offer'
    case 'REQUEST':
      return 'appeal-card__type--request'
    default:
      return 'appeal-card__type--request'
  }
}

onMounted(async () => {
  await fetchAppeals()
})
</script>

<template>
  <NuxtLayout name="supplier" class="government-page">
    <div class="w-full rounded-[16px]">
      <!-- Заголовок -->
      <div class="page-header">
        <h2 class="page-title">Обращения в Акимат</h2>
        <button 
          @click="router.push('/supplier/goverment/create')" 
          class="create-btn"
        >
          Создать обращение
        </button>
      </div>

      <!-- Загрузка -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p class="loading-text">Загрузка обращений...</p>
      </div>

      <!-- Список обращений -->
      <div v-else class="appeals-list">
        <div
          v-for="appeal in appeals"
          :key="appeal.id"
          class="appeal-card"
        >
          <div class="appeal-card__header">
            <h3 class="appeal-card__title">Обращение №{{ appeal.id }}</h3>
            <div class="appeal-card__date">
              Дата обращения: {{ formatDate(appeal.createTime || appeal.createdAt) }}
            </div>
          </div>

          <div class="appeal-card__row">
            <span class="appeal-card__label">Заявитель:</span>
            <span class="appeal-card__value">
              {{ getApplicantName(appeal) }}
            </span>
          </div>

          <div class="appeal-card__row">
            <span class="appeal-card__label">Тип обращения:</span>
            <span class="appeal-card__type" :class="getTypeClass(appeal.type?.value)">
              {{ appeal.type?.nameRu || appeal.type?.name || '—' }}
            </span>
          </div>

          <div class="appeal-card__row" v-if="appeal.document?.url || appeal.documentUrl">
            <span class="appeal-card__label">Документ:</span>
            <a class="appeal-card__file" :href="appeal.document?.url || appeal.documentUrl" target="_blank" rel="noopener">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="#297D85" stroke-width="1.6"/>
                <path d="M14 2v6h6" stroke="#297D85" stroke-width="1.6"/>
              </svg>
              <span>{{ appeal.document?.name || 'Document.pdf' }}</span>
            </a>
          </div>

          <div class="appeal-card__row">
            <span class="appeal-card__label">Обращение:</span>
            <p class="appeal-card__text">{{ appeal.content || appeal.text }}</p>
                    </div>
                </div>
            </div>
        </div>
     </NuxtLayout>
</template>

<style scoped lang="scss">
/* Заголовок страницы */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 16px;
}

.page-title {
  font-family: "FoglihtenNo06", serif;
  font-weight: 700;
  letter-spacing: 0.02em;
  font-size: 24px;
  line-height: 1.2;
  margin: 0;
  color: #1c140e;
}

.create-btn {
  background: #F7B500;
  color: #1F2937;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-btn:hover {
  background: #E6A300;
  transform: translateY(-1px);
}

/* Фильтры */
.filters-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

/* Поля */
.field {
  position: relative;
}

.field__control {
  border: 1px solid #D2D8DF;
  background: #FFFFFF;
  padding: 12px 40px 12px 44px;
  border-radius: 12px;
  font-size: 16px;
  line-height: 24px;
  color: #111827;
  width: 100%;
}

.field__control::placeholder {
  color: #6B7280;
}

.field__icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  pointer-events: none;
}

.field__chevron {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

select.field__control {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

select[required].field__control:invalid {
  color: #6B7280;
}

option[disabled][hidden] {
  display: none;
}

/* Загрузка */
.loading-state {
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid #e7e9ec;
  border-top-color: #38949B;
  animation: spin 0.9s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #6b7280;
  font-size: 16px;
}

/* Список обращений */
.appeals-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.appeal-card {
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  background: #fff;
  padding: 20px;
  transition: all 0.2s ease;
}

.appeal-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.appeal-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 16px;
  gap: 12px;
}

.appeal-card__title {
  font-size: 20px;
  font-weight: 700;
  color: #1C140E;
  margin: 0;
}

.appeal-card__date {
  color: #6B7280;
  font-size: 14px;
}

.appeal-card__row {
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: start;
  column-gap: 16px;
  row-gap: 6px;
  margin: 8px 0;
}

.appeal-card__label {
  color: #6B7280;
  font-weight: 600;
  font-size: 14px;
}

.appeal-card__value {
  color: #111827;
  font-size: 14px;
}

.appeal-card__text {
  color: #111827;
  line-height: 1.5;
  margin: 0;
  font-size: 14px;
}

.appeal-card__type {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  text-align: center;
}

.appeal-card__type--complaint {
  background: #B91C1C;
  width: 60px;
}

.appeal-card__type--offer {
  background: #D97706;
  width: 100px;
}

.appeal-card__type--request {
  background: #047857;
  width: 140px;
}

.appeal-card__file {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #297D85;
  font-weight: 600;
  text-decoration: none;
  font-size: 14px;
}

.appeal-card__file:hover {
  text-decoration: underline;
}

/* Стили страницы */

/* Мобильные стили */
@media (max-width: 768px) {
  :global(.government-page .supplier .container) {
    margin: 0 !important;
    padding: 0 !important;
    max-width: 100% !important;
  }

  :global(.government-page .supplier .main-content) {
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Заголовок */
  .page-header {
    flex-direction: column;
    gap: 16px;
    margin: 0 16px 16px;
    padding: 16px;
    border-radius: 12px;
    background: #FDFCF9;
    box-shadow: 0 2px 8px rgba(46, 30, 23, 0.08);
    border: 1px solid #E0DED9;
  }

  .page-title {
    font-size: 20px;
    text-align: center;
    width: 100%;
  }

  .create-btn {
    width: 100%;
    height: 44px;
    font-size: 14px;
  }

  /* Фильтры */
  .filters-row {
    flex-direction: column;
    gap: 12px;
    margin: 0 16px 16px;
  }

  .field {
    min-width: 100%;
  }

  .field__control {
    height: 44px;
    font-size: 16px;
  }

  /* Карточки обращений */
  .appeals-list {
    margin: 0 16px 16px;
    gap: 12px;
  }

  .appeal-card {
    padding: 16px;
    border-radius: 12px;
    background: #FDFCF9;
    box-shadow: 0 2px 8px rgba(46, 30, 23, 0.08);
    border: 1px solid #E0DED9;
  }

  .appeal-card__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 12px;
  }

  .appeal-card__title {
    font-size: 18px;
    font-weight: 700;
    color: #2E1E17;
  }

  .appeal-card__date {
    font-size: 13px;
    color: #6B7280;
  }

  .appeal-card__row {
    grid-template-columns: 1fr;
    gap: 4px;
    margin: 8px 0;
  }

  .appeal-card__label {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
  }

  .appeal-card__value {
    font-size: 14px;
    color: #1F2937;
  }

  .appeal-card__text {
    font-size: 14px;
    line-height: 1.4;
    color: #2E1E17;
  }

  .appeal-card__type {
    font-size: 12px;
    padding: 6px 12px;
    border-radius: 6px;
  }

  .appeal-card__type--complaint {
    width: 80px;
  }

  .appeal-card__type--offer {
    width: 120px;
  }

  .appeal-card__type--request {
    width: 160px;
  }

  .appeal-card__file {
    font-size: 13px;
  }
}

</style>