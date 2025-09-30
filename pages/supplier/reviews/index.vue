<script setup>
import { getSupplierProductReviews, addReviewResponse, createReviewAppeal } from '~/services/supplier'
import Cookies from "js-cookie";
import {parseJwt} from "~/utils/parseJwt.js";

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

// Состояние пагинации
const currentPage = ref(1)
const pending = ref(false)

// Состояния для ответов на отзывы
const replyForms = ref({}) // Объект для хранения состояния формы для каждого отзыва
const replyTexts = ref({}) // Объект для хранения текста ответа для каждого отзыва
const sendingReply = ref({}) // Объект для отслеживания отправки ответа

// Состояния для обжалования отзывов
const appealForms = ref({}) // Объект для хранения состояния формы обжалования для каждого отзыва
const appealReasons = ref({}) // Объект для хранения причины обжалования для каждого отзыва
const sendingAppeal = ref({}) // Объект для отслеживания отправки обжалования

// Загружаем отзывы с сервера
const { data: reviews, refresh } = await useLazyAsyncData('supplier-reviews', async () => {
    pending.value = true
  const rawToken = Cookies.get('token');
  const token = parseJwt(rawToken);
    try {
        const response = await getSupplierProductReviews(token.phone, currentPage.value)
        return response.data || { items: [], total_pages: 0, total_count: 0, page: 1, limit: 10 }
    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error)
        return { items: [], total_pages: 0, total_count: 0, page: 1, limit: 10 }
    } finally {
        pending.value = false
    }
}, {
    watch: [currentPage]
})

// Функция изменения страницы
const changePage = (page) => {
    if (page >= 1 && page <= reviews.value?.total_pages) {
        currentPage.value = page
        refresh()
    }
}

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

// Функции для работы с ответами на отзывы
const toggleReplyForm = (reviewId) => {
    replyForms.value[reviewId] = !replyForms.value[reviewId]
    if (!replyForms.value[reviewId]) {
        // Очищаем текст при закрытии формы
        replyTexts.value[reviewId] = ''
    }
}

const cancelReply = (reviewId) => {
    replyForms.value[reviewId] = false
    replyTexts.value[reviewId] = ''
}

const submitReply = async (reviewId) => {
    const replyText = replyTexts.value[reviewId]
    
    if (!replyText || replyText.trim() === '') {
        alert('Пожалуйста, введите текст ответа')
        return
    }
    
    try {
        sendingReply.value[reviewId] = true
        
        await addReviewResponse(reviewId, replyText.trim())
        
        // Очищаем форму и закрываем её
        replyTexts.value[reviewId] = ''
        replyForms.value[reviewId] = false
        
        // Обновляем список отзывов
        await refresh()
        
        alert('Ответ успешно отправлен!')
        
    } catch (error) {
        console.error('Ошибка отправки ответа:', error)
        alert('Ошибка при отправке ответа. Попробуйте еще раз.')
    } finally {
        sendingReply.value[reviewId] = false
    }
}

// Функции для работы с обжалованием отзывов
const toggleAppealForm = (reviewId) => {
    appealForms.value[reviewId] = !appealForms.value[reviewId]
    if (!appealForms.value[reviewId]) {
        // Очищаем текст при закрытии формы
        appealReasons.value[reviewId] = ''
    }
}

const cancelAppeal = (reviewId) => {
    appealForms.value[reviewId] = false
    appealReasons.value[reviewId] = ''
}

const submitAppeal = async (reviewId) => {
    const reason = appealReasons.value[reviewId]
    
    if (!reason || reason.trim() === '') {
        alert('Пожалуйста, введите причину обжалования')
        return
    }
    
    try {
        sendingAppeal.value[reviewId] = true
        
        await createReviewAppeal({
            review_id: reviewId,
            reason: reason.trim()
        })
        
        // Очищаем форму и закрываем её
        appealReasons.value[reviewId] = ''
        appealForms.value[reviewId] = false
        
        // Обновляем список отзывов
        await refresh()
        
        alert('Обжалование успешно отправлено!')
        
    } catch (error) {
        console.error('Ошибка отправки обжалования:', error)
        alert('Ошибка при отправке обжалования. Попробуйте еще раз.')
    } finally {
        sendingAppeal.value[reviewId] = false
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
        <div v-else-if="reviews && reviews.items.length > 0">
            <div 
                v-for="(review, index) of reviews.items" 
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

                <!-- Блок ответов на отзыв -->
                <div class="mt-6 border-t pt-4">
                    <!-- Существующий ответ (если есть) -->
                    <div v-if="review.response" class="mb-4 p-4 bg-gray-50 rounded-lg">
                        <div class="flex justify-between items-center mb-2">
                            <div class="font-medium text-sm text-gray-700">Ваш ответ</div>
                            <div class="text-xs text-gray-500">{{ formatDate(review.response.created_at) }}</div>
                        </div>
                        <div class="text-sm">{{ review.response.comment }}</div>
                    </div>

                    <!-- Кнопки действий (показываются только если нет ответа) -->
                    <div v-if="!review.response && !replyForms[review.id] && !appealForms[review.id]" class="flex justify-end gap-2">
                        <button
                            v-if="review.is_moderated"
                            @click="toggleAppealForm(review.id)"
                            class="px-4 py-2 text-white text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                        >
                            Обжаловать
                        </button>
                        <button
                            @click="toggleReplyForm(review.id)"
                            class="px-4 py-2 text-white text-sm font-medium rounded-lg bg-[#224C4F] transition-colors"
                        >
                            Ответить
                        </button>
                    </div>

                    <!-- Форма ответа -->
                    <div v-if="!review.response && replyForms[review.id]" class="mt-4">
                        <div class="space-y-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Ваш ответ на отзыв
                                </label>
                                <textarea
                                    v-model="replyTexts[review.id]"
                                    placeholder="Введите ваш ответ..."
                                    rows="4"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    :disabled="sendingReply[review.id]"
                                ></textarea>
                            </div>
                            
                            <div class="flex justify-end gap-2">
                                <button
                                    @click="cancelReply(review.id)"
                                    :disabled="sendingReply[review.id]"
                                    class="px-4 py-2 text-gray-600 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Отменить
                                </button>
                                <button
                                    @click="submitReply(review.id)"
                                    :disabled="sendingReply[review.id] || !replyTexts[review.id] || replyTexts[review.id].trim() === ''"
                                    class="px-4 py-2 bg-[#224C4F] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <span v-if="sendingReply[review.id]" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    {{ sendingReply[review.id] ? 'Отправка...' : 'Отправить' }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Форма обжалования -->
                    <div v-if="appealForms[review.id]" class="mt-4">
                        <div class="space-y-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    Причина обжалования отзыва
                                </label>
                                <textarea
                                    v-model="appealReasons[review.id]"
                                    placeholder="Опишите причину обжалования отзыва..."
                                    rows="4"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                    :disabled="sendingAppeal[review.id]"
                                ></textarea>
                            </div>
                            
                            <div class="flex justify-end gap-2">
                                <button
                                    @click="cancelAppeal(review.id)"
                                    :disabled="sendingAppeal[review.id]"
                                    class="px-4 py-2 text-gray-600 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Отменить
                                </button>
                                <button
                                    @click="submitAppeal(review.id)"
                                    :disabled="sendingAppeal[review.id] || !appealReasons[review.id] || appealReasons[review.id].trim() === ''"
                                    class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <span v-if="sendingAppeal[review.id]" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    {{ sendingAppeal[review.id] ? 'Отправка...' : 'Отправить обжалование' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Пагинация -->
            <div 
                v-if="reviews && reviews.total_pages > 1"
                class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px]"
            >
                <div class="flex justify-between items-center">
                    <div class="text-sm text-gray-600">
                        Показано {{ Math.min(reviews.limit * (reviews.page - 1) + 1, reviews.total_count) }}-{{ Math.min(reviews.limit * reviews.page, reviews.total_count) }} из {{ reviews.total_count }} отзывов
                    </div>
                    
                    <div class="flex items-center gap-2">
                        <!-- Кнопка "Предыдущая" -->
                        <button
                            @click="changePage(currentPage - 1)"
                            :disabled="currentPage <= 1"
                            :class="[
                                'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                                currentPage <= 1 
                                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                                    : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
                            ]"
                        >
                            ← Предыдущая
                        </button>

                        <!-- Номера страниц -->
                        <div class="flex items-center gap-1">
                            <template v-for="page in Math.min(reviews.total_pages, 5)" :key="page">
                                <!-- Показываем первые 5 страниц или страницы вокруг текущей -->
                                <button
                                    v-if="reviews.total_pages <= 5 || 
                                           page <= 2 || 
                                           page >= reviews.total_pages - 1 || 
                                           Math.abs(page - currentPage) <= 1"
                                    @click="changePage(page)"
                                    :class="[
                                        'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                                        page === currentPage
                                            ? 'bg-blue-500 text-white'
                                            : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
                                    ]"
                                >
                                    {{ page }}
                                </button>
                                
                                <!-- Многоточие -->
                                <span 
                                    v-else-if="page === 3 && currentPage > 4"
                                    class="px-2 text-gray-500"
                                >
                                    ...
                                </span>
                            </template>
                        </div>

                        <!-- Кнопка "Следующая" -->
                        <button
                            @click="changePage(currentPage + 1)"
                            :disabled="currentPage >= reviews.total_pages"
                            :class="[
                                'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                                currentPage >= reviews.total_pages 
                                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                                    : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
                            ]"
                        >
                            Следующая →
                        </button>
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