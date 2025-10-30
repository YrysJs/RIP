<script setup>
import { ref, onMounted, computed } from "vue";
import { getOrders } from "~/services/client";
import { getPaymentReceipt } from "~/services/payments";
import AddComment from "~/components/layout/modals/AddComment.vue";
import ReceiptModal from "~/components/layout/modals/ReceiptModal.vue";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const orders = ref(null);
const loading = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const openItems = ref([]);

const USE_MOCK = true;

function makeMockOrders(total = 23) {
  const statuses = [
    "new",
    "processing",
    "in_progress",
    "completed",
    "cancelled",
    "pending_payment",
  ];

  const all = Array.from({ length: total }, (_, i) => {
    const id = 1000 + i + 1;
    const status = statuses[i % statuses.length];

    return {
      id,
      status,
      transaction_id: `TX-${id}`,
      items: [
        {
          id: `pos-${id}-1`,
          delivery_destination_address: `г. Алматы, ул. Абая, ${10 + (i % 50)}`,
          product_id: 5000 + i,
          product: {
            id: 5000 + i,
            name: `${t('clientServices.mockServiceName')} №${i + 1}`,
            supplier_phone: `7701${(1234567 + i).toString().slice(-7)}`,
          },
        },
      ],
      created_at: new Date(Date.now() - i * 86400000).toISOString(),
    };
  });

  return {
    total_count: all.length,
    total_pages: Math.max(1, Math.ceil(all.length / pageSize.value)),
    items_all: all, // для пагинации ниже
  };
}

// Состояние модалки отзыва
const showCommentModal = ref(false);
const selectedOrder = ref(null);

// Состояние модалки чека
const showReceiptModal = ref(false);
const receiptData = ref(null);
const receiptLoading = ref(false);

// Вычисляемые свойства для пагинации
const totalPages = computed(() => orders.value?.total_pages || 0);
const totalCount = computed(() => orders.value?.total_count || 0);
const hasNextPage = computed(() => currentPage.value < totalPages.value);
const hasPrevPage = computed(() => currentPage.value > 1);

function toggle(index) {
  openItems.value[index] = !openItems.value[index];
}

// async function fetchOrders(page = 1, limit = 10) {
//   try {
//     loading.value = true;
//     const response = await getOrders({ page, limit });
//     orders.value = response.data;
//     // Инициализируем массив для отслеживания открытых элементов
//     openItems.value = response?.items?.map(() => false) || [];
//     console.log("Данные заказов загружены:", response);
//   } catch (error) {
//     console.error("Ошибка загрузки заказов:", error);
//     openItems.value = [];
//   } finally {
//     loading.value = false;
//   }
// }

async function fetchOrders(page = 1, limit = 10) {
  try {
    loading.value = true;

    if (USE_MOCK) {
      // имитация задержки
      await new Promise((r) => setTimeout(r, 400));

      const mock = makeMockOrders(27);
      const start = (page - 1) * limit;
      const end = start + limit;

      orders.value = {
        total_count: mock.total_count,
        total_pages: Math.max(1, Math.ceil(mock.total_count / limit)),
        items: mock.items_all.slice(start, end),
      };

      openItems.value = orders.value.items.map(() => false);
      return;
    }

    // реальный вызов (если выключишь заглушку)
    const response = await getOrders({ page, limit });
    orders.value = response.data;
    openItems.value = response.data?.items?.map(() => false) || [];
  } catch (error) {
    console.error(t('errors.fetchError'), error);
    const { $toast } = useNuxtApp();
    $toast.error(t('common.serverUnavailable'));
    orders.value = { total_count: 0, total_pages: 0, items: [] };
    openItems.value = [];
  } finally {
    loading.value = false;
  }
}

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchOrders(page, pageSize.value);
  }
}

function nextPage() {
  if (hasNextPage.value) {
    goToPage(currentPage.value + 1);
  }
}

function prevPage() {
  if (hasPrevPage.value) {
    goToPage(currentPage.value - 1);
  }
}

function changePageSize(newSize) {
  pageSize.value = newSize;
  currentPage.value = 1;
  fetchOrders(1, newSize);
}

// Методы для работы с модалкой отзыва
function openCommentModal(order) {
  selectedOrder.value = order;
  showCommentModal.value = true;
}

function closeCommentModal() {
  showCommentModal.value = false;
  selectedOrder.value = null;
}

function handleCommentSuccess(message) {
  console.log("Отзыв успешно отправлен:", message);
  // Можно добавить уведомление пользователю
  // Например, показать toast или обновить список заказов
  fetchOrders(currentPage.value, pageSize.value);
}

// Методы для работы с модалкой чека
// async function openReceiptModal(order) {
//   try {
//     console.log("Открытие модалки чека для заказа:", order);
//     console.log("Доступные поля заказа:", Object.keys(order));

//     const transactionId =
//       order.transaction_id ||
//       order.payment_transaction_id ||
//       order.payment_id ||
//       order.transaction ||
//       order.id;

//     if (!transactionId) {
//       console.error("Transaction ID не найден для заказа:", order);
//       alert(
//         "Ошибка: Transaction ID не найден. Проверьте консоль для подробностей."
//       );
//       return;
//     }

//     showReceiptModal.value = true;
//     receiptLoading.value = true;
//     receiptData.value = null;

//     console.log("Получение чека для transaction_id:", transactionId);

//     const response = await getPaymentReceipt(transactionId);

//     if (response.data?.success && response.data?.data) {
//       receiptData.value = response.data.data;
//       console.log("Данные чека получены:", receiptData.value);
//     } else {
//       console.error("Ошибка получения данных чека:", response);
//       alert("Ошибка получения чека");
//       showReceiptModal.value = false;
//     }
//   } catch (error) {
//     console.error("Ошибка при получении чека:", error);
//     alert("Ошибка при получении чека");
//     showReceiptModal.value = false;
//   } finally {
//     receiptLoading.value = false;
//   }
// }

async function openReceiptModal(order) {
  try {
    showReceiptModal.value = true;
    receiptLoading.value = true;
    receiptData.value = null;

    const transactionId =
      order.transaction_id ||
      order.payment_transaction_id ||
      order.payment_id ||
      order.transaction ||
      order.id;

    if (!transactionId) {
      alert("Ошибка: Transaction ID не найден.");
      showReceiptModal.value = false;
      return;
    }

    const response = await getPaymentReceipt(transactionId);
    if (response.data?.success && response.data?.data) {
      receiptData.value = response.data.data;
    } else {
      alert("Ошибка получения чека");
      showReceiptModal.value = false;
    }
  } catch (e) {
    console.error(e);
    alert("Ошибка при получении чека");
    showReceiptModal.value = false;
  } finally {
    receiptLoading.value = false;
  }
}

function computedStatus(status) {
  if (status === "new") {
    return "Новый";
  } else if (status === "processing") {
    return "В обработке";
  } else if (status === "in_progress") {
    return "В процессе";
  } else if (status === "completed") {
    return "Выполнен";
  } else if (status === "cancelled") {
    return "Отменен";
  } else if (status === "pending_payment") {
    return "Ожидается оплата";
  }

  return status;
}

function getStatusColor(status) {
  const colors = {
    new: "bg-blue-500 text-white",
    processing: "bg-yellow-500 text-white",
    in_progress: "bg-orange-500 text-white",
    completed: "bg-green-500 text-white",
    cancelled: "bg-red-500 text-white",
    pending_payment: "bg-purple-500 text-white",
  };
  return colors[status] || "bg-gray-500 text-white";
}

function closeReceiptModal() {
  showReceiptModal.value = false;
  receiptData.value = null;
  receiptLoading.value = false;
}

onMounted(() => {
  fetchOrders(currentPage.value, pageSize.value);
});
</script>

<template>
  <NuxtLayout name="client">
    <div
      class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px] flex flex-col gap-[30px]"
    >
      <!-- Загрузка -->
      <div v-if="loading" class="flex justify-center items-center py-8">
        <div class="text-lg text-gray-600">Загрузка заказов...</div>
      </div>

      <!-- Заказы -->
      <div
        v-else-if="orders?.items?.length"
        v-for="(item, index) in orders.items"
        :key="item.id"
        class="item"
      >
        <div
          class="flex justify-between items-center cursor-pointer select-none"
          @click="toggle(index)"
        >
          <h3 class="text-2xl font-medium">Заказ № {{ item.id }}</h3>
          <img
            src="/icons/dropdown.svg"
            alt=""
            :class="{ 'transform rotate-180': openItems[index] }"
          />
        </div>
        <div v-show="openItems[index]" class="drop">
          <div
            class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]"
            v-for="position in item.items"
            :key="item.id"
          >
            <div class="font-medium flex flex-col gap-[10px]">
              <div class="flex text-base">
                <p class="min-w-[150px] max-w-[150px]">Статус:</p>
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-sm font-semibold',
                    getStatusColor(item.status),
                  ]"
                >
                  {{ computedStatus(item.status) }}
                </span>
              </div>
              <div class="flex text-base">
                <p class="min-w-[150px] max-w-[150px]">Адрес прибытия:</p>
                <p class="p-[4px]">
                  {{ position.delivery_destination_address }}
                </p>
              </div>
              <div class="flex text-base">
                <p class="min-w-[150px] max-w-[150px]">Время прибытия:</p>
                <p class="p-[4px]">10:00</p>
              </div>
              <div class="flex text-base">
                <p class="min-w-[150px] max-w-[150px]">Телефон:</p>
                <p class="p-[4px]">+{{ position.product.supplier_phone }}</p>
              </div>
            </div>
          </div>
          <div class="flex justify-between mt-[16px]">
            <button
              @click="openReceiptModal(item)"
              class="h-[51px] text-[#222222] text-base font-semibold flex items-center gap-[10px] hover:bg-gray-100 px-4 rounded transition-colors"
            >
              <img src="/icons/check-icon.svg" alt="" /> Чек об оплате
            </button>
            <button
              @click="openCommentModal(item)"
              class="block w-[225px] h-[51px] rounded-md bg-[#38949B] text-white text-base font-semibold hover:bg-[#2d7a80] transition-colors"
            >
              Оставить отзыв
            </button>
          </div>
        </div>
      </div>

      <!-- Пустое состояние -->
      <div v-else-if="!loading" class="flex justify-center items-center py-8">
        <div class="text-lg text-gray-600">Заказы не найдены</div>
      </div>

      <!-- Пагинация -->
      <div
        v-if="orders?.items?.length && totalPages > 1"
        class="flex justify-between items-center mt-8 p-4 bg-gray-50 rounded-lg"
      >
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">
            Показано
            {{ totalCount ? (currentPage - 1) * pageSize + 1 : 0 }}–
            {{ totalCount ? Math.min(currentPage * pageSize, totalCount) : 0 }}
            из {{ totalCount }} заказов
          </span>
          <select
            v-model="pageSize"
            @change="changePageSize(pageSize)"
            class="px-3 py-1 border rounded text-sm"
          >
            <option value="5">5 на странице</option>
            <option value="10">10 на странице</option>
            <option value="20">20 на странице</option>
            <option value="50">50 на странице</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="prevPage"
            :disabled="!hasPrevPage"
            class="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Предыдущая
          </button>

          <div class="flex gap-1">
            <button
              v-for="page in Math.min(totalPages, 5)"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-3 py-1 text-sm border rounded',
                currentPage === page
                  ? 'bg-[#38949B] text-white border-[#38949B]'
                  : 'hover:bg-gray-100',
              ]"
            >
              {{ page }}
            </button>

            <span v-if="totalPages > 5" class="px-2 py-1 text-sm">...</span>

            <button
              v-if="totalPages > 5 && currentPage < totalPages"
              @click="goToPage(totalPages)"
              :class="[
                'px-3 py-1 text-sm border rounded',
                currentPage === totalPages
                  ? 'bg-[#38949B] text-white border-[#38949B]'
                  : 'hover:bg-gray-100',
              ]"
            >
              {{ totalPages }}
            </button>
          </div>

          <button
            @click="nextPage"
            :disabled="!hasNextPage"
            class="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Следующая
          </button>
        </div>
      </div>
    </div>

    <!-- Модалка для добавления отзыва -->
    <Teleport to="body">
      <AddComment
        :visible="showCommentModal"
        :productId="selectedOrder?.items?.[0]?.product_id"
        :supplierPhone="selectedOrder?.items?.[0]?.product?.supplier_phone"
        @close="closeCommentModal"
        @success="handleCommentSuccess"
      />
    </Teleport>

    <!-- Модалка для отображения чека -->
    <Teleport to="body">
      <ReceiptModal
        :visible="showReceiptModal"
        :receiptData="receiptData"
        :loading="receiptLoading"
        @close="closeReceiptModal"
      />
    </Teleport>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.status {
  padding: 4px;
  border-radius: 4px;

  font-family: Roboto;
  font-weight: 600;
  font-size: 14px;
  line-height: 100%;
  letter-spacing: 4.5%;
  color: #fff;

  &-danger {
    background: #dc6e29;
  }
  &-cancel {
    background: #d63c3c;
  }
  &-close {
    background: #339b38;
  }
}

.rip-table {
  &__header,
  &__content {
    display: grid;
    grid-template-columns: 202px 249px 127px 127px;
    gap: 16px;
  }

  &__header {
    font-family: Roboto;
    font-weight: 400;
    font-size: 14px;
    line-height: 100%;
    color: #565656;
    padding-top: 12px;
    padding-bottom: 12px;
  }
  &__content {
    padding-top: 12px;
    padding-bottom: 12px;

    &-val {
      font-family: Roboto;
      font-weight: 400;
      font-size: 14px;
      line-height: 100%;
    }
  }
}
</style>
