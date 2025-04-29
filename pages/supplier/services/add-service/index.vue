<script setup lang="ts">
import { ref } from 'vue'
const form = reactive({
  title: '',
  description: '',
  address: '',
  religion: '',
  iin: '',
  firstname: '',
  middle: '',
  lastname: '',
  phone: '',
  status: true
});


const photos = ref([])

const fileInput = ref(null)

function selectFile() {
  fileInput.value.click()
}

function handleFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      // Добавляем фото в массив
      photos.value.push({ url: e.target.result })
    }
    reader.readAsDataURL(file)
  }
  event.target.value = ''
}

function removePhoto(index) {
  photos.value.splice(index, 1)
}

const router = useRouter();
</script>

<template>
  <NuxtLayout name="form">
    <div class="flex items-center bg-white p-5 rounded-2xl mb-4">
      <button class="btn btn-back mr-4" @click="router.push('/supplier/tickets/active')">
        <img class="w-4 h-4 mr-[10px]" src="/icons/arrow-left-primary.svg" alt="">
        Назад
      </button>

      <h1 class="text-[32px] font-medium">Добавление товара/услуги</h1>
    </div>


    <div class="bg-white p-5 rounded-2xl space-y-4 mb-4">
      <h2 class="text-lg font-medium">О товаре/услуге</h2>

      <div>
        <label class="block text-sm mb-1">Категория:</label>
        <div>
        <select v-model="form.religion" class="input">
          <option value="all">Все</option>
          <option value="christian">Христианство</option>
          <option value="muslim">Ислам</option>
          <option value="jewish">Иудаизм</option>
        </select>
      </div>
      </div>

      <div>
        <label class="block text-sm mb-1">Название:</label>
        <input v-model="form.address" type="text" class="input" >
      </div>

      <div>
        <label class="block text-sm mb-1">Описание:</label>
        <textarea v-model="form.description" rows="3" class="input textarea"/>
      </div>

      <div>
        <label class="block text-sm mb-1">Цена товара/услуги:</label>
        <select v-model="form.religion" class="input max-w-[200px] w-full">
          <option value="all">Варируется от</option>
          <option value="christian">Фиксировано</option>
        </select>
        <input v-model="form.address" type="text" class="input max-w-[200px] w-full ml-4" >
      </div>
    </div>

    <div class="bg-white p-5 rounded-2xl space-y-4 mb-4">
      <h2 class="text-lg font-medium">Фото товара</h2>
      <div class="flex flex-wrap gap-[10px] items-center ">
        <div
          v-for="(photo, index) in photos"
          :key="index"
          class="relative w-32 h-32 rounded border overflow-hidden"
        >
          <img
            :src="photo.url"
            alt="Preview"
            class="w-full h-full object-cover"
          >
          <button
            type="button"
            class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
            @click="removePhoto(index)"
          >
            ×
          </button>
        </div>

        <div
          class="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-[#38949B] rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
          @click="selectFile"
        >
          <p class="text-[#38949B] font-semibold">Загрузить</p>
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            accept="image/*"
            @change="handleFileChange"
          >
        </div>
      </div>
    </div>

    <div class="bg-white p-5 rounded-2xl space-y-4 mb-4">
      <h2 class="text-lg font-medium">Местоположение оказания услуг</h2>
    
      <div>
        <label class="block text-sm mb-1">Страна:</label>
        <select v-model="form.religion" class="input">
          <option value="all">Казахстан</option>
          <option value="christian">Узбекистан</option>
          <option value="muslim">Кыргызстан</option>
          <option value="jewish">Иудаизм</option>
        </select>
      </div>
      <div>
        <label class="block text-sm mb-1">Город:</label>
        <select v-model="form.religion" class="input">
          <option value="all">Алматы</option>
          <option value="christian">Астана</option>
          <option value="muslim">Шымкент</option>
          <option value="jewish">Тараз</option>
        </select>
      </div>
    </div>

    <div class="bg-white p-5 rounded-2xl space-y-4 mb-4">
      <h2 class="text-lg font-medium">Доп информация</h2>
    
      <div>
        <label class="block text-sm mb-1">Время оказания услуги/товара:</label>
        <select v-model="form.religion" class="input">
          <option value="all">1 день</option>
          <option value="christian">от 1 до 3 дней</option>
          <option value="muslim">неделя</option>
          <option value="jewish">Менее 1 дня</option>
        </select>
      </div>
    </div>

    <div class="bg-white p-5 rounded-2xl mb-4 flex gap-[10px] justify-end">
      <button class="btn btn-preview">
        Предпросмотр
      </button>
      <button class="btn btn-submit">
        Опубликовать
      </button>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.btn-back {
  height: 40px;
  padding: 12px 16px;
  font-size: 14px;
  color: #224C4F;
  background: #EEEEEE;
}

.btn-add {
  background: #224C4F;
  color: #fff;
  font-size: 14px;
  padding: 8px 16px;
}

.btn-preview {
  height: 52px;
  color: #222;
  background: #224C4F26;
  padding: 16px;
}

.btn-submit {
  height: 52px;
  background: #38949B;
  color: #fff;
  padding: 16px;
}
</style>