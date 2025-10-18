<script setup>
import { ref, computed } from "vue";
import AddReviewModal from "~/components/layout/modals/AddReviewModal.vue";
import { getOrders } from "~/services/client/index.js";
import { getPaymentReceipt } from "~/services/payments/index.js";
import ReceiptModal from "~/components/layout/modals/ReceiptModal.vue";
import AddComment from "~/components/layout/modals/AddComment.vue";

const tabs = ["Активные", "Завершенные"];
const activeTab = ref("Активные");
const showReview = ref(false);

const showReceiptModal = ref(false);
const receiptData = ref(null);
const receiptLoading = ref(false);

// Состояние модалки отзыва
const showCommentModal = ref(false);
const selectedOrder = ref(null);

// Состояние модалки товаров
const showItemsModal = ref(false);
const selectedOrderItems = ref(null);

// Моки
const orders = ref([]);

const statusView = {
  pending_payment: {
    label: "Ожидает оплаты",
    dot: "bg-[#F19024]",
    wrap: "bg-[#E37E141F] text-[#E37E14]",
  },
  new: {
    label: "Новый",
    dot: "bg-[#3498DB]",
    wrap: "bg-[#3498DB1F] text-[#3498DB]",
  },
  processing: {
    label: "В обработке",
    dot: "bg-[#F39C12]",
    wrap: "bg-[#F39C121F] text-[#F39C12]",
  },
  in_progress: {
    label: "Выполняется",
    dot: "bg-[#F19024]",
    wrap: "bg-[#E37E141F] text-[#E37E14]",
  },
  completed: {
    label: "Завершён",
    dot: "bg-[#59A12D]",
    wrap: "bg-[#4E93211F] text-[#4E9321]",
  },
  cancelled: {
    label: "Отменён",
    dot: "bg-[#9AA0A6]",
    wrap: "bg-[#F1F2F4] text-[#3F4A56]",
  },
};

async function fetchOrders(page = 1, limit = 10) {
  try {
    const response = await getOrders({page, limit});
    orders.value = response.data.items;
    // Инициализируем массив для отслеживания открытых элементов
    // openItems.value = response?.items?.map(() => false) || [];
    // console.log("Данные заказов загружены:", response);
  } catch (error) {
    console.error("Ошибка загрузки заказов:", error);
    // openItems.value = [];
  }
}

function formatPhoneNumber(phone) {
  if (!/^\d{11}$/.test(phone)) return "Неверный формат номера";

  return `+${phone[0]} (${phone.slice(1, 4)}) ${phone.slice(
      4,
      7
  )} ${phone.slice(7, 9)} ${phone.slice(9, 11)}`;
}

const filtered = computed(() =>
    activeTab.value === "Активные"
        ? orders.value.filter((o) => o.status !== "done")
        : orders.value.filter((o) => o.status === "done")
);

function formatToDDMMYYYY(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU"); // например "17.05.2025"
}

onMounted(() => {
  fetchOrders();
});

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

const closeReceiptModal = () => {
  showReceiptModal.value = false;
};

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

// Методы для работы с модалкой товаров
function openItemsModal(order) {
  selectedOrderItems.value = order.items;
  showItemsModal.value = true;
}

function closeItemsModal() {
  showItemsModal.value = false;
  selectedOrderItems.value = null;
}

// когда модалка открыта — добавим классы на body
useHead({
  bodyAttrs: {
    class: computed(() =>
        showReview.value ? "overflow-hidden overscroll-none" : ""
    ),
  },
});
</script>

<template>
  <NuxtLayout name="client">
    <section class="w-full">
      <h1 class="font-foglihten text-fluid text-[#201001]">
        ИСТОРИЯ ДОПОЛНИТЕЛЬНЫХ УСЛУГ И ТОВАРОВ
      </h1>

      <!-- Tabs -->
      <!--      <div class="mt-5 flex gap-2">-->
      <!--        <button-->
      <!--          v-for="t in tabs"-->
      <!--          :key="t"-->
      <!--          class="px-3 py-[9px] rounded-lg text-sm text-[#17212A] transition"-->
      <!--          :class="activeTab === t ? 'bg-[#C6C9CC]' : 'bg-white'"-->
      <!--          @click="activeTab = t"-->
      <!--        >-->
      <!--          {{ t }}-->
      <!--        </button>-->
      <!--      </div>-->

      <!-- List -->
      <div class="mt-5">
        <article
            v-for="o in orders"
            :key="o.id"
            class="bg-[#0000000A] rounded-2xl flex gap-3 md:gap-4 items-stretch max-xl:flex-col max-xl:max-w-[457px] max-sm:max-w-full mb-4"
        >
          <!-- image -->
          <div class="min-w-[400px] max-w-[400px] shrink-0 mx-auto">
            <img
                :src="o.items[0]?.product?.image_urls[0]"
                alt=""
                class="w-full h-full object-cover rounded-xl"
            />
          </div>

          <!-- content -->
          <div class="flex-1 flex flex-col pt-3 pr-6 pb-6 gap-2 max-xl:px-6">
            <div
                class="flex items-start justify-between flex-wrap-reverse gap-2"
            >
              <div class="text-[22px] font-semibold w-[250px]">
                Заказ №{{ o.items[0]?.order_id }}
              </div>

              <!-- status -->
              <div
                  class="px-3 py-1 rounded-lg text-[13px] flex items-center gap-2"
                  :class="statusView[o.status].wrap"
              >
                <span
                    class="inline-block w-2 h-2 rounded-full"
                    :class="statusView[o.status].dot"
                />
                {{ statusView[o.status].label }}
              </div>
            </div>
            <div v-if="o.items.length === 1" class="text-sm text-[#5C6771E6] flex flex-wrap">
              {{ o.items[0]?.product?.name }},
              <span
              >телефон:
                {{
                  formatPhoneNumber(o.items[0]?.product?.supplier_phone)
                }}</span
              >
            </div>
            <div v-else class="text-sm text-[#5C6771E6]">
              <span 
                class="text-blue-600 cursor-pointer hover:text-blue-800 underline"
                @click="openItemsModal(o)"
              >
                Количество товаров в заказе: {{ o.items.length }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span><img src="/icons/pin.svg" alt=""/></span>
              <div class="text-[#201001]">
                Адрес прибытия: {{ o.items[0]?.delivery_destination_address }}
              </div>
            </div>

            <div class="flex items-start gap-2">
              <span><img src="/icons/time.svg" alt=""/></span>
              <div class="text-[#201001]">
                Время прибытия:
                {{ formatToDDMMYYYY(o.items[0]?.delivery_arrival_time) }}
              </div>
            </div>

            <div class="flex items-start gap-2">
              <span><img src="/icons/check.svg" alt=""/></span>
              <div class="text-[#201001]" @click="openReceiptModal(o)">
                Чек об оплате
                <!-- {{ o.receipt ? "Доступен" : "—" }} -->
              </div>
            </div>

            <div class="mt-3 flex justify-end">
              <button
                  class="rounded-lg py-[9px] px-[37px] text-sm font-medium transition"
                  :class="
                  o.status === 'completed'
                    ? 'bg-[#E9B949] text-black hover:bg-[#D1A53F] cursor-pointer active:bg-[#B88F34]'
                    : 'bg-[#E9B949] text-black opacity-50 cursor-not-allowed'
                "
                  :disabled="o.status !== 'completed'"
                  @click="openCommentModal(o)"
              >
                Оставить отзыв
              </button>
            </div>
          </div>
        </article>

        <div
            v-if="!filtered.length"
            class="text-[#5C6771] text-sm bg-white border border-[#EFEFEF] rounded-xl p-6"
        >
          Заказов нет.
        </div>
      </div>
    </section>
    <AddReviewModal v-model="showReview"/>
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

    <!-- Модалка для отображения товаров -->
    <Teleport to="body">
      <div v-if="showItemsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex justify-between items-center p-4 border-b">
            <h3 class="text-lg font-semibold">Товары в заказе</h3>
            <button @click="closeItemsModal" class="text-gray-400 hover:text-gray-600 text-2xl">
              &times;
            </button>
          </div>
          
          <!-- Content -->
          <div class="p-4">
            <div v-for="(item, index) in selectedOrderItems" :key="index" class="border-b border-gray-100 pb-4 mb-4 last:border-b-0">
              <div class="flex gap-4">
                <!-- Image -->
                <div class="w-20 h-20 flex-shrink-0">
                  <img 
                    :src="item.product?.image_urls?.[0]" 
                    :alt="item.product?.name"
                    class="w-full h-full object-cover rounded-lg"
                  />
                </div>
                
                <!-- Info -->
                <div class="flex-1">
                  <h4 class="font-medium text-sm mb-1">{{ item.product?.name }}</h4>
                  <p class="text-xs text-gray-600 mb-2">
                    Телефон: {{ formatPhoneNumber(item.product?.supplier_phone) }}
                  </p>
                  <p class="text-xs text-gray-600">
                    Адрес: {{ item.delivery_destination_address }}
                  </p>
                  <p class="text-xs text-gray-600">
                    Время: {{ formatToDDMMYYYY(item.delivery_arrival_time) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.text-fluid {
  font-size: clamp(24px, 3vw, 32px);
}

// Кастомные стили для экранов меньше 425px
@media (max-width: 424px) {
  // Изображение занимает 100% ширины контейнера на маленьких экранах
  article div {
    min-width: 100% !important;
    max-width: 100% !important;
  }
  
  // Уменьшаем высоту изображения для лучшего отображения
  article img {
    height: 200px !important;
  }
}
</style>
