<script setup>
import { ref } from 'vue'

const selectedImages = ref([])
const imagePreviews = ref([])

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
</script>

<template>
    <div class="container">
        <div class="flex items-center bg-white p-5 rounded-2xl mb-4 bg-[#fff]">
            <button class="btn btn-back mr-4" @click="router.push('/supplier/services/active')">
                <img class="w-4 h-4 mr-[10px]" src="/icons/arrow-left-primary.svg" alt="">
                Назад
            </button>

            <h1 class="text-[32px] font-medium">Добавление товара/услуги</h1>
        </div>
        <div class="bg-white p-5 rounded-2xl space-y-4 mb-4">
            <div class="flex justify-between items-center">
                <h3>Lorem, ipsum dolor.</h3>
                <button class="flex items-center gap-2">
                    <img src="/icons/share.svg" alt=""> поделиться
                </button>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div class="photo-upload-container">
                    <!-- Область загрузки фото -->
                    <div 
                        class="upload-area"
                        @click="$refs.fileInput.click()"
                    >
                        <div class="upload-content">
                            <div class="upload-icon">📷</div>
                            <p class="upload-text">Загрузить фото</p>
                            <p class="upload-hint">Нажмите для выбора нескольких файлов</p>
                        </div>
                    </div>
                    
                    <!-- Галерея превью изображений -->
                    <div v-if="imagePreviews.length > 0" class="images-gallery">
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
                        <p>Дата рождения: 12.09.1954</p>
                        <p>Дата смерти: 12.09.1954</p>
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
                            <div>Северное кладбище</div>
                        </div>
                        <div class="flex justify-between text-base font-medium">
                            <div>Сектор</div>
                            <div>11</div>
                        </div>
                        <div class="flex justify-between text-base font-medium">
                            <div>Место:</div>
                            <div>233</div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <h3 class="text-[18px] font-medium mb-4">
                    Эпитафия
                </h3>
                texta                
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
    height: 200px;
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

.images-gallery {
    margin-top: 20px;
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
</style>