<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getMyAppeals } from '~/services/akimat'

const router = useRouter()
const appeals = ref([])
const loading = ref(true)

async function getUserAppeals () {
  try {
    loading.value = true
    const res = await getMyAppeals()
    appeals.value = Array.isArray(res?.data) ? res.data : []
  } catch {
    appeals.value = []
  } finally {
    loading.value = false
  }
}

const isEmpty = computed(() => !loading.value && appeals.value.length === 0)

onMounted(getUserAppeals)

const fmtDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('ru-RU', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
}
</script>

<template>
  <NuxtLayout name="client">
    <!-- Шапка как во 2-м коде -->
    <div class="page-head">
      <h2 class="page-title">Обращение в акимат</h2>
    </div>

    <!-- Загрузка -->
    <div v-if="loading" class="state-card">
      <div class="spinner" />
      <p class="muted">Загружаем ваши обращения…</p>
    </div>

    <!-- Пустое состояние -->
    <div v-else-if="isEmpty" class="empty">
      <div class="empty__card">
        <svg class="empty__icon" viewBox="0 0 48 48" aria-hidden="true">
          <g fill="none" stroke="currentColor" stroke-width="2">
            <rect x="10" y="6" width="28" height="36" rx="3"/>
            <path d="M16 16h16M16 22h16M16 28h10"/>
            <circle cx="33" cy="33" r="6"/>
            <path d="M37.5 37.5L42 42"/>
          </g>
        </svg>

        <div class="empty__title">Ничего не найдено</div>
        <div class="empty__subtitle">У вас пока нет<br>созданных обращений</div>

        <button class="btn btn--yellow empty__btn" @click="router.push('/client/goverment/create')">
          Создать обращение
        </button>
      </div>
    </div>

    <!-- Список обращений в стиле карточек из 2-го кода -->
    <div v-else class="list">
      <div v-for="appeal in appeals" :key="appeal.id" class="card">
        <div class="card__row">
          <div class="head-left">
            <span class="title">ТИП ОБРАЩЕНИЯ:</span>
            <span
              class="num-badge"
              :style="{ background: appeal?.type?.value==='COMPLAINT' ? '#38949B' : appeal?.type?.value==='OFFER' ? '#F7B500' : '#2E7D32', color:'#fff' }"
            >
              {{ appeal?.type?.nameRu || '—' }}
            </span>
          </div>
          <div class="dates">
            <div class="date-line">Дата создания: {{ fmtDate(appeal.createTime) }}</div>
          </div>
        </div>

        <div class="info">
          <div class="info-line">
            <span class="label">Обращение:</span>
            <span class="value">{{ appeal.content || '—' }}</span>
          </div>
        </div>

        <div class="card__row card__row--bottom">
          <div class="actions">
            <!-- при необходимости тут можно добавить кнопку "Подробнее" -->
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
/* ===== Заголовок (копия из 2-го) ===== */
.page-head{
  display:flex; align-items:center;
  background:#fff;
  padding:14px 16px;
  border-radius:16px;
}
.page-title{
  font-family:"FoglihtenNo06", serif;
  font-weight:500; letter-spacing:.02em;
  font-size:32px; color:#1C140E; margin:0;
  text-transform:uppercase;
}

/* ===== Индикатор загрузки ===== */
.state-card{
  background:#fff; border-radius:16px; padding:24px; text-align:center; margin-top:20px;
}
.muted{ color:#6B7280; margin-top:12px; }
.spinner{
  width:36px; height:36px; border-radius:50%;
  border:3px solid #e6e6e6; border-top-color:#224C4F;
  animation:spin .9s linear infinite; margin:0 auto;
}
@keyframes spin{ to{ transform:rotate(360deg) } }

/* ===== Пустое состояние ===== */
.empty{
  background:#fff; border-radius:16px;
  padding:0 40px 30px;
  min-height:360px;
  display:flex; justify-content:center;
}
.empty__card{ text-align:center; color:#1F2937; max-width:360px; }
.empty__icon{ width:64px; height:64px; color:#9AA0A6; margin:0 auto 14px; }
.empty__title{ font-weight:500; font-size:22px; }
.empty__subtitle{ margin-top:8px; font-size:14px; color:#8C8C8C; line-height:1.35; }
.empty__btn{
  display:inline-flex; align-items:center; justify-content:center;
  height:44px; padding:0 18px; margin:40px auto 0;
}

/* ===== Список/карточки (как во 2-м) ===== */
.list{ display:flex; flex-direction:column; gap:16px; }
.card{
  background:#fff; border-radius:16px; padding:16px; margin-top:20px;
  box-shadow:0 2px 6px rgba(0,0,0,.05);
  display:flex; flex-direction:column; gap:12px;
}
.card__row{ display:flex; justify-content:space-between; align-items:flex-start; gap:12px; flex-wrap:wrap; }
.card__row--bottom{ align-items:center; }
.head-left{ display:flex; align-items:center; gap:10px; }
.title{ font-family:"FoglihtenNo06", serif; font-weight:700; color:#1C140E; font-size:16px; letter-spacing:.02em; }
.num-badge{ padding:4px 10px; border-radius:8px; line-height:1.2; display:inline-block; font-weight:600; font-size:14px; }
.dates{ text-align:right; color:#8C8C8C; font-size:12px; }
.date-line{ line-height:1.2; }
.info{ display:flex; flex-direction:column; gap:6px; }
.info-line{ display:flex; align-items:flex-start; gap:8px; }
.label{ --w:120px; width:var(--w); min-width:var(--w); color:#6B7280; font-size:14px; }
.value{ font-size:14px; color:#111827; }

/* кнопки */
.btn{ border:none; border-radius:10px; font-weight:500; cursor:pointer; transition:filter .15s ease; }
.btn--yellow{ background:#F7B500; color:#1F2937; height:44px; padding:0 18px; }
.btn:hover{ filter:brightness(.98); }
</style>
