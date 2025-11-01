<template>
  <div class="profile">
    <!-- head -->
    <div class="profile__head">
      <h1 class="profile__title">{{ $t('managerProfile.title') }}</h1>

      <button
        v-if="showEdit"
        class="profile__edit"
        type="button"
        @click="$emit('edit')"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 17.3V21h3.7l10.9-10.9-3.7-3.7L3 17.3Z" stroke="#000" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14.6 5.4 17.9 2l4 4-3.3 3.3" stroke="#000" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        {{ $t('managerProfile.edit') }}
      </button>
    </div>

    <div class="profile__divider"></div>

    <!-- rows -->
    <div class="profile__row">
      <div class="profile__label">{{ $t('managerProfile.fullName') }}</div>
      <div class="profile__value">{{ profile.fullName || '—' }}</div>
    </div>

    <div class="profile__row">
      <div class="profile__label">{{ $t('managerProfile.iin') }}</div>
      <div class="profile__value">{{ profile.iin || '—' }}</div>
    </div>

    <div class="profile__row">
      <div class="profile__label">{{ $t('managerProfile.phone') }}</div>
      <div class="profile__value">{{ prettyPhone }}</div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  profile: {
    type: Object,
    default: () => ({ fullName: '', iin: '', phone: '' })
  },
  showEdit: { type: Boolean, default: true }
})

defineEmits(['edit'])

const prettyPhone = computed(() => {
  const p = String(props.profile?.phone || '').replace(/\D/g, '')
  if (p.length === 11 && p.startsWith('7')) {
    return `+${p[0]} ${p.slice(1,4)} ${p.slice(4,7)} ${p.slice(7,9)} ${p.slice(9,11)}`
  }
  return props.profile?.phone || '—'
})
</script>

<style scoped>
/* компактная версия: всё в пикселях, без rem-инфлейта */
.profile{
  background:#fff;
  border:1px solid #EEE7DB;
  border-radius:12px;
  padding:12px 14px;          /* было 18–20 */
}

/* шапка */
.profile__head{
  display:flex; align-items:center; justify-content:space-between; gap:8px;
}
.profile__title{
  font-family:"FoglihtenNo06", serif;
  font-weight:700;
  text-transform:uppercase;
  letter-spacing:.01em;
  font-size:22px;             /* было 32–34 */
  line-height:1.1;
  color:#1C140E;
  margin:0;
}
.profile__edit{
  display:inline-flex; align-items:center; gap:8px;
  height:36px;               /* было 44–48 */
  padding:0 12px;
  background:#F7B500;
  color:#1F2937;
  border:none; border-radius:10px;
  cursor:pointer;
  font-weight:700; font-size:14px;
}
.profile__edit:hover{ filter:brightness(.98); }

.profile__divider{
  height:1px; background:#ECECEC; margin:8px 0; /* было 14px */
}

/* строки */
.profile__row{
  display:grid;
  grid-template-columns: 160px 1fr;  /* было 220px */
  gap:12px;
  align-items:center;
  padding:6px 0;                    /* было 10px */
}
.profile__label{
  color:#9CA3AF; font-weight:600; font-size:13px; /* было 16 */
}
.profile__value{
  color:#111827; font-size:15px;                  /* было 18 */
  word-break:break-word;
}

/* чуть добавим на очень больших экранах, но всё равно компактно */
@media (min-width: 1280px){
  .profile__title{ font-size:24px; }
  .profile__value{ font-size:16px; }
}
</style>
