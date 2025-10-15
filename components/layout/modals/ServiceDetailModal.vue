<script setup>
import { defineProps } from 'vue';
const props = defineProps(['service', 'visible', 'reviews', 'supplier'])

const emit = defineEmits(['close', 'order'])

const closeModal = () => {
  emit('close')
}

const orderService = () => {
  emit('order', props.service.id)
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
  if (!/^\d{11}$/.test(phone)) return 'Неверный формат номера';

  return `+${phone[0]} (${phone.slice(1, 4)}) ${phone.slice(4, 7)} ${phone.slice(7, 9)} ${phone.slice(9, 11)}`;
}

</script>

<template>
  <div v-if="visible" class="modal fixed min-w-full min-h-[100vh] flex justify-center items-center z-50">
    <div class="bg-white rounded-lg max-w-[795px] w-full max-h-[90vh] overflow-y-auto m-4">
      <!-- Header -->
      <div class="flex justify-between items-start pt-6 pl-6 pr-6 pb-0 border-b">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <h2 class="text-xl font-bold">{{ service?.name || 'Доставка покойного' }}</h2>
<!--            <div class="flex items-center">-->
<!--              <span class="text-orange-400 text-sm">{{ renderStars(service?.rating || 4.7) }}</span>-->
<!--              <span class="text-sm text-gray-600 ml-1">{{ service?.rating || 4.7 }}</span>-->
<!--            </div>-->
          </div>
          <div class="text-2xl font-bold">
            {{ formatPrice(service?.price || 100000) }} ₸
          </div>
        </div>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-2xl ml-4">
          &times;
        </button>
      </div>
      
      <!-- Content -->
      <div class="pt-2 pl-6 pr-6 pb-6">
        <!-- Service Image -->
        <div class="flex gap-[12px]">
            <div v-if="service?.image_urls" class="mb-6">
                <div class="min-w-[330px] w-full h-[221px] rounded-lg overflow-hidden bg-gray-100" v-for="image in service.image_urls" :key="image">
                    <img 
                    :src="image"
                    :alt="service.title"
                    class="w-full h-full object-cover"
                    />
                </div>
            </div>

            <!-- Description -->
            <div class="mb-6">
                <p class="text-base">
                    {{ service?.description || 'Профессиональная транспортировка покойного осуществляется с соблюдением всех санитарных и этических норм. Мы обеспечиваем бережное отношение к усопшему на всех этапах перевозки для вас период. Услуга включает транспортировку тела в специализированном автомобиле, оформление сопроводительной документации и при необходимости, сопровождение близких.' }}
                </p>
            </div>
        </div>

        <!-- Provider Info -->
        <div class="mb-6 rounded-lg">
          <h3 class="font-semibold text-sm text-[#939393]">Поставщик услуг</h3>
          <p class="text-sm font-medium">{{ supplier?.name || 'Ритуальный Центр "Покой и Уважение"' }}</p>
          <p class="text-sm">{{ supplier?.city.name || 'Улица Бейсекбаева, Алматы' }} <a href="" class="ml-3">{{ formatPhoneNumber(service?.supplier_phone) }}</a></p>
        </div>

        <!-- Reviews -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4">Отзывы</h3>
          <div v-if="reviews && reviews.length" class="space-y-4">
            <div
              v-for="review in reviews"
              :key="review.id"
              class="border-b border-gray-100 pb-3 last:border-b-0"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="font-medium text-sm">{{ review.name }}</span>
                  <span class="text-xs text-gray-500">{{ new Date(review.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</span>
                </div>
                <span class="text-orange-400 text-sm">{{ renderStars(review.rating) }}</span>
              </div>
              <p class="text-sm text-gray-600">{{ review.comment }}</p>
            </div>
          </div>
          <div v-else class="">
              Отзывы отсутствуют
          </div>
        </div>

        <!-- Action Button -->
        <div class="flex justify-end">
          <button 
            @click="orderService"
            class="w-full max-w-[200px] py-3 bg-[#38949B] hover:bg-[#2d7c82] text-white rounded-lg font-semibold transition-colors"
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
}
</style> 