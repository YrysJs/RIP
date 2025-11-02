<script setup>
import { ref, onMounted } from "vue";
import { getSalesStats } from "~/services/supplier";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const stats = ref({
  seven_days: 0,
  one_month: 0,
  three_months: 0,
  all_time: 0,
});
const isLoading = ref(true);

function toNum(v) {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const s = String(v)
    .replace(/\u00A0/g, "")
    .replace(/\s/g, "")
    .replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

onMounted(async () => {
  try {
    const { data } = await getSalesStats();
    stats.value = {
      seven_days: toNum(data?.["7_days"] ?? data?.total_stats.seven_days),
      one_month: toNum(data?.["1_month"] ?? data?.total_stats.one_month),
      three_months: toNum(data?.["3_months"] ?? data?.total_stats.three_months),
      all_time: toNum( data?.total_stats.all_time),
    };
  } catch (e) {
    console.error(t('supplier.reports.loadError'), e);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <NuxtLayout name="supplier">
    <!-- Заголовок страницы -->
    <div class="page-head">
      <h2 class="page-title">{{ $t('supplier.reports.title') }}</h2>
    </div>

    <!-- Карточка с таблицей -->
    <div class="card">
      <div v-if="isLoading" class="state">
        <div class="spinner" />
        <p class="muted mt-3">{{ $t('common.loading') }}</p>
      </div>

      <div v-else class="reports">
        <!-- шапка таблицы -->
        <div class="reports__head">
          <div class="th th--name">{{ $t('supplier.reports.productService') }}</div>
          <div class="th">{{ $t('supplier.reports.sevenDays') }}</div>
          <div class="th">{{ $t('supplier.reports.oneMonth') }}</div>
          <div class="th">{{ $t('supplier.reports.threeMonths') }}</div>
          <div class="th">{{ $t('reports.allTime') }}</div>
        </div>

        <!-- строка ИТОГО -->
        <div class="reports__row">
          <div class="td td--name">{{ $t('common.total') }}</div>
          <div class="td td--num">{{ stats.seven_days }}</div>
          <div class="td td--num">{{ stats.one_month }}</div>
          <div class="td td--num">{{ stats.three_months }}</div>
          <div class="td td--num">
            {{ stats.all_time }}
          </div>
        </div>

        <!-- выгрузка -->
        <div class="downloads">
          <a href="#" download class="dl">{{ $t('supplier.reports.downloadXls') }}</a>
          <a href="#" download class="dl">{{ $t('supplier.reports.downloadPdf') }}</a>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped lang="scss">
/* заголовок */
.page-head {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 12px;
}
.page-title {
  font-family: "Manrope", serif;
  font-weight: 700;
  letter-spacing: 0.02em;
  font-size: 22px;
  line-height: 1.15;
  margin: 0;
  color: #1c140e;
}

/* карточка */
.card {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  margin-top: 16px;
}

/* состояние загрузки */
.state {
  text-align: center;
  padding: 28px 8px;
}
.muted {
  color: #6b7280;
}
.spinner {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 3px solid #e7e9ec;
  border-top-color: #224c4f;
  animation: spin 0.9s linear infinite;
  margin: 0 auto;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* таблица (как на макете) */
.reports__head,
.reports__row {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1fr 1fr;
  column-gap: 16px;
  align-items: center;
}
.reports__head {
  background: #f7f8fa;
  border: 1px solid #eef1f4;
  border-radius: 12px;
  padding: 12px 16px;
  color: #565656;
  font-size: 13px;
}
.th {
  white-space: nowrap;
}
.th--name {
  padding-left: 2px;
}

.reports__row {
  margin-top: 8px;
  padding: 14px 16px;
  border: 1px solid #eef1f4;
  border-radius: 12px;
  background: #fff;
}
.td {
  font-size: 16px;
  color: #0f172a;
}
.td--name {
  font-weight: 600;
}
.td--num {
  text-align: right;
  font-weight: 600;
}

/* блок ссылок выгрузки */
.downloads {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 12px;
}
.dl {
  font-size: 14px;
  color: #2680eb;
  text-decoration: none;
}
.dl:hover {
  text-decoration: underline;
}

/* Мобильные стили */
@media (max-width: 768px) {
  :global(.supplier-reports-page) {
    background: #F8F5F0 !important;
  }

  :global(.supplier-reports-page .supplier) {
    background: #F8F5F0 !important;
  }

  /* Исправляем смещение контента */
  :global(.supplier-reports-page .supplier .container) {
    margin: 0 !important;
    padding: 0 !important;
    max-width: 100% !important;
  }

  :global(.supplier-reports-page .supplier .main-content) {
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Заголовок */
  .page-head {
    margin: 0 0 16px 0;
    padding: 0;
    background: transparent;
  }

  .page-title {
    font-size: 20px;
    font-weight: 700;
    color: #2E1E17;
    font-family: "Manrope", serif;
  }

  /* Карточка */
  .card {
    margin: 0;
    padding: 16px;
    border-radius: 0;
    background: #ffffff;
    box-shadow: none;
    border: none;
  }

  /* Таблица - горизонтальная как в макете */
  .reports__head,
  .reports__row {
    display: grid;
    grid-template-columns: 1.5fr 0.8fr 0.8fr 0.8fr 0.8fr;
    gap: 8px;
    padding: 12px 16px;
    align-items: center;
  }

  .reports__head {
    background: #F3F4F6;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    margin-bottom: 4px;
  }

  .th {
    font-size: 12px;
    font-weight: 600;
    color: #374151;
    text-align: center;
  }

  .th--name {
    text-align: left;
  }

  .reports__row {
    background: #ffffff;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    margin-bottom: 4px;
  }

  /* Зебра - чередующиеся цвета строк */
  .reports__row:nth-child(even) {
    background: #F8F9FA;
  }

  .reports__row:nth-child(odd) {
    background: #ffffff;
  }

  .td {
    font-size: 14px;
    color: #1F2937;
    text-align: center;
  }

  .td--name {
    font-weight: 600;
    color: #2E1E17;
    text-align: left;
  }

  .td--num {
    font-weight: 600;
    color: #2E1E17;
  }

  /* Загрузка */
  .state {
    padding: 20px;
  }

  .spinner {
    width: 28px;
    height: 28px;
  }

  .muted {
    font-size: 14px;
    color: #6B7280;
  }

  /* Ссылки для скачивания */
  .downloads {
    flex-direction: column;
    gap: 8px;
    margin-top: 16px;
    align-items: flex-start;
  }

  .dl {
    font-size: 14px;
    color: #2680eb;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .dl:hover {
    text-decoration: underline;
  }

  .dl::after {
    content: "📥";
    font-size: 12px;
  }
}
</style>
