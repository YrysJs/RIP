<script setup>
import { ref, onMounted } from 'vue'
import { getProducts, addToCart } from '~/services/client'

const products = ref([])
const loading = ref(true)
const error = ref(null)
const totalStars = 5
const rating = 3.5
const addingToCart = ref(false)
const cartMessage = ref('')

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

// Загрузка данных при монтировании компонента
onMounted(async () => {
  try {
    const response = await getProducts()
    products.value = response.data.items
  } catch (err) {
    error.value = 'Ошибка при загрузке услуг'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="bg-[#FAFAFA] min-h-[100vh] py-[70px]">
    <div class="container flex gap-[24px]">
      <div class="max-w-[777px] w-full">
        <div class="w-full h-[61px] p-[20px] flex items-center bg-[#fff] rounded-[16px] gap-[16px]">
          <button tybe="button" class="bg-[#EEEEEE] rounded-md px-[21px] py-[10px] flex items-center gap-[10px] font-semibold text-sm text-[#224C4F]" @click="$router.go(-1)">
            <img src="/icons/back-blue.svg" alt="" class=""> Назад
          </button>
          <h3 class="text-4xl font-medium">Захоронение: <span class="text-[#38949B]">0000023</span></h3>
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
            <div v-for="product in products" :key="product.id" class="p-[9px] rounded-lg max-w-[376px] w-full bg-white">
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
                    <button class="w-[50%] text-sm rounded-lg bg-[#224C4F26] text-[#224C4F] py-[8px] font-semibold">Подробнее</button>
                    <button 
                      class="w-[50%] text-sm rounded-lg bg-[#224C4F] text-white py-[8px] font-semibold"
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
      <div class="p-[20px] bg-white rounded-lg max-w-[376px] h-fit">
        <h3 class="text-2xl text-[#222222] font-medium my-[16px]">
          Северное кладбище
        </h3>
        <div class="border-b border-[#EEEEEE] pb-[16px] flex items-center">
          <h4 class="text-base font-medium font-roboto text-[#222222] w-[105px]">
            Срок брони:
          </h4>
          <span class="text-base font-bold font-roboto text-[#222222]">3 дня</span>
          <img class="ml-[16px]" src="/icons/info.svg" alt="">
        </div>
        <div class="border-b border-[#EEEEEE] pb-[16px] pt-[16px] flex items-center">
          <h4 class="text-base font-medium font-roboto text-[#222222] w-[105px]">
            Сектор:
          </h4>
          <span class="text-base font-bold font-roboto text-[#222222]">11</span>
        </div>
        <div class="border-b border-[#EEEEEE] pb-[16px] pt-[16px] flex items-center">
          <h4 class="text-base font-medium font-roboto text-[#222222] w-[105px]">
            Место:
          </h4>
          <span class="text-base font-bold font-roboto text-[#222222]">233 222</span>
        </div>
        <div class="border-b border-[#EEEEEE] pb-[16px] pt-[16px] flex items-center">
          <h4 class="text-base font-medium font-roboto text-[#222222] w-[105px]">
            ФИО покойного:
          </h4>
          <span class="text-base font-bold font-roboto text-[#222222]">Беляков Макар Максимович</span>
        </div>
        <div class="border-b border-[#EEEEEE] pb-[16px] pt-[16px] flex items-center">
          <h4 class="text-base font-medium font-roboto text-[#222222] w-[105px]">
            Дата похорон:
          </h4>
          <span class="text-base font-light font-roboto text-[#939393]">Не указано</span>
        </div>
        <div>
          <h3 class="font-roboto text-2xl font-bold text-[#222222] mb-[16px]">К оплате</h3>
          <div class="flex justify-between items-center">
            <h4 class="text-base font-medium font-roboto text-[#222222] w-[105px]">Госпошлина</h4> <p class="text-2xl font-medium font-roboto text-[#222222] w-[105px]">57 000 ₸ </p>
          </div>
        </div>
        <button class="text-base font-semibold font-roboto w-full h-[51px] rounded-lg bg-[#339B38] text-white mt-[24px]">
          Оплатить
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  max-width: 1170px;
  width: 100%;
  margin: auto;
}
</style>
