<script setup>
import { getNotifications } from '~/services/notifications'
import { ref, onMounted } from 'vue'

const notifications = ref([])
const loading = ref(false)
const error = ref(null)

const fetchNotifications = async () => {
  try {
    loading.value = true
    const response = await getNotifications()
    notifications.value = response.data.items
  } catch (err) {
    error.value = err.message
    console.error('Ошибка при загрузке уведомлений:', err)
  } finally {
    loading.value = false
  }
}

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

onMounted(() => {
  fetchNotifications()
})
</script>

<template>
    <NuxtLayout name="supplier">
        <div class="w-full h-[61px] pl-[20px] flex items-center bg-white rounded-[16px] text-lg font-semibold">
            Уведомления
        </div>
        
        <div class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px]">
            <!-- Индикатор загрузки -->
            <div v-if="loading" class="flex justify-center items-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#38949B]"></div>
                <span class="ml-2 text-gray-600">Загрузка уведомлений...</span>
            </div>
            
            <!-- Ошибка загрузки -->
            <div v-else-if="error" class="text-center py-8">
                <p class="text-red-500">Ошибка загрузки уведомлений: {{ error }}</p>
                <button 
                    @click="fetchNotifications"
                    class="mt-4 px-4 py-2 bg-[#38949B] text-white rounded-lg hover:bg-[#2a7179]"
                >
                    Попробовать снова
                </button>
            </div>
            
            <!-- Список уведомлений -->
            <div v-else-if="notifications.length > 0" class="flex flex-col gap-[10px]">
                <div 
                    v-for="notification in notifications" 
                    :key="notification.id"
                    class="flex items-center gap-[10px] p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    :class="{ 'opacity-60': notification.is_read }"
                >
                    <!-- Иконка уведомления -->
                    <div 
                        class="w-[40px] h-[40px] rounded-full flex items-center justify-center text-white text-sm font-semibold"
                        :class="{
                            'bg-[#38949B]': notification.type === 'status_changed',
                            'bg-blue-500': notification.type === 'info',
                            'bg-yellow-500': notification.type === 'warning',
                            'bg-red-500': notification.type === 'error',
                            'bg-green-500': notification.type === 'success'
                        }"
                    >
                        {{ notification.title ? notification.title.charAt(0).toUpperCase() : 'N' }}
                    </div>
                    
                    <!-- Контент уведомления -->
                    <div class="flex flex-col flex-1">
                        <p class="text-sm font-semibold">{{ notification.title || 'Уведомление' }}</p>
                        <p v-if="notification.message" class="text-xs text-gray-600 mt-1">{{ notification.message }}</p>
                        <p class="text-xs text-[#224C4F] mt-1">{{ formatDate(notification.created_at) }}</p>
                    </div>
                    
                    <!-- Индикатор непрочитанного -->
                    <div v-if="!notification.is_read" class="w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
            </div>
            
            <!-- Пустое состояние -->
            <div v-else class="text-center py-8">
                <p class="text-gray-500">Уведомлений пока нет</p>
            </div>
        </div>
    </NuxtLayout>
</template>