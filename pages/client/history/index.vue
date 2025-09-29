<script setup>
import { ref, computed } from "vue";
import AddReviewModal from "~/components/layout/modals/AddReviewModal.vue";
import {getOrders} from "~/services/client/index.js";
import {getPaymentReceipt} from "~/services/payments/index.js";
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


// Моки
const orders = ref([]);

const statusView = {
  in_progress: {
    label: "Выполняется",
    dot: "bg-[#F19024]",
    wrap: "bg-[#E37E141F] text-[#E37E14]",
  },
  done: {
    label: "Выполнен",
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
    const response = await getOrders({ page, limit });
    console.log(response)
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
  if (!/^\d{11}$/.test(phone)) return 'Неверный формат номера';

  return `+${phone[0]} (${phone.slice(1, 4)}) ${phone.slice(4, 7)} ${phone.slice(7, 9)} ${phone.slice(9, 11)}`;
}

const filtered = computed(() =>
  activeTab.value === "Активные"
    ? orders.value.filter((o) => o.status !== "done")
    : orders.value.filter((o) => o.status === "done")
);

function formatToDDMMYYYY(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('ru-RU') // например "17.05.2025"
}

onMounted(() => {
  fetchOrders()
})

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

// Методы для работы с модалкой отзыва
function openCommentModal(order) {
  selectedOrder.value = order;
  console.log("Выбранный заказ:", order);
  console.log("Product ID:", order?.items?.[0]?.product?.id);
  console.log("Supplier Phone:", order?.items?.[0]?.product?.supplier_phone);
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
          class="bg-[#0000000A] rounded-2xl flex gap-3 md:gap-4 items-stretch max-xl:flex-col max-xl:max-w-[457px] max-sm:max-w-full"
        >
          <!-- image -->
          <div class="shrink-0">
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
                Заказ №{{ o.order_id }}
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
            <div class="text-sm text-[#5C6771E6] flex flex-wrap">
              {{ o.items[0]?.product?.name }}, <span>телефон: {{ formatPhoneNumber(o.items[0]?.product?.supplier_phone) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span><img src="/icons/pin.svg" alt="" /></span>
              <div class="text-[#201001]">Адрес прибытия: {{ o.items[0]?.delivery_destination_address }}</div>
            </div>

            <div class="flex items-start gap-2">
              <span><img src="/icons/time.svg" alt="" /></span>
              <div class="text-[#201001]">Время прибытия: {{ formatToDDMMYYYY(o.items[0]?.delivery_arrival_time) }}</div>
            </div>

            <div class="flex items-start gap-2">
              <span><img src="/icons/check.svg" alt="" /></span>
              <div class="text-[#201001]" @click="openReceiptModal(o)">
                Чек об оплате
                <!-- {{ o.receipt ? "Доступен" : "—" }} -->
              </div>
            </div>

            <div class="mt-3 flex justify-end">
              <button
                class="rounded-lg py-[9px] px-[37px] text-sm font-medium transition"
                :class="
                  o.status === 'done'
                    ? 'bg-[#E9B949] text-black hover:bg-[#D1A53F] cursor-pointer active:bg-[#B88F34]'
                    : 'bg-[#E9B949] text-black opacity-50 cursor-not-allowed'
                "
                :disabled="o.status !== 'done'"
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
    <AddReviewModal v-model="showReview" />
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
.text-fluid {
  font-size: clamp(24px, 3vw, 32px);
}
</style>
