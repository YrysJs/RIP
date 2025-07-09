<script setup>
import { useCemeteryStore } from '~/store/cemetery'
import { getBurialRequestById } from '~/services/manager'
import PaymentModal from '~/components/layout/modals/PaymentModal.vue'
import SuccessModal from '~/components/layout/modals/SuccessModal.vue'

const cemeteryStore = useCemeteryStore()
const switcher = ref(false)
const route = useRoute()

const paymentModalVisible = ref(false)
const deathCertificateFile = ref(null)
const showSuccessModal = ref(false)

// Реактивные данные для захоронения
const burialData = ref(null)
const loading = ref(true)
const error = ref(null)

// Локальные реактивные переменные для дат
const deathDate = ref('')
const burialDate = ref('')

// Функция для конвертации даты в формат YYYY-MM-DD
const formatDateForInput = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

// Функция для загрузки данных захоронения
const loadBurialData = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await getBurialRequestById(route.params.id)
    burialData.value = response.data
    
    // Инициализируем локальные значения дат
    deathDate.value = formatDateForInput(burialData.value?.deceased?.death_date)
    burialDate.value = formatDateForInput(burialData.value?.burial_date)
    
    // Устанавливаем switcher в true если есть даты
    if (burialData.value?.burial_date || burialData.value?.deceased?.death_date) {
      switcher.value = true
    }
  } catch (err) {
    error.value = 'Ошибка при загрузке данных'
    console.error('Error loading burial data:', err)
  } finally {
    loading.value = false
  }
}

// Отслеживаем изменения дат и обновляем burialData
watch(deathDate, (newDate) => {
  if (burialData.value?.deceased) {
    burialData.value.deceased.death_date = newDate
  }
})

watch(burialDate, (newDate) => {
  if (burialData.value) {
    burialData.value.burial_date = newDate
  }
})

// Функция для обработки выбора файла
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file && file.type === 'application/pdf') {
    deathCertificateFile.value = file
  } else {
    alert('Пожалуйста, выберите PDF файл')
    event.target.value = ''
  }
}

// Функция для открытия модалки оплаты
const openPaymentModal = () => {
  paymentModalVisible.value = true
}

// Функция для обработки успешной оплаты
const handlePaymentSuccess = () => {
  showSuccessModal.value = true
  // Через 5 секунд делаем редирект
  setTimeout(() => {
    navigateTo('/client/tickets/burial')
  }, 5000)
}

// Функция для закрытия SuccessModal
const closeSuccessModal = () => {
  showSuccessModal.value = false
  navigateTo('/client/tickets/burial')
}

// Загружаем данные при монтировании компонента
onMounted(() => {
  loadBurialData()
})

// Computed property для отображения даты похорон
const displayBurialDate = computed(() => {
  if (burialData.value?.burial_date) {
    const date = new Date(burialData.value.burial_date).toLocaleDateString()
    const time = burialData.value.burial_time ? ` ${burialData.value.burial_time}` : ''
    return `${date}${time}`
  }
  return 'Не указано'
})

// Computed property для класса цвета даты похорон
const burialDateClass = computed(() => {
  return burialData.value?.burial_date ? 'text-[#222222]' : 'text-[#939393]'
})

</script>

<template>
  <div class="bg-[#FAFAFA] min-h-[100vh] py-[70px]">
    <div v-if="loading" class="container flex justify-center items-center min-h-[400px]">
      <div class="text-xl text-[#38949B]">Загрузка...</div>
    </div>
    
    <div v-else-if="error" class="container flex justify-center items-center min-h-[400px]">
      <div class="text-xl text-red-500">{{ error }}</div>
    </div>
    
    <div v-else class="container flex gap-[24px]">
      <div class="max-w-[777px] w-full">
        <div class="w-full h-[61px] p-[20px] flex items-center bg-[#fff] rounded-[16px] gap-[16px]">
          <button tybe="button" class="bg-[#EEEEEE] rounded-md px-[21px] py-[10px] flex items-center gap-[10px] font-semibold text-sm text-[#224C4F]" @click="$router.go(-1)">
            <img src="/icons/back-blue.svg" alt="" class=""> Назад
          </button>
          <h3 class="text-4xl font-medium">Бронирование: <span class="text-[#38949B]">{{ burialData?.request_number || 'N/A' }}</span></h3>
        </div>
        <div class="w-full p-[20px] bg-[#fff] rounded-[16px] text-4xl font-semibold mt-[24px]">
          <div class="flex items-center gap-[10px]">
            <h3 class="text-2xl font-medium font-roboto text-[#222222]">Данные покойного</h3>
          </div>
          <div class="grid grid-cols-2 gap-[12px] mt-[24px]">
            <div>
              <p class="text-sm text-[#222222] font-roboto font-normal">ИИН</p>
              <input type="text" v-model="burialData.deceased.inn" class="w-[100%] h-[60px] !border !border-[#222222] rounded-lg pl-[16px] text-lg input" readonly>
            </div>
            <div>
              <p class="text-sm text-[#222222] font-roboto font-normal">ФИО</p>
              <input type="text" v-model="burialData.deceased.full_name" class="w-[100%] h-[60px] !border !border-[#222222] rounded-lg pl-[16px] text-lg input" readonly>
            </div>
          </div>
        </div>
        <div class="w-full p-[20px] bg-[#fff] rounded-[16px] text-2xl font-medium font-roboto text-[#222222] mt-[24px]">
          <div class="flex items-center gap-[24px]">
              Даты 
              <div>
                <label class="relative inline-block w-14 h-8 cursor-pointer select-none">
                  <input v-model="switcher" type="checkbox" class="sr-only peer input">
                  <span
                    class="absolute inset-0 bg-gray-200 rounded-full transition-colors
                          peer-focus:ring-2 peer-focus:ring-blue-500
                          peer-checked:bg-blue-500"/>
                  <span
                    class="absolute left-0 top-0 bg-white w-8 h-8 rounded-full shadow-md transition-transform
                          peer-checked:translate-x-6"/>
                </label>
              </div>
              <span v-if="!burialData?.burial_date && !burialData?.deceased?.death_date" class="text-sm text-[#D63C3C] font-roboto">Необходимо указать даты похорон</span>
          </div>
          <div v-if="switcher" class="grid grid-cols-2 gap-[12px] gap-y-[24px] mt-[24px]">
            <div>
              <p class="text-sm text-[#222222] font-roboto font-normal">Дата смерти</p>
              <input type="date" v-model="deathDate" class="w-[100%] h-[60px] !border !border-[#222222] rounded-lg pl-[16px] text-base input">
            </div>
            <div>
              <p class="text-sm text-[#222222] font-roboto font-normal pb-2">Заключение о смерти от мед учреждения:</p>
              <input type="file" accept=".pdf" class="w-[100%] h-[60px]  rounded-lg text-base file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#38949B] file:text-white hover:file:bg-[#2a6f75]" @change="handleFileSelect">
            </div>
            <div>
              <p class="text-sm text-[#222222] font-roboto font-normal">Дата похорон</p>
              <input type="date" v-model="burialDate" class="w-[100%] h-[60px] !border !border-[#222222] rounded-lg pl-[16px] text-base input">
            </div>
            <div>
              <p class="text-sm text-[#222222] font-roboto font-normal">Время похорон</p>
              <input type="time" v-model="burialData.burial_time" class="w-[100%] h-[60px] !border !border-[#222222] rounded-lg pl-[16px] text-base input" placeholder="00:00">
            </div>
          </div>
        </div>
      </div>
      <div class="p-[20px] bg-white rounded-lg max-w-[376px] h-fit">
        <h3 class="text-2xl text-[#222222] font-medium my-[16px]">
          {{ burialData?.cemetery_name || 'Кладбище' }}
        </h3>
        <div class="border-b border-[#EEEEEE] pb-[16px] flex items-center">
          <h4 class="text-base font-medium font-roboto text-[#222222] w-[105px]">
            Срок брони:
          </h4>
          <span class="text-base font-bold font-roboto text-[#222222]">
            {{ burialData?.reservation_expires_at ? new Date(burialData.reservation_expires_at).toLocaleDateString() : 'Не указано' }}
          </span>
          <img class="ml-[16px]" src="/icons/info.svg" alt="">
        </div>
        <div class="border-b border-[#EEEEEE] pb-[16px] pt-[16px] flex items-center">
          <h4 class="text-base font-medium font-roboto text-[#222222] w-[105px]">
            Сектор:
          </h4>
          <span class="text-base font-bold font-roboto text-[#222222]">{{ burialData?.sector_number || 'Не указано' }}</span>
        </div>
        <div class="border-b border-[#EEEEEE] pb-[16px] pt-[16px] flex items-center">
          <h4 class="text-base font-medium font-roboto text-[#222222] w-[105px]">
            Место:
          </h4>
          <span class="text-base font-bold font-roboto text-[#222222]">{{ burialData?.grave_id || 'Не указано' }}</span>
        </div>
        <div class="border-b border-[#EEEEEE] pb-[16px] pt-[16px] flex items-center">
          <h4 class="text-base font-medium font-roboto text-[#222222] w-[105px]">
            ФИО покойного:
          </h4>
          <span class="text-base font-bold font-roboto text-[#222222]">{{ burialData?.deceased?.full_name || 'Не указано' }}</span>
        </div>
        <div class="border-b border-[#EEEEEE] pb-[16px] pt-[16px] flex items-center">
          <h4 class="text-base font-medium font-roboto text-[#222222] w-[105px]">
            Дата похорон:
          </h4>
          <span class="text-base font-light font-roboto" :class="burialDateClass">
            {{ displayBurialDate }}
          </span>
        </div>
        <div class="border-b border-[#EEEEEE] pb-[16px] pt-[16px] flex items-center">
          <h4 class="text-base font-medium font-roboto text-[#222222] w-[105px]">
            Статус:
          </h4>
          <span class="text-base font-bold font-roboto" :class="{
            'text-green-600': burialData?.status === 'approved',
            'text-yellow-600': burialData?.status === 'pending',
            'text-red-600': burialData?.status === 'rejected',
            'text-[#222222]': !burialData?.status
          }">
            {{ burialData?.status === 'pending' ? 'В ожидании' : 
               burialData?.status === 'approved' ? 'Одобрено' :
               burialData?.status === 'rejected' ? 'Отклонено' : 'Не указано' }}
          </span>
        </div>
        <div class="border-b border-[#EEEEEE] pb-[16px] pt-[16px] flex items-center">
          <h4 class="text-base font-medium font-roboto text-[#222222] w-[105px]">
            Телефон кладбища:
          </h4>
          <span class="text-base font-bold font-roboto text-[#222222]">{{ burialData?.cemetery_phone || 'Не указано' }}</span>
        </div>
        <div>
          <h3 class="font-roboto text-2xl font-bold text-[#222222] mb-[16px]">К оплате</h3>
          <div class="flex justify-between items-center">
            <h4 class="text-base font-medium font-roboto text-[#222222] w-[105px]">Госпошлина</h4> 
            <p class="text-2xl font-medium font-roboto text-[#222222] w-[105px]">57 000 ₸</p>
          </div>
        </div>
        <button class="text-base font-semibold font-roboto w-full h-[51px] rounded-lg bg-[#339B38] text-white mt-[24px]" 
                :disabled="burialData?.status !== 'pending'"
                :class="{'opacity-50 cursor-not-allowed': burialData?.status !== 'pending'}"
                @click="openPaymentModal">
          Оформить место 
        </button>
      </div>
    </div>
    <Teleport to="body">
      <PaymentModal 
        :visible="paymentModalVisible" 
        :burial-data="burialData"
        :death-certificate-file="deathCertificateFile"
        @close="paymentModalVisible = false" 
        @success="handlePaymentSuccess"
      />
    </Teleport>
    <Teleport to="body">
      <SuccessModal 
        v-if="showSuccessModal"
        title="Оплата прошла успешно, заявка на захоронения отправлена!"
        text="Отслеживайте статус в личном кабинете"
        @close="closeSuccessModal"
      />
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.container {
  max-width: 1170px;
  width: 100%;
  margin: auto;
}
</style>
