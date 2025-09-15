<!-- components/CemeteryCard.vue (компактная версия по умолчанию) -->
<template>
  <div class="cem-card">
    <!-- Верх: название + легенда -->
    <div class="cem-card__top">
      <div class="cem-card__heading">
        <div class="cem-card__name-row">
          <!-- Полумесяц со звездой -->
          <svg class="cem-card__brand" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14.5 3.2a9.3 9.3 0 1 0 0 17.6 8 8 0 1 1 0-17.6Z" />
            <path d="M19 6.5l.6 1.8 1.9.1-1.5 1.2.5 1.9L19 10l-1.6 1.5.5-1.9-1.5-1.2 1.9-.1L19 6.5Z" />
          </svg>
          <h3 class="cem-card__title">{{ cemetery.name }}</h3>
        </div>
        <p class="cem-card__type" v-if="typeName">{{ typeName }}</p>
      </div>

      <div class="cem-card__legend">
        <span class="legend" v-if="freeDisp !== null">
          <i class="legend__dot legend__dot--free"></i> Свободные места: {{ freeDisp }}
        </span>
        <span class="legend" v-if="reservedDisp !== null">
          <i class="legend__dot legend__dot--reserved"></i> Зарезервировано: {{ reservedDisp }}
        </span>
        <span class="legend" v-if="occupiedDisp !== null">
          <i class="legend__dot legend__dot--occupied"></i> Занято: {{ occupiedDisp }}
        </span>
      </div>
    </div>

    <!-- Адрес + телефон -->
    <div class="cem-card__info">
      <div class="cem-card__info-item">
        <svg class="cem-card__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        <span class="cem-card__text">
          {{ cemetery.street_name }}<template v-if="cemetery.street_name && (cemetery.city || cemetery.country)">, </template>
          {{ cemetery.city }}<template v-if="cemetery.city && cemetery.country">, </template>{{ cemetery.country }}
          <span v-if="distanceText" class="cem-card__muted"> {{ distanceText }}</span>
        </span>
      </div>

      <div class="cem-card__info-item" v-if="cemetery.phone">
        <svg class="cem-card__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.6 3.8c.5-.5 1.3-.5 1.8 0l2.1 2.1c.5.5.5 1.3 0 1.8L9.5 8.7a1 1 0 0 0-.2 1c.6 1.7 2.1 3.2 3.8 3.8.3.1.7 0 1-.2l1-.9c.5-.5 1.3-.5 1.8 0l2.1 2.1c.5.5.5 1.3 0 1.8l-.6.6c-1.2 1.2-3.1 1.6-4.7 1.1-5-1.6-9-5.6-10.6-10.6-.5-1.6-.1-3.5 1.1-4.7l.6-.6Z"/>
        </svg>
        <span class="cem-card__text">{{ cemetery.phone }}</span>
      </div>
    </div>

    <div class="cem-card__divider"></div>

    <!-- Описание -->
    <p v-if="cemetery.description" class="cem-card__desc">
      {{ cemetery.description }}
    </p>

    <!-- Кнопка -->
    <div class="cem-card__footer">
      <button class="cem-card__btn" @click="emit('open-map', cemetery)">Смотреть на карте</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const emit = defineEmits(['open-map'])
const props = defineProps({ cemetery: { type: Object, required: true } })

/* Текст типа по ключу религии */
const typeMap = {
  muslim: 'Мусульманское кладбище',
  islam: 'Мусульманское кладбище',
  christ: 'Христианское кладбище',
  christian: 'Христианское кладбище',
  slavic: 'Православное кладбище'
}
const typeName = computed(
  () => typeMap[(props.cemetery?.religion || '').toLowerCase()] || props.cemetery?.religion || ''
)

/* Подсчёт мест (если capacity есть — считаем занято) */
const nOrNull = v => (v === 0 || (typeof v === 'number' && !Number.isNaN(v)) ? v : null)
const free     = computed(() => nOrNull(props.cemetery?.free_spaces))
const reserved = computed(() => nOrNull(props.cemetery?.reserved_spaces ?? props.cemetery?.reserved))
const occupied = computed(() => {
  const cap = props.cemetery?.capacity
  if (typeof cap === 'number' && !Number.isNaN(cap)) {
    const f = free.value ?? 0
    const r = reserved.value ?? 0
    const val = cap - f - r
    return nOrNull(val < 0 ? 0 : val)
  }
  return nOrNull(props.cemetery?.occupied_spaces ?? props.cemetery?.occupied)
})
const freeDisp     = computed(() => free.value     ?? '—')
const reservedDisp = computed(() => reserved.value ?? '—')
const occupiedDisp = computed(() => occupied.value ?? '—')

/* Расстояние "(4,6 км от вас)" */
const distanceText = computed(() => {
  const km = props.cemetery?.distance_km
  if (km == null) return ''
  const v = Number(km)
  if (Number.isNaN(v)) return ''
  return `(${v.toLocaleString('ru-RU', { maximumFractionDigits: 1 })} км от вас)`
})
</script>

<style scoped>
/* Контейнер (компакт) */
.cem-card{
  background:#fff;
  border:1px solid #ECEFF1;
  border-radius:16px;
  padding:16px 18px;
  display:flex; flex-direction:column; gap:12px;
}

/* Верхняя полоса */
.cem-card__top{ display:flex; align-items:flex-start; gap:12px; justify-content:space-between; flex-wrap:wrap; }
.cem-card__heading{ display:flex; flex-direction:column; gap:4px; }
.cem-card__name-row{ display:flex; align-items:center; gap:10px; }
.cem-card__brand{ width:22px; height:22px; flex:0 0 22px; fill:#1F2937; }

/* Заголовок — как в фигме, но компакт */
.cem-card__title{
  font-family:"FoglihtenNo06", serif;
  font-weight:700;
  font-size:24px;
  line-height:1.15;
  letter-spacing:.02em;
  text-transform:uppercase;
  color:#1C140E;
  margin:0;
}

/* Подзаголовок типа */
.cem-card__type{ color:#9CA3AF; font-size:13px; margin:0; }

/* Легенда мест */
.cem-card__legend{ display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
.legend{ color:#374151; font-size:14px; display:inline-flex; align-items:center; gap:8px; }
.legend__dot{ width:32px; height:12px; border-radius:4px; display:inline-block; border:2px solid transparent; }
.legend__dot--free{      background:#7BE98D; border-color:#21B14E; }
.legend__dot--reserved{  background:#EACB78; border-color:#C9A84F; }
.legend__dot--occupied{  background:#CFCFCF; border-color:#AFAFAF; }

/* Инфо-строка */
.cem-card__info{ display:flex; flex-wrap:wrap; gap:16px; align-items:center; }
.cem-card__info-item{ display:flex; align-items:center; gap:8px; }
.cem-card__icon{ width:18px; height:18px; fill:#F0B32E; stroke:#F0B32E; }
.cem-card__text{ font-size:15px; color:#111827; }
.cem-card__muted{ color:#9CA3AF; margin-left:6px; font-size:13px; }

/* Разделитель */
.cem-card__divider{ height:1px; background:#EEF0F2; margin:2px 0; }

/* Описание — компакт */
.cem-card__desc{
  font-size:15px; line-height:1.45; color:#0F172A; margin:0;
}

/* Кнопка */
.cem-card__footer{ display:flex; justify-content:flex-end; }
.cem-card__btn{
  background:#F7B500; color:#1F2937;
  font-weight:700; font-size:14px;
  padding:10px 16px; border:none; border-radius:12px; cursor:pointer;
}
.cem-card__btn:hover{ filter:brightness(.98); }

/* Чуть ужмёмся на узких экранах */
@media (max-width: 720px){
  .cem-card{ padding:14px; border-radius:14px; }
  .cem-card__title{ font-size:22px; }
  .legend{ font-size:13px; }
  .legend__dot{ width:28px; height:10px; }
  .cem-card__text{ font-size:14px; }
  .cem-card__desc{ font-size:14px; }
}
</style>
