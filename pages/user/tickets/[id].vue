<template>
  <NuxtLayout name="user" class="ticket-detail-page">
    <!-- back -->
    <button class="backlink" @click="router.push('/user/tickets')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="mr-2">
        <path d="M15 19l-7-7 7-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Вернуться
    </button>

    <div class="card">
      <!-- header -->
<div class="head">
  <div class="head__left">
    <h1 class="case-title">
      ЗАЯВКА НА ПЕРЕЗАХОРОНЕНИЕ
      <span class="case-title__no">№ {{ request?.id ?? '—' }}</span>
    </h1>

    <!-- без запятых между первыми двумя пунктами, запятая только перед телефоном -->
    <div class="meta">
      <span class="meta__item">
        Дата заявки: <b>{{ dateText }}</b>
      </span>

      <span class="meta__item">
        Ответственный исполнитель: <b>{{ responsibleText }}</b>
      </span>

      <span
        class="meta__item meta__item--comma-before"
        :class="{ 'is-empty': phoneText === '—' }"
      >
        {{ phoneText }}
      </span>
    </div>
  </div>

  <span class="status" :class="statusClass(request?.status?.value)">
    {{ statusLabel(request?.status) }}
  </span>
</div>

<!-- линия под шапкой оставляем -->
<div class="divider divider--header"></div>



      <!-- Данные заявителя -->
      <section class="block">
        <h3 class="block__title">Данные заявителя</h3>

        <div class="grid-2col">
          <div class="kv">
            <div class="k">Заявитель:</div>
            <div class="v" :class="{ 'is-empty': !request?.user }">
              <template v-if="request?.user">{{ fio(request.user) }}</template>
              <template v-else>—</template>
            </div>
          </div>

          <div class="kv">
            <div class="k">Контакты заявителя:</div>
            <div class="v" :class="{ 'is-empty': !request?.user?.phone }">
              {{ prettyPhone(request?.user?.phone) || '—' }}
            </div>
          </div>

          <div class="kv">
            <div class="k">ИИН заявителя:</div>
            <div class="v" :class="{ 'is-empty': !request?.user?.iin }">
              {{ request?.user?.iin || '—' }}
            </div>
          </div>
        </div>
      </section>

      <div class="divider"></div>

      <!-- Данные покойного -->
<!--      <section class="block">-->
<!--        <h3 class="block__title">Данные покойного</h3>-->

<!--        <div class="grid-2col">-->
<!--          <div class="kv">-->
<!--            <div class="k">ФИО покойного:</div>-->
<!--            <div class="v" :class="{ 'is-empty': !request?.deceasedFio }">-->
<!--              {{ request?.deceasedFio || '—' }}-->
<!--            </div>-->
<!--          </div>-->

<!--          <div class="kv">-->
<!--            <div class="k">Место захоронения:</div>-->
<!--            <div class="v" :class="{ 'is-empty': !request?.burialPlaceName }">-->
<!--              {{ request?.burialPlaceName || '—' }}-->
<!--            </div>-->
<!--          </div>-->

<!--          <div class="kv">-->
<!--            <div class="k">Дата рождения:</div>-->
<!--            <div class="v" :class="{ 'is-empty': !request?.deceasedBirthDate }">-->
<!--              {{ formatDate(request?.deceasedBirthDate) || '—' }}-->
<!--            </div>-->
<!--          </div>-->

<!--          <div class="kv">-->
<!--            <div class="k">Дата смерти:</div>-->
<!--            <div class="v" :class="{ 'is-empty': !request?.deceasedDeathDate }">-->
<!--              {{ formatDate(request?.deceasedDeathDate) || '—' }}-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </section>-->

      <div class="divider"></div>

      <!-- Старое место -->
      <section class="block">
        <h3 class="block__title">Старое место захоронения</h3>

        <div class="grid-2kv">
          <div class="kv kv--wide">
            <div class="k">Кладбище:</div>
            <div class="v" :class="{ 'is-empty': !request?.fromBurialId }">
              {{ request?.fromBurialId ? getNameById(request?.fromBurialId) : '—' }}
            </div>
          </div>

        </div>
      </section>

      <div class="divider"></div>

      <!-- Новое место -->
      <section class="block">
        <h3 class="block__title">Новое место захоронения</h3>

        <div class="grid-2kv">
          <div class="kv kv--wide">
            <div class="k">Кладбище:</div>
            <div class="v" :class="{ 'is-empty': !request?.toBurialId }">
              {{ request?.toBurialId ? getNameById(request?.toBurialId) : '—' }}
            </div>
          </div>

        </div>
      </section>

      <div class="divider"></div>

      <!-- Причина -->
      <section class="block">
        <div class="kv kv--reason">
          <div class="k">Причина перезахоронения:</div>
          <div class="v" :class="{ 'is-empty': !request?.reason }">
            {{ request?.reason || '—' }}
          </div>
        </div>
      </section>

      <div class="divider"></div>

      <!-- Документы -->
      <section class="block">
        <div class="docs-row">

          <div v-for="doc in documents" :key="doc.name" class="doc-col">
            <div class="doc-label">{{ doc.name }}</div>

            <div class="doc-card">
              <div class="doc-card__left">
                <div class="doc-fileicon" aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="#6B7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14 2v6h6" stroke="#6B7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>

              </div>

              <div class="doc-card__right">
                <button class="doc-btn" @click="download(request?.death_certificate)" title="Скачать">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3v12m0 0l4-4m-4 4l-4-4M5 21h14" stroke="#111827" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </section>

      <!-- actions -->
      <div class="actions">
        <button class="btn btn--ghost-red">Отказать</button>
        <button class="btn btn--ghost-gray">Отправить на доработку</button>
        <button class="btn btn--yellow">Согласовать захоронение</button>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCemeteries } from '~/services/cemetery'
import { getRequests } from '~/services/akimat'

const router = useRouter()
const route = useRoute()

const cemeteries = ref([])
const requests = ref([])
const request = ref({})

const documents = ref([
  { name: 'Свидетельство о смерти', display: 'Document.pdf', size: '5 МБ', file: 'document.pdf' },
  { name: 'Подтверждение родства заявителя', display: 'Document.pdf', size: '5 МБ', file: 'document.pdf' },
  { name: 'Документ на могилу', display: 'Document.pdf', size: '5 МБ', file: 'document.pdf' }
])

function fio(u) {
  if (!u) return '—'
  return `${u.surname || ''} ${u.name || ''} ${u.patronymic || ''}`.trim()
}


// === Плейсхолдерные тексты для шапки ===
const dateText = computed(() => {
  const d = request.value?.createdAt || request.value?.date
  return d ? formatDate(d) : '—'
})
const responsibleText = computed(() => {
  const u = request.value?.responsibleUser
  return u ? `${u.surname ?? ''} ${u.name ?? ''} ${u.patronymic ?? ''}`.trim() : '—'
})
const phoneText = computed(() => {
  const p = request.value?.responsibleUser?.phone || request.value?.userPhone
  const pretty = prettyPhone(p)
  return pretty || '—'
})


function getNameById(id) {
  const item = cemeteries.value.find(o => o.id === id)
  return item ? item.name : '—'
}

async function fetchRequestsLocal() {
  const response = await getRequests()
  requests.value = response.data
  request.value = requests.value.find(o => String(o.id) === String(route.params.id)) || {}
}

onMounted(async () => {
  const response = await getCemeteries()
  cemeteries.value = response.data.data
  await fetchRequestsLocal()
})

function prettyPhone(phone) {
  if (!phone) return ''
  const only = String(phone).replace(/\D/g, '')
  if (only.length === 11) {
    return `+${only[0]} ${only.slice(1, 4)} ${only.slice(4, 7)} ${only.slice(7, 9)} ${only.slice(9, 11)}`
  }
  return String(phone)
}

function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  if (isNaN(date.getTime())) return String(d)
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `${dd}.${mm}.${yyyy}`
}

function statusLabel(s) {
  return s?.nameRu || 'Новый запрос'
}
function statusClass(v) {
  switch (v) {
    case 'NEW':
    case 'CONFIRMED': return 'status--new'
    case 'IN_PROCESS': return 'status--inwork'
    case 'PENDING': return 'status--waiting'
    case 'REJECTED':
    case 'CLOSED': return 'status--rejected'
    default: return 'status--new'
  }
}

function download(doc) {
  if (doc && doc.url) {
    window.open(doc.url, '_blank')
  } else {
    console.error('Документ не содержит URL:', doc)
  }
}
</script>

<style lang="scss" scoped>
:root {
  --ink: #111827;
  --muted: #6B7280;
  --gold: #E3B343;
  --line: #E5E7EB;
}

/* back */
.backlink {
  display: flex;
  align-items: center;
  color: #B0892E;
  background: transparent;
  border: none;
  padding: 8px 0;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}

/* card container */
.card {
  background: #ffffff;
  padding: 20px;
  margin-top: 12px;
}

/* header */
.head {
  
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}
.case-title {
  font-family: "FoglihtenNo06", sans-serif;
  font-size: 32px;
  line-height: 36px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .02em;
  color: var(--ink);
}
.case-title__no { color: var(--gold); }

/* строка с метаданными под заголовком — без точек/палочек */
.meta {
  margin-top: 6px;
  color: #9CA3AF;
  font-size: 14px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

/* просто расстояние между пунктами */
.meta__item + .meta__item { margin-left: 12px; }

/* запятая только перед телефоном */
.meta__item--comma-before::before {
  content: ", ";
  color: #D1D5DB;
  margin-right: 8px;
}

/* если телефона нет — запятую не показываем */
.meta__item--comma-before.is-empty::before {
  content: "";
  margin: 0;
}

/* status */
.status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  color: #1F2937;
}
.status::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: currentColor;
  opacity: .95;
}
.status--new      { background: #E8F6EC; color: #2F9B3C; }
.status--inwork   { background: #E7F2F4; color: #297D85; }
.status--waiting  { background: #FFF1DC; color: #C77700; }
.status--rejected { background: #FDECEC; color: #D33030; }

/* Divider */
.divider {
  display: block;
  width: 100%;
  height: 0;
  border-top: 1px solid var(--line, #E5E7EB);
  margin: 16px 0;
}
.divider--header { margin-top: 12px; margin-bottom: 16px; }
/* blocks */
.block { padding: 4px 0; }
.block__title {
  font-weight: 700;
  font-size: 16px;
  margin: 0 0 10px 0;
  color: var(--ink);
}

/* grids */
.grid-2col {
  display: grid;
  grid-template-columns: repeat(2, minmax(260px, 1fr));
  gap: 12px 32px;
}

/* kv line */
.kv {
  display: grid;
  grid-template-columns: 220px 1fr;
  column-gap: 16px;
}
.kv--wide   { grid-column: 1 / -1; }
.kv--reason { grid-template-columns: 260px 1fr; }
.k          { color: #9CA3AF; font-weight: 700; }
.v          { color: var(--ink); font-weight: 600; word-break: break-word; }
.v.is-empty { color: #9CA3AF; }

/* спец-сетка для старого/нового места */
.grid-2kv {
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 12px 32px;
}

/* documents */
.docs-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(220px, 1fr));
  gap: 16px;
}
.doc-col { display: flex; flex-direction: column; gap: 8px; }
.doc-label { color: var(--ink); font-weight: 700; font-size: 14px; }
.doc-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 12px;
}
.doc-card__left { display: flex; align-items: center; gap: 12px; }
.doc-fileicon   { display: inline-flex; color: #6B7280; }
.doc-filename   { font-weight: 700; color: var(--ink); }
.doc-size       { font-size: 12px; color: #6B7280; }
.doc-card__right{ display: flex; gap: 8px; }
.doc-btn {
  background: #ffffff;
  width: 36px; height: 36px;
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer;
}

/* actions */
.actions {
  display: flex; gap: 12px; justify-content: flex-end; margin-top: 20px;
}
.btn { padding: 10px 16px; border-radius: 12px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; }
.btn--ghost-red  { background: #FDECEC; color: #D33030; }
.btn--ghost-gray { background: #ECEFF1; color: #374151; }
.btn--yellow     { background: #F7B500; color: #1F2937; }
.btn:hover       { filter: brightness(0.98); }

/* responsive */
@media (max-width: 920px) {
  .grid-2col { grid-template-columns: 1fr; }
  .grid-2kv  { grid-template-columns: 1fr; }
  .kv        { grid-template-columns: 1fr; row-gap: 4px; }
  .kv--reason{ grid-template-columns: 1fr; }
  .head      { flex-direction: column; align-items: flex-start; gap: 10px; }
}

/* Мобильная адаптация */
@media (max-width: 768px) {
  /* Устанавливаем белый фон только для страницы деталей заявки */
  :global(.ticket-detail-page) {
    background: #ffffff !important;
  }
  
  :global(.ticket-detail-page .user) {
    background: #ffffff !important;
  }
  
  /* Убираем глобальное переопределение фона */
  :global(.user) {
    background: #ffffff !important;
  }
  
  /* Убираем отступы и фон для мобильных */
  .card {
    background: transparent;
    padding: 0;
    margin-top: 0;
  }

  /* Адаптируем кнопку "Вернуться" */
  .backlink {
    color: #B0892E;
    font-size: 16px;
    padding: 12px 0;
    margin-bottom: 8px;
  }

  /* Адаптируем заголовок */
  .case-title {
    font-size: 24px;
    line-height: 28px;
    margin-bottom: 12px;
  }

  /* Адаптируем метаданные */
  .meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    margin-top: 8px;
  }

  .meta__item + .meta__item {
    margin-left: 0;
  }

  /* Скрываем статус на мобильных */
  .status {
    display: none;
  }

  /* Адаптируем блоки */
  .block {
    padding: 16px 0;
  }

  .block__title {
    font-size: 18px;
    margin-bottom: 12px;
  }

  /* Адаптируем сетки */
  .grid-2col {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .grid-2kv {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  /* Адаптируем kv строки */
  .kv {
    grid-template-columns: 1fr;
    row-gap: 4px;
    margin-bottom: 8px;
  }

  .k {
    font-size: 14px;
    color: #6B7280;
    margin-bottom: 2px;
  }

  .v {
    font-size: 16px;
    color: #1c1c1c;
  }

  /* Адаптируем документы */
  .docs-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .doc-card {
    padding: 16px;
  }

  /* Адаптируем кнопки действий */
  .actions {
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
  }

  .btn {
    width: 100%;
    padding: 16px;
    font-size: 16px;
    border-radius: 12px;
  }

  /* Специальные стили для кнопок */
  .btn--yellow {
    background: #F7B500;
    color: #1F2937;
    order: 1;
  }

  .btn--ghost-gray {
    background: #F3F4F6;
    color: #6B7280;
    order: 2;
  }

  .btn--ghost-red {
    background: #FDECEC;
    color: #D33030;
    order: 3;
  }
}
</style>
