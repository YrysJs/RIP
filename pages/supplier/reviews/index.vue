<script setup>
import { getReviews } from '~/services/supplier'

const props = defineProps({
    value: {
        type: Number,
        default: 3.5,
    },

    totalStars: {
        type: Number,
        default: 5,
    },
});

// Загружаем отзывы с сервера
const { data: reviews, pending } = await useLazyAsyncData('supplier-reviews', async () => {
    try {
        const response = await getReviews()
        return response.data || []
    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error)
        return []
    }
})

function getStarClass(rating, n) {
    if (rating >= n) return "full";
    if (rating >= n - 0.5 && rating < n) return "half";
    return "empty";
}

// Функция для форматирования даты
function formatDate(dateString) {
    if (!dateString) return ''
    try {
        const date = new Date(dateString)
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }) + ', ' + date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        })
    } catch (error) {
        return dateString
    }
}

</script>

<template>
    <NuxtLayout name="supplier">
        <div class="w-full h-[61px] pl-[20px] flex items-center bg-white rounded-[16px] text-lg font-semibold">
            Отзывы и рейтинги
        </div>
        
        <!-- Загрузка -->
        <div v-if="pending" class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px] text-center">
            <div>Загрузка отзывов...</div>
        </div>

        <!-- Список отзывов -->
        <div v-else-if="reviews && reviews.length > 0">
            <div 
                v-for="review in reviews" 
                :key="review.id"
                class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px]"
            >
                <div class="flex justify-between items-center">
                    <div class="font-medium text-lg">Отзыв #{{ review.id }}</div>
                    <div class="flex items-center gap-[20px]">
                        <span class="text-sm">Продукт ID: #{{ review.product_id }}</span>
                        <span 
                            v-if="review.is_moderated"
                            class="text-sm p-1 rounded-md text-white font-medium bg-[#339B38]"
                        >
                            Модерирован
                        </span>
                        <span 
                            v-else
                            class="text-sm p-1 rounded-md text-white font-medium bg-orange-500"
                        >
                            На модерации
                        </span>
                    </div>
                </div>
                
                <div class="my-[32px]">
                    <div class="flex text-sm">
                        <p class="min-w-[150px]">Клиент:</p>
                        <p>{{ review.user_phone || 'Не указан' }}</p>
                    </div>
                    <div class="flex text-sm">
                        <p class="min-w-[150px]">Поставщик:</p>
                        <p>{{ review.supplier_phone || 'Не указан' }}</p>
                    </div>
                </div>
                
                <!-- Рейтинг звездами -->
                <div class="flex space-x-1">
                    <template v-for="n in totalStars" :key="n">
                        <div class="relative text-2xl select-none">
                            <span v-if="getStarClass(review.rating, n) === 'half'" class="text-gray-300">★</span>
                            <span 
                                v-else :class="{
                                'text-yellow-400': getStarClass(review.rating, n) === 'full',
                                'text-gray-300': getStarClass(review.rating, n) === 'empty'
                                }"
                            >
                                ★
                            </span>
                            <span
                                v-if="getStarClass(review.rating, n) === 'half'"
                                class="absolute inset-0 overflow-hidden text-yellow-400"
                                :style="{ width: '50%' }"
                            >
                                ★
                            </span>
                        </div>
                    </template>
                    <span class="ml-2 text-sm text-gray-600">({{ review.rating }}/5)</span>
                </div>
                
                <!-- Отзыв и дата -->
                <div class="mt-[20px]">
                    <div class="flex justify-between items-center">
                        <div class="font-medium text-normal">Отзыв</div>
                        <div class="text-sm">{{ formatDate(review.created_at) }}</div>
                    </div>
                    <div class="font-medium text-normal mt-2">
                        {{ review.comment || 'Комментарий не оставлен' }}
                    </div>
                </div>

                <!-- Изображения отзыва -->
                <div v-if="review.image_urls && review.image_urls.length > 0" class="mt-4">
                    <div class="font-medium text-sm mb-2">Фотографии:</div>
                    <div class="flex gap-2 flex-wrap">
                        <img 
                            v-for="(imageUrl, index) in review.image_urls" 
                            :key="index"
                            :src="imageUrl"
                            :alt="`Фото отзыва ${index + 1}`"
                            class="w-20 h-20 object-cover rounded-lg border"
                            @error="$event.target.style.display = 'none'"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Пустое состояние -->
        <div v-else class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px] text-center">
            <div class="text-gray-500">
                <div class="text-lg font-medium mb-2">Пока нет отзывов</div>
                <div class="text-sm">Отзывы будут отображаться здесь после получения от клиентов</div>
            </div>
        </div>
    </NuxtLayout>
</template>

<style lang=scss scoped>

</style>