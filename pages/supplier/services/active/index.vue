<script setup>
import { getProducts, updateProductStatus } from '~/services/supplier'

const props = defineProps({
    value: {
        type: Number,
        default: 4.5,
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

// Функция для получения данных
const fetchProducts = async () => {
    try {
        loading.value = true
        const response = await getProducts({ status: 'active' })
        products.value = response.data || []
    } catch (err) {
        error.value = err
        console.error('Ошибка при загрузке продуктов:', err)
    } finally {
        loading.value = false
    }
}

// Функция для деактивации товара/услуги
const deactivateProduct = async (productId) => {
    try {
        const response = await updateProductStatus(productId, 'inactive')
        
        if (response.data?.status === 'ok' || response.status === 200) {
            if (products.value?.items) {
                products.value.items = products.value.items.filter(product => product.id !== productId)
            }
            alert('Товар/услуга успешно деактивирован')
        } else {
            if (products.value?.items) {
                products.value.items = products.value.items.filter(product => product.id !== productId)
            }
            alert('Товар/услуга успешно деактивирован')
        }
    } catch (err) {
        if (err.response?.status === 200 || err.response?.data?.status === 'ok') {
            if (products.value?.items) {
                products.value.items = products.value.items.filter(product => product.id !== productId)
            }
            alert('Товар/услуга успешно деактивирован')
        } else {
            alert('Ошибка при деактивации товара/услуги')
        }
    }
}

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
    return '/images/test-card-car.jpg' // fallback изображение
}
</script>

<template>
    <NuxtLayout name="supplier">
        <div class="w-full h-[61px] pl-[20px] flex items-center bg-white rounded-[16px] text-lg font-semibold">
            Активные товары и услуги
        </div>
        
        <!-- Лоадер -->
        <div v-if="loading" class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px] text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#224C4F] mx-auto"></div>
            <p class="mt-4 text-gray-600">Загрузка товаров и услуг...</p>
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
            <p class="text-gray-600">У вас пока нет активных товаров и услуг</p>
        </div>

        <!-- Список товаров/услуг -->
        <div v-for="product in products.items" :key="product.id" class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px]">
            <div class="w-full flex gap-[20px]">
                <div class="min-w-[320px] max-w-[320px] max-h-[260px] rounded-lg overflow-hidden">
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
                        <div class="flex items-center space-x-1">
                            <template v-for="n in 5" :key="n">
                                <div class="relative text-2xl select-none">
                                    <span v-if="getStarClass(5) === 'half'" class="text-gray-300">★</span>
                                    <!-- <span 
                                        v-else :class="{
                                        'text-yellow-400': getStarClass(0) === 'full',
                                        'text-gray-300': getStarClass(0) === 'empty'
                                        }"
                                    >
                                        ★
                                    </span>
                                    <span
                                        v-if="getStarClass(0) === 'half'"
                                        class="absolute inset-0 overflow-hidden text-yellow-400"
                                        :style="{ width: '50%' }"
                                    >
                                        ★
                                    </span> -->
                                </div>
                            </template>
                            <span class="text-[#38949B]">(0 отзыва)</span>
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
                    <div class="flex justify-end gap-[10px] items-center mt-[40px]">
                        <button 
                            @click="deactivateProduct(product.id)"
                            class="py-[8px] px-[16px] rounded-md bg-[#D63C3C26] text-[#D63C3C] font-semibold hover:bg-[#D63C3C33] transition-colors"
                        >
                            Деактивировать
                        </button>
                        <nuxt-link 
                            :to="`/supplier/services/add-service/${product.id}`" 
                            class="py-[8px] px-[16px] rounded-md bg-[#224C4F] text-white font-semibold hover:bg-[#1a3a3d] transition-colors"
                        >
                            Редактировать
                        </nuxt-link>
                    </div>
                </div>
            </div>
        </div>
    </NuxtLayout>
</template>

<style lang=scss scoped>

</style>