<script setup>
import { defineProps, computed, ref } from 'vue';
import { getPaymentReceipt } from "~/services/payments";
import ReceiptModal from "~/components/layout/modals/ReceiptModal.vue";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps(['grave', 'visible', 'booking', 'images'])

const emit = defineEmits(['close', 'confirm', 'cancel', 'complete'])

// Состояние модалки чека
const showReceiptModal = ref(false);
const receiptData = ref(null);
const receiptLoading = ref(false);

function removeEscapedQuotes(str) {
  return str.replace(/\\"/g, '');
}

function formatPhoneNumber(phone) {
  if (!/^\d{11}$/.test(phone)) return t('errors.invalidPhone');

  return `+${phone[0]} (${phone.slice(1, 4)}) ${phone.slice(4, 7)} ${phone.slice(7, 9)} ${phone.slice(9, 11)}`;
}

const closeModal = () => {
  emit('close')
}

// Методы для работы с модалкой чека
async function openReceiptModal() {
  try {
    showReceiptModal.value = true;
    receiptLoading.value = true;
    receiptData.value = null;

    const transactionId =
      props.booking?.transaction_id ||
      props.booking?.payment_transaction_id ||
      props.booking?.payment_id ||
      props.booking?.transaction ||
      props.booking?.id;

    if (!transactionId) {
      const { $toast } = useNuxtApp();
      $toast.error(t('errors.transactionIdNotFound'));
      showReceiptModal.value = false;
      return;
    }

    const response = await getPaymentReceipt(transactionId);
    if (response.data?.success && response.data?.data) {
      receiptData.value = response.data.data;
    } else {
      const { $toast } = useNuxtApp();
      $toast.error(t('errors.receiptLoadError'));
      showReceiptModal.value = false;
    }
  } catch (e) {
    console.error(e);
    const { $toast } = useNuxtApp();
    $toast.error(t('errors.receiptLoadError'));
    showReceiptModal.value = false;
  } finally {
    receiptLoading.value = false;
  }
}

function closeReceiptModal() {
  showReceiptModal.value = false;
  receiptData.value = null;
  receiptLoading.value = false;
}

// Получение всех мест (основное + дополнительные) - как на странице
const getAllGraves = () => {
  const places = []
  
  // Основное место
  if (props.grave?.grave_number) {
    places.push(props.grave.grave_number)
  }
  
  // Дополнительные места
  if (props.booking?.adjacent_graves && props.booking.adjacent_graves.length > 0) {
    props.booking.adjacent_graves.forEach(grave => {
      if (grave.grave_number) {
        places.push(grave.grave_number)
      }
    })
  }
  
  return places.join(', ')
}

// Обработчик статусов
const statusConfig = computed(() => {
  const status = props.booking?.status;
  
  switch (status) {
    case 'pending':
      return {
        text: t('statuses.pending'),
        bgColor: 'bg-[#FEF3C7]',
        textColor: 'text-[#D97706]'
      };
    case 'paid':
      return {
        text: t('statuses.paid'),
        bgColor: 'bg-[#E5F8EC]',
        textColor: 'text-[#1EB676]'
      };
    case 'cancelled':
      return {
        text: t('statuses.cancelled'),
        bgColor: 'bg-[#FEE2E2]',
        textColor: 'text-[#DC2626]'
      };
    case 'confirmed':
      return {
        text: t('statuses.confirmed'),
        bgColor: 'bg-[#E0E7FF]',
        textColor: 'text-[#3730A3]'
      };
    default:
      return {
        text: t('statuses.unknown'),
        bgColor: 'bg-[#F3F4F6]',
        textColor: 'text-[#6B7280]'
      };
  }
})
</script>

<template>
  <div v-if="visible" class="modal fixed min-w-full min-h-[100vh] flex justify-center items-center z-50 p-2 sm:p-4">
    <div class="bg-white rounded-lg max-w-[800px] w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto m-0 sm:m-4">
      <!-- Header -->
      <div class="flex justify-between items-center pt-4 sm:pt-6 px-4 sm:px-6 pb-3 sm:pb-0 border-b sticky top-0 bg-white z-10">
        <h2 class="text-lg sm:text-xl md:text-2xl font-bold pr-2 break-words">{{ booking?.cemetery_name }}</h2>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-2xl sm:text-3xl flex-shrink-0">
          &times;
        </button>
      </div>

      <!-- Content -->
      <div class="pt-4 sm:pt-2 px-4 sm:px-6 pb-4 sm:pb-6">
        <!-- Location info -->
        <div class="mb-4 sm:mb-6">
          <div class="flex gap-1 sm:gap-2 items-center mb-2 flex-wrap">
            <span class="bg-[#E9EDED] rounded-lg px-2 py-1 text-xs sm:text-sm">{{ $t('manager.burial.sectorLabel') }} <span class="font-bold">{{ grave?.sector_number }}</span></span>
            <span class="bg-[#E9EDED] rounded-lg px-2 py-1 text-xs sm:text-sm">{{ $t('manager.burial.placeLabel') }} <span class="font-bold">{{ getAllGraves() }}</span></span>
            <span class="bg-[#E9EDED] rounded-lg px-2 py-1 text-xs sm:text-sm">{{ $t('manager.burial.areaLabel') }} <span class="font-bold">{{ grave?.area || '2.5 x 1.5 м' }}</span></span>
          </div>
        </div>


        <!-- Images Gallery -->
        <div v-if="images?.photos_urls?.length" class="mb-4 sm:mb-6">
          <div class="flex gap-2 sm:gap-4 overflow-x-scroll pb-2 -mx-4 sm:-mx-6 px-4 sm:px-6">
            <div
                v-for="(image, index) in images"
                :key="index"
                class="min-w-[250px] sm:min-w-[300px] md:min-w-[330px] h-[167px] sm:h-[200px] md:h-[221px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0"
            >
              <img
                  :src="removeEscapedQuotes(image)"
                  :alt="$t('manager.burial.photo') + ' ' + (index + 1)"
                  class="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start mt-4 sm:mt-[16px] border-b border-[#EEEEEE] pb-3 sm:pb-[16px] gap-2 sm:gap-0">
          <p class="text-sm sm:text-base font-medium sm:min-w-[150px]">{{ $t('manager.burial.deceasedFullName') }}</p>
          <p class="text-sm sm:text-base font-bold break-words">{{ booking?.deceased?.full_name }}</p>
        </div>

<!--         Заключение о смерти-->

        <div v-if="booking.deceased.death_cert_url" class="flex flex-col sm:flex-row text-sm sm:text-base border-b border-[#EEEEEE] pb-3 sm:pb-[16px] mt-3 sm:mt-4 gap-2 sm:gap-0">
          <p class="font-medium sm:min-w-[150px] sm:max-w-[150px]">{{ $t('manager.burial.deathCertificate') }}</p>
          <a
              :href="booking.deceased.death_cert_url"
              target="_blank"
              class="text-[#007AFF] font-medium hover:underline break-all sm:break-normal"
          >
            {{ $t('manager.burial.open') }}
          </a>
        </div>

        <!-- Дата похорон -->
        <div class="flex flex-col sm:flex-row text-sm sm:text-base mt-3 sm:mt-2 gap-2 sm:gap-0">
          <p class="font-medium sm:min-w-[150px] sm:max-w-[150px]">{{ $t('manager.burial.burialDate') }}</p>
          <p v-if="booking?.burial_date" class="font-bold break-words">{{ new Date(booking.burial_date).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) }} {{booking.burial_time}}</p>
        </div>


        <!-- Контакты заказчика -->
        <div class="flex flex-col sm:flex-row text-sm sm:text-base border-b border-[#EEEEEE] pb-3 sm:pb-[16px] mt-3 sm:mt-2 gap-2 sm:gap-0">
          <p class="font-medium sm:min-w-[150px] sm:max-w-[150px]">{{ $t('manager.burial.customerContacts') }}</p>
          <p class="font-bold break-words">{{ formatPhoneNumber(booking?.user_phone) }}</p>
        </div>

        <!-- Статус -->
        <div class="flex flex-col sm:flex-row text-sm sm:text-base mt-3 sm:mt-4 items-start sm:items-center border-b border-[#EEEEEE] pb-3 sm:pb-[16px] gap-2 sm:gap-0">
          <p class="font-medium sm:min-w-[150px] sm:max-w-[150px]">{{ $t('reserve.status') }}</p>
          <div class="flex gap-2 items-center">
            <span 
              :class="[statusConfig.bgColor, statusConfig.textColor]" 
              class="px-3 py-1 rounded-md text-xs sm:text-sm font-medium"
            >
              {{ statusConfig.text }}
            </span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row text-sm sm:text-base mt-3 sm:mt-2 gap-2 sm:gap-0">
          <p class="font-medium sm:min-w-[150px] sm:max-w-[150px]">{{ $t('manager.burial.completed') }}</p>
          <p class="font-bold">{{ booking?.is_complete ? $t('common.yes') : $t('common.no') }}</p>
        </div>

        <!-- Кнопки -->
        <div class="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-6">
          <!-- Кнопка чека (показывается для paid и confirmed) -->
          <button 
            v-if="booking?.status === 'paid' || booking?.status === 'confirmed'"
            @click="openReceiptModal" 
            class="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 border rounded-md border-gray-300 hover:bg-gray-100 text-sm w-full sm:w-auto"
          >
            <img src="/icons/file-text.svg" :alt="$t('alts.receipt')" class="w-4 h-4" />
            {{ $t('manager.burial.receipt') }}
          </button>
          
          <!-- Пустой div для выравнивания, если кнопка чека не показывается -->
          <div v-else></div>

          <!-- Кнопки действий -->
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-[16px] w-full sm:w-auto">
            <!-- Кнопка отменить (показывается для pending и paid) -->
            <button 
              v-if="booking?.status === 'pending' || booking?.status === 'paid'"
              class="px-4 sm:px-6 py-2.5 sm:py-2 bg-[#FEE2E2] text-[#B91C1C] rounded-md text-sm hover:bg-[#fcbaba] w-full sm:w-auto" 
              @click="emit('cancel')"
            >
              {{ $t('common.cancel') }}
            </button>
            
            <!-- Кнопка подтвердить (показывается только для paid) -->
            <button 
              v-if="booking?.status === 'paid'"
              class="px-4 sm:px-6 py-2.5 sm:py-2 bg-[#10B981] text-white rounded-md text-sm hover:bg-[#0e9c6e] w-full sm:w-auto" 
              @click="emit('confirm')"
            >
              <span class="hidden sm:inline">{{ $t('manager.burial.confirmBurial') }}</span>
              <span class="sm:hidden">{{ $t('manager.burial.confirmBurialShort') }}</span>
            </button>
            
            <!-- Кнопка завершить (показывается только для confirmed) -->
            <button 
              v-if="booking?.status === 'confirmed' && !booking?.is_complete"
              class="px-4 sm:px-6 py-2.5 sm:py-2 bg-[#3B82F6] text-white rounded-md text-sm hover:bg-[#2563EB] w-full sm:w-auto" 
              @click="emit('complete')"
            >
              {{ $t('manager.burial.complete') }}
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>

  <!-- Модалка для отображения чека -->
  <Teleport to="body">
    <ReceiptModal
      :visible="showReceiptModal"
      :receiptData="receiptData"
      :loading="receiptLoading"
      @close="closeReceiptModal"
    />
  </Teleport>
</template>

<style lang="scss" scoped>
.modal {
  top: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
}

</style>