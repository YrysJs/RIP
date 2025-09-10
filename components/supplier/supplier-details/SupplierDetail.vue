<script setup>
import { ref, onMounted, computed } from "vue";
import { getOrderById } from "~/services/supplier";
import { getCemeteryById } from "~/services/cemetery";
import { updateOrderStatus } from "~/services/supplier";
import CompletedModal from "~/components/layout/modals/CompletedModal.vue";
import GraveInfoModal from "~/components/layout/modals/GraveInfoModal.vue";

const props = defineProps(["ticketId"]);
const showModal = ref(false);
const graveModalOpen = ref(false);

// Мок заказа
const orderData = ref({
  id: 101,
  status: "processing",
  created_at: "2025-12-12T12:30:00Z",
  user_phone: "77071234567",
  user_info: {
    surname: "Нұрбике",
    name: "Бакадыр",
    patronymic: "Бекзатқызы",
  },
  items: [
    {
      id: 1,
      product: { id: 55, name: "Организация перевозки" },
      delivery_destination_address: "г. Алматы, ул. Абая 10",
    },
  ],
});

// Переменная для хранения данных заказа
// const orderData = ref(null);
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
  }
};

const orderStatuses = [
  {
    current: "new",
    next: "processing",
    title: "Прянять заказ",
    status: "Заказ принят",
  },
  {
    current: "processing",
    next: "in_progress",
    title: "Подтвердить исполнение",
    status: "Выполняется",
  },
  {
    current: "in_progress",
    next: "completed",
    title: "Заказ выполнен",
    status: "Выполнен",
  },
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
  if (!orderData.value?.status) return "Неизвестно";

  const statusInfo = orderStatuses.find(
    (status) => status.current === orderData.value.status
  );
  return statusInfo ? statusInfo.status : orderData.value.status;
});

// Computed свойство для определения цвета статуса
const statusColor = computed(() => {
  if (!orderData.value?.status) return "bg-gray-500";

  const colorMap = {
    new: "bg-blue-500", // голубой для нового
    processing: "bg-yellow-500", // желтый для принятого
    in_progress: "bg-orange-500", // оранжевый для выполняется
    completed: "bg-green-500", // зеленый для завершенного
  };

  return colorMap[orderData.value.status] || "bg-gray-500";
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

    if (currentStatusAction.value.next === "in_progress") {
      showModal.value = true;
    }
  } catch (error) {
    console.error("Ошибка при смене статуса:", error);
  } finally {
    loading.value = false;
  }
};

// Данные для модалки (берём из orderData, с мок-дефолтами)
const graveModalData = computed(() => ({
  image: "/img/funeral.jpg", // подставь свой путь
  title: orderData.value?.cemetery_name || "Северное кладбище",
  sector: orderData.value?.sector_number ?? "11",
  place: orderData.value?.grave_id ?? "3",
  description:
    "Участок расположен на ровной местности, что обеспечивает устойчивость и простоту в обустройстве памятника и территории. Размер участка составляет 2,5 x 1,5 метра, для индивидуального захоронения. Территория находится в солнечной части кладбища с легким уклоном, обеспечивающим естественный дренаж. Участок доступен для посещения, имеется удобный подъезд.",
  note: "Участок расположен в небольшой низине, защищенной от ветров.",
}));

const whatsAppLink = computed(() => {
  const phone = orderData.value?.user_phone?.replace(/\D/g, "") || "";
  const surname = orderData.value?.user_info?.surname || "";
  const name = orderData.value?.user_info?.name || "";
  const patronymic = orderData.value?.user_info?.patronymic || "";
  const productName = orderData.value?.items?.[0]?.product?.name || "";

  const message = `Здравствуйте ${surname} ${name} ${patronymic}\nПишу вам по поводу вашего заказа.\nНаименование: ${productName}`;

  return `http://wa.me/${phone}?text=${encodeURIComponent(message)}`;
});
</script>

<template>
  <div class="w-full bg-white rounded-[16px] py-[24px] px-[18px]">
    <div
      class="flex justify-between items-start pb-4 border-b-2 border-[#EEEEEE]"
    >
      <h3
        class="font-foglihten text-fluid font-medium text-[#201001] leading-[48px]"
      >
        Организация перевозки
        <!-- <span class="text-[#B88F34]">{{ orderData?.id }}</span> -->
      </h3>
      <p class="text-sm text-[#999]">
        Дата и время заявки:
        {{ new Date(orderData?.created_at).toLocaleString() }}
      </p>
    </div>
    <div v-for="order in orderData?.items" :key="order.id">
      <div
        class="flex justify-between items-start mt-2 border-b-2 border-[#EEEEEE] pb-2 max-sm:mt-3 max-sm:pb-3"
      >
        <div class="min-w-[580px] font-medium flex flex-col gap-2 max-sm:gap-0">
          <div class="h-[38px] flex items-center text-base">
            <p class="min-w-[150px] grey-14">Кладбище:</p>
            <p class="black-16">
              {{ orderData?.cemetery_name || "Северное кладбище" }}
            </p>
          </div>
          <div class="h-[38px] flex items-center text-base">
            <p class="min-w-[150px] grey-14">Сектор</p>
            <p class="black-16">{{ orderData?.sector_number || 3 }}</p>
          </div>
          <div class="h-[38px] flex items-center text-base">
            <p class="min-w-[150px] grey-14">Место:</p>
            <p class="black-16">{{ orderData?.grave_id || 11 }}</p>
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
              {{ orderData?.deceased?.full_name || "Иван Иванов Иванович" }}
            </p>
          </div>
        </div>
      </div>
      <div
        class="flex justify-between items-start mt-2 border-b-2 border-[#EEEEEE] pb-[16px]"
      >
        <div class="min-w-[580px] font-medium flex flex-col gap-2">
          <div class="h-[38px] flex items-center text-base">
            <p class="min-w-[150px] max-w-[150px] grey-14">Дата похорон:</p>
            <p v-if="orderData?.burial_date">
              {{
                new Date(orderData?.burial_date).toLocaleDateString("ru-RU")
              }},
              {{ orderData?.burial_time }}
            </p>
            <p v-else class="text-base text-[#DB1414]">
              Необходимо указать даты похорон
            </p>
          </div>
          <div class="h-[38px] flex items-center text-base">
            <p class="min-w-[150px] max-w-[150px] grey-14">Заказчик:</p>
            <p class="black-16">
              {{ orderData?.user_info?.surname }}
              {{ orderData?.user_info?.name }}
              {{ orderData?.user_info?.patronymic }}
            </p>
          </div>
          <div class="h-[38px] flex items-center text-base">
            <p
              class="min-w-[150px] max-w-[150px] grey-14 flex items-center gap-[10px]"
            >
              Контакты заказчика:
            </p>
            <p class="flex items-center gap-[10px] black-16">
              +{{ orderData?.user_phone }}
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
              {{ orderData?.items[0].delivery_destination_address }}
            </p>
          </div>
          <div class="h-[38px] flex items-center text-base">
            <p class="min-w-[150px] max-w-[150px] grey-14">Время прибытия:</p>
            <p class="black-16">
              {{ orderData?.items[0].delivery_destination_time || "09:00" }}
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
          <div
            class="flex items-center gap-[10px]"
            v-if="orderData?.status === 'processing'"
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
        </div>
      </div>
    </div>
    <button
      v-if="currentStatusAction && orderData.status !== 'completed'"
      @click="handleStatusChange"
      :disabled="loading"
      class="block py-[15px] px-[20px] rounded-lg bg-[#E9B949] text-black text-base font-semibold ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ loading ? "Обновление..." : currentStatusAction.title }}
    </button>
    <CompletedModal v-if="showModal" @close="showModal = false" />
    <GraveInfoModal v-model="graveModalOpen" :data="graveModalData" />
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
</style>
