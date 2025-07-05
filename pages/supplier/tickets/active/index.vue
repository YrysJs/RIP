<script setup>
import { getOrders } from '~/services/supplier'
import { ref, onMounted } from 'vue'

// Реактивные переменные
const orders = ref([])
const loading = ref(true)
const error = ref(null)
const showFilters = ref(false)

// Фильтры
const filters = ref({
  burial_order_id: '',
  date_from: '',
  date_to: '',
  type: '',
  status: ''
})

// Опции для фильтров
const typeOptions = [
  { value: '', text: 'Все типы' },
  { value: 'product', text: 'Товар' },
  { value: 'service', text: 'Услуга' }
]

const statusOptions = [
  { value: '', text: 'Все статусы' },
  { value: 'new', text: 'Новый' },
  { value: 'processing', text: 'В обработке' },
  { value: 'in_progress', text: 'В процессе' },
  { value: 'completed', text: 'Завершен' },
  { value: 'cancelled', text: 'Отменен' }
]

// Функция для получения заказов
const fetchOrders = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Подготавливаем параметры для запроса
    const params = {}
    
    if (filters.value.burial_order_id) {
      params.burial_order_id = filters.value.burial_order_id
    }
    
    if (filters.value.date_from) {
      params.date_from = filters.value.date_from
    }
    
    if (filters.value.date_to) {
      params.date_to = filters.value.date_to
    }
    
    if (filters.value.type) {
      params.type = filters.value.type
    }
    
    if (filters.value.status) {
      params.status = filters.value.status
    }
    
    const response = await getOrders(params)
    orders.value = response.data?.items || []
  } catch (err) {
    console.error('Ошибка при получении заказов:', err)
    error.value = 'Ошибка при загрузке заказов'
  } finally {
    loading.value = false
  }
}

// Функция для применения фильтров
const applyFilters = () => {
  fetchOrders()
}

// Функция для сброса фильтров
const resetFilters = () => {
  filters.value = {
    burial_order_id: '',
    date_from: '',
    date_to: '',
    type: '',
    status: ''
  }
  fetchOrders()
}

// Функция для переключения видимости фильтров
const toggleFilters = () => {
  showFilters.value = !showFilters.value
}

// Функция для получения статуса в нужном формате
const getStatusInfo = (status) => {
  const statusMap = {
    new: { text: 'Ожидает', class: 'status-danger' },
    pending: { text: 'Ожидает', class: 'status-danger' },
    approved: { text: 'Одобрено', class: 'status-close' },
    rejected: { text: 'Отклонено', class: 'status-cancel' },
    completed: { text: 'Завершено', class: 'status-close' }
  }
  return statusMap[status] || { text: status, class: 'status-danger' }
}

// Функция для форматирования даты
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU')
}

// Функция для получения названия продукта/услуги из первого элемента заказа
const getProductName = (order) => {
  if (order.items && order.items.length > 0) {
    return order.items[0].product?.name || 'Не указано'
  }
  return 'Не указано'
}

// Функция для получения времени доставки из первого элемента заказа
const getDeliveryTime = (order) => {
  if (order.items && order.items.length > 0) {
    return order.items[0].delivery_arrival_time
  }
  return null
}

// Загрузка данных при монтировании компонента
onMounted(() => {
  fetchOrders()
})
</script>

<template>
    <NuxtLayout name="supplier">
        <div class="w-full h-[61px] pl-[20px] pr-[20px] flex items-center justify-between bg-white rounded-[16px] text-lg font-semibold">
            <span>Активные заявки</span>

            <div class="flex items-center gap-[10px] cursor-pointer" @click="toggleFilters">
                <span>Фильтры</span>
            </div>
        </div>

        <!-- Панель фильтров -->
        <div v-if="showFilters" class="w-full bg-white rounded-[16px] mt-[20px] p-[20px]">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Фильтр по ID заказа на похороны -->
                <div class="flex flex-col">
                    <label class="text-sm font-medium text-gray-700 mb-2">ID заказа на похороны</label>
                    <input 
                        v-model="filters.burial_order_id"
                        type="text"
                        placeholder="Введите ID заказа"
                        class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <!-- Фильтр по дате от -->
                <div class="flex flex-col">
                    <label class="text-sm font-medium text-gray-700 mb-2">Дата от</label>
                    <input 
                        v-model="filters.date_from"
                        type="date"
                        class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <!-- Фильтр по дате до -->
                <div class="flex flex-col">
                    <label class="text-sm font-medium text-gray-700 mb-2">Дата до</label>
                    <input 
                        v-model="filters.date_to"
                        type="date"
                        class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <!-- Фильтр по типу -->
                <div class="flex flex-col">
                    <label class="text-sm font-medium text-gray-700 mb-2">Тип</label>
                    <select 
                        v-model="filters.type"
                        class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option v-for="option in typeOptions" :key="option.value" :value="option.value">
                            {{ option.text }}
                        </option>
                    </select>
                </div>

                <!-- Фильтр по статусу -->
                <div class="flex flex-col">
                    <label class="text-sm font-medium text-gray-700 mb-2">Статус</label>
                    <select 
                        v-model="filters.status"
                        class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                            {{ option.text }}
                        </option>
                    </select>
                </div>
            </div>

            <!-- Кнопки действий -->
            <div class="flex gap-4 mt-4">
                <button 
                    @click="applyFilters"
                    class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                    Применить
                </button>
                <button 
                    @click="resetFilters"
                    class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                    Сбросить
                </button>
            </div>
        </div>

        <div class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px]">
            <!-- Индикатор загрузки -->
            <div v-if="loading" class="flex justify-center items-center py-8">
                <div class="text-gray-500">Загрузка заказов...</div>
            </div>
            
            <!-- Сообщение об ошибке -->
            <div v-else-if="error" class="flex justify-center items-center py-8">
                <div class="text-red-500">{{ error }}</div>
                <button @click="fetchOrders" class="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Повторить
                </button>
            </div>
            
            <!-- Данные заказов -->
            <div v-else-if="orders.length > 0" class="rip-table">
                <div class="rip-table__header">
                    <div>Товар/Услуга</div>
                    <div>Заказчик</div>
                    <div>Дата доставки</div>
                    <div>Статус</div>
                </div>
                <nuxt-link 
                    v-for="order in orders" 
                    :key="order.id" 
                    :to="`/supplier/tickets/active/${order.id}`" 
                    class="rip-table__content"
                >
                    <div class="rip-table__content-val">
                        {{ getProductName(order) }}
                    </div>
                    <div class="rip-table__content-val">
                        {{ order.user_phone || 'Не указано' }}
                    </div>
                    <div class="rip-table__content-val">
                        {{ formatDate(getDeliveryTime(order)) }}
                    </div>
                    <div class="rip-table__content-val flex items-center gap-[15px]">
                        <span class="status" :class="getStatusInfo(order.status).class">
                            {{ getStatusInfo(order.status).text }}
                        </span> 
                        <img src="/icons/link.svg" alt="arrow"> 
                    </div>
                </nuxt-link>
            </div>
            
            <!-- Сообщение о пустом списке -->
            <div v-else class="flex justify-center items-center py-8">
                <div class="text-gray-500">Нет активных заказов</div>
            </div>
        </div>
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
        background: #DC6E29;
    }
    &-cancel {
        background: #D63C3C;
    }
    &-close {
        background: #339B38;
    }
}

.rip-table {
    &__header, &__content {
        display: grid;
        grid-template-columns: 202px 249px 127px 127px;
        gap: 16px
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