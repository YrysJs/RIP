<script setup>
const memorial = ref({
  name: 'Беляков Макар Максимович',
  birthDate: '12.09.1954',
  deathDate: '10.04.2024',
  photo: null,
  additionalPhoto: null,
  location: {
    country: 'Казахстан', 
    city: 'Алматы',
    cemetery: 'Северное кладбище',
    sector: '11',
    place: '233'
  },
  memoryText: `Ты был для нас примером доброты, мудрости и безграничной щедрости. Его жизнь была наполнена заботой о других, любовью к своей семье и неутомимым стремлением всегда быть лучше.` 
})

const mainPhotoInput = ref(null)
const additionalPhotoInput = ref(null)

const uploadMainPhoto = () => {
  mainPhotoInput.value?.click()
}

const uploadAdditionalPhoto = () => {
  additionalPhotoInput.value?.click()
}

const handleMainPhotoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      memorial.value.photo = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleAdditionalPhotoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      memorial.value.additionalPhoto = e.target.result
    }
    reader.readAsDataURL(file)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-6xl mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-semibold text-gray-800">{{ memorial.name }}</h1>
          <div class="text-sm text-gray-600 flex items-center cursor-pointer hover:text-gray-800">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
            </svg>
            поделиться
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 py-8">
      <!-- Main Content Card -->
      <div class="bg-white rounded-lg shadow-sm border p-6">
        <!-- Dates -->
        <div class="mb-6">
          <div class="text-sm text-gray-600 mb-1">Дата рождения - Дата смерти</div>
          <div class="text-base font-medium">{{ memorial.birthDate }} - {{ memorial.deathDate }}</div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-12 gap-6">
          <!-- Left side - Photos -->
          <div class="col-span-8">
            <div class="grid grid-cols-2 gap-6">
              <!-- Main Photo -->
              <div class="aspect-[4/5]">
                <div 
                  v-if="!memorial.photo"
                  @click="uploadMainPhoto"
                  class="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 bg-gray-50"
                >
                  <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span class="text-gray-500 text-sm">Загрузить фото</span>
                </div>
                <div v-else class="relative w-full h-full">
                  <img 
                    :src="memorial.photo" 
                    :alt="memorial.name"
                    class="w-full h-full object-cover rounded-lg"
                  >
                  <button 
                    @click="uploadMainPhoto"
                    class="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                  </button>
                </div>
                <input 
                  ref="mainPhotoInput"
                  type="file" 
                  accept="image/*" 
                  @change="handleMainPhotoUpload"
                  class="hidden"
                >
              </div>

              <!-- Additional Photo -->
              <div class="aspect-[4/5]">
                <div 
                  v-if="!memorial.additionalPhoto"
                  @click="uploadAdditionalPhoto"
                  class="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 bg-gray-50"
                >
                  <svg class="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  <span class="text-gray-500 text-sm">Добавить фото</span>
                </div>
                <div v-else class="relative w-full h-full">
                  <img 
                    :src="memorial.additionalPhoto" 
                    alt="Дополнительное фото"
                    class="w-full h-full object-cover rounded-lg"
                  >
                  <button 
                    @click="uploadAdditionalPhoto"
                    class="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                  </button>
                </div>
                <input 
                  ref="additionalPhotoInput"
                  type="file" 
                  accept="image/*" 
                  @change="handleAdditionalPhotoUpload"
                  class="hidden"
                >
              </div>
            </div>
          </div>

          <!-- Right side - Information -->
          <div class="col-span-4">
            <div class="space-y-6">
              <!-- Location Info -->
              <div>
                <div class="flex justify-between items-start mb-4">
                  <h3 class="font-medium text-gray-700">Информация о захоронении</h3>
                  <span class="text-sm text-blue-600 cursor-pointer hover:text-blue-800">Координаты</span>
                </div>
                
                <div class="space-y-3 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Страна</span>
                    <span class="text-gray-800 font-medium">{{ memorial.location.country }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Город</span>
                    <span class="text-gray-800 font-medium">{{ memorial.location.city }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Кладбище:</span>
                    <span class="text-gray-800 font-medium">{{ memorial.location.cemetery }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Сектор</span>
                    <span class="text-gray-800 font-medium">{{ memorial.location.sector }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Место:</span>
                    <span class="text-gray-800 font-medium">{{ memorial.location.place }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Memory Text Section -->
      <div class="bg-white rounded-lg shadow-sm border p-6 mt-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 text-center">
          "Вечная память о тебе в сердцах близких"
        </h3>
        <div class="prose max-w-none text-gray-700 text-sm leading-relaxed">
          <p v-for="paragraph in memorial.memoryText.split('\n\n')" :key="paragraph" class="mb-4">
            {{ paragraph }}
          </p>
        </div>
      </div>

      <!-- Video Materials -->
      <div class="bg-white rounded-lg shadow-sm border p-6 mt-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Видеоматериалы</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Video placeholder -->
          <div class="relative group cursor-pointer">
            <div class="w-full h-32 bg-gray-200 rounded-lg shadow-sm group-hover:shadow-md transition-shadow flex items-center justify-center">
              <div class="w-12 h-12 bg-black bg-opacity-60 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div class="text-center mt-4">
          <button class="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors">
            Редактировать
          </button>
        </div>
      </div>

      <!-- Subscriptions Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        <!-- Subscriptions -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-800">Подписки</h3>
            <button class="text-blue-600 hover:text-blue-700 text-sm">добавить</button>
          </div>
          <div class="text-gray-600 text-sm">
            Пересылка заказа
          </div>
          <div class="mt-4 text-right">
            <button class="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors text-sm">
              Добавлено
            </button>
          </div>
        </div>

        <!-- One-time Services -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-800">Одноразовые услуги</h3>
            <button class="text-blue-600 hover:text-blue-700 text-sm">добавить</button>
          </div>
          <div class="text-gray-600 text-sm">
            Не выбрано
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.prose p:last-child {
  margin-bottom: 0;
}
</style>