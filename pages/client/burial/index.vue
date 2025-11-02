<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { getMyRequests } from "~/services/akimat";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();
const appeals = ref([]);
const loading = ref(true);

async function getUserAppeals() {
  try {
    loading.value = true;
    const res = await getMyRequests();
    appeals.value = Array.isArray(res?.data) ? res.data : [];
  } catch {
    // если не загрузилось — показываем пустое состояние (без "повторить")
    appeals.value = [];
  } finally {
    loading.value = false;
  }
}

const isEmpty = computed(() => !loading.value && appeals.value.length === 0);

onMounted(getUserAppeals);

// вспомогательные (на будущий список)
const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
const formatPhoneNumber = (phone) => {
  const p = String(phone || "");
  if (!/^\d{11}$/.test(p)) return t('errors.invalidPhone');
  return `+${p[0]} (${p.slice(1, 4)}) ${p.slice(4, 7)} ${p.slice(
    7,
    9
  )} ${p.slice(9, 11)}`;
};
</script>

<template>
  <NuxtLayout name="client">
    <div class="min-h-[50vh]">
      <!-- заголовок -->
      <h2 class="page-title">{{ $t('client.burial.reburialRequest') }}</h2>

      <!-- загрузка -->
      <div v-if="loading" class="state-card">
        <div class="spinner" />
        <p class="muted">{{ $t('client.burial.loadingRequests') }}</p>
      </div>

      <!-- пустое состояние -->
      <div v-else-if="isEmpty" class="empty">
        <div class="empty__card">
          <img src="/icons/search-request.svg" alt="" class="mx-auto" />

          <div class="empty__title">{{ $t('client.burial.nothingFound') }}</div>
          <div class="empty__subtitle">
            {{ $t('client.burial.noRequestsYet') }}
          </div>

          <button
            class="btn btn--yellow empty__btn"
            @click="router.push('/client/burial/create')"
          >
            {{ $t('client.burial.createRequest') }}
          </button>
        </div>
      </div>
      <template v-else>
        <div class="w-full flex justify-end">
          <button
              class="btn btn--yellow"
              @click="router.push('/client/burial/create')"
          >
            {{ $t('client.burial.createRequest') }}
          </button>
        </div>

        <div class="list">
          <div v-for="req in appeals" :key="req.id" class="card">
            <div class="card__row">
              <div class="head-left">
                <span class="title">{{ $t('client.burial.request') }}</span>
                <span class="num-badge">{{
                    String(req.id).padStart(3, "0")
                  }}</span>
              </div>
<!--              <div class="dates">-->
<!--                <div class="date-line">-->
<!--                  Дата создания: {{ fmtDate(req.createdAt || req.created_at) }}-->
<!--                </div>-->
<!--              </div>-->
            </div>

            <div class="info">
              <div class="info-line">
                <span class="label">{{ $t('client.burial.applicant') }}</span>
                <span class="value value--bold">
                <template v-if="req.user">
                  {{ req.user.surname }} {{ req.user.name }}
                  {{ req.user.patronymic }}
                </template>
                <template v-else>
                  {{ formatPhoneNumber(req.userPhone || req.phone) }}
                </template>
              </span>
              </div>

              <div class="info-line">
                <span class="label">{{ $t('client.burial.reason') }}</span>
                <span class="value">{{ req.reason || "—" }}</span>
              </div>
            </div>

            <div class="card__row card__row--bottom">
              <div class="actions">
                <button
                    class="btn btn--ghost"
                    @click="router.push(`/client/burial/${req.id}`)"
                >
                  {{ $t('common.more') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
      <!-- список (если появятся данные) -->

    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
/* ===== Заголовок ===== */
.page-title {
  font-family: "Manrope", serif;
  font-weight: 500;
  letter-spacing: 0.02em;
  font-size: clamp(24px, 3vw, 32px);
  color: #1c140e;
  margin-bottom: 16px;
}

/* ===== Индикатор загрузки ===== */
.state-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
}
.muted {
  color: #6b7280;
  margin-top: 12px;
}
.spinner {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid #e6e6e6;
  border-top-color: #224c4f;
  animation: spin 0.9s linear infinite;
  margin: 0 auto;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== Пустое состояние ===== */
.empty {
  background: #fff;
  padding: 32px 40px 30px; /* сверху 0, по бокам 40, снизу 40 */
  min-height: 360px;
  display: flex; /* вертикальный центр */
  justify-content: center; /* горизонтальный центр */
  @media (max-width: 640px) {
    padding-left: 0;
    padding-right: 0;
  }
}
.empty__card {
  text-align: center;
  color: #1f2937;
  max-width: 360px;
  @media (max-width: 640px) {
    max-width: 100%;
    width: 100%;
  }
}
.empty__icon {
  width: 64px;
  height: 64px;
  color: #9aa0a6;
  margin: 0 auto 14px;
}
.empty__title {
  font-weight: 500;
  font-size: 22px;
}
.empty__subtitle {
  margin-top: 8px;
  font-size: 14px;
  color: #8c8c8c;
  line-height: 1.35;
}
.empty__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 18px;
  margin: 40px auto 0; /* 40px после подзаголовка */
}

/* ===== Список (на будущее) ===== */
.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.card__row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
}
.card__row--bottom {
  align-items: center;
}
.head-left {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.title {
  font-family: "Manrope", serif;
  font-weight: 700;
  color: #1c140e;
  font-size: 20px;
}
.num-badge {
  background: #f7b500;
  color: #1f2937;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 8px;
  line-height: 1.2;
  display: inline-block;
}
.dates {
  text-align: right;
  color: #8c8c8c;
  font-size: 12px;
}
.date-line {
  line-height: 1.2;
}
.info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.info-line {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.label {
  --w: 150px;
  width: var(--w);
  min-width: var(--w);
  color: #6b7280;
  font-size: 14px;
}
.value {
  font-size: 14px;
  color: #111827;
}
.value--bold {
  font-weight: 600;
}

/* кнопки */
.btn {
  border: none;
  border-radius: 10px;
  font-family: "Manrope", sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: filter 0.15s ease;
}
.btn--yellow {
  background: #e9b949;
  color: #1f2937;
  height: 48px;
  padding: 0 20px;
  &:hover {
    background-color: #d1a53f;
  }
  &:active {
    background-color: #b88f34;
  }

  @media (max-width: 639px) {
    width: 100%;
  }
}
.btn--ghost {
  background: #f3f4f6;
  color: #1f2937;
  padding: 8px 12px;
}
.btn:hover {
  filter: brightness(0.98);
}
</style>
