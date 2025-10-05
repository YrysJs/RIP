<script setup>
import { getNotifications, markAsReadAll, markAsRead } from '~/services/notifications'
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const notifications = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const error = ref(null)
const limit = ref(10)
const offset = ref(0)
const hasMore = ref(true)
const scrollContainer = ref(null)
const markingAllAsRead = ref(false)
const serviceType = ref('')

const fetchNotifications = async (reset = false) => {
  try {
    if (reset) {
      loading.value = true
      offset.value = 0
      notifications.value = []
      hasMore.value = true
    } else {
      loadingMore.value = true
    }

    const params = {
      limit: limit.value,
      offset: offset.value
    }
    
    if (serviceType.value) {
      params.service_name = serviceType.value
    }

    const response = await getNotifications(params)
    const newNotifications = response.data.notifications || []
    
    if (reset) {
      notifications.value = newNotifications
      offset.value = limit.value
    } else {
      notifications.value = [...notifications.value, ...newNotifications]
      offset.value += limit.value
    }

    hasMore.value = newNotifications.length === limit.value
    
  } catch (err) {
    error.value = err.message
    console.error('Ошибка при загрузке уведомлений:', err)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return
  
  await fetchNotifications(false)
}

const onLimitChange = () => {
  fetchNotifications(true)
}

const onServiceTypeChange = () => {
  fetchNotifications(true)
}

const handleScroll = () => {
  if (!scrollContainer.value || !hasMore.value || loadingMore.value) return

  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value
  
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    loadMore()
  }
}

onMounted(async () => {
  await fetchNotifications(true)
  
  await nextTick()
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', handleScroll)
  }
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleMarkAllAsRead = async () => {
  try {
    markingAllAsRead.value = true
    await markAsReadAll()
    
    notifications.value = notifications.value.map(notification => ({
      ...notification,
      is_read: true
    }))
    
  } catch (err) {
    console.error('Ошибка при пометке всех уведомлений как прочитанные:', err)
    error.value = 'Не удалось пометить все уведомления как прочитанные'
  } finally {
    markingAllAsRead.value = false
  }
}

const handleMarkAsRead = async (notificationId) => {
  try {
    await markAsRead(notificationId)
    
    const notificationIndex = notifications.value.findIndex(n => n.id === notificationId)
    if (notificationIndex !== -1) {
      notifications.value[notificationIndex].is_read = true
    }
    
  } catch (err) {
    console.error('Ошибка при пометке уведомления как прочитанное:', err)
  }
}

const handleNotificationClick = async (notification) => {
  if (!notification.is_read) {
    await handleMarkAsRead(notification.id)
  }
}
</script>

<template>
    <NuxtLayout name="client">
        <div class="w-full flex items-center flex-wrap justify-between bg-white rounded-[16px] text-lg font-semibold px-4 gap-4">
            <span>Уведомления</span>
            
            <div class="flex flex-wrap items-center gap-4">
                <button 
                    @click="handleMarkAllAsRead"
                    :disabled="markingAllAsRead || notifications.length === 0"
                    class="px-2 py-1 text-white text-sm rounded-lg flex items-center gap-2 btn--primary"
                >
                    <div v-if="markingAllAsRead" class="animate-spin rounded-full border-b-2 border-white text-xs"/>
                    {{ markingAllAsRead ? 'Обновление...' : 'Пометить все как прочитанные' }}
                </button>
                
                <div class="flex items-center gap-2">
                    <label class="text-sm text-gray-600">Тип сервиса:</label>
                    <select 
                        v-model="serviceType" 
                        @change="onServiceTypeChange"
                        class="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#38949B]"
                    >
                        <option value="">Все</option>
                        <option value="burial-request-service">Заявки захоронений</option>
                        <option value="supplier-service">Заявки услуг</option>
                    </select>
                </div>
                
                <div class="flex items-center gap-2">
                    <label class="text-sm text-gray-600">Показать по:</label>
                    <select 
                        v-model="limit" 
                        @change="onLimitChange"
                        class="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#38949B]"
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div 
            ref="scrollContainer"
            class="w-full bg-white rounded-[16px] mt-[20px] max-h-[calc(100vh-200px)] overflow-y-auto"
        >
            <!-- Индикатор загрузки -->
            <div v-if="loading && notifications.length === 0" class="flex justify-center items-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#38949B]"/>
                <span class="ml-2 text-gray-600">Загрузка уведомлений...</span>
            </div>
            
            <!-- Ошибка загрузки -->
            <div v-else-if="error && notifications.length === 0" class="text-center py-8">
                <p class="text-red-500">Ошибка загрузки уведомлений: {{ error }}</p>
                <button 
                    class="mt-4 px-4 py-2 bg-[#38949B] text-white rounded-lg hover:bg-[#2a7179]"
                    @click="fetchNotifications(true)"
                >
                    Попробовать снова
                </button>
            </div>
            
            <!-- Список уведомлений -->
            <div v-else-if="notifications.length > 0" class="flex flex-col gap-[10px] p-4">
                <div 
                    v-for="notification in notifications" 
                    :key="notification.id"
                    class="flex items-center gap-[10px] py-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    :class="{ 'opacity-60': notification.is_read }"
                    @click="handleNotificationClick(notification)"
                >
                    <div class="flex flex-col flex-1">
<!--                        <nuxt-link :to="notification.type === 'new_review' ? `/supplier/reviews` : `/supplier/tickets/active/${notification.entity_id}`" class="text-sm font-semibold">Уведомление - {{ notification.subject }} - {{ notification.data.order_id || notification.data.request_number }}</nuxt-link>-->
                      <p class="text-sm font-semibold">Уведомление - {{ notification.subject }} - {{ notification.data.order_id || notification.data.request_number }}</p>

                      <p v-if="notification.content" class="text-xs text-gray-600 mt-1">{{ notification.content }}</p>
                        <p class="text-xs text-[#224C4F] mt-1">{{ formatDate(notification.created_at) }}</p>
                    </div>
                    
                    <div v-if="!notification.is_read" class="w-2 h-2 bg-red-500 rounded-full"/>
                </div>
                
                <div v-if="loadingMore" class="flex justify-center items-center py-4">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-[#38949B]"/>
                    <span class="ml-2 text-gray-600 text-sm">Загрузка...</span>
                </div>
                
                <div v-else-if="!hasMore && notifications.length > 0" class="text-center py-4">
                    <p class="text-gray-500 text-sm">Все уведомления загружены</p>
                </div>
            </div>
            
            <!-- Пустое состояние -->
            <div v-else class="text-center py-8">
                <p class="text-gray-500">Уведомлений пока нет</p>
            </div>
        </div>
    </NuxtLayout>
</template>

<style lang="scss" scoped>
.btn--primary{ background:#F7B500; color:#1F2937; }
</style>