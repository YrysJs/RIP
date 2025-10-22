<script setup>
import { ref, watch, onMounted } from "vue";
import LayoutTop from "~/components/layout/LayoutTop.vue";
import { getAllProducts, getCategories } from "~/services/supplier";
import {
  addToCart,
  getCart,
  getProductById,
  getProductReviews,
} from "~/services/client";
import { getSupplier } from "~/services/login";
import ServiceDetailModal from "~/components/layout/modals/ServiceDetailModal.vue";
import DeliveryModal from "~/components/layout/modals/DeliveryModal.vue";
import AppHeader from "~/components/layout/AppHeader.vue";
import { useAuthModalStore } from "~/store/authModal";
import Cookies from "js-cookie";
import AppHeaderClient from "~/components/layout/AppHeaderClient.vue";
import MobileFooter from "~/components/layout/MobileFooter.vue";

const serviceDetailModalVisible = ref(false);
const deliveryModalVisible = ref(false);
const selectedProductId = ref(null);

const serviceDelivery = ref({});
const serviceReviews = ref([]);
const serviceSupplier = ref({});

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
  max_price: 0,
  city: "Алматы",
  search: "",
});

// Данные продуктов и категорий
const products = ref([]);
const categories = ref([]);
const loading = ref(false);
const addingToCart = ref(false);
const cartMessage = ref("");
const cartItems = ref([]);

// Состояние пагинации
const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);
const itemsPerPage = ref(10);

const token = ref(Cookies.get("token"));
const router = useRouter();
const authModalStore = useAuthModalStore();

// Функция для форматирования цены
function formatPrice(price) {
  return new Intl.NumberFormat("ru-RU").format(price);
}

const fetchProduct = async (id) => {
  try {
    const response = await getProductById(id);
    serviceDelivery.value = response.data;
    const reviews = await getProductReviews(id);
    serviceReviews.value = reviews.data.items;
    const supplierRes = await getSupplier({
      phone: serviceDelivery.value.supplier_phone,
    });
    serviceSupplier.value = supplierRes.data;
  } catch (error) {
    console.error("Ошибка при услуги:", error);
    const { $toast } = useNuxtApp();
    $toast.error("Сервер не доступен");
  } finally {
    serviceDetailModalVisible.value = true;
  }
};

// Функция для получения URL изображения
function getImageUrl(product) {
  if (product.image_urls && product.image_urls.length > 0) {
    // Если это полный URL
    if (product.image_urls[0].startsWith("http")) {
      return product.image_urls[0];
    }
    // Если это относительный путь
    return product.image_urls[0];
  }
  return "/images/client/banner.jpg";
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
    const params = {
      page: currentPage.value,
      limit: itemsPerPage.value
    };

    if (filters.value.category_id)
      params.category_id = filters.value.category_id;
    if (filters.value.type) params.type = filters.value.type;
    if (filters.value.min_price) params.min_price = filters.value.min_price;
    if (filters.value.max_price) params.max_price = filters.value.max_price;
    if (filters.value.city) params.city = filters.value.city;
    if (filters.value.search) params.search = filters.value.search;

    const response = await getAllProducts(params);

    // Обновляем для правильной структуры ответа API
    products.value = response.data?.items || [];
    
    // Обновляем данные пагинации
    totalItems.value = response.data?.total || 0;
    totalPages.value = response.data?.total_pages || 1;
    
    console.log("Загружено продуктов:", products.value.length);
    console.log("Пагинация:", {
      currentPage: currentPage.value,
      totalPages: totalPages.value,
      totalItems: totalItems.value
    });
  } catch (error) {
    console.error("Ошибка при загрузке продуктов:", error);
    const { $toast } = useNuxtApp();
    $toast.error("Сервер не доступен");
    products.value = [];
  } finally {
    loading.value = false;
  }
}

// Функция для загрузки категорий
async function fetchCategories() {
  try {
    const response = await getCategories();
    console.log("Ответ API категорий:", response.data);

    // Предполагаем, что категории также могут быть в items
    categories.value = response.data?.items || response.data || [];
    console.log("Загружено категорий:", categories.value.length);
  } catch (error) {
    console.error("Ошибка при загрузке категорий:", error);
    const { $toast } = useNuxtApp();
    $toast.error("Сервер не доступен");
    categories.value = [];
  }
}

const loadCart = async () => {
  try {
    const response = await getCart();
    cartItems.value = response.data || [];
    console.log("Cart loaded:", cartItems.value);
  } catch (err) {
    console.error("Ошибка при загрузке корзины:", err);
    const { $toast } = useNuxtApp();
    $toast.error("Сервер не доступен");
  }
};

const addProductToCart = async (productId) => {
  if (token.value) {
    selectedProductId.value = productId;
    deliveryModalVisible.value = true;
  } else {
    authModalStore.openLoginMenu();
  }
};

const handleDeliveryConfirm = async (deliveryData) => {
  addingToCart.value = true;
  cartMessage.value = "";
  deliveryModalVisible.value = false;

  try {
    // Формируем дату и время доставки в нужном формате
    const deliveryDateTime = `${deliveryData.date}T${deliveryData.time}:00Z`;

    const cartData = {
      delivery_arrival_time: deliveryDateTime,
      delivery_destination_address: deliveryData.address,
      product_id: selectedProductId.value,
      quantity: 1,
    };

    await addToCart(cartData);
    cartMessage.value = "Товар добавлен в корзину";
    await loadCart(); // Перезагружаем корзину
    await router.push("/client/tickets/burial/add-service");
    setTimeout(() => {
      cartMessage.value = "";
    }, 3000);
  } catch (err) {
    cartMessage.value = "Ошибка при добавлении товара";
    console.error("Ошибка при добавлении в корзину:", err);
    const { $toast } = useNuxtApp();
    $toast.error("Сервер не доступен");
  } finally {
    addingToCart.value = false;
    selectedProductId.value = null;
  }
};

const closeDeliveryModal = () => {
  deliveryModalVisible.value = false;
  selectedProductId.value = null;
  addingToCart.value = false;
};

// Загружаем данные при монтировании компонента
onMounted(async () => {
  await fetchCategories();
  await fetchProducts();
});

// Следим за изменениями фильтров
watch(
  () => [
    filters.value.category_id,
    filters.value.type,
    filters.value.min_price,
    filters.value.max_price,
    filters.value.city,
  ],
  () => {
    resetPagination();
    fetchProducts();
  }
);

// Отдельный watch для поиска с debounce
let searchTimeout = null;
watch(
  () => filters.value.search,
  (newSearch) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    searchTimeout = setTimeout(() => {
      resetPagination();
      fetchProducts();
    }, 500); // задержка 500ms
  }
);

// Функция для сброса цен
function updatePriceRange(event) {
  const value = parseInt(event.target.value);
  filters.value.max_price = value;
}

// Функции для работы с пагинацией
function goToPage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchProducts();
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchProducts();
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchProducts();
  }
}

// Функция для сброса пагинации при изменении фильтров
function resetPagination() {
  currentPage.value = 1;
}

// Функция для получения видимых страниц
function getVisiblePages() {
  const pages = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, currentPage.value + 2);
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
}
</script>

<template>
  <div class="bg-[#faf7ee] pt-[20px] pb-[100px] mt-[60px]">
    <AppHeader type="client" />
    <AppHeaderClient />
    <div class="container">
      <!-- <LayoutTop title="Заказать услуги и товары" :hide="true" /> -->
      <h2 class="page-title">Заказать услуги и товары</h2>
      <!-- Уведомление о добавлении в корзину -->
      <div
        v-if="cartMessage"
        class="mt-4 p-3 rounded-lg text-center"
        :class="
          cartMessage.includes('Ошибка')
            ? 'bg-red-100 text-red-700'
            : 'bg-green-100 text-green-700'
        "
      >
        {{ cartMessage }}
      </div>

      <div
        class="flex justify-between items-start mt-[20px] gap-6 max-md:flex-col"
      >
        <div class="max-w-[376px] w-full max-md:max-w-full">
          <!-- Выбор города -->
          <div
            class="py-[13px] px-[20px] bg-white rounded-lg flex gap-[15px] text-base"
          >
            <span>Город:</span>
            <select
              v-model="filters.city"
              id=""
              name=""
              placeholder="Город"
              class="bg-transparent border-none outline-none"
            >
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
              <h4 class="text-base font-bold text-[#222222]">Категория</h4>
              <div class="flex flex-col gap-[16px] mt-[20px]">
                <div
                  v-for="category in categories"
                  :key="category.id"
                  class="flex justify-between items-center"
                >
                  <div
                    class="flex justify-between items-center gap-[12px] text-base"
                  >
                    <input
                      type="radio"
                      :value="category.id"
                      v-model="filters.category_id"
                      :id="`category-${category.id}`"
                    />
                    <label :for="`category-${category.id}`">{{
                      category.name
                    }}</label>
                  </div>
                </div>
                <!-- Кнопка для сброса фильтра -->
                <div class="flex justify-between items-center">
                  <div
                    class="flex justify-between items-center gap-[12px] text-base"
                  >
                    <input
                      type="radio"
                      :value="null"
                      v-model="filters.category_id"
                      id="category-all"
                    />
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
                  <div
                    class="flex justify-between items-center gap-[12px] text-base"
                  >
                    <input
                      type="radio"
                      value="service"
                      v-model="filters.type"
                      id="type-service"
                    />
                    <label for="type-service">Услуги</label>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <div
                    class="flex justify-between items-center gap-[12px] text-base"
                  >
                    <input
                      type="radio"
                      value="product"
                      v-model="filters.type"
                      id="type-product"
                    />
                    <label for="type-product">Товары</label>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <div
                    class="flex justify-between items-center gap-[12px] text-base"
                  >
                    <input
                      type="radio"
                      :value="null"
                      v-model="filters.type"
                      id="type-all"
                    />
                    <label for="type-all">Все</label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Фильтр по цене -->
          <div class="p-[20px] bg-white rounded-lg mt-[20px] pb-[40px]">
            <h3 class="text-xl font-bold text-[#222222] mb-[20px]">Цена</h3>
            <div class="mb-[20px]">
              <div class="flex gap-[10px] mb-[10px]">
                <input
                  type="number"
                  v-model="filters.min_price"
                  placeholder="От"
                  min="0"
                  class="w-full p-[8px] border border-gray-300 rounded"
                />
                <input
                  type="number"
                  v-model="filters.max_price"
                  placeholder="До"
                  min="0"
                  class="w-full p-[8px] border border-gray-300 rounded"
                />
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
                :value="filters.max_price"
                @input="updatePriceRange"
              />
              <div class="absolute bottom-[-25px] right-0">750000</div>
            </div>
          </div>
        </div>

        <!-- Область с продуктами -->
        <div class="max-w-[770px] w-full">
          <!-- Поиск -->
          <div
            class="w-full bg-white rounded border-1 border-[#EEEEEE] h-[44px] relative mb-5"
          >
            <img
              class="absolute top-[10px] left-[15px]"
              src="/icons/search.svg"
              alt=""
            />
            <input
              class="bg-transparent w-full h-full pl-[45px]"
              type="text"
              placeholder="Поиск"
              v-model="filters.search"
            />
          </div>

          <!-- Загрузка -->
          <div
            v-if="loading"
            class="flex justify-center items-center py-[40px]"
          >
            <div class="text-lg">Загрузка...</div>
          </div>

          <!-- Список продуктов -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
            <div
              v-for="product in products"
              :key="product.id"
              class="p-[9px] rounded-lg w-full bg-white"
            >
              <div>
                <img
                  class="rounded-lg overflow-hidden w-full h-[189px] object-cover"
                  :src="getImageUrl(product)"
                  :alt="product.name"
                />
                <h3 class="text-lg font-medium text-[#222222] mt-[10px]">
                  {{ product.name }}
                </h3>
                <h4 class="text-2xl font-medium text-[#222222] mb-[4px]">
                  {{ formatPrice(product.price) }} ₸
                </h4>
                <!--                                <div class="flex items-center mb-[4px]">-->
                <!--                                    <div class="flex space-x-1">-->
                <!--                                        <template v-for="n in totalStars" :key="n">-->
                <!--                                            <div class="relative text-2xl select-none">-->
                <!--                                                <span v-if="getStarClass(n) === 'half'" class="text-gray-300">★</span>-->
                <!--                                                <span -->
                <!--                                                    v-else :class="{-->
                <!--                                                    'text-orange-400': getStarClass(n) === 'full',-->
                <!--                                                    'text-gray-300': getStarClass(n) === 'empty'-->
                <!--                                                    }"-->
                <!--                                                >-->
                <!--                                                    ★-->
                <!--                                                </span>-->
                <!--                                                <span-->
                <!--                                                    v-if="getStarClass(n) === 'half'"-->
                <!--                                                    class="absolute inset-0 overflow-hidden text-orange-400"-->
                <!--                                                    :style="{ width: '50%' }"-->
                <!--                                                >-->
                <!--                                                    ★-->
                <!--                                                </span>-->
                <!--                                            </div>-->
                <!--                                        </template>-->
                <!--                                    </div>-->
                <!--                                    <span class=" text-sm text-[#38949B]">({{ product.reviews_count || 0 }} отзывов)</span>-->
                <!--                                </div>-->
                <div
                  v-if="product.service_time"
                  class="flex gap-[12px] text-sm text-[#5C5C5C] mb-[4px]"
                >
                  <img src="/icons/calendar-icon.svg" alt="" />
                  <span>Срок выполнения: {{ product.service_time }}</span>
                </div>

                <!-- Дополнительная информация -->
                <div
                  class="flex flex-col gap-[4px] text-sm text-[#5C5C5C] mb-[4px]"
                >
                  <div
                    v-if="product.country && product.city"
                    class="flex gap-[12px]"
                  >
                    <img src="/icons/map-pin.svg" alt="" />
                    <span>{{ product.country }}, {{ product.city }}</span>
                  </div>
                  <div v-if="product.type" class="flex gap-[12px]">
                    <span class="font-medium"
                      >Тип:
                      {{
                        product.type === "service" ? "Услуга" : "Товар"
                      }}</span
                    >
                  </div>
                </div>
                <div class="flex gap-[10px] mt-[10px]">
                  <button
                    class="w-[50%] text-sm rounded-lg bg-[#224C4F26] text-[#17212A] py-[8px] font-semibold"
                    @click="fetchProduct(product.id)"
                  >
                    Подробнее
                  </button>
                  <button
                    class="w-[50%] text-sm rounded-lg bg-[#E9B949] text-[#17212A] py-[8px] font-semibold"
                    @click="addProductToCart(product.id)"
                  >
                    Добавить
                  </button>
                </div>
              </div>
            </div>

            <!-- Сообщение, если нет продуктов -->
            <div
              v-if="!loading && products.length === 0"
              class="w-full text-center py-[40px]"
            >
              <p class="text-lg text-gray-500">Продукты не найдены</p>
            </div>
          </div>

          <!-- Пагинация -->
          <div v-if="!loading && totalPages > 1" class="mt-8 flex justify-center">
            <div class="flex items-center gap-2">
              <!-- Кнопка "Предыдущая" -->
              <button
                @click="prevPage"
                :disabled="currentPage === 1"
                class="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium transition-colors"
                :class="currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'"
              >
                Предыдущая
              </button>

              <!-- Номера страниц -->
              <div class="flex gap-1">
                <!-- Показываем первую страницу -->
                <button
                  v-if="currentPage > 3"
                  @click="goToPage(1)"
                  class="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
                >
                  1
                </button>
                
                <!-- Многоточие, если нужно -->
                <span v-if="currentPage > 4" class="px-2 py-2 text-gray-500">...</span>

                <!-- Страницы вокруг текущей -->
                <template v-for="page in getVisiblePages()" :key="page">
                  <button
                    @click="goToPage(page)"
                    class="px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
                    :class="page === currentPage
                      ? 'bg-[#E9B949] text-[#17212A] border-[#E9B949]'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
                  >
                    {{ page }}
                  </button>
                </template>

                <!-- Многоточие, если нужно -->
                <span v-if="currentPage < totalPages - 3" class="px-2 py-2 text-gray-500">...</span>

                <!-- Показываем последнюю страницу -->
                <button
                  v-if="currentPage < totalPages - 2"
                  @click="goToPage(totalPages)"
                  class="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
                >
                  {{ totalPages }}
                </button>
              </div>

              <!-- Кнопка "Следующая" -->
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium transition-colors"
                :class="currentPage === totalPages 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'"
              >
                Следующая
              </button>
            </div>
          </div>

          <!-- Информация о пагинации -->
          <div v-if="!loading && totalItems > 0" class="mt-4 text-center text-sm text-gray-600">
            Показано {{ products.length }} из {{ totalItems }} товаров
          </div>
        </div>
      </div>
    </div>
    <MobileFooter />
    <Teleport to="body">
      <ServiceDetailModal
        :visible="serviceDetailModalVisible"
        :service="serviceDelivery"
        :reviews="serviceReviews"
        :supplier="serviceSupplier"
        @close="serviceDetailModalVisible = false"
        @order="addProductToCart"
      />
      <DeliveryModal
        :visible="deliveryModalVisible"
        :loading="addingToCart"
        @close="closeDeliveryModal"
        @confirm="handleDeliveryConfirm"
      />
    </Teleport>
  </div>
</template>

<style lang="css" scoped>
.container {
  max-width: 1170px;
  width: 100%;
  margin: auto;
  margin-top: 68px;
  padding: 0 16px;
}

@media (max-width: 768px) {
  .container {
    margin-top: 0;
  }
}

.card {
  box-shadow: 0px 4px 10px -5px #000;
}

.page-title {
  font-family: "FoglihtenNo06", serif;
  font-size: clamp(24px, 3vw, 32px);
  color: #201001;
  font-weight: 400;
}
</style>
