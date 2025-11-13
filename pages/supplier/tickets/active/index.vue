<script setup>
import { getOrders } from "~/services/supplier";
import { ref, onMounted, computed } from "vue";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const displayRows = computed(() =>
  (orders.value ?? [])
    .filter((o) => {
      const status = o.status || "in_progress";
      return status !== "completed" && status !== "cancelled";
    })
    .map((o) => ({
      id: o.id ?? o.burial_order_id,
      product: getProductName(o),
      burial: o.burial_order_id || "—",
      customer: o.customer?.fullName || o.user_name || o.user_phone || "—",
      date: o.burial_date || o.created_at,
      status: o.status || "in_progress",
    }))
)

// Чип статуса (текст + класс под цвет бейджа)
function statusChip(status) {
  if (!status) return { text: "—", class: "chip chip--orange" };
  
  const statusLower = String(status).toLowerCase();
  const map = {
    new: { text: t('supplier.orders.status_new'), kind: "orange" },
    processing: { text: t('statuses.processing'), kind: "orange" },
    in_progress: { text: t('statuses.inProgress'), kind: "orange" },
    'in progress': { text: t('statuses.inProgress'), kind: "orange" },
    completed: { text: t('statuses.completed'), kind: "green" },
    pending_payment: { text: t('statuses.waitingPayment'), kind: "green" },
    'pending payment': { text: t('statuses.waitingPayment'), kind: "green" },
    cancelled: { text: t('statuses.cancelled'), kind: "red" },
    canceled: { text: t('statuses.cancelled'), kind: "red" },
  }[statusLower] ?? { text: t('statuses.unknown'), kind: "orange" };
  return { text: map.text, class: `chip chip--${map.kind}` };
}

// Реактивные переменные
const orders = ref([]);
const loading = ref(true);
const error = ref(null);
const showFilters = ref(false);

// Пагинация
const currentPage = ref(1);
const pageSize = ref(10);
const totalPages = ref(0);
const totalCount = ref(0);

// Фильтры
const filters = ref({
  burial_order_id: "",
  date_from: "",
  date_to: "",
  type: "",
  status: "",
});

// Опции для фильтров
const typeOptions = computed(() => [
  { value: "", text: t('filterOptions.allTypes') },
  { value: "product", text: t('filterOptions.product') },
  { value: "service", text: t('filterOptions.service') },
]);

const statusOptions = computed(() => [
  { value: "", text: t('supplier.tickets.allStatuses') },
  { value: "new", text: t('statuses.new') },
  { value: "processing", text: t('statuses.processing') },
  { value: "in_progress", text: t('statuses.inProgress') },
  { value: "completed", text: t('statuses.completed') },
  { value: "cancelled", text: t('statuses.cancelled') },
]);

// Функция для получения заказов
const fetchOrders = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Подготавливаем параметры для запроса
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
    };

    if (filters.value.burial_order_id) {
      params.burial_order_id = filters.value.burial_order_id;
    }

    if (filters.value.date_from) {
      params.date_from = filters.value.date_from;
    }

    if (filters.value.date_to) {
      params.date_to = filters.value.date_to;
    }

    if (filters.value.type) {
      params.type = filters.value.type;
    }

    if (filters.value.status) {
      params.status = filters.value.status;
    }

    const response = await getOrders(params);
    orders.value = response.data?.items || [];
    totalCount.value = response.data?.total_count || response.data?.total || 0;
    totalPages.value = response.data?.total_pages || Math.ceil(totalCount.value / pageSize.value) || 0;
  } catch (err) {
    console.error(t('errors.fetchError'), err);
    error.value = t('errors.fetchError');
    const { $toast } = useNuxtApp()
    $toast.error(t('common.serverUnavailable'))
    orders.value = [];
    totalCount.value = 0;
    totalPages.value = 0;
  } finally {
    loading.value = false;
  }
};

// Функция для применения фильтров
const applyFilters = () => {
  currentPage.value = 1; // Сбрасываем на первую страницу при применении фильтров
  fetchOrders();
};

// Функция для сброса фильтров
const resetFilters = () => {
  filters.value = {
    burial_order_id: "",
    date_from: "",
    date_to: "",
    type: "",
    status: "",
  };
  currentPage.value = 1; // Сбрасываем на первую страницу при сбросе фильтров
  fetchOrders();
};

// Функция для переключения видимости фильтров
const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

// Функция для получения статуса в нужном формате
// const getStatusInfo = (status) => {
//   const statusMap = {
//     new: { text: "Ожидает", class: "status-danger" },
//     pending: { text: "Ожидает", class: "status-danger" },
//     approved: { text: "Одобрено", class: "status-close" },
//     rejected: { text: "Отклонено", class: "status-cancel" },
//     completed: { text: "Завершено", class: "status-close" },
//     pending_payment: { text: "Ожидает оплаты", class: "status-danger" },
//   };
//   return statusMap[status] || { text: status, class: "status-danger" };
// };

// Функция для форматирования даты
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU") + " " + date.toLocaleTimeString("ru-RU", { hour: '2-digit', minute: '2-digit' });
};

// Функция для получения названия продукта/услуги из первого элемента заказа
const getProductName = (order) => {
  if (order.items && order.items.length > 0) {
    return order.items[0].product?.name || t('common.notSpecified');
  }
  return t('common.notSpecified');
};

// Функция для получения времени доставки из первого элемента заказа
// const getDeliveryTime = (order) => {
//   if (order.items && order.items.length > 0) {
//     return order.items[0].delivery_arrival_time;
//   }
//   return null;
// };

// Функции для работы с пагинацией
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchOrders();
    // Прокручиваем вверх при смене страницы
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    goToPage(currentPage.value + 1);
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    goToPage(currentPage.value - 1);
  }
};

const changePageSize = (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1;
  fetchOrders();
};

// Вычисляемые свойства для пагинации
const hasNextPage = computed(() => currentPage.value < totalPages.value);
const hasPrevPage = computed(() => currentPage.value > 1);

// Функция для получения видимых страниц
const getVisiblePages = () => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
};

// Загрузка данных при монтировании компонента
onMounted(() => {
  fetchOrders();
});
</script>

<template>
  <NuxtLayout name="supplier" class="supplier-tickets-page">
    <div class="page-head">
      <h2 class="page-title">{{ $t('supplierTickets.activeRequests') }}</h2>

      <button class="fbtn" @click="toggleFilters">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M4 7h16M7 12h10M10 17h4"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        {{ $t('supplierTickets.filters') }}
      </button>
    </div>

    <!-- Панель фильтров -->
    <div v-if="showFilters" class="filters-panel">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Фильтр по ID заказа на похороны -->
        <div class="flex flex-col">
          <label class="text-sm font-medium text-gray-700 mb-2"
            >{{ $t('supplierTickets.burialOrderId') }}</label
          >
          <input
            v-model="filters.burial_order_id"
            type="text"
            :placeholder="$t('supplierTickets.enterOrderId')"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Фильтр по дате от -->
        <div class="flex flex-col">
          <label class="text-sm font-medium text-gray-700 mb-2">{{ $t('supplierTickets.dateFrom') }}</label>
          <input
            v-model="filters.date_from"
            type="date"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Фильтр по дате до -->
        <div class="flex flex-col">
          <label class="text-sm font-medium text-gray-700 mb-2">{{ $t('supplierTickets.dateTo') }}</label>
          <input
            v-model="filters.date_to"
            type="date"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Фильтр по типу -->
        <div class="flex flex-col">
          <label class="text-sm font-medium text-gray-700 mb-2">{{ $t('supplierTickets.type') }}</label>
          <select
            v-model="filters.type"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option
              v-for="option in typeOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.text }}
            </option>
          </select>
        </div>

        <!-- Фильтр по статусу -->
        <div class="flex flex-col">
          <label class="text-sm font-medium text-gray-700 mb-2">{{ $t('supplierTickets.status') }}</label>
          <select
            v-model="filters.status"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option
              v-for="option in statusOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.text }}
            </option>
          </select>
        </div>
      </div>

      <!-- Кнопки действий -->
      <div class="flex gap-4 mt-4">
        <button
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          @click="applyFilters"
        >
          {{ $t('supplierTickets.apply') }}
        </button>
        <button
          class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          @click="resetFilters"
        >
          {{ $t('supplierTickets.reset') }}
        </button>
      </div>
    </div>

    <div class="orders-table-wrap">
      <!-- загрузка -->
      <div v-if="loading" class="orders-empty">{{ $t('supplierTickets.loading') }}</div>

      <!-- ошибка -->
      <div v-else-if="error" class="orders-empty">
        {{ error }}
        <button class="retry-btn" @click="fetchOrders">{{ $t('supplierTickets.retry') }}</button>
      </div>

      <!-- данные -->
      <template v-else>
        <div v-if="displayRows.length" class="orders-table">
          <div class="orders-row orders-head">
            <div>{{ $t('supplierTickets.productService') }}</div>
            <div>{{ $t('supplierTickets.customer') }}</div>
            <div>{{ $t('supplierTickets.burial') }}</div>
            <div>{{ $t('supplierTickets.burialDate') }}</div>
            <div>{{ $t('supplierTickets.status') }}</div>
          </div>

          <NuxtLink
            v-for="(row, i) in displayRows"
            :key="row.id ?? i"
            :to="row.id ? `/supplier/tickets/active/${row.id}` : '#'"
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

        <div v-else class="orders-empty">{{ $t('supplierTickets.noActiveRequests') }}</div>
      </template>
    </div>

    <!-- Пагинация -->
    <div
      v-if="!loading && !error && totalCount > 0 && totalPages > 1"
      class="pagination-wrapper"
    >
      <div class="pagination-info">
        <span class="pagination-text">
          Показано {{ totalCount ? (currentPage - 1) * pageSize + 1 : 0 }}–{{ totalCount ? Math.min(currentPage * pageSize, totalCount) : 0 }} из {{ totalCount }}
        </span>
        <select
          :value="pageSize"
          @change="changePageSize(Number($event.target.value))"
          class="pagination-select"
        >
          <option value="5">5 на странице</option>
          <option value="10">10 на странице</option>
          <option value="20">20 на странице</option>
          <option value="50">50 на странице</option>
        </select>
      </div>

      <div class="pagination-controls">
        <button
          @click="prevPage"
          :disabled="!hasPrevPage"
          class="pagination-btn"
          :class="{ 'pagination-btn--disabled': !hasPrevPage }"
        >
          Предыдущая
        </button>

        <div class="pagination-pages">
          <button
            v-if="currentPage > 3 && totalPages > 5"
            @click="goToPage(1)"
            class="pagination-page"
          >
            1
          </button>
          <span v-if="currentPage > 3 && totalPages > 5" class="pagination-dots">...</span>

          <button
            v-for="page in getVisiblePages()"
            :key="page"
            @click="goToPage(page)"
            class="pagination-page"
            :class="{ 'pagination-page--active': currentPage === page }"
          >
            {{ page }}
          </button>

          <span v-if="currentPage < totalPages - 2 && totalPages > 5" class="pagination-dots">...</span>
          <button
            v-if="currentPage < totalPages - 2 && totalPages > 5"
            @click="goToPage(totalPages)"
            class="pagination-page"
          >
            {{ totalPages }}
          </button>
        </div>

        <button
          @click="nextPage"
          :disabled="!hasNextPage"
          class="pagination-btn"
          :class="{ 'pagination-btn--disabled': !hasNextPage }"
        >
          Следующая
        </button>
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
/* шапка (у тебя уже стоит – оставляю на случай, если нет) */
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
  font-family: "Manrope", serif;
  font-weight: 700;
  letter-spacing: 0.02em;
  font-size: 28px;
  line-height: 1.15;
  color: #1c140e;
  margin: 0;
}

.fbtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 12px;
  border-radius: 12px;
  font-size: 14px;
  border: 1px solid #e6e8ec;
  background: #f5f6f7;
  color: #374151;
  font-weight: 700;
}

.fbtn svg {
  width: 16px;
  height: 16px;
}

/* панель фильтров */
.filters-panel {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 16px;
  padding: 12px;
  margin-top: 16px;
}

/* таблица */
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
  /* было 14px 20px */
  font-size: 15px;
  /* было 18px */
  color: #111827;
}

.orders-head {
  background: #e9eef5;
  border-radius: 10px;
  font-weight: 700;
  padding: 10px 16px;
}

.orders-row--alt {
  background: #f3f6fa;
  border-radius: 4px;
}

/* зебра чуть светлее */

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

/* чипы статуса */
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
  opacity: 0.9;
}

.chip--orange {
  background: #ffe8cc;
  color: #c77700;
}

.chip--red {
  background: #fdecec;
  color: #d33030;
}

.chip--green {
  background: #e8f6ec;
  color: #2f9b3c;
}

/* адаптив */
@media (max-width: 960px) {
  .orders-row {
    grid-template-columns: 1.4fr 1.2fr 0.8fr 0.9fr 0.9fr;
    font-size: 14px;
    padding: 9px 14px;
  }

  .orders-head {
    padding: 9px 14px;
  }

  .page-title {
    font-size: 26px;
  }
}

@media (max-width: 680px) {
  .orders-row {
    grid-template-columns: 1fr;
    row-gap: 8px;
    align-items: start;
  }

  .orders-head {
    display: none !important;
  }
}

/* ===== МОБИЛЬНЫЕ СТИЛИ ===== */
@media (max-width: 768px) {
  /* Белый фон для страницы заявок поставщиков */
  :global(.supplier-tickets-page) {
    background: #ffffff !important;
  }
  
  :global(.supplier-tickets-page .supplier) {
    background: #ffffff !important;
  }

  :global(.supplier-tickets-page .supplier__content) {
    background: #ffffff !important;
  }
  /* Общие стили */
  .page-head {
    padding: 20px 16px 16px;
    margin-bottom: 16px;
    background: transparent;
    border: none;
    box-shadow: none;
  }

  .page-title {
    font-size: 20px;
    line-height: 24px;
  }

  .fbtn {
    height: 40px;
    padding: 0 16px;
    font-size: 16px;
    border-radius: 8px;
  }

  /* Панель фильтров */
  .filters-panel {
    margin: 16px;
    padding: 16px;
    border-radius: 12px;
  }

  .filters-panel .grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .filters-panel label {
    font-size: 14px;
    margin-bottom: 8px;
  }

  .filters-panel input,
  .filters-panel select {
    height: 44px;
    font-size: 16px;
    border-radius: 8px;
    padding: 0 16px;
  }

  .filters-panel .flex {
    gap: 12px;
    margin-top: 20px;
  }

  .filters-panel button {
    flex: 1;
    height: 44px;
    font-size: 16px;
    border-radius: 8px;
  }

  /* Таблица заказов */
  .orders-table-wrap {
    margin: 16px;
    border-radius: 12px;
    padding: 0;
  }

  .orders-table {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .orders-row {
    display: flex;
    flex-direction: column;
    background: #FAF7EF;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    padding: 16px;
    gap: 12px;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s ease;
    position: relative;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .orders-row:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
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
  }

  .orders-cell:before {
    content: attr(data-label);
    font-size: 12px;
    font-weight: 600;
    color: #6B7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .orders-cell:nth-child(1):before { content: "Товар/услуга"; }
  .orders-cell:nth-child(2):before { content: "Заказчик"; }
  .orders-cell:nth-child(3):before { content: "Захоронение"; }
  .orders-cell:nth-child(4):before { content: "Дата похорон"; }
  .orders-cell:nth-child(5):before { content: "Статус"; }

  .orders-cell {
    font-size: 14px;
    line-height: 1.4;
  }

  /* Специальные стили для карточек заявок */
  .orders-row {
    display: flex;
    flex-direction: column;
    position: relative;
    padding-bottom: 40px; /* Место для стрелки */
  }

  .orders-cell:nth-child(1) {
    font-weight: 700;
    font-size: 16px;
    color: #1C140E;
    margin-bottom: 8px;
  }

  .orders-cell:nth-child(1):before {
    display: none;
  }

  .orders-cell:nth-child(2) {
    font-size: 14px;
    color: #6B7280;
    margin-bottom: 4px;
  }

  .orders-cell:nth-child(2):before {
    content: "Заказчик: ";
    font-size: 12px;
    font-weight: 600;
    color: #6B7280;
    text-transform: none;
    letter-spacing: normal;
  }

  .orders-cell:nth-child(3) {
    font-size: 14px;
    color: #6B7280;
    margin-bottom: 4px;
  }

  .orders-cell:nth-child(3):before {
    content: "Захоронение: ";
    font-size: 12px;
    font-weight: 600;
    color: #6B7280;
    text-transform: none;
    letter-spacing: normal;
  }

  .orders-cell:nth-child(4) {
    font-size: 14px;
    color: #6B7280;
    margin-bottom: 8px;
  }

  .orders-cell:nth-child(4):before {
    content: "Дата похорон: ";
    font-size: 12px;
    font-weight: 600;
    color: #6B7280;
    text-transform: none;
    letter-spacing: normal;
  }

  .orders-cell:nth-child(5) {
    position: absolute;
    top: 16px;
    right: 16px;
  }

  .orders-cell:nth-child(5):before {
    display: none;
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

  .retry-btn {
    margin-left: 0;
    margin-top: 12px;
    width: 100%;
    height: 44px;
    font-size: 16px;
    border-radius: 8px;
  }

  /* Чипы статуса */
  .chip {
    font-size: 12px;
    padding: 6px 10px;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .chip__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  .chip--orange {
    background: #FFF1DC;
    color: #C77700;
  }

  .chip--red {
    background: #FDE7E7;
    color: #D33030;
  }

  .chip--green {
    background: #E8F6EC;
    color: #2F9B3C;
  }
}

/* Пагинация */
.pagination-wrapper {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pagination-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.pagination-text {
  font-size: 14px;
  color: #6b7280;
}

.pagination-select {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  color: #374151;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}

.pagination-select:hover {
  border-color: #d1d5db;
}

.pagination-select:focus {
  border-color: #38949B;
  ring: 2px;
  ring-color: #38949B;
}

.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.pagination-btn:hover:not(.pagination-btn--disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.pagination-btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-page {
  min-width: 40px;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.pagination-page:hover:not(.pagination-page--active) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.pagination-page--active {
  background: #38949B;
  color: #fff;
  border-color: #38949B;
}

.pagination-dots {
  padding: 0 8px;
  color: #6b7280;
  font-size: 14px;
}

/* Адаптив для пагинации */
@media (max-width: 768px) {
  .pagination-wrapper {
    margin: 16px;
    padding: 16px;
  }

  .pagination-info {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-text {
    text-align: center;
    font-size: 13px;
  }

  .pagination-select {
    width: 100%;
    height: 44px;
    font-size: 16px;
  }

  .pagination-controls {
    flex-direction: column;
    gap: 12px;
  }

  .pagination-btn {
    width: 100%;
    height: 44px;
    font-size: 16px;
  }

  .pagination-pages {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .pagination-page {
    min-width: 36px;
    height: 36px;
    font-size: 14px;
  }
}
</style>
