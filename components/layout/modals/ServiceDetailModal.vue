<script setup>
import { defineProps, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps(['service', 'visible', 'reviews', 'supplier'])

const emit = defineEmits(['close', 'order'])

// Состояние карусели
const currentImageIndex = ref(0)

const closeModal = () => {
  emit('close')
}

const orderService = () => {
  emit('order', props.service.id)
}

// Функции карусели
const nextImage = () => {
  if (props.service?.image_urls?.length > 1) {
    currentImageIndex.value = (currentImageIndex.value + 1) % props.service.image_urls.length
  }
}

const prevImage = () => {
  if (props.service?.image_urls?.length > 1) {
    currentImageIndex.value = currentImageIndex.value === 0 
      ? props.service.image_urls.length - 1 
      : currentImageIndex.value - 1
  }
}

const goToImage = (index) => {
  currentImageIndex.value = index
}

const renderStars = (rating) => {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0
  
  for (let i = 0; i < fullStars; i++) {
    stars.push('★')
  }
  
  if (hasHalfStar) {
    stars.push('⯪')
  }
  
  const emptyStars = 5 - Math.ceil(rating)
  for (let i = 0; i < emptyStars; i++) {
    stars.push('☆')
  }
  
  return stars.join('')
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('ru-RU').format(price)
}

function formatPhoneNumber(phone) {
  if (!/^\d{11}$/.test(phone)) return t('errors.invalidPhone');

  return `+${phone[0]} (${phone.slice(1, 4)}) ${phone.slice(4, 7)} ${phone.slice(7, 9)} ${phone.slice(9, 11)}`;
}

</script>

<template>
  <div v-if="visible" class="modal fixed min-w-full min-h-[100vh] flex justify-center items-center z-50 p-1 xs:p-2 sm:p-4">
    <div class="bg-white rounded-lg max-w-[795px] w-full max-h-[95vh] xs:max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex justify-between items-start pt-3 xs:pt-4 sm:pt-6 pl-3 xs:pl-4 sm:pl-6 pr-3 xs:pr-4 sm:pr-6 pb-0 border-b">
        <div class="flex-1 min-w-0 pr-2">
          <div class="flex items-center gap-1 xs:gap-2 mb-1 xs:mb-2">
            <h2 class="text-base xs:text-lg sm:text-xl font-bold truncate">{{ service?.name || 'Доставка покойного' }}</h2>
<!--            <div class="flex items-center">-->
<!--              <span class="text-orange-400 text-sm">{{ renderStars(service?.rating || 4.7) }}</span>-->
<!--              <span class="text-sm text-gray-600 ml-1">{{ service?.rating || 4.7 }}</span>-->
<!--            </div>-->
          </div>
          <div class="text-lg xs:text-xl sm:text-2xl font-bold">
            {{ formatPrice(service?.price || 100000) }} ₸
          </div>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-xl xs:text-2xl ml-1 xs:ml-2 sm:ml-4 flex-shrink-0">
          &times;
        </button>
      </div>
      
      <!-- Content -->
      <div class="pt-2 pl-3 xs:pl-4 sm:pl-6 pr-3 xs:pr-4 sm:pr-6 pb-3 xs:pb-4 sm:pb-6">
        <!-- Service Image -->
        <div v-if="service?.image_urls" class="mb-3 xs:mb-4 sm:mb-6">
            <!-- Карусель изображений -->
            <div v-if="service.image_urls.length > 1" class="relative">
                <!-- Основное изображение -->
                <div class="w-full h-[200px] xs:h-[250px] sm:h-[300px] lg:h-[350px] rounded-lg overflow-hidden bg-gray-100 relative">
                    <img 
                        :src="service.image_urls[currentImageIndex]"
                        :alt="service.title"
                        class="w-full h-full object-cover"
                    />
                    
                    <!-- Кнопки навигации -->
                    <button 
                        @click="prevImage"
                        class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70 transition-all"
                    >
                        ‹
                    </button>
                    <button 
                        @click="nextImage"
                        class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-70 transition-all"
                    >
                        ›
                    </button>
                    
                    <!-- Индикатор текущего изображения -->
                    <div class="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                        {{ currentImageIndex + 1 }} / {{ service.image_urls.length }}
                    </div>
                </div>
                
                <!-- Миниатюры -->
                <div class="flex gap-2 mt-2 overflow-x-auto carousel-thumbnails">
                    <button 
                        v-for="(image, index) in service.image_urls" 
                        :key="index"
                        @click="goToImage(index)"
                        :class="[
                            'flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-all',
                            currentImageIndex === index 
                                ? 'border-blue-500' 
                                : 'border-gray-300 hover:border-gray-400'
                        ]"
                    >
                        <img 
                            :src="image"
                            :alt="`${service.title} ${index + 1}`"
                            class="w-full h-full object-cover"
                        />
                    </button>
                </div>
            </div>
            
            <!-- Одно изображение -->
            <div v-else class="w-full h-[200px] xs:h-[250px] sm:h-[300px] lg:h-[350px] rounded-lg overflow-hidden bg-gray-100">
                <img 
                    :src="service.image_urls[0]"
                    :alt="service.title"
                    class="w-full h-full object-cover"
                />
            </div>
        </div>

        <!-- Description -->
        <div class="mb-3 xs:mb-4 sm:mb-6">
            <p class="text-xs xs:text-sm sm:text-base leading-relaxed">
                {{ service?.description || 'Профессиональная транспортировка покойного осуществляется с соблюдением всех санитарных и этических норм. Мы обеспечиваем бережное отношение к усопшему на всех этапах перевозки для вас период. Услуга включает транспортировку тела в специализированном автомобиле, оформление сопроводительной документации и при необходимости, сопровождение близких.' }}
            </p>
        </div>

        <!-- Provider Info -->
        <div class="mb-3 xs:mb-4 sm:mb-6 rounded-lg">
          <h3 class="font-semibold text-xs sm:text-sm text-[#939393] mb-1">{{ $t('review.providerServices') }}</h3>
          <p class="text-xs sm:text-sm font-medium mb-1 break-words">{{ supplier?.name || 'Ритуальный Центр "Покой и Уважение"' }}</p>
          <p class="text-xs sm:text-sm break-words">
            {{ supplier?.city?.name || 'Улица Бейсекбаева, Алматы' }} 
            <a href="" class="ml-1 xs:ml-2 sm:ml-3 text-blue-600 hover:text-blue-800 break-all">{{ formatPhoneNumber(service?.supplier_phone) }}</a>
          </p>
        </div>

        <!-- Reviews -->
        <div class="mb-3 xs:mb-4 sm:mb-6">
          <h3 class="text-sm xs:text-base sm:text-lg font-semibold mb-2 xs:mb-3 sm:mb-4">{{ $t('review.reviews') }}</h3>
          <div v-if="reviews && reviews.length" class="space-y-2 xs:space-y-3 sm:space-y-4">
            <div
              v-for="review in reviews"
              :key="review.id"
              class="border-b border-gray-100 pb-2 xs:pb-2 sm:pb-3 last:border-b-0"
            >
              <div class="flex flex-col gap-1">
                <div class="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1">
                  <div class="flex flex-col xs:flex-row xs:items-center gap-1">
                    <span class="font-medium text-xs sm:text-sm">{{ review.name }}</span>
                    <span class="text-xs text-gray-500">{{ new Date(review.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</span>
                  </div>
                  <span class="text-orange-400 text-xs sm:text-sm">{{ renderStars(review.rating) }}</span>
                </div>
                <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">{{ review.comment }}</p>
              </div>
            </div>
          </div>
          <div v-else class="text-xs xs:text-sm text-gray-500">
              Отзывы отсутствуют
          </div>
        </div>

        <!-- Action Button -->
        <div class="flex justify-center sm:justify-end">
          <button 
            @click="orderService"
            class="w-full sm:w-auto sm:max-w-[200px] py-2 xs:py-3 px-3 xs:px-4 bg-[#E9B949] hover:bg-[#D1A53F] text-white rounded-lg font-semibold transition-colors text-sm xs:text-base"
          >
            {{ service?.buttonText || 'Добавить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal {
  top: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  z-index: 99;
}

// Кастомные стили для экранов меньше 425px
@media (max-width: 424px) {
  .modal {
    padding: 4px;
  }
  
  .modal > div {
    max-height: 98vh;
    border-radius: 8px;
  }
  
  // Уменьшаем отступы для очень маленьких экранов
  .modal .pt-3 {
    padding-top: 8px;
  }
  
  .modal .pl-3, .modal .pr-3 {
    padding-left: 8px;
    padding-right: 8px;
  }
  
  .modal .pb-3 {
    padding-bottom: 8px;
  }
  
  // Уменьшаем размеры изображений
  .modal .h-\[200px\] {
    height: 120px !important;
  }
  
  .modal .h-\[250px\] {
    height: 140px !important;
  }
  
  .modal .h-\[300px\] {
    height: 160px !important;
  }
  
  .modal .h-\[350px\] {
    height: 180px !important;
  }
  
  // Уменьшаем размеры текста
  .modal h2 {
    font-size: 14px !important;
    line-height: 1.2;
  }
  
  .modal .text-lg {
    font-size: 16px !important;
  }
  
  .modal .text-xs {
    font-size: 10px !important;
  }
  
  .modal .text-sm {
    font-size: 11px !important;
  }
  
  // Уменьшаем отступы между элементами
  .modal .mb-3 {
    margin-bottom: 8px;
  }
  
  .modal .gap-2 {
    gap: 4px;
  }
  
  // Улучшаем кнопку
  .modal button {
    padding: 6px 12px !important;
    font-size: 12px !important;
  }
}

// Стили для карусели
.carousel-nav-btn {
  font-size: 18px;
  font-weight: bold;
  line-height: 1;
}

.carousel-thumbnails {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 transparent;
}

.carousel-thumbnails::-webkit-scrollbar {
  height: 4px;
}

.carousel-thumbnails::-webkit-scrollbar-track {
  background: transparent;
}

.carousel-thumbnails::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 2px;
}

.carousel-thumbnails::-webkit-scrollbar-thumb:hover {
  background-color: #a0aec0;
}
</style> 