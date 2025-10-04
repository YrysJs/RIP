<script setup>
import { ref, onMounted, computed } from 'vue'
import { getProducts, addToCart, getCart, removeFromCart } from '~/services/client'
import PaymentModalProducts from '~/components/layout/modals/PaymentModalProducts.vue'

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
  }
}

// Функция для добавления товара в корзину
const addProductToCart = async (productId) => {
  addingToCart.value = true
  cartMessage.value = ''
  
  try {
    const cartData = {
      delivery_arrival_time: "2025-05-17T09:00:00Z",
      delivery_destination_address: "Алматы, ул. Еревагская 157",
      product_id: productId,
      quantity: 1
    }
    
    await addToCart(cartData)
    cartMessage.value = 'Товар добавлен в корзину'
    await loadCart() // Перезагружаем корзину
    setTimeout(() => {
      cartMessage.value = ''
    }, 3000)
  } catch (err) {
    cartMessage.value = 'Ошибка при добавлении товара'
    console.error('Ошибка при добавлении в корзину:', err)
  } finally {
    addingToCart.value = false
  }
}

// Функция для удаления товара из корзины
const removeProductFromCart = async (productId) => {
  removingFromCart.value = true
  try {
    await removeFromCart(productId)
    await loadCart() // Перезагружаем корзину
    cartMessage.value = 'Товар удален из корзины'
    setTimeout(() => {
      cartMessage.value = ''
    }, 3000)
  } catch (err) {
    cartMessage.value = 'Ошибка при удалении товара'
    console.error('Ошибка при удалении из корзины:', err)
  } finally {
    removingFromCart.value = false
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
    cartMessage.value = 'Заказ успешно оформлен!'
    setTimeout(() => {
      cartMessage.value = ''
    }, 5000)
  } catch (err) {
    cartMessage.value = 'Ошибка при обновлении данных'
    console.error('Ошибка при обновлении корзины:', err)
  }
}

// Загрузка данных при монтировании компонента
onMounted(async () => {
  try {
    const [productsResponse] = await Promise.all([
      getProducts(),
      loadCart()
    ])
    products.value = productsResponse.data.items || productsResponse.data || []
  } catch (err) {
    error.value = 'Ошибка при загрузке услуг'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="bg-[#faf7ee] min-h-[100vh] py-[70px]">
    <div class="container flex gap-[24px]">
      <div class="max-w-[777px] w-full">
        <div class="w-full h-[61px] p-[20px] flex items-center bg-[#fff] rounded-[16px] gap-[16px]">
          <button tybe="button" class="bg-[#EEEEEE] rounded-md px-[21px] py-[10px] flex items-center gap-[10px] font-semibold text-sm text-[#224C4F]" @click="$router.go(-1)">
            <img src="/icons/back-blue.svg" alt="" class=""> Назад
          </button>
<!--          <h3 class="text-4xl font-medium">Захоронение: <span class="text-[#38949B]">0000023</span></h3>-->
        </div>
        
        <!-- Уведомление о добавлении в корзину -->
        <div v-if="cartMessage" class="mt-4 p-3 rounded-lg text-center" :class="cartMessage.includes('Ошибка') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
          {{ cartMessage }}
        </div>
        
        <div class="mt-[24px]">
          <h3 class="text-[#222222] font-medium text-xl font-roboto">Дополнительные услуги</h3>
          
          <!-- Отображение загрузки -->
          <div v-if="loading" class="mt-[24px] text-center">
            <p>Загрузка услуг...</p>
          </div>
          
          <!-- Отображение ошибки -->
          <div v-else-if="error" class="mt-[24px] text-center text-red-500">
            <p>{{ error }}</p>
          </div>
          
          <!-- Отображение услуг -->
          <div v-else class="grid grid-cols-2 gap-[12px] mt-[24px]">
            <div v-for="product in products" :key="product.id" class="p-[9px] rounded-lg min-w-[376px] max-w-[376px] w-full bg-white">
              <div>
                <img class="rounded-lg overflow-hidden w-full h-[189px] object-cover" 
                     :src="product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : '/images/client/banner.jpg'" 
                     alt="">
                <h3 class="text-lg font-roboto font-medium text-[#222222] mt-[10px]">{{ product.name }}</h3>
                <h4 class="text-2xl font-roboto font-medium text-[#222222] mb-[4px]">{{ product.price.toLocaleString() }} ₸</h4>
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
                    <span class="font-roboto text-sm text-[#38949B]">(42 отзыва)</span>
                </div>
                <div class="flex gap-[12px] text-sm font-roboto text-[#5C5C5C]">
                    <img src="/icons/calendar-icon.svg" alt=""> 
                    <span>Срок выполнения: {{ product.service_time || '1 день' }}</span>
                </div>
                <div class="flex gap-[10px] mt-[10px]">
                    <button class="w-[50%] text-sm rounded-lg bg-[#224C4F26] text-[#17212A] py-[8px] font-semibold">Подробнее</button>
                    <button 
                      class="w-[50%] text-sm rounded-lg bg-[#E9B949] text-[#17212A] py-[8px] font-semibold"
                      @click="addProductToCart(product.id)"
                      :disabled="addingToCart"
                    >
                      {{ addingToCart ? 'Добавление...' : 'Добавить' }}
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="p-[20px] bg-white rounded-lg min-w-[376px] max-w-[376px] h-fit">

        <!-- Корзина с товарами -->
        <div v-if="hasCartItems" class="border-b border-[#EEEEEE] pb-[16px] pt-[16px]">
          <h4 class="text-base font-medium font-roboto text-[#222222] mb-[12px]">Товары в корзине:</h4>
          <div class="space-y-[8px]">
            <div v-for="item in cartItems" :key="item.id" class="flex items-center justify-between">
              <div class="flex-1">
                <p class="text-sm font-roboto text-[#222222]">{{ item.product.name }}</p>
                <p class="text-xs font-roboto text-[#5C5C5C]">{{ item.quantity }} шт. × {{ item.product.price.toLocaleString() }} ₸</p>
              </div>
              <button 
                @click="removeProductFromCart(item.id)"
                :disabled="removingFromCart"
                class="ml-[8px] text-red-500 hover:text-red-700 text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3 class="font-roboto text-2xl font-bold text-[#222222] mb-[16px]">К оплате</h3>
          <div v-if="hasCartItems" class="flex justify-between items-center mb-[8px]">
            <h4 class="text-base font-medium font-roboto text-[#222222]">Доп. услуги</h4>
            <p class="text-xl font-medium font-roboto text-[#222222]">{{ (cartTotal).toLocaleString() }} ₸</p>
          </div>
          <div class="flex justify-between items-center pt-[8px] border-t border-[#EEEEEE]">
            <h4 class="text-lg font-bold font-roboto text-[#222222]">Итого</h4>
            <p class="text-2xl font-bold font-roboto text-[#222222]">{{ cartTotal.toLocaleString() }} ₸</p>
          </div>
        </div>
        <button 
          class="text-base font-semibold font-roboto w-full h-[51px] rounded-lg text-white mt-[24px] transition-colors"
          :class="hasCartItems ? 'bg-[#339B38] hover:bg-[#2d8530]' : 'bg-gray-400 cursor-not-allowed'"
          :disabled="!hasCartItems"
          @click="openPaymentModal"
        >
          Оплатить
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
      @close="closePaymentModal"
      @success="handlePaymentSuccess"
    />
  </div>
</template>

<style lang="scss" scoped>
.container {
  max-width: 1170px;
  width: 100%;
  margin: auto;
}
</style>
