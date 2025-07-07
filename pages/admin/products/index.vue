<template>
    <NuxtLayout name="admin">
      <div class="w-full bg-white rounded-[16px] p-[20px] mt-[20px]">
        <div class="flex justify-between items-center mb-[16px]">
          <h2 class="text-2xl font-semibold">Продукты</h2>
          <!--        <button class="invite-btn" @click="isCreateModal = true">-->
          <!--          <img src="/icons/plus.svg" alt="Пригласить" class="w-4 h-4 mr-2" />-->
          <!--          Пригласить-->
          <!--        </button>-->
        </div>
  
        <div class="grid grid-cols-12 text-sm font-semibold text-[#6B7280] py-[10px] border-b border-[#EEEEEE]">
          <div class="col-span-3">Название</div>
          <div class="col-span-3">Описание</div>
          <div class="col-span-2">Цена</div>
          <div class="col-span-2">Статус</div>
          <div class="col-span-2">Категория</div>
        </div>
        <div
            v-for="product in products"
            :key="product.id"
            class="grid grid-cols-12 items-center text-sm py-[14px] border-b border-[#EEEEEE] hover:bg-[#F9FAFB] transition cursor-pointer"
            @click="showProductDetails(product)"
        >
          <div class="col-span-3">{{ product.name }}</div>
          <div class="col-span-3">{{ product.description }}</div>
          <div class="col-span-2">{{ product.price }}</div>
          <div class="col-span-2">
            <span class="status" :class="getStatusClass(product.status)">
              {{ getStatusText(product.status) }}
            </span>
          </div>
          <div class="col-span-1">{{ product.category?.name || 'Не указана' }}</div>
          <div class="col-span-1 flex justify-end">
            <img src="/icons/arrow-right.svg" class="w-4 h-4" />
          </div>
        </div>
  
      </div>
      <Teleport to="body">
        <SuccessModal
            v-if="showSuccessModal"
            title="Приглашение отправлено!"
            @close="closeSuccessModal"
        />
        <ProductDetailModal
          :visible="isProductDetailModal"
          :product="selectedProduct"
          @close="isProductDetailModal = false"
          @updated="handleProductUpdated"
        />
      </Teleport>
    </NuxtLayout>
  </template>
  
  <script setup>
  import SuccessModal from "~/components/layout/modals/SuccessModal.vue";
  import ProductDetailModal from "~/components/admin/products/ProductDetailModal.vue";
  
  import { getProducts } from '~/services/admin'
  import {ref} from "vue";
  
  definePageMeta({
    middleware: ['auth', 'admin'],
  });
  
  const showSuccessModal = ref(false)
  const products = ref([])
  const isProductDetailModal = ref(false)
  const selectedProduct = ref(null)
  
  const showProductDetails = (product) => {
    selectedProduct.value = product
    isProductDetailModal.value = true
  }
  
  const handleProductUpdated = (updatedProduct) => {
    // Обновляем продукт в списке
    const index = products.value.findIndex(p => p.id === updatedProduct.id)
    if (index !== -1) {
      products.value[index] = updatedProduct
    }
    
    // Если товар активирован, можно его убрать из списка (если показываем только pending)
    if (updatedProduct.status === 'active') {
      loadProducts()
    }
  }
  
  const loadProducts = async () => {
    try {
      const response = await getProducts({status: 'pending'})
      products.value = response.data?.items || response.data || []
    } catch (error) {
      console.error('Ошибка при получении продуктов:', error)
    }
  }
  
  const getStatusClass = (status) => {
    switch(status) {
      case 'active': return 'status--active'
      case 'pending': return 'status--pending'
      case 'requires_fix': return 'status--requires-fix'
      case 'blocked': return 'status--blocked'
      default: return 'status--pending'
    }
  }
  
  const getStatusText = (status) => {
    switch(status) {
      case 'active': return 'Активен'
      case 'pending': return 'На рассмотрении'
      case 'requires_fix': return 'Требует доработки'
      case 'blocked': return 'Заблокирован'
      default: return 'Неизвестно'
    }
  }
  
  const closeSuccessModal = () => {
    showSuccessModal.value = false
  }
  
  onMounted(() => {
    loadProducts()
  })
  
  </script>
  
  <style scoped>
  .invite-btn {
    background: #224C4F;
    color: white;
    font-size: 14px;
    font-weight: 600;
    border-radius: 8px;
    padding: 10px 20px;
    display: flex;
    align-items: center;
  }
  
  .status {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 12px;
    text-align: center;
  }
  
  .status--active {
    background: #3CBF4A;
    color: white;
  }
  
  .status--pending {
    background: #F7901E;
    color: white;
  }
  
  .status--requires-fix {
    background: #FF6B35;
    color: white;
  }
  
  .status--blocked {
    background: #E53935;
    color: white;
  }
  </style>
  