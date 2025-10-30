<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { getMyAppeals } from "~/services/akimat";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();
const loading = ref(true);
const appeals = ref([]);

onMounted(async () => {
  try {
    loading.value = true;
    const res = await getMyAppeals();
    appeals.value = Array.isArray(res?.data) ? res.data : [];
  } catch {
    appeals.value = [];
  } finally {
    loading.value = false;
  }
});

const isEmpty = computed(() => !loading.value && appeals.value.length === 0);

/* статус как в макете (плашка с точкой, цвета по смыслу) */
const statusText = (s) =>
  typeof s === "object" ? s.nameRu ?? s.value ?? s.name ?? "—" : s ?? "—";

const statusMeta = (s) => {
  const raw = statusText(s) || "";
  const v = raw.toString().toLowerCase();

  // Новые статусы из таблицы (приходят в UPPERCASE)
  if (v.includes("rejected") || v.includes("отказано"))
    return { kind: "rejected", text: t('client.government.status_rejected') };
  if (v.includes("confirmed") || v.includes("подтверждено"))
    return { kind: "accepted", text: t('client.government.status_confirmed') };
  if (v.includes("closed") || v.includes("закрыто"))
    return { kind: "accepted", text: t('client.government.status_closed') };
  if (v.includes("new") || v.includes("новый запрос"))
    return { kind: "pending", text: t('client.government.status_new') };
  if (v.includes("in_process") || v.includes("в работе"))
    return { kind: "pending", text: t('client.government.status_inProcess') };
  if (v.includes("pending") || v.includes("ожидание"))
    return { kind: "pending", text: t('client.government.status_pending') };

  // Прямые проверки для UPPERCASE статусов
  if (raw === "REJECTED") return { kind: "rejected", text: t('client.government.status_rejected') };
  if (raw === "CONFIRMED") return { kind: "accepted", text: t('client.government.status_confirmed') };
  if (raw === "CLOSED") return { kind: "accepted", text: t('client.government.status_closed') };
  if (raw === "NEW") return { kind: "pending", text: t('client.government.status_new') };
  if (raw === "IN_PROCESS") return { kind: "pending", text: t('client.government.status_inProcess') };
  if (raw === "PENDING") return { kind: "pending", text: t('client.government.status_pending') };

  return { kind: "default", text: raw || "—" };
};
</script>

<template>
  <NuxtLayout name="client">
    <div class="max-sm:h-min-[50vh]">
      <!-- Шапка -->
      <div class="page-head">
        <h2 class="page-title">{{ $t('client.sidebar.governmentAppeal') }}</h2>
      </div>

      <!-- Загрузка -->
      <div v-if="loading" class="state-card">
        <div class="spinner" />
        <p class="muted">{{ $t('client.government.loadingAppeals') }}</p>
      </div>

      <!-- Пусто -->
      <div v-else-if="isEmpty" class="empty">
        <div class="empty__card">
          <img src="/icons/search-request.svg" alt="" class="mx-auto" />
          <div class="empty__title">{{ $t('client.government.nothingFound') }}</div>
          <div class="empty__subtitle">{{ $t('client.government.noAppealsYet') }}</div>
          <button
            class="btn btn--yellow"
            @click="router.push('/client/government/create')"
          >
            {{ $t('client.government.createAppeal') }}
          </button>
        </div>
      </div>

      <!-- Список -->
      <div v-else class="details-list">
        <div class="w-full flex justify-end">
          <button
              class="btn btn--yellow !m-0"
              @click="router.push('/client/government/create')"
          >
            {{ $t('client.government.createAppeal') }}
          </button>
        </div>
        <div v-for="a in appeals" :key="a.id" class="details-card">
          <div class="details-head">
            <div class="right-note">
              {{ $t('client.government.appealNumber') }} №{{ String(a.id).padStart(5, "0") }}
            </div>
          </div>

          <div class="rows">
            <div class="row">
              <div class="label">{{ $t('client.government.appealType') }}</div>
              <div class="value">{{ a?.type?.nameRu || "—" }}</div>
            </div>

            <div class="row">
              <div class="label">{{ $t('common.status') }}</div>
              <div class="value">
                <span
                  class="status-chip"
                  :class="`status--${statusMeta(a?.status).kind}`"
                >
                  <span class="dot"></span>
                  {{ statusMeta(a?.status).text }}
                </span>
              </div>
            </div>

            <div class="row">
              <div class="label">{{ $t('client.government.appealContent') }}</div>
              <div class="value">{{ a.content || "—" }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
/* Шапка */
.page-head {
  margin-bottom: 16px;
}
.page-title {
  font-family: "FoglihtenNo06", serif;
  font-size: clamp(24px, 3vw, 32px);
  color: #201001;
}

/* Кнопки */
.btn {
  font-family: "Manrope", sans-serif;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: filter 0.15s ease;
  font-size: 14px;
}
.btn--yellow {
  margin: 0 auto;
  background: #e9b949;
  color: #000;
  padding: 15px 20px;
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

/* Загрузка */
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

/* Пусто */
.empty {
  display: flex;
  justify-content: center;
}
.empty__card {
  padding-top: 38px;
  text-align: center;
  max-width: 360px;
  @media (max-width: 639px) {
    max-width: 100%;
    width: 100%;
  }
}
.empty__title {
  font-weight: 500;
  font-size: 22px;
}
.empty__subtitle {
  font-size: 14px;
  color: #8c8c8c;
  margin-top: 6px;
  margin-bottom: 40px;
  line-height: 1.35;
}

/* Список */
.details-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.details-card {
  position: relative;
  background: #fff;
  border-radius: 16px;
  padding: 16px;
}
.details-card::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: -10px;
  height: 1px;
  background: #ece7de;
  pointer-events: none;
}

.details-head {
  display: flex;
  justify-content: flex-end;
}
.right-note {
  color: #9ca3af;
  font-size: 12px;
}
.rows {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
}
.row {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 16px;
  padding: 6px 0;
}
.label {
  color: #6b7280;
  font-size: 14px;
}
.value {
  color: #111827;
  font-size: 14px;
}

/* Статус (плашка с точкой) */
.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  background: #eef2f7;
  color: #374151;
}
.status-chip .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #374151;
}

.status--accepted {
  background: #eaf7ed;
  color: #2e7d32;
}
.status--accepted .dot {
  background: #2e7d32;
}

.status--pending {
  background: #fff7e6;
  color: #a56700;
}
.status--pending .dot {
  background: #f5a400;
}

.status--rejected {
  background: #fdecec;
  color: #b42318;
}
.status--rejected .dot {
  background: #b42318;
}
</style>
