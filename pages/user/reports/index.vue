<template>
  <NuxtLayout name="user">
    <div class="dash">

      <!-- ===== СЕКЦИЯ: Количество заявок ===== -->
      <section class="section">
        <div class="section__head">
          <h2 class="h-title">Количество заявок всего: {{ totalRequests }}</h2>

          <!-- период: неделя / месяц / всё время -->
          <select class="period" v-model="reqPeriod" @change="onPeriodChange('requests')">
            <option value="week">За неделю</option>
            <option value="month">За месяц</option>
            <option value="all">За всё время</option>
          </select>
        </div>

        <div class="kpi-grid">
          <div class="kpi kpi--green">
            <div class="kpi__label">Согласовано</div>
            <div class="kpi__value">{{ countBy('CONFIRMED') }}</div>
          </div>
          <div class="kpi kpi--peach">
            <div class="kpi__label">Отказано</div>
            <div class="kpi__value">{{ countBy('REJECTED') }}</div>
          </div>
          <div class="kpi kpi--blue">
            <div class="kpi__label">В работе</div>
            <div class="kpi__value">{{ countBy('IN_PROCESS') }}</div>
          </div>
          <div class="kpi kpi--sand">
            <div class="kpi__label">На доработке</div>
            <div class="kpi__value">{{ countBy('PENDING') }}</div>
          </div>
        </div>

        <div class="section__actions">
          <button class="btn" type="button" @click="exportRequests">Отчет по заявкам</button>
          <button class="btn" type="button" @click="exportAppeals">Отчет по обращениям</button>
        </div>
      </section>

      <!-- ===== ДВА БЛОКА В РЯД ===== -->
      <section class="grid-2">
        <!-- Сейчас в работе -->
        <div class="card">
          <div class="card__head">
            <h3 class="card__title card__title--muted">Сейчас в работе</h3>
          </div>

          <div v-if="requestStats?.inWork?.length" class="worklist">
            <div v-for="item in requestStats.inWork" :key="item.id" class="worklist__row">
              <span class="worklist__text">{{ item.status.nameRu }} №{{ item.requestNumber }}</span>
              <!-- inline arrow -->
              <svg class="worklist__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <div v-else class="worklist__empty">В работе ничего нет</div>
        </div>

        <!-- Типы обращения -->
        <div class="card">
          <div class="card__head">
            <h3 class="card__title">Типы обращения</h3>
            <select class="period period--sm" v-model="typesPeriod" @change="onPeriodChange('types')">
              <option value="week">За неделю</option>
              <option value="month">За месяц</option>
              <option value="all">За всё время</option>
            </select>
          </div>
          <div class="types-wrap">
            <Doughnut
              :data="types"
              :options="{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'right' }}}"
            />
          </div>
        </div>
      </section>

      <!-- ===== Захоронения ===== -->
      <template v-for="(value, key) in burialStats" :key="key">
        <section v-if="key !== 'total'" class="section">
          <div class="card flat">
            <div class="card__head">
              <h3 class="card__title card__title--muted">{{ burialStatsTitles[key] }}</h3>
            </div>
            <div class="chips">
              <span v-for="item in value" :key="item.name" class="chip">
                {{ key === 'by_months' ? formatYearMonth(item.name) : item.name }}: {{ item.count }}
              </span>
            </div>
          </div>
        </section>
      </template>

      <!-- ===== Новостей всего ===== -->
      <section class="section">
        <div class="section__head">
          <h2 class="h-title">Новостей всего: {{ newsStats?.count ?? 0 }}</h2>
          <select class="period" v-model="newsPeriod" @change="onPeriodChange('news')">
            <option value="week">За неделю</option>
            <option value="month">За месяц</option>
            <option value="all">За всё время</option>
          </select>
        </div>
        <div class="news-stats">
          <span
            v-for="st in newsStats?.newsStatuses || []"
            :key="st.status.id"
            class="news-stats__item"
            :class="{
              'news-stats__item--green': st.status.id === 1,
              'news-stats__item--gray':  st.status.id === 2
            }"
          >
            {{ st.status.nameRu }}: {{ st.count }}
          </span>
        </div>
      </section>

      <!-- ===== Топ-5 просматриваемых новостей (без селекта) ===== -->
      <section class="section">
        <div class="card">
          <div class="card__head">
            <h3 class="card__title">Топ-5 просматриваемых новостей</h3>
          </div>

          <div class="topnews" v-if="topNews.length">
            <div v-for="n in topNews" :key="n.id" class="topnews__row">
              <div class="topnews__title" :title="n.title">{{ n.title }}</div>
              <div class="topnews__meta">
                <span class="topnews__views" title="Просмотры">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/>
                  </svg>
                  <span>{{ n.views ?? n.viewCount ?? 0 }}</span>
                </span>
                <svg class="topnews__chev" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
          <div v-else class="topnews__empty">Новостей нет</div>
        </div>
      </section>

    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import {
  getNewsStats,
  getRequestsStats,
  exportAppealsReport,
  exportRequestsReport,
  getBurialRequestStats,
  // getTopNews, // ← оставляю закомментированным, чтобы не ловить 500
} from '~/services/akimat'
import { downloadBase64File } from '~/utils/downloadBase64.js'

definePageMeta({ middleware: ['auth', 'akimat'] })
ChartJS.register(ArcElement, Tooltip, Legend)

/* ---------------- periods (плейсхолдеры) ---------------- */
const reqPeriod   = ref('month') // week | month | all
const typesPeriod = ref('month')
const newsPeriod  = ref('all')

function onPeriodChange(which){
  // плейсхолдер: можно будет пробросить параметры на бэк
  // например: getRequestsStats({ period: reqPeriod.value })
  loadDashboard()
}

/* ---------------- state ---------------- */
const loading      = ref(false)
const newsStats    = ref({})
const requestStats = ref({})
const burialStats  = ref({})

/* график «типы обращений» */
const types = ref({
  labels: ['Обращения', 'Перезахоронение'],
  datasets: [{ backgroundColor: ['#66CDD8', '#22686F'], data: [54, 17] }]
})

/* заголовки блоков */
const burialStatsTitles = ref({
  by_cemeteries: 'Кладбища',
  by_cities:     'Города',
  by_months:     'Месяцы',
  by_status:     'Статусы'
})

/* удобный тотал */
const totalRequests = computed(() => {
  if (typeof requestStats.value?.count === 'number') return requestStats.value.count
  const arr = requestStats.value?.statuses || []
  return arr.reduce((s, x) => s + (x.count || 0), 0)
})

/* KPI нормализация */
const STATUS_MAP = {
  CONFIRMED:  ['CONFIRMED','APPROVED','AGREED','согласовано','согласован','одобрено'],
  REJECTED:   ['REJECTED','DECLINED','отказано','отклонено','отклонён'],
  IN_PROCESS: ['IN_PROCESS','IN_PROGRESS','PROCESSING','в работе'],
  PENDING:    ['PENDING','REVISION','RETURNED_FOR_REVISION','на доработке','ожидает','ожидание']
}
const norm = v => (v == null ? '' : String(v).trim().toLowerCase())
function matchesNeedles(statusObj, needles){
  const value = norm(statusObj?.value ?? statusObj?.code ?? statusObj?.id)
  const name  = norm(statusObj?.nameRu ?? statusObj?.name)
  return needles.has(value) || needles.has(name)
}
function countBy(key){
  const arr = requestStats.value?.statuses || []
  const needles = new Set(STATUS_MAP[key].map(norm))
  return arr.filter(s => matchesNeedles(s.status || {}, needles)).reduce((sum, s) => sum + (s.count || 0), 0)
}

/* helpers */
function formatYearMonth(dateStr){
  const [year, month] = (dateStr || '').split('-')
  const names = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
  const mm = Math.max(1, Math.min(12, +month || 0)) - 1
  return `${names[mm] || '—'} ${year || ''}`
}

/* экспорт */
const exportAppeals = async () => {
  const res = await exportAppealsReport()
  downloadBase64File(res.data.base64, 'Отчет по обращениям.xslx')
}
const exportRequests = async () => {
  const res = await exportRequestsReport()
  downloadBase64File(res.data.base64, 'Отчет по заявкам.xslx')
}

/* ---- Top-5 news: пока без API, пустое при отсутствии ---- */
const topNews = ref([])
function loadTopNews(){
  // когда появится API:
  // const { data } = await getTopNews({ limit: 5, period: newsPeriod.value })
  // topNews.value = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : [])
  topNews.value = []
}

/* ---- data load + автorefresh ---- */
async function loadDashboard(){
  loading.value = true
  try {
    const [newsRes, reqRes, burRes] = await Promise.all([
      getNewsStats(/* { period: newsPeriod.value } */),
      getRequestsStats(/* { period: reqPeriod.value } */),
      getBurialRequestStats(/* { period: typesPeriod.value } */),
    ])

    newsStats.value    = newsRes.data || {}
    requestStats.value = reqRes.data  || {}
    burialStats.value  = burRes.data  || {}

    const t = requestStats.value?.types || []
    if (t.length) {
      const palette = ['#66CDD8', '#22686F', '#9AD9DF', '#558C92']
      types.value = {
        labels: t.map(x => x.type?.nameRu || x.type?.name || '—'),
        datasets: [{ backgroundColor: palette.slice(0, t.length), data: t.map(x => x.count || 0) }]
      }
    }
  } catch (e) {
    console.error('Ошибка при загрузке дашборда:', e)
  } finally {
    loading.value = false
  }
}

let timer = null
function startAutoRefresh(){ stopAutoRefresh(); timer = setInterval(() => { loadDashboard(); loadTopNews() }, 30000) }
function stopAutoRefresh(){ if (timer) clearInterval(timer), (timer = null) }
function onVis(){ if (document.visibilityState === 'visible') { loadDashboard(); loadTopNews() } }

onMounted(() => {
  loadDashboard()
  loadTopNews()
  startAutoRefresh()
  document.addEventListener('visibilitychange', onVis)
})
onBeforeUnmount(() => {
  stopAutoRefresh()
  document.removeEventListener('visibilitychange', onVis)
})
</script>

<style scoped>
/* Общая сетка */
.dash{ display:flex; flex-direction:column; gap:24px; }

/* Заголовки секций */
.h-title{
  font-family:"FoglihtenNo06", serif;
  font-weight:700;
  text-transform:uppercase;
  letter-spacing:.02em;
  font-size:28px;
  line-height:1.2;
  color:#1C140E;
}

/* Секции */
.section{ display:flex; flex-direction:column; gap:16px; }
.section__head{ display:flex; align-items:center; justify-content:space-between; gap:12px; }

/* Селекты */
.period{ border:1px solid #E6E8EC; background:#F5F6F7; height:36px; border-radius:5px; padding:0 12px; font-size:14px; color:#374151; }
.period--sm{ height:34px; }

/* Кнопки */
.section__actions{ display:flex; gap:12px; justify-content:flex-end; margin-top:4px; }
.btn{ height:36px; border-radius:10px; border:none; background:#F7B500; color:#fff; font-weight:700; padding:0 14px; cursor:pointer; }
.btn:hover{ filter:brightness(.98); }

/* KPI */
.kpi-grid{ display:grid; grid-template-columns: repeat(4, minmax(160px, 1fr)); gap:16px; }
.kpi{ border-radius:14px; padding:16px; background:#F6F7F8; display:flex; flex-direction:column; gap:10px; min-height:86px; }
.kpi__label{ size:14px; color:#6B7280; font-weight:400; }
.kpi__value{ font-size:32px; font-weight:400; color:#111827; line-height:1; }
.kpi--green{ background:#4E93211F; } .kpi--peach{ background:#DA43391F; } .kpi--blue{ background:#417DD61F; } .kpi--sand{ background:#E37E141F; }

/* Две карточки */
.grid-2{ display:grid; grid-template-columns: 1fr 1fr; gap:24px; }
@media (max-width: 980px){ .grid-2{ grid-template-columns: 1fr; } }

/* Карточки */
.card{ background:#fff; border-radius:16px; box-shadow:0 4px 6px rgba(0,0,0,.04); padding:16px; display:flex; flex-direction:column; gap:12px; }
.card.flat{ box-shadow:none; border:1px solid #ECECEC; }
.card__head{ display:flex; align-items:center; justify-content:space-between; gap:12px; }
.card__title{ font-weight:700; font-size:16px; color:#111827; }
.card__title--muted{ color:#6B7280; }

/* Сейчас в работе */
.worklist{ display:flex; flex-direction:column; gap:6px; max-height:300px; overflow-y:auto; padding-right:6px; }
.worklist__row{ display:flex; align-items:center; justify-content:space-between; padding:8px 10px; border-radius:10px; transition:background .15s; }
.worklist__row:hover{ background:#F9FAFB; }
.worklist__text{ font-weight:600; font-size:14px; color:#111827; }
.worklist__arrow{ width:16px; height:16px; }
.worklist__empty{ color:#939393; font-size:14px; }

/* Типы обращения */
.types-wrap{ position:relative; height:260px; }

/* Чипы */
.chips{ display:flex; flex-wrap:wrap; gap:10px; }
.chip{ background:#F5F6F7; border:1px solid #E6E8EC; color:#111827; padding:6px 10px; border-radius:10px; font-weight:600; font-size:14px; }

/* Новости всего: бейджи */
.news-stats{ display:flex; flex-wrap:wrap; gap:10px; }
.news-stats__item{ padding:6px 10px; border-radius:999px; font-weight:700; font-size:12px; background:#ECEFF1; color:#6B7280; }
.news-stats__item--green{ background:#E8F6EC; color:#2F9B3C; }
.news-stats__item--gray{  background:#ECEFF1; color:#9CA3AF; }

/* Top-5 news */
.topnews{ display:flex; flex-direction:column; gap:8px; }
.topnews__row{
  display:flex; align-items:center; justify-content:space-between;
  background:#F5F6F7; border:1px solid #E6E8EC; border-radius:12px;
  padding:10px 12px; transition:background .15s;
}
.topnews__row:hover{ background:#F0F2F4; }
.topnews__title{ font-size:14px; color:#111827; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width: calc(100% - 140px); }
.topnews__meta{ display:flex; align-items:center; gap:12px; }
.topnews__views{ display:inline-flex; align-items:center; gap:6px; color:#6B7280; font-weight:600; }
.topnews__chev{ color:#9CA3AF; }
.topnews__empty{ color:#939393; font-size:14px; }
</style>
