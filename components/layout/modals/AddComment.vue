<script setup>
import { ref, computed, watch } from 'vue'
import { createProductReview } from '~/services/client'

const props = defineProps({
  visible: Boolean,
  productId: [String, Number],
  supplierPhone: String
})
const emit = defineEmits(['close', 'success'])

// Отладка пропсов
watch(() => [props.productId, props.supplierPhone], ([productId, supplierPhone]) => {
  console.log('AddComment пропсы:', { productId, supplierPhone })
}, { immediate: true })

// Реактивные данные формы
const formData = ref({
  rating: 5,
  comment: '',
  images: []
})

const isLoading = ref(false)
const errors = ref({})

// Валидация формы
const isFormValid = computed(() => {
  return formData.value.rating > 0 &&
         formData.value.comment.trim() !== ''
})

// Закрытие модального окна
const closeModal = () => {
  resetForm()
  emit('close')
}

// Сброс формы
const resetForm = () => {
  // Очищаем URL объекты перед сбросом формы
  if (process.client && typeof URL !== 'undefined' && URL.revokeObjectURL) {
    formData.value.images.forEach(image => {
      const imageUrl = getImagePreview(image)
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    })
  }
  
  formData.value = {
    rating: 5,
    comment: '',
    images: []
  }
  errors.value = {}
}

// Обработка загрузки файлов
const handleFileUpload = (event) => {
  const files = Array.from(event.target.files)
  
  // Ограничиваем количество файлов (например, максимум 5)
  if (files.length > 5) {
    errors.value.images = 'Максимум 5 изображений'
    return
  }
  
  // Проверяем размер файлов (максимум 5MB каждый)
  const maxSize = 5 * 1024 * 1024 // 5MB
  const validFiles = files.filter(file => {
    if (file.size > maxSize) {
      errors.value.images = 'Размер файла не должен превышать 5MB'
      return false
    }
    return true
  })
  
  formData.value.images = validFiles
}

// Удаление изображения
const removeImage = (index) => {
  const image = formData.value.images[index]
  // Очищаем URL объект для предотвращения утечек памяти
  if (process.client && typeof URL !== 'undefined' && URL.revokeObjectURL) {
    const imageUrl = getImagePreview(image)
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl)
    }
  }
  formData.value.images.splice(index, 1)
  delete errors.value.images
}

// Отправка формы
const submitForm = async () => {
  if (!isFormValid.value) return
  
  isLoading.value = true
  errors.value = {}
  
  try {
    // Подставляем данные из props
    const submitData = {
      ...formData.value,
      supplier_phone: props.supplierPhone,
      product_id: props.productId
    }
    
    console.log('Данные для отправки:', submitData)
    console.log('Props:', { supplierPhone: props.supplierPhone, productId: props.productId })
    
    // Проверяем наличие обязательных полей
    if (!submitData.product_id) {
      errors.value.submit = 'ID продукта не указан'
      return
    }
    if (!submitData.supplier_phone) {
      errors.value.submit = 'Телефон поставщика не указан'
      return
    }
    
    await createProductReview(submitData)
    emit('success', 'Отзыв успешно добавлен!')
    closeModal()
  } catch (error) {
    console.error('Ошибка при отправке отзыва:', error)
    errors.value.submit = 'Произошла ошибка при отправке отзыва. Попробуйте еще раз.'
  } finally {
    isLoading.value = false
  }
}

// Установка рейтинга
const setRating = (rating) => {
  formData.value.rating = Number(rating)
  console.log('Установлен рейтинг:', rating) // Для отладки
}

// Безопасное создание preview URL только на клиентской стороне
const getImagePreview = (image) => {
  if (process.client && typeof URL !== 'undefined' && URL.createObjectURL) {
    return URL.createObjectURL(image)
  }
  return '' // Возвращаем пустую строку для SSR
}
</script>

<template>
  <div v-if="visible" class="modal fixed min-w-full min-h-[100vh] flex justify-center items-center z-50">
    <div class="bg-white rounded-lg max-w-[600px] w-full max-h-[90vh] overflow-y-auto m-4">
      <!-- Header -->
      <div class="flex justify-between items-center pt-6 px-6 pb-4 border-b">
        <h2 class="text-2xl font-bold">Добавить отзыв</h2>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-2xl">
          &times;
        </button>
      </div>
      
      <!-- Content -->
      <form @submit.prevent="submitForm" class="p-6">
        <!-- Рейтинг -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Рейтинг *
          </label>
          <div class="flex gap-1">
            <button
              v-for="star in [1, 2, 3, 4, 5]"
              :key="star"
              type="button"
              @click="setRating(star)"
              class="text-2xl focus:outline-none transition-colors hover:scale-110"
              :class="star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'"
            >
              ★
            </button>
          </div>
          <span class="text-sm text-gray-500 mt-1">{{ formData.rating }} из 5 звезд</span>
        </div>

        <!-- Комментарий -->
        <div class="mb-4">
          <label for="comment" class="block text-sm font-medium text-gray-700 mb-2">
            Комментарий *
          </label>
          <textarea
            id="comment"
            v-model="formData.comment"
            required
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Поделитесь вашим мнением о продукте..."
          ></textarea>
        </div>

        <!-- Загрузка изображений -->
        <div class="mb-6">
          <label for="images" class="block text-sm font-medium text-gray-700 mb-2">
            Изображения (необязательно)
          </label>
          <input
            id="images"
            type="file"
            multiple
            accept="image/*"
            @change="handleFileUpload"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p class="text-xs text-gray-500 mt-1">Максимум 5 изображений, до 5MB каждое</p>
          
          <!-- Ошибка загрузки -->
          <p v-if="errors.images" class="text-red-500 text-sm mt-1">{{ errors.images }}</p>
          
          <!-- Превью изображений -->
          <div v-if="formData.images.length > 0" class="mt-3">
            <div class="grid grid-cols-3 gap-2">
              <div
                v-for="(image, index) in formData.images"
                :key="index"
                class="relative"
              >
                <img
                  v-if="getImagePreview(image)"
                  :src="getImagePreview(image)"
                  :alt="`Preview ${index + 1}`"
                  class="w-full h-20 object-cover rounded border"
                />
                <div
                  v-else
                  class="w-full h-20 bg-gray-200 rounded border flex items-center justify-center"
                >
                  <span class="text-gray-500 text-sm">Загрузка...</span>
                </div>
                <button
                  type="button"
                  @click="removeImage(index)"
                  class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Ошибка отправки -->
        <div v-if="errors.submit" class="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
          <p class="text-red-700 text-sm">{{ errors.submit }}</p>
        </div>

        <!-- Кнопки -->
        <div class="flex justify-end gap-3">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            :disabled="isLoading"
          >
            Отмена
          </button>
          <button
            type="submit"
            :disabled="!isFormValid || isLoading"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading">Отправляем...</span>
            <span v-else>Отправить отзыв</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal {
  top: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
}
</style>
