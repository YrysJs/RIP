<script setup>
import { ref, onMounted, computed } from "vue";
import { getOrderById, updateOrderStatus } from "~/services/supplier";
import { getCemeteryById } from "~/services/cemetery";
import CompletedModal from "~/components/layout/modals/CompletedModal.vue";
import GraveInfoModal from "~/components/layout/modals/GraveInfoModal.vue";

const props = defineProps(["ticketId"]);
const showModal = ref(false);
const showCompletedModal = ref(false);
const graveModalOpen = ref(false);

// Переменная для хранения данных заказа
const orderData = ref(null);
const cemeteryData = ref(null);
const loading = ref(false);
const error = ref(null);

// Функция для загрузки данных заказа
const fetchOrderData = async () => {
  if (!props.ticketId) return;

  loading.value = true;
  error.value = null;

  try {
    const response = await getOrderById(props.ticketId);
    orderData.value = response.data;

    if (response.data) {
      await getCemetryInfoById(response.data.items[0].product.id);
    }
  } catch (err) {
    error.value = err.message || "Ошибка при загрузке данных заказа";
    console.error("Error fetching order:", err);
    const { $toast } = useNuxtApp()
    $toast.error('Сервер не доступен')
  } finally {
    loading.value = false;
  }
};

const getCemetryInfoById = async (id) => {
  loading.value = true;
  error.value = null;

  try {
    const response = await getCemeteryById(id);
    cemeteryData.value = response.data;
  } catch (err) {
    error.value = err.message || "Ошибка при загрузке данных заказа";
    console.error("Error fetching order:", err);
    const { $toast } = useNuxtApp()
    $toast.error('Сервер не доступен')
  } finally {
    loading.value = false;
  }
};

// Загружаем данные при монтировании компонента
onMounted(() => {
  fetchOrderData();
});

const handleStatusUpdate = async (orderId, newStatus) => {
  try {
    await updateOrderStatus(orderId, newStatus);
    // Обновить данные заказа после успешного изменения статуса
    await fetchOrderData();
  } catch (error) {
    console.error("Ошибка при обновлении статуса:", error);
    const { $toast } = useNuxtApp()
    $toast.error('Сервер не доступен')
  }
};

const orderStatuses = [
  {
    current: "new",
    next: "processing",
    title: "Принять заказ",
    status: "Новый",
  },
  {
    current: "processing",
    next: "in_progress",
    title: "Подтвердить исполнение",
    status: "В обработке",
  },
  {
    current: "in_progress",
    next: "completed",
    title: "Заказ выполнен",
    status: "В процессе",
  },
  // completed / cancelled — финальные, без next
];

// Computed свойство для определения текущего действия
const currentStatusAction = computed(() => {
  if (!orderData.value?.status) return null;

  return orderStatuses.find(
    (status) => status.current === orderData.value.status
  );
});

// Computed свойство для определения текущего статуса
const currentStatus = computed(() => {
  const s = orderData.value?.status;
  const found = orderStatuses.find((x) => x.current === s)?.status;
  if (found) return found;
  if (s === "completed") return "Завершен";
  if (s === "cancelled") return "Отменен";
  return "—";
});

// Computed свойство для определения цвета статуса
const statusColor = computed(() => {
  const s = orderData.value?.status;
  const map = {
    new: "bg-blue-500",
    processing: "bg-yellow-500",
    in_progress: "bg-orange-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
  };
  return map[s] || "bg-gray-500";
});

// Функция для обработки смены статуса
const handleStatusChange = async () => {
  if (!currentStatusAction.value || !orderData.value) return;
  loading.value = true;
  try {
    await handleStatusUpdate(
      orderData.value.id,
      currentStatusAction.value.next
    );
    if (currentStatusAction.value.next === "completed") {
      showCompletedModal.value = true;
    } else if (currentStatusAction.value.next === "in_progress") {
      showModal.value = true;
    }
  } finally {
    loading.value = false;
  }
};

const cancelStatus = async () => {
  loading.value = true;
  try {
    await handleStatusUpdate(
        orderData.value.id,
        'cancelled'
    );
  } finally {
    loading.value = false;
  }
}

// — безопасные геттеры
const fullName = computed(() => {
  const u = orderData.value?.user_info;
  return [u?.surname, u?.name, u?.patronymic].filter(Boolean).join(" ") || "—";
});
const cemeteryName = computed(() => orderData.value?.grave_info?.cemetery_name || "—");
const sectorNumber = computed(() => orderData.value?.grave_info?.sector_number ?? "—");
const graveId = computed(() => orderData.value?.grave_info?.grave_number ?? "—");

// const whatsAppLink = computed(() => {
//   const phone = orderData.value?.user_phone?.replace(/\D/g, "") || "";
//   const u = orderData.value?.user_info || {};
//   const productName = orderData.value?.items?.[0]?.product?.name || "";

//   const message = `Здравствуйте ${surname} ${name} ${patronymic}\nПишу вам по поводу вашего заказа.\nНаименование: ${productName}`;

//   return `http://wa.me/${phone}?text=${encodeURIComponent(message)}`;
// });

const graveModalData = computed(() => ({
  image: "/images/main_service/f1.jpg",
  title: orderData.value?.grave_info?.cemetery_name || "—",
  sector: orderData.value?.grave_info?.sector_number ?? "—",
  place: orderData.value?.grave_info?.grave_number ?? "—",
  description: orderData.value?.grave_info?.description || "",
  note: orderData.value?.grave_note || "",
  cords: orderData.value?.grave_info?.polygon_data?.coordinates[0]
}));

function formatToDDMMYYYY(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU"); // например "17.05.2025"
}
</script>

<template>
  <div
    class="w-full bg-white rounded-[16px] py-[24px] px-[18px] border border-[#ece7da]"
  >
    <div v-if="loading" class="text-sm text-[#999]">Загрузка…</div>
    <div v-else-if="error" class="text-sm text-[#DB1414]">{{ error }}</div>

    <template v-else-if="orderData">
      <div
        class="flex justify-between items-start pb-4 border-b-2 border-[#EEEEEE]"
      >
        <p class="text-sm text-[#999]">
          Дата и время заявки:
          {{
            orderData?.created_at
              ? new Date(orderData.created_at).toLocaleString()
              : "—"
          }}
        </p>
      </div>
      <div v-for="it in orderData.items || []" :key="it.id">
        <div
            class="flex justify-between items-start pb-4 border-b-2 border-[#EEEEEE] mt-2"
        >
          <h3
              class="font-foglihten text-fluid font-medium text-[#201001] leading-[48px]"
          >
            {{ it.product?.name || "—" }}
            <!-- <span class="text-[#B88F34]">{{ orderData?.id }}</span> -->
          </h3>
          <p class="text-sm text-[#999]">
            Дата и время заявки:
            {{
              orderData?.created_at
                  ? new Date(orderData.created_at).toLocaleString()
                  : "—"
            }}
          </p>
        </div>
        <!-- Показываем информацию о кладбище и покойном только если есть burial_info -->
        <template v-if="orderData?.burial_info">
          <div
            class="flex justify-between items-start mt-2 border-b-2 border-[#EEEEEE] pb-2 max-sm:mt-3 max-sm:pb-3"
          >
            <div
              class="min-w-[580px] font-medium flex flex-col gap-2 max-sm:gap-0"
            >
              <div class="h-[38px] flex items-center text-base">
                <p class="min-w-[150px] grey-14">Кладбище:</p>
                <p class="black-16">
                  {{ cemeteryName }}
                </p>
              </div>
              <div class="h-[38px] flex items-center text-base">
                <p class="min-w-[150px] grey-14">Сектор</p>
                <p class="black-16">{{ sectorNumber }}</p>
              </div>
              <div class="h-[38px] flex items-center text-base">
                <p class="min-w-[150px] grey-14">Место:</p>
                <p class="black-16">{{ graveId }}</p>
              </div>
            </div>
            <button
              class="rounded-md p-2 text-sm text-[#224C4F] font-semibold bg-[#EEEEEE]"
              @click="graveModalOpen = true"
            >
              Координаты кладбища
            </button>
          </div>
          <div
            class="flex justify-between items-start mt-2 border-b-2 border-[#EEEEEE] pb-2 max-sm:mt-3 max-sm:pb-3"
          >
            <div class="font-medium flex flex-col gap-[10px]">
              <div class="h-[38px] flex items-center text-base">
                <p class="min-w-[150px] max-w-[150px] grey-14">ФИО покойного:</p>
                <p class="black-16">
                  {{ orderData?.burial_info?.deceased?.full_name || "—" }}
                </p>
              </div>
            </div>
          </div>
        </template>
        <div
          class="flex justify-between items-start mt-2 border-b-2 border-[#EEEEEE] pb-[16px]"
        >
          <div class="min-w-[580px] font-medium flex flex-col gap-2">
            <div v-if="orderData?.burial_info" class="h-[38px] flex items-center text-base">
              <p class="min-w-[150px] max-w-[150px] grey-14">Дата похорон:</p>
              <p v-if="orderData?.burial_info?.burial_date">
                {{
                  new Date(orderData?.burial_info?.burial_date).toLocaleDateString("ru-RU")
                }}, {{ orderData?.burial_info?.burial_time || "—" }}
              </p>
              <p v-else class="text-base text-[#DB1414]">
                Необходимо указать даты похорон
              </p>
            </div>
            <div class="h-[38px] flex items-center text-base">
              <p class="min-w-[150px] max-w-[150px] grey-14">Заказчик:</p>
              <p class="black-16">
                {{ fullName }}
              </p>
            </div>
            <div class="h-[38px] flex items-center text-base">
              <p
                class="min-w-[150px] max-w-[150px] grey-14 flex items-center gap-[10px]"
              >
                Контакты заказчика:
              </p>
              <p class="flex items-center gap-[10px] black-16">
                {{ orderData?.user_phone ? `+${orderData.user_phone}` : "—" }}
                <!-- <a :href="whatsAppLink" class="ml-2">
                  <img
                    src="/icons/whatsapp.svg"
                    alt=""
                    class="w-[32px] h-[32px]"
                  />
                </a> -->
              </p>
            </div>
            <div class="h-[38px] flex items-center text-base">
              <p class="min-w-[150px] max-w-[150px] grey-14">Адрес прибытия:</p>
              <p class="black-16">
                {{ it?.delivery_destination_address || "—" }}
              </p>
            </div>
            <div class="h-[38px] flex items-center text-base">
              <p class="min-w-[150px] max-w-[150px] grey-14">Время прибытия:</p>
              <p class="black-16">
                {{ formatToDDMMYYYY(it?.delivery_arrival_time) || "—" }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        class="flex justify-between items-start mt-[16px] max-sm:mt-3 max-sm:pb-3"
      >
        <div class="font-medium flex flex-col gap-[10px]">
          <div class="h-[48px] flex items-center text-base">
            <p class="min-w-[150px] max-w-[150px] grey-14">Cтатус:</p>
            <div class="flex items-center gap-[10px]">
              <span class="text-sm text-[#17212A]">{{ currentStatus }}</span>
              <span
                class="inline-block w-3 h-3 rounded-full"
                :class="statusColor"
              ></span>
              <!-- <div
              class="flex items-center gap-[10px]"
              v-if="orderData?.status === 'new'"
            >
              <p class="text-sm text-[#17212A]">Новая</p>
            </div> 
            <div
              class="flex items-center gap-[10px]"
              v-if="orderData?.status === 'in_progress'"
            >
              <p class="text-sm text-[#17212A]">В работе</p>
            </div>
            <div
              class="flex items-center gap-[10px]"
              v-if="
                orderData?.status === 'processing' ||
                orderData?.status === 'pending_payment'
              "
            >
              <img src="/icons/warning.svg" alt="" />
              <p class="text-sm text-[#17212A]">В ожидании оплаты</p>
            </div>
            <div
              class="flex items-center gap-[10px]"
              v-if="orderData?.status === 'paid'"
            >
              <img src="/icons/paid-tick.svg" alt="" />
              <p class="text-sm text-[#17212A]">Оплачено</p>
            </div>
            <div
              class="flex items-center gap-[10px]"
              v-if="orderData?.status === 'confirmed'"
            >
              <img src="/icons/paid-tick.svg" alt="" />
              <p class="text-sm text-[#17212A]">Завершено</p>
            </div> -->
            </div>
          </div>
        </div>
      </div>
      <div class="flex gap-3 justify-end">
        <button
          v-if="currentStatusAction && orderData.status !== 'completed'"
          :disabled="loading"
          class="block py-[15px] px-[20px] rounded-lg bg-[#E9B949] text-black text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          @click="handleStatusChange"
        >
          {{ loading ? "Обновление..." : currentStatusAction.title }}
        </button>
        <button
          v-if="orderData.status !== 'cancelled' && orderData.status !== 'completed'"
          :disabled="loading"
          class="block py-[15px] px-[20px] rounded-lg bg-[#DB1414] text-white text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          @click="cancelStatus"
        >
          Отменить
        </button>
      </div>
      <CompletedModal v-if="showModal" @close="showModal = false" />
      
      <!-- Модальное окно "Заявка завершена" -->
      <div v-if="showCompletedModal" class="modal-overlay" @click="showCompletedModal = false">
        <div class="completed-modal" @click.stop>
          <div class="completed-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#10B981"/>
              <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="completed-title">Заявка завершена</h3>
          <button class="completed-close-btn" @click="showCompletedModal = false">
            Закрыть
          </button>
        </div>
      </div>
      
      <GraveInfoModal v-model="graveModalOpen" :data="graveModalData" />
    </template>

    <template v-else>
      <div class="text-sm text-[#999]">Заказ не найден</div>
    </template>
  </div>
</template>

<style lang="css" scoped>
.text-fluid {
  font-size: clamp(24px, 3vw, 32px);
}

.grey-14 {
  font-size: 14px;
  color: #999;
}

.black-16 {
  font-size: 16px;
  color: #050202;
}

/* ===== МОБИЛЬНЫЕ СТИЛИ ===== */
@media (max-width: 768px) {
  /* Предотвращаем горизонтальный скролл */
  * {
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
  
  /* Принудительно ограничиваем ширину всех элементов */
  div, p, span, button {
    max-width: 100% !important;
    word-wrap: break-word !important;
    overflow-wrap: break-word !important;
  }
  /* Основной контейнер */
  .w-full {
    padding: 20px 16px;
    margin: 0;
    border-radius: 0;
    border: none;
    background: #ffffff;
    max-width: 100%;
    overflow-x: hidden;
  }

  /* Заголовок */
  .text-fluid {
    font-size: 24px;
    line-height: 28px;
    margin-bottom: 20px;
    font-weight: 700;
  }

  /* Информация о дате заявки */
  .text-sm {
    font-size: 16px;
  }

  /* Секции с информацией */
  .flex.justify-between {
    flex-direction: column;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #E5E7EB;
    width: 100%;
    max-width: 100%;
  }

  /* Кнопка "Координаты кладбища" */
  .rounded-md {
    width: 100%;
    padding: 16px;
    font-size: 18px;
    margin-top: 16px;
    border-radius: 12px;
    text-align: center;
    display: block;
    font-weight: 600;
  }

  /* Информационные строки */
  .h-\[38px\] {
    height: auto;
    padding: 8px 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    width: 100%;
    max-width: 100%;
  }

  .min-w-\[150px\] {
    min-width: auto;
    font-size: 14px;
    font-weight: 600;
    color: #6B7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .black-16 {
    font-size: 16px;
    color: #1C140E;
    line-height: 1.4;
    word-wrap: break-word;
    overflow-wrap: break-word;
    max-width: 100%;
    font-weight: 500;
  }

  /* Статус */
  .h-\[48px\] {
    height: auto;
    padding: 12px 0;
    flex-direction: row;
    align-items: center;
    gap: 8px;
  }

  /* Стили для кружка статуса */
  .inline-block {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 8px;
  }

  /* Кнопки действий */
  .flex.gap-3 {
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
  }

  .block {
    width: 100%;
    padding: 18px;
    font-size: 18px;
    border-radius: 12px;
    margin-left: 0;
    font-weight: 700;
    text-align: center;
    display: block;
  }

  /* Кнопка отмены */
  .bg-\[#DB1414\] {
    background: #DB1414;
    color: white;
  }

  /* Адаптивные отступы */
  .max-sm\:mt-3 {
    margin-top: 16px;
  }

  .max-sm\:pb-3 {
    padding-bottom: 16px;
  }

  .max-sm\:gap-0 {
    gap: 8px;
  }

  /* Модальное окно "Заявка завершена" */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .completed-modal {
    background: #ffffff;
    border-radius: 16px;
    padding: 32px 24px;
    text-align: center;
    max-width: 320px;
    width: 90%;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  }

  .completed-icon {
    margin-bottom: 16px;
  }

  .completed-title {
    font-size: 20px;
    font-weight: 700;
    color: #1C140E;
    margin-bottom: 24px;
  }

  .completed-close-btn {
    background: #E9B949;
    color: #1C140E;
    border: none;
    border-radius: 12px;
    padding: 16px 32px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    width: 100%;
  }

  .completed-close-btn:hover {
    background: #D4A842;
  }
}
</style>
