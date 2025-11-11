<script setup>
import { ref, onMounted, computed } from 'vue'
import { getProducts, addToCart, getCart, removeFromCart, getProductById, getProductReviews, getBurialRequestById, updateCartCount, createOrder } from '~/services/client'
import { getSupplier } from '~/services/login'
import { createInvoice, generateToken } from '~/services/payments'
import PaymentModalProducts from '~/components/layout/modals/PaymentModalProducts.vue'
import DeliveryModal from '~/components/layout/modals/DeliveryModal.vue'
import ServiceDetailModal from '~/components/layout/modals/ServiceDetailModal.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const products = ref([])
const cartItems = ref([])
const loading = ref(true)
const error = ref(null)
const totalStars = 5
const rating = 3.5
const addingToCart = ref(false)
const cartMessage = ref('')
const showPaymentModal = ref(false)
const removingFromCart = ref(false)
const deliveryModalVisible = ref(false)
const selectedProductId = ref(null)
const serviceDetailModalVisible = ref(false)
const serviceDelivery = ref({})
const serviceReviews = ref([])
const serviceSupplier = ref({})
const burialData = ref(null)
const orderResponse = ref(null)
const route = useRoute()
const router = useRouter()

// Состояние пагинации
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const itemsPerPage = ref(10)

// Вычисляемое свойство для общей суммы корзины
const cartTotal = computed(() => {
  const cartSum = cartItems.value.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  const stateSum = 0 // Госпошлина
  const total = cartSum + stateSum
  return total
})

// Вычисляемое свойство для проверки наличия товаров в корзине
const hasCartItems = computed(() => {
  const hasItems = cartItems.value.length > 0
  return hasItems
})

// Функция для определения класса звезды (полная, половина, пустая)
const getStarClass = (position) => {
  if (position <= Math.floor(rating)) {
    return 'full'
  } else if (position === Math.ceil(rating) && !Number.isInteger(rating)) {
    return 'half'
  } else {
    return 'empty'
  }
}

// Функция для загрузки корзины
const loadCart = async () => {
  try {
    const response = await getCart()
    cartItems.value = response.data || []
  } catch (err) {
    console.error('Ошибка при загрузке корзины:', err)
    const { $toast } = useNuxtApp()
    $toast.error(t('common.serverUnavailable'))
  }
}

// Функция для добавления товара в корзину
const addProductToCart = async (productId) => {
  selectedProductId.value = productId
  deliveryModalVisible.value = true
}

// Функция для обработки подтверждения данных доставки
const handleDeliveryConfirm = async (deliveryData) => {
  addingToCart.value = true
  cartMessage.value = ''
  deliveryModalVisible.value = false
  
  try {
    // Формируем дату и время доставки в нужном формате
    const deliveryDateTime = `${deliveryData.date}T${deliveryData.time}:00Z`
    
    const cartData = {
      delivery_arrival_time: deliveryDateTime,
      delivery_destination_address: deliveryData.address,
      product_id: selectedProductId.value,
      quantity: 1
    }
    
    await addToCart(cartData)
    cartMessage.value = t('cart.itemAdded')
    await loadCart() // Перезагружаем корзину
    setTimeout(() => {
      cartMessage.value = ''
    }, 3000)
  } catch (err) {
    cartMessage.value = t('cart.addError')
    console.error(t('errors.fetchError'), err)
    const { $toast } = useNuxtApp()
    $toast.error(t('common.serverUnavailable'))
  } finally {
    addingToCart.value = false
    selectedProductId.value = null
  }
}

// Функция для закрытия модалки доставки
const closeDeliveryModal = () => {
  deliveryModalVisible.value = false
  selectedProductId.value = null
  addingToCart.value = false
}

// Функция для увеличения количества товара в корзине
const increaseQuantity = async (item) => {
  try {
    const newQuantity = item.quantity + 1
    await updateCartCount({
      id: item.id,
      data: { quantity: newQuantity }
    })
    await loadCart() // Перезагружаем корзину
  } catch (err) {
    console.error('Ошибка при увеличении количества:', err)
    const { $toast } = useNuxtApp()
    $toast.error(t('common.serverUnavailable'))
  }
}

// Функция для уменьшения количества товара в корзине
const decreaseQuantity = async (item) => {
  try {
    if (item.quantity > 1) {
      const newQuantity = item.quantity - 1
      await updateCartCount({
        id: item.id,
        data: { quantity: newQuantity }
      })
      await loadCart() // Перезагружаем корзину
    } else {
      // Если количество = 1, удаляем товар
      await removeProductFromCart(item.id)
    }
  } catch (err) {
    console.error('Ошибка при уменьшении количества:', err)
    const { $toast } = useNuxtApp()
    $toast.error(t('common.serverUnavailable'))
  }
}

// Функция для удаления товара из корзины
const removeProductFromCart = async (productId) => {
  removingFromCart.value = true
  try {
    await removeFromCart(productId)
    await loadCart() // Перезагружаем корзину
    cartMessage.value = t('cart.itemRemoved')
    setTimeout(() => {
      cartMessage.value = ''
    }, 3000)
  } catch (err) {
    cartMessage.value = t('services.errorDeletingItem')
    console.error('Ошибка при удалении из корзины:', err)
    const { $toast } = useNuxtApp()
    $toast.error(t('common.serverUnavailable'))
  } finally {
    removingFromCart.value = false
  }
}

// Функция для создания объекта платежа для виджета Halyk
const createPaymentObject = (auth, invoiceId, amount) => {
  const config = useRuntimeConfig()
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const currentPath = route.path
  const apiBaseUrl = config.public.apiBaseUrl
  
  const paymentObject = {
    invoiceId: invoiceId,
    invoiceIdAlt: invoiceId,
    backLink: `${baseUrl}${currentPath}?success=true`,
    failureBackLink: `${baseUrl}${currentPath}?failure=true`,
    postLink: `${apiBaseUrl}/api/v1/payments/mobile/callback`,
    failurePostLink: `${apiBaseUrl}/api/v1/payments/mobile/callback`,
    language: "RUS",
    description: "Оплата дополнительных услуг",
    accountId: "", // Можно получить из профиля пользователя, если нужно
    terminal: "", // Можно получить из конфигурации, если нужно
    amount: amount,
    name: "", // Можно получить из профиля пользователя, если нужно
    currency: "KZT",
    data: JSON.stringify({
      statement: {
        invoiceID: invoiceId
      }
    }),
    recurrent: false
  }
  
  paymentObject.auth = auth
  return paymentObject
}

// Функция для создания ордера
const createOrderData = async () => {
  try {
    const orderRequestData = {
      // Данные захоронения (если есть)
      ...(burialData.value && {
        burial_date: burialData.value.burial_date,
        burial_order_id: burialData.value.id,
        burial_time: burialData.value.burial_time,
        cemetery_id: burialData.value.cemetery_id,
        deceased_id: burialData.value.deceased_id,
        grave_id: burialData.value.grave_id,
      }),
      // Товары заказа
      order_items: cartItems.value?.map(item => ({
        delivery_arrival_time: item.delivery_arrival_time || "2025-05-17T09:00:00Z",
        delivery_destination_address: item.delivery_destination_address || "Алматы, ул. Еревагская 157",
        product_id: item.product_id,
        quantity: item.quantity
      })) || []
    }

    console.log('Order request data:', orderRequestData)
    orderResponse.value = await createOrder(orderRequestData)
  } catch (error) {
    console.error('Ошибка при создании ордера:', error)
    const { $toast } = useNuxtApp()
    $toast.error(t('common.serverUnavailable'))
    throw error
  }
}

const processPayment = async () => {
  try {
    await createOrderData();
    
    // Проверяем, что ордер создан успешно
    if (orderResponse.value?.data?.id) {
      const invoiceData = {
        amount: cartTotal.value,
        currency: "KZT",
        description: "",
        metadata: {
          order_id: orderResponse.value.data.id,
          service: burialData.value ? "burial" : "supplier"
        }
      }
      
      const invoiceResponse = await createInvoice(invoiceData)
      console.log('Invoice created:', invoiceResponse)
      
      // Проверяем, что инвойс создан успешно
      if (invoiceResponse?.data?.data?.invoiceId) {
        const tokenData = {
          amount: cartTotal.value,
          invoiceID: invoiceResponse.data.data.invoiceId,
          terminalType: burialData.value ? "burial" : "shop"
        }
        
        const tokenResponse = await generateToken(tokenData)
        console.log('Token generated:', tokenResponse)
        
        // Проверяем, что токен получен успешно
        if (tokenResponse?.data?.data?.accessToken && typeof window !== 'undefined' && window.halyk) {
          const auth = tokenResponse.data.data.accessToken
          const invoiceId = invoiceResponse.data.data.invoiceId
          const amount = cartTotal.value
          
          // Создаем объект платежа
          const paymentObject = createPaymentObject(auth, invoiceId, amount)
          
          // Вызываем виджет оплаты
          window.halyk.showPaymentWidget(paymentObject, (result) => {
            console.log('Payment widget callback:', result)
            if (result.success) {
              // Обрабатываем успешную оплату
              handlePaymentSuccess()
            } else {
              // Обрабатываем неудачную оплату
              const { $toast } = useNuxtApp()
              $toast.error(t('payment.paymentFailed'))
            }
          })
        }
      }
    }
  } catch (error) {
    console.error('Ошибка при обработке платежа:', error)
    const { $toast } = useNuxtApp()
    $toast.error(t('common.serverUnavailable'))
  }
}

// Функция для открытия модального окна оплаты
const openPaymentModal = () => {
  if (hasCartItems.value) {
    showPaymentModal.value = true
  }
}

// Функция для закрытия модального окна оплаты
const closePaymentModal = () => {
  showPaymentModal.value = false
}

// Функция для обработки успешной оплаты
const handlePaymentSuccess = async () => {
  try {
    // Перезагружаем корзину (она должна быть пустой после заказа)
    await loadCart()
    cartMessage.value = t('cart.orderSuccess')
    setTimeout(() => {
      cartMessage.value = ''
    }, 5000)
  } catch (err) {
    cartMessage.value = t('services.errorUpdatingData')
    console.error('Ошибка при обновлении корзины:', err)
    const { $toast } = useNuxtApp()
    $toast.error(t('common.serverUnavailable'))
  }
}

// Функция для получения детальной информации о продукте
const fetchProduct = async (id) => {
  try {
    const response = await getProductById(id)
    serviceDelivery.value = response.data
    const reviews = await getProductReviews(id)
    serviceReviews.value = reviews.data.items
    const supplierRes = await getSupplier({
      phone: serviceDelivery.value.supplier_phone
    })
    serviceSupplier.value = supplierRes.value
  } catch (error) {
    console.error('Ошибка при загрузке услуги:', error)
    const { $toast } = useNuxtApp()
    $toast.error(t('common.serverUnavailable'))
  } finally {
    serviceDetailModalVisible.value = true
  }
}

// Функция для загрузки данных о захоронении
const loadBurialData = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await getBurialRequestById(route.query.burial_id)
    burialData.value = response.data.data
  } catch (err) {
    error.value = t('services.errorLoadingBurialData')
    console.error('Error loading burial data:', err)
    const { $toast } = useNuxtApp()
    $toast.error(t('common.serverUnavailable'))
  } finally {
    loading.value = false
  }
}

// Функции для работы с пагинацией
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadProducts()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadProducts()
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    loadProducts()
  }
}

// Функция для сброса пагинации
const resetPagination = () => {
  currentPage.value = 1
}

// Функция для получения видимых страниц
const getVisiblePages = () => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
}

// Функция для загрузки продуктов с пагинацией
const loadProducts = async () => {
  try {
    loading.value = true
    error.value = null
    
    const params = {
      page: currentPage.value,
      limit: itemsPerPage.value
    }
    
    const response = await getProducts(params)
    products.value = response.data?.items || response.data || []
    
    // Обновляем данные пагинации
    totalItems.value = response.data?.total || 0
    totalPages.value = response.data?.total_pages || 1
    
    console.log('Загружено продуктов:', products.value.length)
    console.log('Пагинация:', {
      currentPage: currentPage.value,
      totalPages: totalPages.value,
      totalItems: totalItems.value
    })
  } catch (err) {
    error.value = t('services.errorLoadingServices')
    console.error('Ошибка при загрузке продуктов:', err)
    const { $toast } = useNuxtApp()
    $toast.error(t('common.serverUnavailable'))
    products.value = []
  } finally {
    loading.value = false
  }
}

// Загрузка данных при монтировании компонента
onMounted(async () => {
  try {
    await Promise.all([
      loadProducts(),
      loadCart()
    ])
    
    // Проверяем наличие burial_id в query параметрах и загружаем данные о захоронении
    if (route.query.burial_id) {
      await loadBurialData()
    }
  } catch (err) {
    error.value = t('services.errorLoadingServices')
    console.error(err)
    const { $toast } = useNuxtApp()
    $toast.error(t('common.serverUnavailable'))
  }
})
</script>

<template>
  <div class="bg-[#faf7ee] min-h-[100vh] py-[20px] md:py-[70px] px-4 md:px-0">
    <div class="container flex flex-col lg:flex-row gap-[16px] md:gap-[24px]">
      <!-- Товары (показываются первыми на мобильных) -->
      <div class="max-w-[777px] w-full lg:flex-shrink-0 order-1 lg:order-1">
        <div class="w-full min-h-[61px] h-auto md:h-[61px] p-[12px] md:p-[20px] flex items-center bg-[#fff] rounded-[16px] gap-[12px] md:gap-[16px]">
          <button tybe="button" class="bg-[#EEEEEE] rounded-md px-[16px] md:px-[21px] py-[8px] md:py-[10px] flex items-center gap-[8px] md:gap-[10px] font-semibold text-xs md:text-sm text-[#224C4F]" @click="$router.go(-1)">
            <img src="/icons/back-blue.svg" alt="" class="w-4 h-4 md:w-auto md:h-auto"> {{ $t('common.back') }}
          </button>
<!--          <h3 class="text-4xl font-medium">Захоронение: <span class="text-[#38949B]">0000023</span></h3>-->
        </div>
        
        <!-- Уведомление о добавлении в корзину -->
        <div v-if="cartMessage" class="mt-4 p-3 rounded-lg text-center" :class="cartMessage.includes(t('common.error')) || cartMessage.includes('Ошибка') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
          {{ cartMessage }}
        </div>
        
        <div class="mt-[16px] md:mt-[24px]">
          <h3 class="text-[#222222] font-medium text-lg md:text-xl font-roboto">{{ $t('services.additionalServices') }}</h3>
          
          <!-- Отображение загрузки -->
          <div v-if="loading" class="mt-[24px] text-center">
            <p>{{ $t('services.loadingServices') }}</p>
          </div>
          
          <!-- Отображение ошибки -->
          <div v-else-if="error" class="mt-[24px] text-center text-red-500">
            <p>{{ error }}</p>
          </div>
          
          <!-- Отображение услуг -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-[12px] mt-[16px] md:mt-[24px]">
            <div v-for="product in products" :key="product.id" class="p-[9px] rounded-lg w-full bg-white">
              <div>
                <img class="rounded-lg overflow-hidden w-full h-[150px] md:h-[189px] object-cover" 
                     :src="product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : '/images/client/banner.jpg'" 
                     alt="">
                <h3 class="text-base md:text-lg font-roboto font-medium text-[#222222] mt-[8px] md:mt-[10px]">{{ product.name }}</h3>
                <h4 class="text-xl md:text-2xl font-roboto font-medium text-[#222222] mb-[4px]">{{ product.price.toLocaleString() }} ₸</h4>
<!--                <div class="flex items-center mb-[4px]">-->
<!--                    <div class="flex space-x-1">-->
<!--                        <template v-for="n in totalStars" :key="n">-->
<!--                            <div class="relative text-2xl select-none">-->
<!--                                <span v-if="getStarClass(n) === 'half'" class="text-gray-300">★</span>-->
<!--                                <span -->
<!--                                    v-else :class="{-->
<!--                                    'text-orange-400': getStarClass(n) === 'full',-->
<!--                                    'text-gray-300': getStarClass(n) === 'empty'-->
<!--                                    }"-->
<!--                                >-->
<!--                                    ★-->
<!--                                </span>-->
<!--                                <span-->
<!--                                    v-if="getStarClass(n) === 'half'"-->
<!--                                    class="absolute inset-0 overflow-hidden text-orange-400"-->
<!--                                    :style="{ width: '50%' }"-->
<!--                                >-->
<!--                                    ★-->
<!--                                </span>-->
<!--                            </div>-->
<!--                        </template>-->
<!--                    </div>-->
<!--                    <span class="font-roboto text-sm text-[#38949B]">(42 отзыва)</span>-->
<!--                </div>-->
                <div class="flex gap-[8px] md:gap-[12px] text-xs md:text-sm font-roboto text-[#5C5C5C]">
                    <img src="/icons/calendar-icon.svg" alt="" class="w-4 h-4 md:w-auto md:h-auto flex-shrink-0"> 
                    <span class="truncate">{{ $t('services.serviceTime') }} {{ product.service_time || $t('services.oneDay') }}</span>
                </div>
                <div class="flex gap-[8px] md:gap-[10px] mt-[8px] md:mt-[10px]">
                    <button class="w-[50%] text-xs md:text-sm rounded-lg bg-[#224C4F26] text-[#17212A] py-[6px] md:py-[8px] font-semibold" @click="fetchProduct(product.id)">{{ $t('common.more') }}</button>
                    <button 
                      class="w-[50%] text-xs md:text-sm rounded-lg bg-[#E9B949] text-[#17212A] py-[6px] md:py-[8px] font-semibold"
                      @click="addProductToCart(product.id)"
                      :disabled="addingToCart"
                    >
                      {{ addingToCart ? $t('services.adding') : $t('common.add') }}
                    </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Пагинация -->
          <div v-if="!loading && totalPages > 1" class="mt-6 md:mt-8 flex justify-center overflow-x-auto">
            <div class="flex items-center gap-1 md:gap-2">
              <!-- Кнопка "Предыдущая" -->
              <button
                @click="prevPage"
                :disabled="currentPage === 1"
                class="px-2 md:px-3 py-1.5 md:py-2 rounded-lg border border-gray-300 text-xs md:text-sm font-medium transition-colors whitespace-nowrap"
                :class="currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'"
              >
                <span class="hidden md:inline">{{ $t('services.pagination.previous') }}</span>
                <span class="md:hidden">‹</span>
              </button>

              <!-- Номера страниц -->
              <div class="flex gap-1">
                <!-- Показываем первую страницу -->
                <button
                  v-if="currentPage > 3"
                  @click="goToPage(1)"
                  class="px-2 md:px-3 py-1.5 md:py-2 rounded-lg border border-gray-300 text-xs md:text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
                >
                  1
                </button>
                
                <!-- Многоточие, если нужно -->
                <span v-if="currentPage > 4" class="px-1 md:px-2 py-1.5 md:py-2 text-gray-500 hidden md:inline">...</span>

                <!-- Страницы вокруг текущей -->
                <template v-for="page in getVisiblePages()" :key="page">
                  <button
                    @click="goToPage(page)"
                    class="px-2 md:px-3 py-1.5 md:py-2 rounded-lg border text-xs md:text-sm font-medium transition-colors"
                    :class="page === currentPage
                      ? 'bg-[#E9B949] text-[#17212A] border-[#E9B949]'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
                  >
                    {{ page }}
                  </button>
                </template>

                <!-- Многоточие, если нужно -->
                <span v-if="currentPage < totalPages - 3" class="px-1 md:px-2 py-1.5 md:py-2 text-gray-500 hidden md:inline">...</span>

                <!-- Показываем последнюю страницу -->
                <button
                  v-if="currentPage < totalPages - 2"
                  @click="goToPage(totalPages)"
                  class="px-2 md:px-3 py-1.5 md:py-2 rounded-lg border border-gray-300 text-xs md:text-sm font-medium bg-white text-gray-700 hover:bg-gray-50"
                >
                  {{ totalPages }}
                </button>
              </div>

              <!-- Кнопка "Следующая" -->
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="px-2 md:px-3 py-1.5 md:py-2 rounded-lg border border-gray-300 text-xs md:text-sm font-medium transition-colors whitespace-nowrap"
                :class="currentPage === totalPages 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'"
              >
                <span class="hidden md:inline">{{ $t('services.pagination.next') }}</span>
                <span class="md:hidden">›</span>
              </button>
            </div>
          </div>

          <!-- Информация о пагинации -->
          <div v-if="!loading && totalItems > 0" class="mt-4 text-center text-xs md:text-sm text-gray-600">
            {{ $t('services.pagination.showing') }} {{ products.length }} {{ $t('services.pagination.of') }} {{ totalItems }} {{ $t('services.pagination.items') }}
          </div>
        </div>
      </div>
      
      <!-- Корзина (показывается второй на мобильных) -->
      <div class="p-[16px] md:p-[20px] bg-white rounded-lg w-full lg:min-w-[376px] lg:max-w-[376px] lg:h-fit sticky lg:static top-4 lg:top-auto z-10 order-2 lg:order-2">
        <!-- Корзина с товарами -->
        <div v-if="hasCartItems" class="border-b border-[#EEEEEE] pb-[12px] md:pb-[16px] pt-[12px] md:pt-[16px]">
          <h4 class="text-sm md:text-base font-medium font-roboto text-[#222222] mb-[8px] md:mb-[12px]">{{ $t('services.cartItems') }}</h4>
          <div class="space-y-[6px] md:space-y-[8px]">
            <div v-for="item in cartItems" :key="item.id" class="flex items-center justify-between gap-2">
              <div class="flex-1 min-w-0">
                <p class="text-xs md:text-sm font-roboto text-[#222222] truncate">{{ item.product.name }}</p>
                <p class="text-xs font-roboto text-[#5C5C5C]">{{ item.quantity }} {{ $t('services.pieces') }} × {{ item.product.price.toLocaleString() }} ₸</p>
              </div>
              <div class="flex items-center gap-[6px] md:gap-[8px] flex-shrink-0">
                <button 
                  @click="decreaseQuantity(item)"
                  :disabled="removingFromCart"
                  class="w-[20px] h-[20px] md:w-[24px] md:h-[24px] flex items-center justify-center rounded border border-[#EEEEEE] bg-white text-[#222222] hover:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  −
                </button>
                <span class="text-xs md:text-sm font-roboto text-[#222222] min-w-[20px] md:min-w-[24px] text-center">{{ item.quantity }}</span>
                <button 
                  @click="increaseQuantity(item)"
                  :disabled="removingFromCart"
                  class="w-[20px] h-[20px] md:w-[24px] md:h-[24px] flex items-center justify-center rounded border border-[#EEEEEE] bg-white text-[#222222] hover:bg-[#F5F5F5] disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  +
                </button>
                <button 
                  @click="removeProductFromCart(item.id)"
                  :disabled="removingFromCart"
                  class="ml-[4px] md:ml-[8px] w-[20px] h-[20px] md:w-[24px] md:h-[24px] flex items-center justify-center text-red-500 hover:text-red-700 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 class="font-roboto text-xl md:text-2xl font-bold text-[#222222] mb-[12px] md:mb-[16px]">{{ $t('services.toPay') }}</h3>
          <div v-if="hasCartItems" class="flex justify-between items-center mb-[6px] md:mb-[8px]">
            <h4 class="text-sm md:text-base font-medium font-roboto text-[#222222]">{{ $t('services.additionalServices') }}</h4>
            <p class="text-lg md:text-xl font-medium font-roboto text-[#222222]">{{ (cartTotal).toLocaleString() }} ₸</p>
          </div>
          <div class="flex justify-between items-center pt-[6px] md:pt-[8px] border-t border-[#EEEEEE]">
            <h4 class="text-base md:text-lg font-bold font-roboto text-[#222222]">{{ $t('common.total') }}</h4>
            <p class="text-xl md:text-2xl font-bold font-roboto text-[#222222]">{{ cartTotal.toLocaleString() }} ₸</p>
          </div>
        </div>
        <button 
          class="text-sm md:text-base font-semibold font-roboto w-full h-[44px] md:h-[51px] rounded-lg text-white mt-[16px] md:mt-[24px] transition-colors"
          :class="hasCartItems ? 'bg-[#339B38] hover:bg-[#2d8530]' : 'bg-gray-400 cursor-not-allowed'"
          :disabled="!hasCartItems"
          @click="processPayment"
        >
          {{ $t('services.pay') }}
        </button>
      </div>
    </div>

    <!-- Модальное окно оплаты -->
    <PaymentModalProducts 
      :visible="showPaymentModal"
      :order-data="{ 
        cartTotal: cartTotal, 
        cartItems: cartItems 
      }"
      :burial-data="burialData"
      @close="closePaymentModal"
      @success="handlePaymentSuccess"
    />
    
    <!-- Модальное окно доставки -->
    <DeliveryModal 
      :visible="deliveryModalVisible" 
      :loading="addingToCart"
      @close="closeDeliveryModal" 
      @confirm="handleDeliveryConfirm" 
    />
    
    <!-- Модальное окно с детальной информацией о услуге -->
    <ServiceDetailModal 
      :visible="serviceDetailModalVisible" 
      :service="serviceDelivery" 
      :reviews="serviceReviews" 
      :supplier="serviceSupplier" 
      @close="serviceDetailModalVisible = false" 
      @order="addProductToCart" 
    />
  </div>
</template>

<style lang="scss" scoped>
.container {
  max-width: 1170px;
  width: 100%;
  margin: auto;
  padding: 0 16px;
}

@media (min-width: 768px) {
  .container {
    padding: 0;
  }
}
</style>
