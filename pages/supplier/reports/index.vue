<script setup>
import { ref, onMounted } from "vue";
import { getSalesStats } from "~/services/supplier";

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
      seven_days: toNum(data?.["7_days"] ?? data?.seven_days),
      one_month: toNum(data?.["1_month"] ?? data?.one_month),
      three_months: toNum(data?.["3_months"] ?? data?.three_months),
      all_time: toNum(data?.["all_time"] ?? data?.all_time),
    };
  } catch (e) {
    console.error("Ошибка при загрузке статистики:", e);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <NuxtLayout name="supplier">
    <!-- Заголовок страницы -->
    <div class="page-head">
      <h2 class="page-title">Отчёты</h2>
    </div>

    <!-- Карточка с таблицей -->
    <div class="card">
      <div v-if="isLoading" class="state">
        <div class="spinner" />
        <p class="muted mt-3">Загрузка…</p>
      </div>

      <div v-else class="reports">
        <!-- шапка таблицы -->
        <div class="reports__head">
          <div class="th th--name">Товар/услуга</div>
          <div class="th">7 дней</div>
          <div class="th">1 месяц</div>
          <div class="th">3 месяца</div>
          <div class="th">За всё время</div>
        </div>

        <!-- строка ИТОГО -->
        <div class="reports__row">
          <div class="td td--name">Итого</div>
          <div class="td td--num">{{ stats.seven_days }}</div>
          <div class="td td--num">{{ stats.one_month }}</div>
          <div class="td td--num">{{ stats.three_months }}</div>
          <div class="td td--num">
            {{ Number.isFinite(stats.all_time) ? stats.all_time : 0 }}
          </div>
        </div>

        <!-- выгрузка -->
        <div class="downloads">
          <a href="#" download class="dl">Скачать файл .xls</a>
          <a href="#" download class="dl">Скачать файл .pdf</a>
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
  font-family: "FoglihtenNo06", serif;
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

/* адаптив */
@media (max-width: 760px) {
  .reports__head,
  .reports__row {
    grid-template-columns: 1.2fr repeat(4, 0.8fr);
  }
  .td,
  .th {
    font-size: 14px;
  }
}
</style>
