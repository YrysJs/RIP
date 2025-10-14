<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-semibold">Детальная информация о захоронении</h3>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div v-if="burial" class="space-y-4">
        <!-- Информация о заявителе -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h4 class="font-semibold text-lg mb-3 text-gray-800">Информация о заявителе</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-600">ФИО заявителя</label>
              <p class="text-gray-900">{{ burial.applicant_name }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-600">Email</label>
              <p class="text-gray-900">{{ burial.applicant_email }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-600">Телефон</label>
              <p class="text-gray-900">{{ formatPhoneNumber(burial.applicant_phone) }}</p>
            </div>
          </div>
        </div>

        <!-- Информация о покойном -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h4 class="font-semibold text-lg mb-3 text-gray-800">Информация о покойном</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-600">Фамилия</label>
              <p class="text-gray-900">{{ burial.deceased_surname }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-600">Имя</label>
              <p class="text-gray-900">{{ burial.deceased_name }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-600">Отчество</label>
              <p class="text-gray-900">{{ burial.deceased_patronym }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-600">Дата рождения</label>
              <p class="text-gray-900">{{ formatDate(burial.birth_date) }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-600">Дата смерти</label>
              <p class="text-gray-900">{{ formatDate(burial.death_date) }}</p>
            </div>
          </div>
        </div>

        <!-- Дополнительная информация -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h4 class="font-semibold text-lg mb-3 text-gray-800">Дополнительная информация</h4>
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-600">Тип запроса</label>
              <p class="text-gray-900">{{ getRequestTypeText(burial.request_type) }}</p>
            </div>
            <div v-if="burial.additional_info">
              <label class="text-sm font-medium text-gray-600">Дополнительные сведения</label>
              <p class="text-gray-900">{{ burial.additional_info }}</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-600">Дата создания</label>
                <p class="text-gray-900">{{ formatDateTime(burial.created_at) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Дата обновления</label>
                <p class="text-gray-900">{{ formatDateTime(burial.updated_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end mt-6">
        <button 
          @click="$emit('close')" 
          class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
        >
          Закрыть
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  burial: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['close'])

function formatPhoneNumber(phone) {
  if (!phone || !/^\d{11}$/.test(phone)) return 'Неверный формат номера';
  return `+${phone[0]} (${phone.slice(1, 4)}) ${phone.slice(4, 7)} ${phone.slice(7, 9)} ${phone.slice(9, 11)}`;
}

function formatDate(dateString) {
  if (!dateString) return 'Не указано';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU');
}

function formatDateTime(dateString) {
  if (!dateString) return 'Не указано';
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU');
}

function getRequestTypeText(type) {
  const types = {
    'search': 'Поиск захоронения',
    'burial': 'Захоронение',
    'reburial': 'Перезахоронение'
  };
  return types[type] || type;
}
</script>
