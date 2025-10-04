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
        customer: o.customer?.fullName || o.user_name || o.user_phone || "—",
        date: o.burial_date || o.created_at,
        status: o.status || "",
      }))
    : placeholderRows;

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
  <NuxtLayout name="supplier">
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
            <div>Дата похорон</div>
            <div>Статус</div>
          </div>

          <NuxtLink
            v-for="(row, i) in displayRows"
            :key="row.id ?? i"
            :to="row.id ? `/supplier/tickets/archive/${row.id}` : '#'"
            class="orders-row"
            :class="{ 'orders-row--alt': i % 2 === 1 }"
          >
            <div class="orders-cell">{{ row.product }}</div>
            <div class="orders-cell">{{ row.customer }}</div>
            <div class="orders-cell">
              {{ formatDate(row.date) || row.date }}
            </div>
            <div class="orders-cell">
              <span :class="statusChip(row.status).class">
                <i class="chip__dot"></i>
                {{ statusChip(row.status).text }}
              </span>
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
  grid-template-columns: 1.2fr 1.6fr 0.9fr 0.9fr;
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
    grid-template-columns: 1.4fr 1.2fr 0.9fr 0.9fr;
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
</style>
