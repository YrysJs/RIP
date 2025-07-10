<script setup>
import { ref } from 'vue'
import { createMemorial, getBurialRequestById } from '~/services/client'

const route = useRoute()
const router = useRouter()

// Данные захоронения
const burial = ref(null)

const selectedImages = ref([])
const imagePreviews = ref([])

// Состояние для видео
const showVideoInput = ref(false)
const videoUrl = ref('')
const videos = ref([])

// Состояние для достижений (фото)
const achievementPhotos = ref([])

// Состояние формы
const epitaph = ref('')
const aboutPerson = ref('')
const isPublic = ref(false)
const isSubmitting = ref(false)

const deceasedId = ref(2)

// Загрузка данных захоронения
const loadBurialData = async () => {
  try {
    if (route.query.id) {
      const response = await getBurialRequestById(route.query.id)
      burial.value = response.data
    }
  } catch (error) {
    console.error('Ошибка при загрузке данных захоронения:', error)
  }
}

// Загружаем данные при монтировании компонента
onMounted(() => {
  loadBurialData()
})

const handleImageUpload = (event) => {
  const files = Array.from(event.target.files)
  
  files.forEach(file => {
    if (file && file.type.startsWith('image/')) {
      selectedImages.value.push(file)
      
      // Создаем URL для превью
      const reader = new FileReader()
      reader.onload = (e) => {
        imagePreviews.value.push({
          id: Date.now() + Math.random(), // уникальный ID
          url: e.target.result,
          file: file
        })
      }
      reader.readAsDataURL(file)
    }
  })
  
  // Очищаем input для возможности повторной загрузки
  event.target.value = ''
}

const removeImage = (index) => {
  selectedImages.value.splice(index, 1)
  imagePreviews.value.splice(index, 1)
}

const removeAllImages = () => {
  selectedImages.value = []
  imagePreviews.value = []
}

// Функции для работы с видео
const showVideoInputField = () => {
  showVideoInput.value = true
}

const extractYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return (match && match[2].length === 11) ? match[2] : null
}

const addVideo = () => {
  if (videoUrl.value.trim()) {
    const videoId = extractYouTubeId(videoUrl.value)
    if (videoId) {
      const newVideo = {
        id: Date.now() + Math.random(),
        url: videoUrl.value,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        title: `Видео ${videos.value.length + 1}`
      }
      videos.value.push(newVideo)
      videoUrl.value = ''
      showVideoInput.value = false
    }
  }
}

const removeVideo = (index) => {
  videos.value.splice(index, 1)
}

const cancelVideoInput = () => {
  videoUrl.value = ''
  showVideoInput.value = false
}

// Функции для достижений (фото)
const handleAchievementPhotoUpload = (event) => {
  const files = Array.from(event.target.files)
  
  files.forEach(file => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        achievementPhotos.value.push({
          id: Date.now() + Math.random(),
          url: e.target.result,
          file: file
        })
      }
      reader.readAsDataURL(file)
    }
  })
  
  event.target.value = ''
}

const removeAchievementPhoto = (index) => {
  achievementPhotos.value.splice(index, 1)
}

// Функция создания мемориала
const submitMemorial = async () => {
  try {
    isSubmitting.value = true
    
    // Подготавливаем данные для отправки
    const formData = {
      deceased_id: +burial.value?.deceased?.id,
      epitaph: epitaph.value,
      about_person: aboutPerson.value,
      is_public: isPublic.value,
      photos: selectedImages.value, // основные фото мемориала
      achievements: achievementPhotos.value.map(photo => photo.file), // фото достижений
      video_urls: videos.value.map(video => video.url) // URL видео
    }
    
    const response = await createMemorial(formData)
    
    // Успешно создано
    alert('Мемориал успешно создан!')
    console.log('Memorial created:', response)
    
    // Можно перенаправить пользователя
    // await navigateTo('/client/memorials')
    
  } catch (error) {
    console.error('Error creating memorial:', error)
    alert('Ошибка при создании мемориала: ' + (error.response?.data?.message || error.message))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
    <div class="container">
        <div class="flex items-center bg-white p-5 rounded-2xl mb-4 bg-[#fff]">
            <button class="btn btn-back mr-4" @click="router.push('/client/memorial')">
                <img class="w-4 h-4 mr-[10px]" src="/icons/arrow-left-primary.svg" alt="">
                Назад
            </button>

            <h1 class="text-[32px] font-medium">Мемориал</h1>
        </div>
        <div class="bg-white p-5 rounded-2xl space-y-4 mb-4">
            <div class="flex justify-between items-center">
                <h3 class="text-[24px] font-medium">{{ burial?.deceased?.full_name }}</h3>
                <button class="flex items-center gap-2">
                    <img src="/icons/share.svg" alt=""> поделиться
                </button>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div class="photo-upload-container">
                    <!-- Область загрузки фото -->
                    <div 
                        v-if="imagePreviews.length === 0"
                        class="upload-area"
                        @click="$refs.fileInput.click()"
                    >
                        <div class="upload-content">
                            <div class="upload-icon">📷</div>
                            <p class="upload-text">Загрузить фото</p>
                            <p class="upload-hint">Нажмите для выбора нескольких файлов</p>
                        </div>
                    </div>
                    
                    <!-- Галерея превью изображений внутри блока загрузки -->
                    <div v-else class="upload-area-with-images">
                        <div class="gallery-header">
                            <h4>Загруженные фото ({{ imagePreviews.length }})</h4>
                            <button 
                                @click="removeAllImages"
                                class="remove-all-btn"
                            >
                                Удалить все
                            </button>
                        </div>
                        
                        <div class="gallery-grid">
                            <div 
                                v-for="(preview, index) in imagePreviews" 
                                :key="preview.id"
                                class="image-preview-container"
                            >
                                <img :src="preview.url" alt="Preview" class="image-preview">
                                <div class="image-overlay">
                                    <button 
                                        @click="removeImage(index)"
                                        class="remove-btn"
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div class="image-number">{{ index + 1 }}</div>
                            </div>
                        </div>
                        
                        <!-- Кнопка добавления еще фото -->
                        <button 
                            @click="$refs.fileInput.click()"
                            class="add-more-btn"
                        >
                            + Добавить еще фото
                        </button>
                    </div>
                    
                    <!-- Скрытый input для файлов -->
                    <input 
                        ref="fileInput"
                        type="file" 
                        accept="image/*" 
                        multiple
                        @change="handleImageUpload"
                        class="hidden"
                    >
                </div>
                <div>
                    <div class="border-b border-[#EEEEEE] pb-4 font-medium text-base">
                        <p>Дата смерти: {{ new Date(burial?.deceased?.death_date).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) }}</p>
                    </div>
                    <div>
                        <h3 class="text-[18px] font-medium mb-4">
                            Информация о захоронении
                        </h3>
                        <div class="flex justify-between text-base font-medium">
                            <div>Страна</div>
                            <div>Казахстан</div>
                        </div>
                        <div class="flex justify-between text-base font-medium">
                            <div>Город</div>
                            <div>Алматы</div>
                        </div>
                        <div class="flex justify-between text-base font-medium">
                            <div>Кладбище:</div>
                            <div>{{ burial?.cemetery_name }}</div>
                        </div>
                        <div class="flex justify-between text-base font-medium">
                            <div>Сектор</div>
                            <div>{{ burial?.sector_number }}</div>
                        </div>
                        <div class="flex justify-between text-base font-medium">
                            <div>Место:</div>
                            <div>{{ burial?.grave_id }}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <h3 class="text-[18px] font-medium mb-1">
                    Эпитафия
                </h3>
                <textarea 
                    v-model="epitaph"
                    class="border border-[#222222] rounded-lg p-4 w-full" 
                    placeholder="Введите эпитафию..."
                    rows="4"
                ></textarea>                
            </div>
            <div>
                <h3 class="text-[18px] font-medium mb-1">
                    О человеке
                </h3>
                <textarea 
                    v-model="aboutPerson"
                    class="border border-[#222222] rounded-lg p-4 w-full" 
                    placeholder="Расскажите о человеке..."
                    rows="4"
                ></textarea>                
            </div>
            <div class="flex items-center gap-2">
                <span class="text-[18px] font-semibold">Публичная личность </span> 
                <input v-model="isPublic" type="checkbox"> 
                <span class="text-base text-[#939393]">Цифровой мемориал этого человека приватный и доступен только по ссылке</span>
            </div>
            <div>
                <h3 class="text-[18px] font-medium mb-1">
                    Достижения
                </h3>
                
                <!-- Кнопка загрузки фото -->
                <button 
                    @click="$refs.achievementFileInput.click()"
                    class="bg-[#EEEEEE] w-[120px] h-[28px] font-semibold text-[#224C4F] rounded-lg hover:bg-[#DDD] transition-colors mb-4"
                >
                    Добавить
                </button>
                
                <!-- Скрытый input для файлов -->
                <input 
                    ref="achievementFileInput"
                    type="file" 
                    accept="image/*" 
                    multiple
                    @change="handleAchievementPhotoUpload"
                    class="hidden"
                >
                
                <!-- Галерея фото достижений -->
                <div v-if="achievementPhotos.length > 0" class="achievement-photos-gallery">
                    <div class="gallery-header">
                        <h4>Фото достижений ({{ achievementPhotos.length }})</h4>
                    </div>
                    
                    <div class="gallery-grid">
                        <div 
                            v-for="(photo, index) in achievementPhotos" 
                            :key="photo.id"
                            class="image-preview-container"
                        >
                            <img :src="photo.url" alt="Achievement photo" class="image-preview">
                            <div class="image-overlay">
                                <button 
                                    @click="removeAchievementPhoto(index)"
                                    class="remove-btn"
                                >
                                    ✕
                                </button>
                            </div>
                            <div class="image-number">{{ index + 1 }}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <h3 class="text-[18px] font-medium mb-1">
                    Видеоматериалы
                </h3>
                
                <!-- Кнопка добавления видео -->
                <button 
                    v-if="!showVideoInput" 
                    @click="showVideoInputField"
                    class="bg-[#EEEEEE] w-[120px] h-[28px] font-semibold text-[#224C4F] rounded-lg hover:bg-[#DDD] transition-colors mb-4"
                >
                    Добавить
                </button>
                
                <!-- Поле ввода ссылки -->
                <div v-if="showVideoInput" class="video-input-container">
                    <div class="flex gap-2 mb-4">
                        <input 
                            v-model="videoUrl"
                            type="text" 
                            placeholder="Вставьте ссылку на YouTube видео"
                            class="flex-1 border border-[#222222] rounded-lg p-3 text-base"
                            @keyup.enter="addVideo"
                        >
                        <button 
                            @click="addVideo"
                            class="bg-[#224C4F] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#1a3a3c] transition-colors"
                        >
                            Добавить
                        </button>
                        <button 
                            @click="cancelVideoInput"
                            class="bg-[#EF4444] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#DC2626] transition-colors"
                        >
                            Отмена
                        </button>
                    </div>
                </div>
                
                <!-- Список видео плееров -->
                <div v-if="videos.length > 0" class="videos-list">
                    <div class="videos-header mb-4">
                        <h4 class="text-base font-medium">Добавленные видео ({{ videos.length }})</h4>
                    </div>
                    
                    <div class="videos-grid">
                        <div 
                            v-for="(video, index) in videos" 
                            :key="video.id"
                            class="video-item"
                        >
                            <div class="flex justify-between items-center mb-3">
                                <h5 class="text-sm font-medium text-gray-700">{{ video.title }}</h5>
                                <button 
                                    @click="removeVideo(index)"
                                    class="text-[#EF4444] hover:text-[#DC2626] font-medium transition-colors text-sm"
                                >
                                    Удалить
                                </button>
                            </div>
                            <div class="video-wrapper">
                                <iframe 
                                    :src="video.embedUrl"
                                    frameborder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowfullscreen
                                    class="video-iframe"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Кнопка создания мемориала -->
            <div class="bg-white p-5 rounded-2xl flex justify-end">
                <button 
                    @click="submitMemorial"
                    :disabled="isSubmitting"
                    class="bg-[#224C4F] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#1a3a3c] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <span v-if="isSubmitting">Создание мемориала...</span>
                    <span v-else>Создать мемориал</span>
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
    padding-top: 40px;
    padding-bottom: 40px;
}

.photo-upload-container {
    width: 100%;
    position: relative;
}

.upload-area {
    width: 100%;
    height: 225px;
    border: 2px dashed #E5E7EB;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: #F9FAFB;
    margin-bottom: 20px;

    &:hover {
        border-color: #6366F1;
        background-color: #F0F7FF;
    }
}

.upload-content {
    text-align: center;
    padding: 20px;
}

.upload-icon {
    font-size: 48px;
    margin: 0 auto 16px;
    opacity: 0.6;
    display: block;
}

.upload-text {
    font-size: 18px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
}

.upload-hint {
    font-size: 14px;
    color: #6B7280;
}

.upload-area-with-images {
    width: 100%;
    min-height: 225px;
    border: 2px solid #E5E7EB;
    border-radius: 12px;
    padding: 20px;
    background-color: #F9FAFB;
    margin-bottom: 20px;
}

.add-more-btn {
    width: 100%;
    padding: 12px;
    background-color: #F3F4F6;
    border: 2px dashed #D1D5DB;
    border-radius: 8px;
    color: #6B7280;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 16px;

    &:hover {
        background-color: #E5E7EB;
        border-color: #9CA3AF;
        color: #374151;
    }
}

.gallery-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    h4 {
        font-size: 16px;
        font-weight: 600;
        color: #374151;
        margin: 0;
    }
}

.remove-all-btn {
    padding: 6px 12px;
    background-color: #EF4444;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: #DC2626;
    }
}

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
}

.image-preview-container {
    width: 100%;
    height: 120px;
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid #E5E7EB;
}

.image-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    opacity: 0;
    transition: opacity 0.3s ease;

    .image-preview-container:hover & {
        opacity: 1;
    }
}

.image-number {
    position: absolute;
    top: 4px;
    left: 4px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: 12px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    min-width: 20px;
    text-align: center;
}

.change-btn, .remove-btn {
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 500;
    font-size: 14px;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
}

.change-btn {
    background-color: #6366F1;
    color: white;

    &:hover {
        background-color: #5B5BF7;
    }
}

.remove-btn {
    background-color: #EF4444;
    color: white;
    font-size: 18px;
    padding: 4px 8px;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background-color: #DC2626;
    }
}

.hidden {
    display: none;
}

// Стили для видео компонентов
.video-input-container {
    margin-top: 16px;
}

.videos-list {
    margin-top: 16px;
}

.videos-header {
    h4 {
        color: #374151;
        margin: 0;
    }
}

.videos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 20px;
}

.video-item {
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    padding: 16px;
    background-color: #F9FAFB;
    transition: all 0.3s ease;

    &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
}

.video-wrapper {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 56.25%; /* 16:9 aspect ratio */
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.video-iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 8px;
}

// Стили для галереи достижений
.achievement-photos-gallery {
    margin-top: 16px;
}
</style>