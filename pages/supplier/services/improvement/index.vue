<script setup>
import { getProducts } from '~/services/supplier'

const props = defineProps({
    value: {
        type: Number,
        default: 0,
    },

    totalStars: {
        type: Number,
        default: 5,
    },
});

// Состояние для хранения данных
const products = ref([])
const loading = ref(true)
const error = ref(null)

// Функция для получения данных товаров/услуг требующих доработки
const fetchProducts = async () => {
    try {
        loading.value = true
        const response = await getProducts({ status: 'requires_fix' })
        products.value = response.data || []
    } catch (err) {
        error.value = err
        console.error('Ошибка при загрузке продуктов требующих доработки:', err)
    } finally {
        loading.value = false
    }
}

// Загружаем данные при монтировании компонента
onMounted(() => {
    fetchProducts()
})

function getStarClass(n) {
    if (props.value >= n) return "full";
    if (props.value >= n - 0.5 && props.value < n) return "half";
    return "empty";
}

// Функция для форматирования цены
const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price)
}

// Функция для получения URL изображения
const getImageUrl = (imageUrls) => {
    if (imageUrls && imageUrls.length > 0) {
        return imageUrls[0]
    }
    return '/images/test-card-image.jpg' // fallback изображение
}

// Функция для форматирования даты
const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
}
</script>

<template>
    <NuxtLayout name="supplier">
        <div class="w-full h-[61px] pl-[20px] flex items-center bg-white rounded-[16px] text-lg font-semibold">
            Требует доработки
        </div>
        
        <!-- Лоадер -->
        <div v-if="loading" class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px] text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#224C4F] mx-auto"></div>
            <p class="mt-4 text-gray-600">Загрузка товаров и услуг требующих доработки...</p>
        </div>

        <!-- Ошибка -->
        <div v-if="error && !loading" class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px] text-center">
            <div class="text-red-500">
                <p>Ошибка при загрузке данных</p>
                <button @click="fetchProducts" class="mt-4 px-4 py-2 bg-[#224C4F] text-white rounded hover:bg-[#1a3a3d]">
                    Попробовать снова
                </button>
            </div>
        </div>

        <!-- Пустое состояние -->
        <div v-if="!loading && !error && products.length === 0" class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px] text-center">
            <p class="text-gray-600">У вас пока нет товаров и услуг требующих доработки</p>
        </div>

        <!-- Список товаров/услуг требующих доработки -->
        <div v-for="product in products" :key="product.id" class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px]">
            <div class="w-full flex gap-[20px]">
                <div class="min-w-[320px] w-[320px] rounded-lg overflow-hidden">
                    <img class="w-full h-full object-cover" :src="getImageUrl(product.image_urls)" :alt="product.name">
                </div>
                <div class="w-full">
                    <div class="flex justify-between items-start mb-[3px]">
                        <div>
                            <h3 class="font-medium text-lg">{{ product.name }}</h3>
                            <p class="text-sm text-[#939393]">{{ product.description }}</p>
                        </div>
                        <div class="font-medium text-xl">
                            от {{ formatPrice(product.price) }} ₸
                        </div>
                    </div>
                    <div>
                        <div class="flex space-x-1">
                            <template v-for="n in 5" :key="n">
                                <div class="relative text-2xl select-none">
                                    <span v-if="getStarClass(n) === 'half'" class="text-gray-300">★</span>
                                    <span 
                                        v-else :class="{
                                        'text-yellow-400': getStarClass(n) === 'full',
                                        'text-gray-300': getStarClass(n) === 'empty'
                                        }"
                                    >
                                        ★
                                    </span>
                                    <span
                                        v-if="getStarClass(n) === 'half'"
                                        class="absolute inset-0 overflow-hidden text-yellow-400"
                                        :style="{ width: '50%' }"
                                    >
                                        ★
                                    </span>
                                </div>
                            </template>
                        </div>
                        <div class="flex items-center gap-[10px] text-sm font-normal mb-[8px] text-[#5C5C5C] mt-[8px]">
                            <img src="/icons/calendar-icon.svg" alt="calendar-icon"> 
                            Срок выполнения: {{ product.service_time }} {{ product.service_time === '1' ? 'день' : 'дня/дней' }}
                        </div>
                        <div class="flex items-center gap-[10px] text-sm font-normal text-[#224C4F]">
                            <img src="/icons/geo-icon.svg" alt="geo-icon"> 
                            {{ product.country }}, {{ product.city }}
                        </div>
                    </div>
                    <div class="flex justify-between items-center mt-[40px]">
                        <div class="flex items-center gap-[10px] text-sm font-normal mb-[5px] text-[#5C5C5C]">
                            <img src="/icons/calendar-icon.svg" alt="calendar-icon"> 
                            Дата подачи: {{ formatDate(product.created_at) }}
                        </div>
                        <nuxt-link 
                            :to="`/supplier/services/add-service/${product.id}`" 
                            class="py-[8px] px-[16px] rounded-md bg-[#224C4F] text-white font-semibold hover:bg-[#1a3a3d] transition-colors"
                        >
                            Редактировать
                        </nuxt-link>
                    </div>
                </div>
            </div>
            <div class="bg-[#DC6E2926] p-[10px] rounded-md mt-[10px] flex items-center gap-3 text-base">
                <img src="/icons/attention-icon.svg" alt="icon"> 
                Услуга требует доработки, укажите точное описание и прикрепите фотографии
            </div>
        </div>
    </NuxtLayout>
</template>

<style lang=scss scoped>

</style>