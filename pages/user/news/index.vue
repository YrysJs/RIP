<template>
  <NuxtLayout name="user">
    <div class="page">

      <!-- Заголовок + кнопка -->
      <div class="page-head">
        <h1 class="page-title">Новости</h1>

        <button class="add-btn" @click="router.push('/user/news/form')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Добавить новость
        </button>
      </div>

      <!-- Фильтры -->
      <div class="filters">
        <!-- Категория -->
        <div class="field">
          <span class="field__icon" aria-hidden>
            <!-- папка -->
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="#6B7280" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <select class="field__control" v-model="categoryId">
            <option value="">Категория</option>
            <option value="1">Объявления</option>
            <option value="2">Социальная поддержка</option>
            <option value="3">Изменения в законодательстве</option>
          </select>
          <span class="field__chevron" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="#111827" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </div>

        <!-- Статус -->
        <div class="field">
          <span class="field__icon" aria-hidden>
            <!-- часы -->
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v4l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="#6B7280" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <select class="field__control" v-model="statusId">
            <option value="">Статус</option>
            <option value="1">Активный</option>
            <option value="2">Черновик</option>
          </select>
          <span class="field__chevron" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="#111827" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </div>

        <!-- Сортировка -->
        <div class="field">
          <span class="field__icon" aria-hidden>
            <!-- sort -->
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M7 4v16M7 4l-3 3M7 4l3 3M17 20V4m0 16l3-3m-3 3l-3-3" stroke="#6B7280" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <select class="field__control" v-model="sortingType">
            <option value="desc">Сначала новые</option>
            <option value="asc">Сначала старые</option>
          </select>
          <span class="field__chevron" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="#111827" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Список -->
      <div class="list">
        <article
          v-for="news in newsList"
          :key="news.id"
          class="card"
        >
          <img :src="news.coverImageUrl" alt="" class="card__img" />

          <div class="card__body">
            <!-- Верхняя строка: категория слева, статус справа -->
            <div class="card__top">
              <span class="badge">{{ news.category?.name || '—' }}</span>

              <span
                class="status"
                :class="{
                  'status--active': news.newsStatus?.id === 1,
                  'status--draft': news.newsStatus?.id !== 1
                }"
              >
                <i></i>{{ news.newsStatus?.nameRu || '—' }}
              </span>
            </div>

            <h3 class="card__title">
              {{ news.title }}
            </h3>

            <p class="card__excerpt">
              {{ truncate(news.content, 260) }}
            </p>

            <div class="card__bottom">
              <span class="card__date">{{ formatDate(news.registrationDate) }}</span>

              <div class="card__actions">
                <button
                  v-if="news.newsStatus?.id === 1"
                  class="btn btn--ghost"
                  @click="hide(news)"
                >
                  Скрыть
                </button>

                <button
                  class="btn btn--yellow"
                  @click="edit(news)"
                >
                  Редактировать
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getNews, changeNewsStatus } from '~/services/akimat'
import { useNewsStore } from '~/store/news.js'

const router = useRouter()
const newsStore = useNewsStore()

const newsList   = ref([])
const categoryId = ref('')
const statusId   = ref('')
const sortingType= ref('desc')

async function fetchNews () {
  try {
    const { data } = await getNews({
      categoryId: categoryId.value || undefined,
      statusId:   statusId.value   || undefined,
      sortingType: sortingType.value
    })
    newsList.value = data
  } catch (e) {
    console.error('Ошибка при получении новостей:', e)
  }
}

watch([categoryId, statusId, sortingType], fetchNews, { immediate: true })

function formatDate(arr) {
  if (!Array.isArray(arr) || arr.length < 6) return ''
  const [y, m, d, hh, mm, ss, ns = 0] = arr
  const dt = new Date(y, m - 1, d, hh, mm, ss, Math.floor(ns/1_000_000))
  const pad = n => String(n).padStart(2,'0')
  return `${pad(dt.getDate())}.${pad(dt.getMonth()+1)}.${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

function truncate(text, n = 200) {
  if (!text) return ''
  return text.length > n ? text.slice(0, n).trim() + '…' : text
}

function edit(news) {
  newsStore.setSelected(news)
  router.push(`/user/news/form?id=${news.id}`)
}

async function hide(news) {
  try {
    await changeNewsStatus({ newsId: news.id, newsStatusId: 2 })
    news.newsStatus.id = 2
    news.newsStatus.nameRu = 'Черновик'
  } catch (e) {
    console.error('Ошибка при смене статуса:', e)
  }
}
</script>

<style scoped>
/* контейнер */
.page { background:#fff; border:1px solid #ECECEC; border-radius:16px; padding:20px; margin-top:20px; }

/* заголовок */
.page-head{ display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:8px; }
.page-title{
  font-family: Georgia, 'Times New Roman', serif;
  font-size:28px; line-height:36px; font-weight:700; text-transform:uppercase; letter-spacing:.02em; color:#111827;
}

/* добавить новость */
.add-btn{
  display:flex; align-items:center; gap:8px;
  background:#224C4F; color:#fff; padding:10px 16px; border-radius:12px; font-weight:700; font-size:14px; border:none; cursor:pointer;
}

/* фильтры */
.filters{ display:flex; gap:12px; flex-wrap:wrap; margin-top:8px; }
.field{ position:relative; min-width:260px; }
.field__control{
  width:100%; border:1px solid #D2D8DF; background:#fff; border-radius:12px;
  padding:12px 40px 12px 44px; font-size:16px; line-height:24px; color:#111827;
  -webkit-appearance:none; -moz-appearance:none; appearance:none;
}
.field__icon{ position:absolute; left:14px; top:50%; transform:translateY(-50%); pointer-events:none; }
.field__chevron{ position:absolute; right:12px; top:50%; transform:translateY(-50%); pointer-events:none; }

/* разделительная линия */
.divider{ height:1px; background:#E5E7EB; margin:16px 0; }

/* список */
.list{ display:flex; flex-direction:column; gap:12px; }

/* карточка */
.card{
  display:grid; grid-template-columns: 230px 1fr; gap:16px;
  border:1px solid #EEEEEE; border-radius:12px; overflow:hidden; background:#fff;
}
.card__img{ width:230px; height:176px; object-fit:cover; }
.card__body{ display:flex; flex-direction:column; padding:16px; gap:8px; }

/* верхняя строка */
.card__top{ display:flex; justify-content:space-between; align-items:center; gap:12px; }
.badge{
  background:#F1F5F9; color:#374151; font-size:12px; font-weight:600;
  padding:4px 10px; border-radius:8px;
}
.status{
  display:inline-flex; align-items:center; gap:8px;
  font-size:12px; font-weight:700; padding:8px 12px; border-radius:999px; white-space:nowrap;
  background:#ECEFF1; color:#6B7280;
}
.status i{ width:8px; height:8px; border-radius:999px; background:currentColor; opacity:.95; display:inline-block; }
.status--active{ background:#E8F6EC; color:#2F9B3C; }
.status--draft { background:#ECEFF1; color:#9CA3AF; }

/* контент */
.card__title{ font-weight:700; font-size:18px; line-height:24px; color:#111827; }
.card__excerpt{ color:#6B7280; font-size:14px; line-height:20px; max-width:980px; }

/* низ карточки */
.card__bottom{ display:flex; justify-content:space-between; align-items:center; gap:12px; margin-top:4px; }
.card__date{ color:#6B7280; font-size:14px; white-space:nowrap; }
.card__actions{ display:flex; gap:12px; }

/* кнопки */
.btn{ border:none; cursor:pointer; font-weight:700; border-radius:12px; }
.btn--ghost{ background:#ECEFF1; color:#111827; padding:10px 16px; }
.btn--yellow{ background:#F7B500; color:#1F2937; padding:10px 16px; }
.btn:hover{ filter:brightness(.98); }

/* адаптив */
@media (max-width: 720px){
  .field{ min-width: 100%; }
  .card{ grid-template-columns: 1fr; }
  .card__img{ width:100%; height:200px; }
  .card__bottom{ flex-direction:column; align-items:flex-start; }
}
</style>
