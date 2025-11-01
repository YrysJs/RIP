<script setup>
import {
  getReviews,
  addReviewResponse,
  createReviewAppeal,
  getSupplierInfo
} from '~/services/supplier'

// Применяем middleware для проверки авторизации поставщика
definePageMeta({
  middleware: 'supplier'
})

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

// Реактивные данные для отзывов
const reviews = ref({ items: [], total_pages: 0, total_count: 0, page: 1, limit: 10 })

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

// Функция загрузки отзывов
const loadReviews = async () => {
    pending.value = true
    console.log(t('supplier.reviews.loading'))
    
    try {

        const response = await getReviews(currentPage.value)
        console.log(t('supplier.reviews.loaded'), response)
        
        if (!response?.data) {
            console.warn(t('supplier.reviews.emptyResponse'))
            reviews.value = { items: [], total_pages: 0, total_count: 0, page: 1, limit: 10 }
        } else {
            reviews.value = response.data
        }
        
    } catch (error) {
        console.error(t('errors.fetchError'), error)
        // Показываем пользователю более информативную ошибку
        if (error.response?.status === 401) {
            console.error('Ошибка авторизации - перенаправление на главную')
            await navigateTo('/')
        } else if (error.response?.status === 403) {
            console.error('Нет доступа к отзывам')
        }
        reviews.value = { items: [], total_pages: 0, total_count: 0, page: 1, limit: 10 }
    } finally {
        pending.value = false
    }
}

// Функция обновления (аналог refresh)
const refresh = () => {
    loadReviews()
}

// Загружаем отзывы при монтировании компонента
onMounted(() => {
    console.log('Компонент отзывов поставщика смонтирован')
    loadReviews()
})

// Следим за изменением страницы и перезагружаем данные
watch(currentPage, () => {
    console.log('Изменилась страница на:', currentPage.value)
    loadReviews()
})

// Функция изменения страницы
const changePage = (page) => {
    if (page >= 1 && page <= reviews.value?.total_pages) {
        currentPage.value = page
        // loadReviews() будет вызван автоматически через watcher
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
        const { $toast } = useNuxtApp();
        $toast.warning(t('review.replyRequired'));
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
        
        const { $toast } = useNuxtApp();
        $toast.success(t('review.replySent'));
        
    } catch (error) {
        console.error('Ошибка отправки ответа:', error)
        const { $toast } = useNuxtApp();
        $toast.error(t('review.replyError'));
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
        const { $toast } = useNuxtApp();
        $toast.warning(t('review.appealReasonRequired'));
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
        
        const { $toast } = useNuxtApp();
        $toast.success(t('review.appealSent'));
        
    } catch (error) {
        console.error('Ошибка отправки обжалования:', error)
        const { $toast } = useNuxtApp();
        $toast.error(t('review.appealError'));
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
            <div>{{ $t('supplierReviews.loading') }}</div>
        </div>

        <!-- Список отзывов -->
        <div v-else-if="reviews && reviews.items.length > 0">
            <div 
                v-for="(review, index) of reviews.items" 
                :key="review.id"
                class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px]"
            >
                <div class="flex justify-between items-center">
                    <div class="font-medium text-lg">{{ $t('supplierReviews.reviewNumber') }}{{ review.id }}</div>
                    <div class="flex items-center gap-[20px]">
                        <span class="text-sm">{{ $t('supplierReviews.productId') }}{{ review.product_id }}</span>
                        <span 
                            v-if="review.moderation_status === 'approved'"
                            class="text-sm p-1 rounded-md text-white font-medium bg-[#339B38]"
                        >
                            {{ $t('supplierReviews.approved') }}
                        </span>
                        <span 
                            v-else-if="review.moderation_status === 'rejected'"
                            class="text-sm p-1 rounded-md text-white font-medium bg-red-500"
                        >
                            {{ $t('supplierReviews.rejected') }}
                        </span>
                        <span 
                            v-else
                            class="text-sm p-1 rounded-md text-white font-medium bg-orange-500"
                        >
                            {{ $t('supplierReviews.onModeration') }}
                        </span>
                    </div>
                </div>
                
                <div class="my-[32px]">
                    <div class="flex text-sm">
                        <p class="min-w-[150px]">{{ $t('supplierReviews.client') }}</p>
                        <p>{{ review.user_phone || $t('supplierReviews.notSpecified') }}</p>
                    </div>
                    <div class="flex text-sm">
                        <p class="min-w-[150px]">{{ $t('supplierReviews.supplier') }}</p>
                        <p>{{ review.supplier_phone || $t('supplierReviews.notSpecified') }}</p>
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
                        <div class="font-medium text-normal">{{ $t('supplierReviews.review') }}</div>
                        <div class="text-sm">{{ formatDate(review.created_at) }}</div>
                    </div>
                    <div class="font-medium text-normal mt-2">
                        {{ review.comment || $t('supplierReviews.commentNotLeft') }}
                    </div>
                </div>

                <!-- Изображения отзыва -->
                <div v-if="review.image_urls && review.image_urls.length > 0" class="mt-4">
                    <div class="font-medium text-sm mb-2">{{ $t('supplierReviews.photos') }}</div>
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
                            <div class="font-medium text-sm text-gray-700">{{ $t('supplierReviews.yourResponse') }}</div>
                            <div class="text-xs text-gray-500">{{ formatDate(review.response.created_at) }}</div>
                        </div>
                        <div class="text-sm">{{ review.response.comment }}</div>
                    </div>

                    <!-- Кнопки действий (показываются только если нет ответа) -->
                    <div v-if="!review.response && !replyForms[review.id] && !appealForms[review.id]" class="flex justify-end gap-2">
                        <button
                            v-if="review.moderation_status === 'approved'"
                            @click="toggleAppealForm(review.id)"
                            class="px-4 py-2 text-white text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                        >
                            {{ $t('supplierReviews.appeal') }}
                        </button>
                        <button
                            @click="toggleReplyForm(review.id)"
                            class="px-4 py-2 text-white text-sm font-medium rounded-lg bg-[#224C4F] transition-colors"
                        >
                            {{ $t('supplierReviews.reply') }}
                        </button>
                    </div>

                    <!-- Форма ответа -->
                    <div v-if="!review.response && replyForms[review.id]" class="mt-4">
                        <div class="space-y-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    {{ $t('supplierReviews.yourReply') }}
                                </label>
                                <textarea
                                    v-model="replyTexts[review.id]"
                                    :placeholder="$t('supplierReviews.replyPlaceholder')"
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
                                    {{ $t('supplierReviews.cancel') }}
                                </button>
                                <button
                                    @click="submitReply(review.id)"
                                    :disabled="sendingReply[review.id] || !replyTexts[review.id] || replyTexts[review.id].trim() === ''"
                                    class="px-4 py-2 bg-[#224C4F] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <span v-if="sendingReply[review.id]" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    {{ sendingReply[review.id] ? $t('supplierReviews.sending') : $t('supplierReviews.send') }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Форма обжалования -->
                    <div v-if="appealForms[review.id]" class="mt-4">
                        <div class="space-y-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">
                                    {{ $t('supplierReviews.appealReason') }}
                                </label>
                                <textarea
                                    v-model="appealReasons[review.id]"
                                    :placeholder="$t('supplierReviews.appealPlaceholder')"
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
                                    {{ $t('supplierReviews.cancel') }}
                                </button>
                                <button
                                    @click="submitAppeal(review.id)"
                                    :disabled="sendingAppeal[review.id] || !appealReasons[review.id] || appealReasons[review.id].trim() === ''"
                                    class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <span v-if="sendingAppeal[review.id]" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    {{ sendingAppeal[review.id] ? $t('supplierReviews.sending') : $t('supplierReviews.sendAppeal') }}
                                </button>
                            </div>
                        </div>
                    </div>

                  <div v-if="review.appeal" class="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div class="flex justify-between items-center mb-2">
                      <div class="font-medium text-sm text-gray-700">{{ $t('supplierReviews.appeals') }}</div>
                      <div class="text-xs text-gray-500">{{ formatDate(review.appeal.created_at) }}</div>
                    </div>
                    <div class="text-sm">{{ review.appeal.reason }}</div>
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
                        {{ $t('supplierReviews.shownReviews') }} {{ Math.min(reviews.limit * (reviews.page - 1) + 1, reviews.total_count) }}-{{ Math.min(reviews.limit * reviews.page, reviews.total_count) }} {{ $t('supplierReviews.ofReviews') }} {{ reviews.total_count }} {{ $t('supplierReviews.reviews') }}
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
                            {{ $t('supplierReviews.previous') }}
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
                            {{ $t('supplierReviews.next') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Пустое состояние -->
        <div v-else class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px] text-center">
            <div class="text-gray-500">
                <div class="text-lg font-medium mb-2">{{ $t('supplierReviews.noReviews') }}</div>
                <div class="text-sm">{{ $t('supplierReviews.reviewsWillAppear') }}</div>
            </div>
        </div>
    </NuxtLayout>
</template>

<style lang=scss scoped>
/* Мобильные стили */
@media (max-width: 768px) {
  :global(.supplier-reviews-page) {
    background: #F8F5F0 !important;
  }

  :global(.supplier-reviews-page .supplier) {
    background: #F8F5F0 !important;
  }

  /* Исправляем смещение контента */
  :global(.supplier-reviews-page .supplier .container) {
    margin: 0 !important;
    padding: 0 !important;
    max-width: 100% !important;
  }

  :global(.supplier-reviews-page .supplier .main-content) {
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Заголовок */
  .w-full.h-\[61px\] {
    margin: 0 16px 16px;
    padding: 16px;
    border-radius: 12px;
    font-size: 18px;
    font-weight: 600;
    font-family: "FoglihtenNo06", serif;
    color: #2E1E17;
    background: #FDFCF9;
    box-shadow: 0 2px 8px rgba(46, 30, 23, 0.08);
    border: 1px solid #E0DED9;
  }

  /* Карточки отзывов */
  .w-full.bg-white.rounded-\[16px\] {
    margin: 0 16px 16px;
    padding: 20px;
    border-radius: 12px;
    background: #FDFCF9 !important;
    box-shadow: 0 2px 8px rgba(46, 30, 23, 0.08);
    border: 1px solid #E0DED9;
  }

  /* Заголовок отзыва */
  .flex.justify-between.items-center {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .font-medium.text-lg {
    font-size: 18px;
    font-weight: 700;
    color: #2E1E17;
    font-family: "FoglihtenNo06", serif;
  }

  .flex.items-center.gap-\[20px\] {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .text-sm {
    font-size: 12px;
  }

  /* Информация о клиенте */
  .my-\[32px\] {
    margin: 16px 0;
  }

  .flex.text-sm {
    flex-direction: column;
    gap: 4px;
    margin-bottom: 8px;
    position: relative;
  }

  .flex.text-sm:not(:last-child)::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    right: 0;
    height: 1px;
    background: #E0DED9;
  }

  .min-w-\[150px\] {
    min-width: auto;
    font-weight: 500;
    color: #A09B95;
    font-size: 13px;
  }

  /* Звезды рейтинга */
  .flex.space-x-1 {
    gap: 2px;
  }

  .relative.text-2xl {
    font-size: 20px;
  }

  .ml-2.text-sm {
    margin-left: 8px;
    font-size: 12px;
  }

  /* Отзыв и дата */
  .mt-\[20px\] {
    margin-top: 16px;
  }

  .flex.justify-between.items-center {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .font-medium.text-normal {
    font-size: 14px;
    font-weight: 500;
    color: #2E1E17;
    line-height: 1.4;
  }

  .text-sm {
    font-size: 12px;
    color: #6B7280;
  }

  /* Фотографии */
  .mt-4 {
    margin-top: 12px;
  }

  .flex.gap-2.flex-wrap {
    gap: 8px;
  }

  .w-20.h-20 {
    width: 60px;
    height: 60px;
  }

  /* Блок ответов */
  .mt-6.border-t.pt-4 {
    margin-top: 16px;
    padding-top: 16px;
  }

  .mb-4.p-4 {
    margin-bottom: 12px;
    padding: 12px;
  }

  .flex.justify-between.items-center.mb-2 {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .font-medium.text-sm {
    font-size: 13px;
    font-weight: 600;
  }

  .text-xs {
    font-size: 11px;
  }

  /* Кнопки действий */
  .flex.justify-end.gap-2 {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  .px-4.py-2 {
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 8px;
    width: 100%;
  }

  /* Формы */
  .mt-4 {
    margin-top: 12px;
  }

  .space-y-3 {
    gap: 12px;
  }

  .block.text-sm.font-medium {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .w-full.px-3.py-2 {
    padding: 12px;
    font-size: 14px;
    border-radius: 8px;
  }

  .flex.justify-end.gap-2 {
    flex-direction: column;
    gap: 8px;
  }

  /* Пагинация */
  .flex.justify-between.items-center {
    flex-direction: column;
    gap: 12px;
  }

  .text-sm.text-gray-600 {
    font-size: 12px;
    text-align: center;
  }

  .flex.items-center.gap-2 {
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .flex.items-center.gap-1 {
    gap: 4px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .px-3.py-2 {
    padding: 8px 12px;
    font-size: 12px;
    border-radius: 6px;
  }

  /* Пустое состояние */
  .text-gray-500 {
    padding: 20px;
  }

  .text-lg.font-medium {
    font-size: 16px;
    font-weight: 600;
  }

  .text-sm {
    font-size: 13px;
  }
}

/* Веб-версия заголовка */
.w-full.h-\[61px\] {
  font-family: "FoglihtenNo06", serif;
  color: #2E1E17;
}
</style>