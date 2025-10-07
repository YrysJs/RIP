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
  <NuxtLayout name="supplier" class="supplier-notifications-page">
    <!-- Заголовок страницы -->
    <div class="page-head">
      <h2 class="page-title">Уведомления</h2>
      
      <div class="page-actions">
        <button 
          @click="handleMarkAllAsRead"
          :disabled="markingAllAsRead || notifications.length === 0"
          class="btn btn--primary"
          :class="{ 'btn--loading': markingAllAsRead }"
        >
          <div v-if="markingAllAsRead" class="btn__spinner"/>
          {{ markingAllAsRead ? 'Обновление...' : 'Пометить все как прочитанные' }}
        </button>
        
        <div class="page-controls">
          <label class="page-controls__label">Показать по:</label>
          <select 
            v-model="limit" 
            @change="onLimitChange"
            class="page-controls__select"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Контент -->
    <div class="notifications-content">
      <!-- Индикатор загрузки -->
      <div v-if="loading && notifications.length === 0" class="loading-state">
        <div class="loading-spinner"/>
        <span class="loading-text">Загрузка уведомлений...</span>
      </div>
      
      <!-- Ошибка загрузки -->
      <div v-else-if="error && notifications.length === 0" class="error-state">
        <div class="error-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <p class="error-message">Ошибка загрузки уведомлений: {{ error }}</p>
        <button 
          class="btn btn--secondary"
          @click="fetchNotifications(true)"
        >
          Попробовать снова
        </button>
      </div>
      
      <!-- Список уведомлений -->
      <div 
        v-else-if="notifications.length > 0" 
        ref="scrollContainer"
        class="notifications-list"
      >
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          class="notification-card"
          :class="{ 
            'notification-card--read': notification.is_read,
            'notification-card--unread': !notification.is_read
          }"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-card__content">
            <div class="notification-card__header">
              <h3 class="notification-card__title">
                <NuxtLink 
                  :to="notification.type === 'new_review' ? `/supplier/reviews` : `/supplier/tickets/active/${notification.entity_id}`"
                  class="notification-card__link"
                >
                  {{ notification.subject }}
                </NuxtLink>
              </h3>
              <div v-if="!notification.is_read" class="notification-card__badge"/>
            </div>
            
            <p v-if="notification.content" class="notification-card__description">
              {{ notification.content }}
            </p>
            
            <div class="notification-card__meta">
              <span class="notification-card__date">{{ formatDate(notification.created_at) }}</span>
              <span v-if="notification.data.order_id || notification.data.request_number" class="notification-card__id">
                № {{ notification.data.order_id || notification.data.request_number }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Индикатор загрузки дополнительных уведомлений -->
        <div v-if="loadingMore" class="loading-more">
          <div class="loading-spinner loading-spinner--small"/>
          <span class="loading-text">Загрузка...</span>

        </div>
        
        <!-- Сообщение о завершении загрузки -->
        <div v-else-if="!hasMore && notifications.length > 0" class="end-message">
          <p>Все уведомления загружены</p>
        </div>
      </div>
      
      <!-- Пустое состояние -->
      <div v-else class="empty-state">
        <div class="empty-state__icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h3 class="empty-state__title">Уведомлений пока нет</h3>
        <p class="empty-state__description">Здесь будут отображаться все ваши уведомления</p>
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
// Основные стили страницы
.supplier-notifications-page {
  min-height: 100vh;
  background: #f8f9fa;
  
  @media (max-width: 768px) {
    padding-top: 0; /* Убираем дополнительный отступ */
    margin-top: 0; /* Убираем дополнительный отступ */
  }
}

// Заголовок страницы
.page-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1c1c1c;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 24px;
  }
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}

.page-controls {
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    justify-content: space-between;
  }
}

.page-controls__label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.page-controls__select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #F7B500;
    box-shadow: 0 0 0 3px rgba(247, 181, 0, 0.1);
  }
}

// Кнопки
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  min-height: 44px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &--primary {
    background: #F7B500;
    color: #1F2937;

    &:hover:not(:disabled) {
      background: #e6a300;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(247, 181, 0, 0.3);
    }
  }

  &--secondary {
    background: #6b7280;
    color: white;

    &:hover:not(:disabled) {
      background: #4b5563;
      transform: translateY(-1px);
    }
  }

  &--loading {
    pointer-events: none;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    margin-bottom: 12px; /* Отступ между кнопками */
  }
}

.btn__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

// Контент уведомлений
.notifications-content {
  background: white;
  border-radius: 16px;
  border: 1px solid #ece7da;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    border-radius: 12px;
    margin: 0 -8px;
  }
}

// Состояния загрузки и ошибок
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #F7B500;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  &--small {
    width: 20px;
    height: 20px;
    border-width: 2px;
  }
}

.loading-text {
  margin-top: 12px;
  color: #6b7280;
  font-size: 14px;
}

.error-icon {
  color: #ef4444;
  margin-bottom: 16px;
}

.error-message {
  color: #ef4444;
  font-size: 16px;
  margin-bottom: 20px;
}

// Список уведомлений
.notifications-list {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding: 0;

  @media (max-width: 768px) {
    max-height: calc(100vh - 140px); /* Учитываем хедер и bottom nav */
    overflow-y: auto;
    -webkit-overflow-scrolling: touch; /* Плавная прокрутка на iOS */
  }
}

// Карточка уведомления
.notification-card {
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }

  &--unread {
    background: #fef7e0;
    border-left: 4px solid #F7B500;

    &:hover {
      background: #fef3c7;
    }
  }

  &--read {
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    padding: 16px 20px;
  }
}

.notification-card__content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notification-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.notification-card__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1c1c1c;
  flex: 1;
}

.notification-card__link {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #F7B500;
  }
}

.notification-card__badge {
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}

.notification-card__description {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

.notification-card__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 4px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

.notification-card__date {
  color: #9ca3af;
  font-size: 12px;
}

.notification-card__id {
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 4px;
}

// Загрузка дополнительных уведомлений
.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: #6b7280;
  font-size: 14px;
}

.end-message {
  text-align: center;
  padding: 20px;
  color: #9ca3af;
  font-size: 14px;
}

// Пустое состояние
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
}

.empty-state__icon {
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-state__title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.empty-state__description {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

// Адаптивные стили
@media (max-width: 768px) {
  .supplier-notifications-page {
    padding: 0;
    margin: 0;
    background: #ffffff; /* Белый фон для мобильных */
  }

  .page-head {
    margin-bottom: 16px;
    padding: 0 16px; /* Отступы по бокам */
  }

  .notifications-content {
    border-radius: 0; /* Убираем скругления на мобильных */
    margin: 0; /* Убираем отступы */
    box-shadow: none; /* Убираем тень */
    border: none; /* Убираем границу */
  }

  .notification-card {
    padding: 16px 20px;
    border-bottom: 1px solid #f3f4f6;
  }

  .notification-card__title {
    font-size: 15px;
  }

  .notification-card__description {
    font-size: 13px;
  }
}
</style>