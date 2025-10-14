<script setup>
import { ref, onMounted, computed } from "vue";
import { getOrders } from "~/services/supplier";

const ARCHIVE_STATUSES = ["completed", "cancelled"];

const orders = ref([]);
const loading = ref(true);
const error = ref(null);

function statusChip(status) {
  const map = {
    cancelled: { text: "Отменен", kind: "red" },
    completed: { text: "Завершен", kind: "green" },
  };
  const m = map[status] || { text: status || "—", kind: "red" };
  return { text: m.text, class: `chip chip--${m.kind}` };
}

const getProductName = (order) => {
  if (order.items && order.items.length > 0) {
    return order.items[0].product?.name || "Не указано";
  }
  return order.product || "Не указано";
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU");
};

const displayRows = computed(() => {
  const base = orders.value?.length
    ? orders.value.map((o) => ({
        id: o.id ?? o.burial_order_id,
        product: getProductName(o),
        burial: o.burial_order_id || "—",
        customer: o.customer?.fullName || o.user_name || o.user_phone || "—",
        date: o.burial_date || o.created_at,
        status: o.status || "",
      }))
    : [];

  return base.filter((r) => ARCHIVE_STATUSES.includes(r.status));
});

const fetchOrders = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await getOrders();
    orders.value = response?.data?.items || [];
  } catch (err) {
    console.error("Ошибка при получении заказов:", err);
    error.value = "Ошибка при загрузке заказов";
  } finally {
    loading.value = false;
  }
};

onMounted(fetchOrders);
</script>

<template>
  <NuxtLayout name="supplier" class="supplier-archive-page">
    <div class="page-head">
      <h2 class="page-title">Архивные заявки</h2>
    </div>

    <div class="orders-table-wrap">
      <div v-if="loading" class="orders-empty">Загрузка…</div>

      <div v-else-if="error" class="orders-empty">
        {{ error }}
        <button class="retry-btn" @click="fetchOrders">Повторить</button>
      </div>

      <template v-else>
        <div v-if="displayRows.length" class="orders-table">
          <div class="orders-row orders-head">
            <div>Товар/услуга</div>
            <div>Заказчик</div>
            <div>Захоронение</div>
            <div>Дата похорон</div>
            <div>Статус</div>
          </div>

          <NuxtLink
            v-for="(row, i) in displayRows"
            :key="row.id ?? i"
            :to="row.id ? `/supplier/tickets/archive/${row.id}` : '#'"
            class="orders-row"
            :class="{ 'orders-row--alt': i % 2 === 1 }"
            @click.prevent="!row.id"
          >
            <div class="orders-cell">{{ row.product }}</div>
            <div class="orders-cell">{{ row.customer }}</div>
            <div class="orders-cell">{{ row.burial }}</div>
            <div class="orders-cell">
              {{ formatDate(row.date) || row.date }}
            </div>
            <div class="orders-cell">
              <span :class="statusChip(row.status).class">
                <i class="chip__dot"></i>
                {{ statusChip(row.status).text }}
              </span>
            </div>
            
            <!-- Стрелка для мобильных -->
            <div class="orders-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </NuxtLink>
        </div>

        <div v-else class="orders-empty">В архиве пока пусто</div>
      </template>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 16px;
  padding: 10px 16px;
  margin-bottom: 12px;
}
.page-title {
  font-family: "FoglihtenNo06", serif;
  font-weight: 700;
  font-size: 28px;
  margin: 0;
  color: #1c140e;
}

.orders-table-wrap {
  background: #fff;
  border-radius: 16px;
  padding: 4px 0 8px;
  margin-top: 16px;
}
.orders-table {
  width: 100%;
}
.orders-row {
  display: grid;
  grid-template-columns: 1.2fr 1.6fr 0.8fr 0.9fr 0.9fr;
  align-items: center;
  padding: 10px 16px;
  font-size: 15px;
  color: #111827;
}
.orders-head {
  background: #e9eef5;
  border-radius: 10px;
  font-weight: 700;
}
.orders-row--alt {
  background: #f3f6fa;
  border-radius: 4px;
}
.orders-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.orders-empty {
  text-align: center;
  padding: 16px;
  color: #6b7280;
}
.retry-btn {
  margin-left: 12px;
  background: #224c4f;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 8px 14px;
  cursor: pointer;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 10px;
}
.chip__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}
.chip--red {
  background: #fdecec;
  color: #d33030;
}
.chip--green {
  background: #e8f6ec;
  color: #2f9b3c;
}

@media (max-width: 960px) {
  .orders-row {
    grid-template-columns: 1.4fr 1.2fr 0.8fr 0.9fr 0.9fr;
    font-size: 14px;
    padding: 9px 14px;
  }
}
@media (max-width: 680px) {
  .orders-row {
    grid-template-columns: 1fr;
    row-gap: 8px;
    align-items: start;
  }
  .orders-head {
    display: none;
  }
}

/* Мобильные стили для архивных заявок */
@media (max-width: 768px) {
  :global(.supplier-archive-page) {
    background: #ffffff !important;
  }

  :global(.supplier-archive-page .supplier) {
    background: #ffffff !important;
  }

  .page-head {
    padding: 20px 16px 16px;
    margin-bottom: 16px;
    background: transparent;
    border: none;
    box-shadow: none;
  }

  .page-title {
    font-size: 18px;
    line-height: 1.2;
  }

  .orders-table-wrap {
    margin: 0;
    border-radius: 0;
    padding: 0 16px;
  }

  .orders-table {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .orders-row {
    background: #FAF7EF;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    padding: 16px;
    gap: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    position: relative;
    padding-bottom: 40px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .orders-row--alt {
    background: #FAF7EF;
  }

  .orders-head {
    display: none !important;
  }

  .orders-cell {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    width: 100%;
  }

  .orders-cell:nth-child(1) {
    font-weight: 600;
    font-size: 16px;
    color: #1C140E;
  }

  .orders-cell:nth-child(2) {
    font-size: 14px;
    color: #6B7280;
  }

  .orders-cell:nth-child(3) {
    font-size: 14px;
    color: #6B7280;
  }

  .orders-cell:nth-child(4) {
    font-size: 14px;
    color: #6B7280;
  }

  .orders-cell:nth-child(1)::before {
    content: "Товар/услуга: ";
    font-weight: 600;
    color: #6B7280;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .orders-cell:nth-child(2)::before {
    content: "Заказчик: ";
    font-weight: 600;
    color: #6B7280;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .orders-cell:nth-child(3)::before {
    content: "Захоронение: ";
    font-weight: 600;
    color: #6B7280;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .orders-cell:nth-child(4)::before {
    content: "Дата похорон: ";
    font-weight: 600;
    color: #6B7280;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .orders-cell:nth-child(5)::before {
    content: "Статус: ";
    font-weight: 600;
    color: #6B7280;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}

/* Стрелка для навигации - скрыта по умолчанию */
.orders-arrow {
  display: none;
}

/* Показываем стрелку только на мобильных */
@media (max-width: 768px) {
  .orders-arrow {
    position: absolute;
    bottom: 16px;
    right: 16px;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }

  .orders-empty {
    padding: 40px 16px;
    font-size: 16px;
  }

  .chip {
    font-size: 12px;
    padding: 6px 10px;
    border-radius: 8px;
  }

  .chip__dot {
    width: 6px;
    height: 6px;
  }
}
</style>
