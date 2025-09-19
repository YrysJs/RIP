<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getMyAppeals } from '~/services/akimat'

const router = useRouter()
const loading = ref(true)
const appeals  = ref([])

onMounted(async () => {
  try {
    loading.value = true
    const res = await getMyAppeals()
    appeals.value = Array.isArray(res?.data) ? res.data : []
  } catch {
    appeals.value = []
  } finally {
    loading.value = false
  }
})

const isEmpty = computed(() => !loading.value && appeals.value.length === 0)

/* статус как в макете (плашка с точкой, цвета по смыслу) */
const statusText = (s) =>
  (typeof s === 'object' ? (s.nameRu ?? s.value ?? s.name ?? '—') : (s ?? '—'))

const statusMeta = (s) => {
  const raw = statusText(s) || ''
  const v = raw.toString().toLowerCase()

  if (v.includes('reject') || v.includes('отклон')) return { kind: 'rejected', text: raw || 'Отклонён' }
  if (
    v.includes('accept') || v.includes('approve') || v.includes('принят') ||
    v.includes('одобр')  || v.includes('complete') || v.includes('заверш')
  ) return { kind: 'accepted', text: raw || 'Принят' }
  if (v.includes('new') || v.includes('ожид') || v.includes('process') || v.includes('обработ'))
    return { kind: 'pending', text: raw || 'NEW' }

  return { kind: 'default', text: raw || '—' }
}
</script>

<template>
  <NuxtLayout name="client">
    <!-- Шапка -->
    <div class="page-head">
      <h2 class="page-title">Обращение в акимат</h2>
      <button class="btn btn--yellow" @click="router.push('/client/goverment/create')">
        Создать новое обращение
      </button>
    </div>

    <!-- Загрузка -->
    <div v-if="loading" class="state-card">
      <div class="spinner" />
      <p class="muted">Загружаем ваши обращения…</p>
    </div>

    <!-- Пусто -->
    <div v-else-if="isEmpty" class="empty">
      <div class="empty__card">
        <div class="empty__title">Ничего не найдено</div>
        <div class="empty__subtitle">У вас пока нет созданных обращений</div>
      </div>
    </div>

    <!-- Список -->
    <div v-else class="details-list">
      <div v-for="a in appeals" :key="a.id" class="details-card">
        <div class="details-head">
          <div class="right-note">Обращение №{{ String(a.id).padStart(5,'0') }}</div>
        </div>

        <div class="rows">
          <div class="row">
            <div class="label">Тип обращения:</div>
            <div class="value">{{ a?.type?.nameRu || '—' }}</div>
          </div>

          <div class="row">
            <div class="label">Статус:</div>
            <div class="value">
              <span class="status-chip" :class="`status--${statusMeta(a?.status).kind}`">
                <span class="dot"></span>
                {{ statusMeta(a?.status).text }}
              </span>
            </div>
          </div>

          <div class="row">
            <div class="label">Обращение:</div>
            <div class="value">{{ a.content || '—' }}</div>
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
.empty__title{ font-weight:700; font-size:20px; }
.empty__subtitle{ font-size:14px; color:#8C8C8C; margin-top:6px; line-height:1.35; }

/* Список */
.details-list{ display:flex; flex-direction:column; gap:16px; }
.details-card{ position:relative; background:#fff; border-radius:16px; padding:16px; }
.details-card::before{ content:""; position:absolute; left:0; right:0; top:-10px; height:1px; background:#ECE7DE; pointer-events:none; }

.details-head{ display:flex; justify-content:flex-end; }
.right-note{ color:#9CA3AF; font-size:12px; }
.rows{ margin-top:8px; display:flex; flex-direction:column; }
.row{ display:grid; grid-template-columns: 220px 1fr; gap:16px; padding:6px 0; }
.label{ color:#6B7280; font-size:14px; }
.value{ color:#111827; font-size:14px; }

/* Статус (плашка с точкой) */
.status-chip{
  display:inline-flex; align-items:center; gap:8px;
  padding:6px 12px; border-radius:12px; font-weight:600; font-size:14px;
  background:#EEF2F7; color:#374151;
}
.status-chip .dot{ width:10px; height:10px; border-radius:50%; background:#374151; }

.status--accepted{ background:#EAF7ED; color:#2E7D32; }
.status--accepted .dot{ background:#2E7D32; }

.status--pending{ background:#FFF7E6; color:#A56700; }
.status--pending .dot{ background:#F5A400; }

.status--rejected{ background:#FDECEC; color:#B42318; }
.status--rejected .dot{ background:#B42318; }
</style>
