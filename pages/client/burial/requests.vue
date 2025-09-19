<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getMyRequests } from '~/services/akimat'

const router = useRouter()

const loading = ref(true)
const appeals  = ref([])

async function loadData () {
  loading.value = true
  try {
    const reqRes = await getMyRequests()
    appeals.value = Array.isArray(reqRes?.data) ? reqRes.data : []
  } catch {
    appeals.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

const isEmpty = computed(() => !loading.value && appeals.value.length === 0)

/* просто выводим "Кладбище <id>" */
const cemPlain = (id) => `Кладбище ${id ?? '—'}`

const fileTitle = (url) => {
  if (!url) return '—'
  try {
    const name = decodeURIComponent(url.split('/').pop() || '')
    return name || 'document.pdf'
  } catch { return 'document.pdf' }
}
</script>

<template>
  <NuxtLayout name="client">
    <!-- Шапка -->
    <div class="page-head">
      <h2 class="page-title">Запрос на перезахоронение</h2>
      <button class="btn btn--yellow" @click="router.push('/client/burial/create')">
        Создать новый запрос
      </button>
    </div>

    <!-- Загрузка -->
    <div v-if="loading" class="state-card">
      <div class="spinner" />
      <p class="muted">Загружаем ваши заявки…</p>
    </div>

    <!-- Пусто -->
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
        <div class="empty__subtitle">У вас пока нет<br>созданных заявок</div>
        <button class="btn btn--yellow empty__btn" @click="router.push('/client/burial/create')">
          Создать заявку
        </button>
      </div>
    </div>

    <!-- Список -->
    <div v-else class="details-list">
      <div v-for="req in appeals" :key="req.id" class="details-card">
        <div class="details-head">
          <div class="right-note">
            Запрос на перезахоронение №{{ String(req.id).padStart(6, '0') }}
          </div>
        </div>

        <div class="rows">
          <div class="row">
            <div class="label">Старое место захоронения:</div>
            <div class="value">{{ cemPlain(req.fromBurialId) }}</div>
          </div>

          <div class="row">
            <div class="label">Новое место захоронения:</div>
            <div class="value">{{ cemPlain(req.toBurialId) }}</div>
          </div>

          <div class="row">
            <div class="label">Причина:</div>
            <div class="value">{{ req.reason || '—' }}</div>
          </div>

          <div class="row">
            <div class="label">Свидетельство о смерти:</div>
            <div class="value">
              <template v-if="req.death_certificate">
                <a :href="req.death_certificate" target="_blank" class="doc-link">
                  {{ fileTitle(req.death_certificate) }}
                </a>
              </template>
              <template v-else>—</template>
            </div>
          </div>

          <div class="row">
            <div class="label">Подтверждение родства заявителя:</div>
            <div class="value">
              <template v-if="req.proof_of_relation">
                <a :href="req.proof_of_relation" target="_blank" class="doc-link">
                  {{ fileTitle(req.proof_of_relation) }}
                </a>
              </template>
              <template v-else>—</template>
            </div>
          </div>

          <div class="row">
            <div class="label">Документ на могилу:</div>
            <div class="value">
              <template v-if="req.grave_doc">
                <a :href="req.grave_doc" target="_blank" class="doc-link">
                  {{ fileTitle(req.grave_doc) }}
                </a>
              </template>
              <template v-else>—</template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
/* Шапка */
.page-head{
  background:#fff; border-radius:16px; padding:14px 16px;
  display:flex; align-items:center; justify-content:space-between; gap:12px;
  margin-bottom:16px;
}
.page-title{
  font-family:"FoglihtenNo06", serif; font-weight:500; letter-spacing:.02em;
  font-size:32px; color:#1C140E; margin:0;
}

/* Кнопки */
.btn{ border:none; border-radius:10px; font-weight:700; cursor:pointer; transition:filter .15s ease; }
.btn--yellow{ background:#F7B500; color:#1F2937; height:44px; padding:0 18px; }
.btn:hover{ filter:brightness(.98); }

/* Загрузка */
.state-card{ background:#fff; border-radius:16px; padding:24px; text-align:center; }
.muted{ color:#6B7280; margin-top:12px; }
.spinner{ width:36px;height:36px;border-radius:50%; border:3px solid #e6e6e6; border-top-color:#224C4F; animation:spin .9s linear infinite; margin:0 auto; }
@keyframes spin{ to{ transform:rotate(360deg) } }

/* Пусто */
.empty{ background:#fff; border-radius:16px; padding:56px 40px; display:flex; justify-content:center; }
.empty__card{ text-align:center; max-width:360px; }
.empty__icon{ width:64px; height:64px; color:#9AA0A6; margin:0 auto 14px; }
.empty__title{ font-weight:700; font-size:20px; }
.empty__subtitle{ font-size:14px; color:#8C8C8C; margin-top:6px; line-height:1.35; }
.empty__btn{ margin-top:40px; }

/* Список */
.details-list{ display:flex; flex-direction:column; gap:16px; }
.details-card{
  position: relative;
  background:#fff; border-radius:16px; padding:16px;
}
/* тонкая линия строго над карточкой */
.details-card::before{
  content:""; position:absolute; left:0; right:0; top:-10px; height:1px;
  background:#ECE7DE; pointer-events:none;
}

.details-head{ display:flex; justify-content:flex-end; }
.right-note{ color:#9CA3AF; font-size:12px; }
.rows{ margin-top:8px; display:flex; flex-direction:column; }
.row{ display:grid; grid-template-columns: 260px 1fr; gap:16px; padding:6px 0; }
.label{ color:#6B7280; font-size:14px; }
.value{ color:#111827; font-size:14px; }

/* Файлы */
.doc-link{ color:#2563EB; text-decoration:none; }
.doc-link:hover{ text-decoration:underline; }
</style>
