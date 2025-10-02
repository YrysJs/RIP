<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'confirm'])

const deliveryAddress = ref('')
const deliveryDate = ref('')
const deliveryTime = ref('')

// Функция для закрытия модалки
const closeModal = () => {
  deliveryAddress.value = ''
  deliveryDate.value = ''
  deliveryTime.value = ''
  emit('close')
}

// Функция для подтверждения
const confirmDelivery = () => {
  if (!deliveryAddress.value || !deliveryDate.value || !deliveryTime.value) {
    return
  }

  const deliveryData = {
    address: deliveryAddress.value,
    date: deliveryDate.value,
    time: deliveryTime.value
  }

  emit('confirm', deliveryData)
}

// Вычисляемое свойство для проверки валидности формы
const isFormValid = computed(() => {
  return deliveryAddress.value && deliveryDate.value && deliveryTime.value
})
</script>

<template>
  <div v-if="visible" class="modal fixed min-w-full min-h-[100vh] flex justify-center items-center z-50">
    <div class="bg-white rounded-md max-w-[500px] w-full p-8 relative max-sm:mx-4 max-sm:pt-6 max-sm:px-4 max-sm:pb-12">
      <button class="absolute right-[32px] top-[32px] text-[22px] leading-5 font-semibold" @click="closeModal">&#10005;</button>
      
      <div class="flex flex-col">
        <h3 class="text-2xl font-extrabold text-left text-[#222222] mb-[32px] max-lg:text-[22px] max-lg:mb-6">
          Укажите данные
        </h3>
        
        <p class="text-lg max-lg:text-base mb-4">
          Введите адрес подачи машины:
        </p>
        <input 
          v-model="deliveryAddress" 
          class="border-2 border-[#AFB5C166] mb-[24px] px-3 py-[18px] text-base rounded-lg h-14 max-lg:py-[14px] max-lg:mb-6" 
          type="text" 
          placeholder="Тауғұл 1, дом 48"
        />
        
        <p class="text-lg max-lg:text-base mb-4">
          Выберите дату:
        </p>
        <input 
          v-model="deliveryDate" 
          class="border-2 border-[#AFB5C166] mb-[24px] px-3 py-[18px] text-base rounded-lg h-14 max-lg:py-[14px] max-lg:mb-6" 
          type="date"
        />
        
        <p class="text-lg max-lg:text-base mb-4">
          Выберите время:
        </p>
        <input 
          v-model="deliveryTime" 
          class="border-2 border-[#AFB5C166] mb-[32px] px-3 py-[18px] text-base rounded-lg h-14 max-lg:py-[14px] max-lg:mb-6" 
          type="time"
        />
        
        <button 
          class="bg-[#E9B949] py-[18px] rounded-lg text-[#000] font-medium max-lg:py-[15px]"
          :class="{ 'opacity-50 cursor-not-allowed': !isFormValid || loading }"
          :disabled="!isFormValid || loading"
          @click="confirmDelivery"
        >
          {{ loading ? 'Добавление...' : 'Подтвердить' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal {
  background: #0000005b;
  top: 0;
}
</style>
