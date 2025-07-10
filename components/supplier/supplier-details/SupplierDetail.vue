<script setup>
import { ref, onMounted, computed } from 'vue'
import { getOrderById } from '~/services/supplier'
import { getCemeteryById } from '~/services/cemetery'
import { updateOrderStatus } from '~/services/supplier'


const props = defineProps(['ticketId'])


// Переменная для хранения данных заказа
const orderData = ref(null)
const cemeteryData = ref(null)
const loading = ref(false)
const error = ref(null)

// Функция для загрузки данных заказа
const fetchOrderData = async () => {
    if (!props.ticketId) return
    
    loading.value = true
    error.value = null
    
    try {
        const response = await getOrderById(props.ticketId)
        orderData.value = response.data

        if (response.data) {
            await getCemetryInfoById(response.data.items[0].product.id)
        }

        console.log('Order data:', orderData.value)
    } catch (err) {
        error.value = err.message || 'Ошибка при загрузке данных заказа'
        console.error('Error fetching order:', err)
    } finally {
        loading.value = false
    }
}

const getCemetryInfoById = async (id) => {
    loading.value = true
    error.value = null
    
    try {
        const response = await getCemeteryById(id)
        cemeteryData.value = response.data
        console.log('Order data:', orderData.value)
    } catch (err) {
        error.value = err.message || 'Ошибка при загрузке данных заказа'
        console.error('Error fetching order:', err)
    } finally {
        loading.value = false
    }
}

// Загружаем данные при монтировании компонента
onMounted(() => {
    fetchOrderData()
})

const handleStatusUpdate = async (orderId, newStatus) => {
    try {
        await updateOrderStatus(orderId, newStatus)
        // Обновить данные заказа после успешного изменения статуса
        await fetchOrderData()
    } catch (error) {
        console.error('Ошибка при обновлении статуса:', error)
    }
}

const orderStatuses = [
    {
        current: 'new',
        next: 'processing',
        title: 'Прянять заказ',
        status: 'Заказ принят'
    },
    {
        current: 'processing',
        next: 'in_progress',
        title: 'Подтвердить исполнение',
        status: 'Выполняется'
    },
    {
        current: 'in_progress',
        next: 'completed',
        title: 'Заказ выполнен',
        status: 'Выполнен'
    }
]

// Computed свойство для определения текущего действия
const currentStatusAction = computed(() => {
    if (!orderData.value?.status) return null
    
    return orderStatuses.find(status => status.current === orderData.value.status)
})

// Computed свойство для определения текущего статуса
const currentStatus = computed(() => {
    if (!orderData.value?.status) return 'Неизвестно'
    
    const statusInfo = orderStatuses.find(status => status.current === orderData.value.status)
    return statusInfo ? statusInfo.status : orderData.value.status
})

// Computed свойство для определения цвета статуса
const statusColor = computed(() => {
    if (!orderData.value?.status) return 'bg-gray-500'
    
    const colorMap = {
        'new': 'bg-blue-500',           // голубой для нового
        'processing': 'bg-yellow-500',   // желтый для принятого
        'in_progress': 'bg-orange-500',  // оранжевый для выполняется
        'completed': 'bg-green-500'      // зеленый для завершенного
    }
    
    return colorMap[orderData.value.status] || 'bg-gray-500'
})

// Функция для обработки смены статуса
const handleStatusChange = async () => {
    if (!currentStatusAction.value || !orderData.value) return
    
    loading.value = true
    try {
        await handleStatusUpdate(orderData.value.id, currentStatusAction.value.next)
    } catch (error) {
        console.error('Ошибка при смене статуса:', error)
    } finally {
        loading.value = false
    }
}

const whatsAppLink = computed(() => {
  const phone = orderData.value?.user_phone?.replace(/\D/g, '') || '';
  const surname = orderData.value?.user_info?.surname || '';
  const name = orderData.value?.user_info?.name || '';
  const patronymic = orderData.value?.user_info?.patronymic || '';
  const productName = orderData.value?.items?.[0]?.product?.name || '';

  const message = `Здравствуйте ${surname} ${name} ${patronymic}\nПишу вам по поводу вашего заказа.\nНаименование: ${productName}`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
});

</script>

<template>
    <div class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px]">
        <button tybe="button" class="bg-[#EEEEEE] rounded-md px-[21px] py-[10px] flex items-center gap-[10px] font-semibold text-sm text-[#224C4F]" @click="$router.go(-1)">
            <img src="/icons/back-blue.svg" alt="" class=""> Назад
        </button>
        <div class="flex justify-between items-center border-b-2 border-[#EEEEEE] pb-[16px] mt-[16px]">
            <h3 class="text-2xl font-medium">Заказ № {{ orderData?.id }}</h3>
            <p class="text-sm">Дата и время заявки: {{ new Date(orderData?.created_at).toLocaleString() }}</p>
        </div>
        <div v-for="order in orderData?.items" :key="order.id">
            <div class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
                <div class="min-w-[580px] font-medium flex flex-col gap-[10px]">
                    <!-- <div class="flex text-base"><p class="min-w-[150px]">Кладбище:</p><p>Дружба</p></div>
                    <div class="flex text-base"><p class="min-w-[150px]">Сектор</p><p>11</p></div>
                    <div class="flex text-base"><p class="min-w-[150px]">Место:</p><p>233</p></div> -->
                    <div class="flex text-base"><p class="min-w-[150px]">Заказчик:</p><p>{{ orderData?.user_info?.surname }} {{ orderData?.user_info?.name }} {{ orderData?.user_info?.patronymic }}</p></div>
                </div>
                <!-- <button class="rounded-md w-[140px] h-[30px] text-sm text-[#224C4F] font-semibold bg-[#EEEEEE]">Данные участка</button> -->
            </div>
            <div class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
                <div class="font-medium flex flex-col gap-[10px]">
                    <!-- <div class="flex text-base"><p class="min-w-[150px] max-w-[150px]">Дата похорон:</p><p>12.09.2024, 10:00</p></div>
                    <div class="flex text-base"><p class="min-w-[150px] max-w-[150px]">Заказчик:</p><p>{{ '-'}}</p></div> -->
                    <div class="flex text-base">
                        <p class="min-w-[150px] max-w-[150px] flex items-center gap-[10px]">Контакты заказчика:</p>
                        <p class="flex items-center gap-[10px]">
                            +{{ orderData?.user_phone }} 
                            <a :href="whatsAppLink" class="ml-2">
                                <img src="/icons/whatsapp.svg" alt="" class="w-[32px] h-[32px]">
                            </a>
                        </p>
                    </div>
                    <div class="flex text-base"><p class="min-w-[150px] max-w-[150px]">Адрес прибытия:</p><p>{{ orderData?.items[0].delivery_destination_address }}</p></div>
                    <!-- <div class="flex text-base"><p class="min-w-[150px] max-w-[150px]">Время прибытия:</p><p>09:00</p></div> -->
                </div>
            </div>
        </div>  
        <div class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
            <div class="font-medium flex flex-col gap-[10px]">
                <div class="flex text-base">
                    <p class="min-w-[150px] max-w-[150px]">Cтатус:</p>
                    <p :class="`p-[4px] rounded-md ${statusColor} text-sm font-semibold text-white mr-4`">{{ currentStatus }}</p>
                </div>
            </div>
        </div>
        <button 
            v-if="currentStatusAction && orderData.status !== 'completed'" 
            @click="handleStatusChange"
            :disabled="loading"
            class="block w-[225px] h-[51px] rounded-md bg-[#38949B] text-white text-base font-semibold ml-auto mt-[16px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {{ loading ? 'Обновление...' : currentStatusAction.title }}
        </button>
    </div>
</template>

<style lang="css" scoped>
</style>