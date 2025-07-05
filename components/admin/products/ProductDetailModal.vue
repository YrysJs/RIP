<template>
  <div
    v-if="visible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="closeModal"
  >
    <div
      class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Детали продукта</h2>
        <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
          <img src="/icons/close.svg" alt="Закрыть" class="w-6 h-6" />
        </button>
      </div>

      <div v-if="product" class="space-y-4">
        <!-- Изображения -->
        <div v-if="product.image_urls && product.image_urls.length > 0" class="mb-4">
          <h3 class="text-lg font-medium mb-2">Изображения</h3>
          <div class="grid grid-cols-2 gap-4">
            <img
              v-for="(image, index) in product.image_urls"
              :key="index"
              :src="image"
              :alt="product.name"
              class="w-full h-32 object-cover rounded-lg"
            />
          </div>
        </div>

        <!-- Основная информация -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ID</label>
            <p class="text-sm text-gray-900">{{ product.id }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Название</label>
            <p class="text-sm text-gray-900">{{ product.name }}</p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Описание</label>
          <p class="text-sm text-gray-900">{{ product.description }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Цена</label>
            <p class="text-sm text-gray-900">{{ product.price }} ₸</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Телефон поставщика</label>
            <p class="text-sm text-gray-900">{{ product.supplier_phone }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Статус</label>
            <span class="inline-block px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusClass(product.status)">
              {{ getStatusText(product.status) }}
            </span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Тип</label>
            <p class="text-sm text-gray-900">{{ product.type }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Страна</label>
            <p class="text-sm text-gray-900">{{ product.country }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Город</label>
            <p class="text-sm text-gray-900">{{ product.city }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Доступность</label>
            <p class="text-sm text-gray-900">{{ product.availability ? 'Доступен' : 'Недоступен' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Время обслуживания</label>
            <p class="text-sm text-gray-900">{{ product.service_time }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Дата создания</label>
            <p class="text-sm text-gray-900">{{ formatDate(product.created_at) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Дата обновления</label>
            <p class="text-sm text-gray-900">{{ formatDate(product.updated_at) }}</p>
          </div>
        </div>

        <!-- Модерация -->
        <div class="border-t pt-4">
          <h3 class="text-lg font-medium mb-3">Модерация</h3>
          
          <div class="mb-4">
            <label for="moderationComment" class="block text-sm font-medium text-gray-700 mb-1">
              Комментарий модератора
            </label>
            <textarea
              id="moderationComment"
              v-model="moderationComment"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Введите комментарий..."
            />
          </div>

          <div class="flex space-x-3">
            <button
              @click="updateStatus('active')"
              :disabled="loading"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {{ loading ? 'Загрузка...' : 'Активировать' }}
            </button>
            <button
              @click="updateStatus('requires_fix')"
              :disabled="loading"
              class="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              {{ loading ? 'Загрузка...' : 'Отправить на доработку' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { updateProductStatus } from '~/services/admin'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'updated'])

const moderationComment = ref('')
const loading = ref(false)

watch(() => props.visible, (newVal) => {
  if (newVal) {
    moderationComment.value = ''
  }
})

const closeModal = () => {
  emit('close')
}

const updateStatus = async (status) => {
  if (!props.product) return

  loading.value = true
  try {
    await updateProductStatus(props.product.id, {
      status,
      moderation_comment: moderationComment.value
    })
    
    emit('updated', { ...props.product, status })
    emit('close')
  } catch (error) {
    console.error('Ошибка при обновлении статуса:', error)
    alert('Ошибка при обновлении статуса товара')
  } finally {
    loading.value = false
  }
}

const getStatusClass = (status) => {
  switch(status) {
    case 'active': return 'bg-green-100 text-green-800'
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'requires_fix': return 'bg-orange-100 text-orange-800'
    case 'blocked': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status) => {
  switch(status) {
    case 'active': return 'Активен'
    case 'pending': return 'На рассмотрении'
    case 'requires_fix': return 'Требует доработки'
    case 'blocked': return 'Заблокирован'
    default: return 'Неизвестно'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script> 