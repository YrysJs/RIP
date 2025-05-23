<script setup>
import { ref, watch, onMounted } from 'vue';
import LayoutTop from '~/components/layout/LayoutTop.vue';
import { getAllProducts, getCategories } from '~/services/supplier';

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

// Реактивные данные для фильтров
const filters = ref({
    category_id: null,
    type: null,
    min_price: null,
    max_price: null,
    city: 'Алматы',
    search: ''
});

// Данные продуктов и категорий
const products = ref([]);
const categories = ref([]);
const loading = ref(false);

// Функция для форматирования цены
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU').format(price);
}

// Функция для получения URL изображения
function getImageUrl(product) {
    if (product.image_urls && product.image_urls.length > 0) {
        // Если это полный URL
        if (product.image_urls[0].startsWith('http')) {
            return product.image_urls[0];
        }
        // Если это относительный путь
        return product.image_urls[0];
    }
    return '/images/client/banner.jpg';
}

// Функция для получения класса звездочки
function getStarClass(n) {
    if (props.value >= n) return "full";
    if (props.value >= n - 0.5 && props.value < n) return "half";
    return "empty";
}

// Функция для загрузки продуктов с фильтрами
async function fetchProducts() {
    try {
        loading.value = true;
        const params = {};
        
        if (filters.value.category_id) params.category_id = filters.value.category_id;
        if (filters.value.type) params.type = filters.value.type;
        if (filters.value.min_price) params.min_price = filters.value.min_price;
        if (filters.value.max_price) params.max_price = filters.value.max_price;
        if (filters.value.city) params.city = filters.value.city;
        if (filters.value.search) params.search = filters.value.search;
        
        console.log('Запрос продуктов с параметрами:', params);
        const response = await getAllProducts(params);
        console.log('Ответ API продуктов:', response.data);
        
        // Обновляем для правильной структуры ответа API
        products.value = response.data?.items || [];
        console.log('Загружено продуктов:', products.value.length);
    } catch (error) {
        console.error('Ошибка при загрузке продуктов:', error);
        products.value = [];
    } finally {
        loading.value = false;
    }
}

// Функция для загрузки категорий
async function fetchCategories() {
    try {
        const response = await getCategories();
        console.log('Ответ API категорий:', response.data);
        
        // Предполагаем, что категории также могут быть в items
        categories.value = response.data?.items || response.data || [];
        console.log('Загружено категорий:', categories.value.length);
    } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
        categories.value = [];
    }
}

// Загружаем данные при монтировании компонента
onMounted(async () => {
    await fetchCategories();
    await fetchProducts();
});

// Следим за изменениями фильтров
watch(() => [filters.value.category_id, filters.value.type, filters.value.min_price, filters.value.max_price, filters.value.city], () => {
    fetchProducts();
});

// Отдельный watch для поиска с debounce
let searchTimeout = null;
watch(() => filters.value.search, (newSearch) => {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    searchTimeout = setTimeout(() => {
        fetchProducts();
    }, 500); // задержка 500ms
});

// Функция для сброса цен
function updatePriceRange(event) {
    const value = parseInt(event.target.value);
    filters.value.max_price = value;
}
</script>

<template>
    <div class="bg-[#FAFAFA] py-[20px]">
        <div class="container">
            <LayoutTop title="Заказать услуги и товары" :hide="true"/>
            <div class="flex justify-between items-start mt-[20px]">
                <div class="max-w-[376px] w-full">
                    <!-- Выбор города -->
                    <div class="py-[13px] px-[20px] bg-white rounded-lg flex gap-[15px] text-base font-roboto">
                        <span>Город:</span> 
                        <select v-model="filters.city" id="" name="" placeholder="Город" class="bg-transparent border-none outline-none">
                            <option value="Алматы">Алматы</option>
                            <option value="Астана">Астана</option>
                            <option value="Шымкент">Шымкент</option>
                            <option value="Тараз">Тараз</option>
                        </select>
                    </div>
                    
                    <!-- Фильтры по категориям -->
                    <div class="p-[20px] bg-white rounded-lg mt-[20px]">
                        <h3 class="text-xl font-bold text-[#222222]">Фильтры</h3>
                        <div class="mt-[40px]">
                            <h4 class="text-base font-bold font-roboto text-[#222222]">Категория</h4>
                            <div class="flex flex-col gap-[16px] mt-[20px]">
                                <div v-for="category in categories" :key="category.id" class="flex justify-between items-center">
                                    <div class="flex justify-between items-center gap-[12px] text-base font-roboto">
                                        <input 
                                            type="radio" 
                                            :value="category.id" 
                                            v-model="filters.category_id"
                                            :id="`category-${category.id}`"
                                        > 
                                        <label :for="`category-${category.id}`">{{ category.name }}</label>
                                    </div>
                                </div>
                                <!-- Кнопка для сброса фильтра -->
                                <div class="flex justify-between items-center">
                                    <div class="flex justify-between items-center gap-[12px] text-base font-roboto">
                                        <input 
                                            type="radio" 
                                            :value="null" 
                                            v-model="filters.category_id"
                                            id="category-all"
                                        > 
                                        <label for="category-all">Все категории</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Фильтр по типу -->
                    <div class="p-[20px] bg-white rounded-lg mt-[20px]">
                        <h3 class="text-xl font-bold text-[#222222]">Тип</h3>
                        <div class="mt-[40px]">
                            <div class="flex flex-col gap-[16px] mt-[20px]">
                                <div class="flex justify-between items-center">
                                    <div class="flex justify-between items-center gap-[12px] text-base font-roboto">
                                        <input type="radio" value="service" v-model="filters.type" id="type-service"> 
                                        <label for="type-service">Услуги</label>
                                    </div>
                                </div>
                                <div class="flex justify-between items-center">
                                    <div class="flex justify-between items-center gap-[12px] text-base font-roboto">
                                        <input type="radio" value="product" v-model="filters.type" id="type-product"> 
                                        <label for="type-product">Товары</label>
                                    </div>
                                </div>
                                <div class="flex justify-between items-center">
                                    <div class="flex justify-between items-center gap-[12px] text-base font-roboto">
                                        <input type="radio" :value="null" v-model="filters.type" id="type-all"> 
                                        <label for="type-all">Все</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Фильтр по цене -->
                    <div class="p-[20px] bg-white rounded-lg mt-[20px]">
                        <h3 class="text-xl font-bold text-[#222222] mb-[20px]">Цена</h3>
                        <div class="mb-[20px]">
                            <div class="flex gap-[10px] mb-[10px]">
                                <input 
                                    type="number" 
                                    v-model="filters.min_price" 
                                    placeholder="От" 
                                    class="w-full p-[8px] border border-gray-300 rounded"
                                >
                                <input 
                                    type="number" 
                                    v-model="filters.max_price" 
                                    placeholder="До" 
                                    class="w-full p-[8px] border border-gray-300 rounded"
                                >
                            </div>
                        </div>
                        <div class="relative font-semibold text-base">
                            <div class="absolute bottom-[-25px] left-0">0</div>
                            <input 
                                type="range" 
                                class="w-full" 
                                min="0" 
                                max="750000" 
                                step="1000"
                                @input="updatePriceRange"
                            >
                            <div class="absolute bottom-[-25px] right-0">750000</div>
                        </div>
                    </div>
                </div>
                
                <!-- Область с продуктами -->
                <div class="max-w-[770px] w-full mt-[20px]">
                    <!-- Поиск -->
                    <div class="w-full bg-white border-1 border-[#EEEEEE] h-[44px] relative">
                        <img class="absolute top-[10px] left-[15px]" src="/icons/search.svg" alt=""> 
                        <input 
                            class="bg-transparent w-full h-full pl-[45px]" 
                            type="text" 
                            placeholder="Поиск"
                            v-model="filters.search"
                        >
                    </div>
                    
                    <!-- Загрузка -->
                    <div v-if="loading" class="flex justify-center items-center py-[40px]">
                        <div class="text-lg">Загрузка...</div>
                    </div>
                    
                    <!-- Список продуктов -->
                    <div v-else class="flex flex-wrap gap-[18px]">
                        <div v-for="product in products" :key="product.id" class="p-[9px] rounded-lg max-w-[376px] w-full bg-white">
                            <div>
                                <img 
                                    class="rounded-lg overflow-hidden w-full h-[189px] object-cover" 
                                    :src="getImageUrl(product)" 
                                    :alt="product.name"
                                >
                                <h3 class="text-lg font-roboto font-medium text-[#222222] mt-[10px]">{{ product.name }}</h3>
                                <h4 class="text-2xl font-roboto font-medium text-[#222222] mb-[4px]">{{ formatPrice(product.price) }} ₸</h4>
                                <div class="flex items-center mb-[4px]">
                                    <div class="flex space-x-1">
                                        <template v-for="n in totalStars" :key="n">
                                            <div class="relative text-2xl select-none">
                                                <span v-if="getStarClass(n) === 'half'" class="text-gray-300">★</span>
                                                <span 
                                                    v-else :class="{
                                                    'text-orange-400': getStarClass(n) === 'full',
                                                    'text-gray-300': getStarClass(n) === 'empty'
                                                    }"
                                                >
                                                    ★
                                                </span>
                                                <span
                                                    v-if="getStarClass(n) === 'half'"
                                                    class="absolute inset-0 overflow-hidden text-orange-400"
                                                    :style="{ width: '50%' }"
                                                >
                                                    ★
                                                </span>
                                            </div>
                                        </template>
                                    </div>
                                    <span class="font-roboto text-sm text-[#38949B]">({{ product.reviews_count || 0 }} отзывов)</span>
                                </div>
                                <div v-if="product.service_time" class="flex gap-[12px] text-sm font-roboto text-[#5C5C5C] mb-[4px]">
                                    <img src="/icons/calendar-icon.svg" alt=""> 
                                    <span>Срок выполнения: {{ product.service_time }}</span>
                                </div>
                                
                                <!-- Дополнительная информация -->
                                <div class="flex flex-col gap-[4px] text-sm font-roboto text-[#5C5C5C] mb-[4px]">
                                    <div v-if="product.country && product.city" class="flex gap-[12px]">
                                        <img src="/icons/map-pin.svg" alt=""> 
                                        <span>{{ product.country }}, {{ product.city }}</span>
                                    </div>
                                    <div v-if="product.type" class="flex gap-[12px]">
                                        <span class="font-medium">Тип: {{ product.type === 'service' ? 'Услуга' : 'Товар' }}</span>
                                    </div>
                                </div>
                                <div class="flex gap-[10px] mt-[10px]">
                                    <button class="w-[50%] text-sm rounded-lg bg-[#224C4F26] text-[#224C4F] py-[8px] font-semibold">Подробнее</button>
                                    <button class="w-[50%] text-sm rounded-lg bg-[#224C4F] text-white py-[8px] font-semibold">Добавить</button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Сообщение, если нет продуктов -->
                        <div v-if="!loading && products.length === 0" class="w-full text-center py-[40px]">
                            <p class="text-lg text-gray-500">Продукты не найдены</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
</template>

<style lang="css" scoped>
.container {
    max-width: 1170px;
    width: 100%;
    margin: auto;
}
.card {
    box-shadow: 0px 4px 10px -5px #000;
}
</style>