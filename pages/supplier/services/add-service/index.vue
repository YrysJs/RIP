<script setup>
import { ref, reactive, onMounted } from 'vue'
import { createProduct, getCategories } from '~/services/supplier'

const form = reactive({
  name: '',
  description: '',
  price: '',
  category_id: '1',
  type: 'service',
  availability: true,
  country: 'Казахстан',
  city: 'Алматы',
  service_time: '1 день'
});

const photos = ref([])
const fileInput = ref(null)
const loading = ref(false)
const categories = ref([])

function selectFile() {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

function handleFileChange(event) {
  const target = event.target
  const files = target.files
  if (files) {
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          photos.value.push({ 
            url: e.target.result,
            file: file
          })
        }
      }
      reader.readAsDataURL(file)
    })
  }
  target.value = ''
}

function removePhoto(index) {
  photos.value.splice(index, 1)
}

function showPreview() {
  // Валидация основных полей перед предпросмотром
  if (!form.name.trim()) {
    alert('Пожалуйста, введите название товара/услуги для предпросмотра')
    return
  }
  
  if (!form.description.trim()) {
    alert('Пожалуйста, введите описание товара/услуги для предпросмотра')
    return
  }
  
  // Можно открыть модальное окно с предпросмотром или перейти на отдельную страницу
  alert(`Предпросмотр товара/услуги:
  
Название: ${form.name}
Описание: ${form.description}
Цена: ${form.price} ₸
Тип: ${form.type === 'service' ? 'Услуга' : 'Товар'}
Категория: ${getCategoryName(form.category_id)}
Страна: ${form.country}
Город: ${form.city}
Время выполнения: ${form.service_time}
Доступность: ${form.availability ? 'Доступен' : 'Недоступен'}
Количество фото: ${photos.value.length}`)
}

function getCategoryName(categoryId) {
  const category = categories.value.find(cat => cat.id.toString() === categoryId.toString())
  return category ? category.name : 'Неизвестная категория'
}

async function submitForm() {
  try {
    // Валидация обязательных полей
    if (!form.name.trim()) {
      alert('Пожалуйста, введите название товара/услуги')
      return
    }
    
    if (!form.description.trim()) {
      alert('Пожалуйста, введите описание товара/услуги')
      return
    }
    
    if (!form.price || parseFloat(form.price) <= 0) {
      alert('Пожалуйста, введите корректную цену')
      return
    }
    
    loading.value = true
    
    // Подготавливаем данные для отправки
    const productData = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: form.price,
      category_id: form.category_id,
      type: form.type,
      availability: form.availability,
      country: form.country,
      city: form.city,
      service_time: form.service_time,
      images: photos.value.map(photo => photo.file).filter(Boolean)
    }
    
    // Отправляем запрос
    await createProduct(productData)
    
    // Показываем успешное сообщение
    alert('Товар/услуга успешно создана!')
    
    // Перенаправляем на страницу товаров на рассмотрении
    await router.push('/supplier/services/consideration')
    
  } catch (error) {
    console.error('Ошибка при создании товара/услуги:', error)
    
    // Более детальное сообщение об ошибке
    let errorMessage = 'Ошибка при создании товара/услуги. Попробуйте еще раз.'
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message) {
      errorMessage = error.message
    }
    
    alert(errorMessage)
  } finally {
    loading.value = false
  }
}

const router = useRouter();

// Загружаем категории при инициализации компонента
onMounted(async () => {
  try {
    const response = await getCategories()
    categories.value = response.data || []
    
    // Устанавливаем первую категорию по умолчанию, если она есть
    if (categories.value.length > 0) {
      form.category_id = categories.value[0].id.toString()
    }
  } catch (error) {
    console.error('Ошибка при загрузке категорий:', error)
    // Fallback к статичным категориям в случае ошибки
    categories.value = [
      { id: 1, name: 'Ритуальные услуги' },
      { id: 2, name: 'Памятники и мемориалы' },
      { id: 3, name: 'Цветы и венки' },
      { id: 4, name: 'Прочие услуги' }
    ]
  }
})
</script>

<template>
  <NuxtLayout name="form">
    <div class="flex items-center bg-white p-5 rounded-2xl mb-4">
      <button class="btn btn-back mr-4" @click="router.push('/supplier/services/active')">
        <img class="w-4 h-4 mr-[10px]" src="/icons/arrow-left-primary.svg" alt="">
        Назад
      </button>

      <h1 class="text-[32px] font-medium">Добавление товара/услуги</h1>
    </div>

    <div class="bg-white p-5 rounded-2xl space-y-4 mb-4">
      <h2 class="text-lg font-medium">О товаре/услуге</h2>

      <div>
        <label class="block text-sm mb-1">Категория:</label>
        <select v-model="form.category_id" class="input">
          <option v-for="category in categories" :value="category.id">{{ category.name }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm mb-1">Тип:</label>
        <select v-model="form.type" class="input">
          <option value="service">Услуга</option>
          <option value="product">Товар</option>
        </select>
      </div>

      <div>
        <label class="block text-sm mb-1">Название:</label>
        <input v-model="form.name" type="text" class="input" placeholder="Введите название" required>
      </div>

      <div>
        <label class="block text-sm mb-1">Описание:</label>
        <textarea v-model="form.description" rows="3" class="input textarea" placeholder="Введите описание" required/>
      </div>

      <div>
        <label class="block text-sm mb-1">Цена товара/услуги (₸):</label>
        <input v-model="form.price" type="number" class="input max-w-[200px] w-full" placeholder="0" required>
      </div>

      <div>
        <label class="block text-sm mb-1">Доступность:</label>
        <div class="flex items-center gap-4">
          <label class="flex items-center">
            <input v-model="form.availability" type="radio" :value="true" class="mr-2">
            Доступен
          </label>
          <label class="flex items-center">
            <input v-model="form.availability" type="radio" :value="false" class="mr-2">
            Недоступен
          </label>
        </div>
      </div>
    </div>

    <div class="bg-white p-5 rounded-2xl space-y-4 mb-4">
      <h2 class="text-lg font-medium">Фото товара</h2>
      <div class="flex flex-wrap gap-[10px] items-center">
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
            multiple
            @change="handleFileChange"
          >
        </div>
      </div>
    </div>

    <div class="bg-white p-5 rounded-2xl space-y-4 mb-4">
      <h2 class="text-lg font-medium">Местоположение оказания услуг</h2>
    
      <div>
        <label class="block text-sm mb-1">Страна:</label>
        <select v-model="form.country" class="input">
          <option value="Казахстан">Казахстан</option>
          <option value="Узбекистан">Узбекистан</option>
          <option value="Кыргызстан">Кыргызстан</option>
          <option value="Таджикистан">Таджикистан</option>
        </select>
      </div>
      <div>
        <label class="block text-sm mb-1">Город:</label>
        <select v-model="form.city" class="input">
          <option value="Алматы">Алматы</option>
          <option value="Астана">Астана</option>
          <option value="Шымкент">Шымкент</option>
          <option value="Тараз">Тараз</option>
        </select>
      </div>
    </div>

    <div class="bg-white p-5 rounded-2xl space-y-4 mb-4">
      <h2 class="text-lg font-medium">Доп информация</h2>
    
      <div>
        <label class="block text-sm mb-1">Время оказания услуги/товара:</label>
        <select v-model="form.service_time" class="input">
          <option value="Менее 1 дня">Менее 1 дня</option>
          <option value="1 день">1 день</option>
          <option value="от 1 до 3 дней">от 1 до 3 дней</option>
          <option value="неделя">неделя</option>
          <option value="1 час">1 час</option>
        </select>
      </div>
    </div>

    <div class="bg-white p-5 rounded-2xl mb-4 flex gap-[10px] justify-end">
      <button class="btn btn-preview" :disabled="loading" @click="showPreview">
        Предпросмотр
      </button>
      <button class="btn btn-submit" @click="submitForm" :disabled="loading">
        <span v-if="loading">Создание...</span>
        <span v-else>Опубликовать</span>
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.btn-submit {
  height: 52px;
  background: #38949B;
  color: #fff;
  padding: 16px;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: #38949B;
  }
}
</style>