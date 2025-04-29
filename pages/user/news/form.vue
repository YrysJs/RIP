<template>
  <NuxtLayout name="user">
    <div class="news-create bg-white rounded-[16px] p-[24px] mt-[20px] w-full">
      <!-- Назад и заголовок -->
      <button class="btn-back mb-[16px]" @click="router.push('/user/news')">
        <img src="/icons/arrow-left-primary.svg" class="w-4 h-4 mr-[10px]" />
        Назад
      </button>

      <h1 class="text-2xl font-semibold mb-[24px]">Создание новости</h1>

      <!-- Выбор категории -->
      <div class="form-group mb-[24px]">
        <label class="label">Выберите категорию</label>
        <select class="form-select">
          <option>Перезахоронение</option>
          <option>Новая категория</option>
        </select>
      </div>

      <!-- Название новости -->
      <div class="form-group mb-[24px]">
        <label class="label">Название новости</label>
        <input type="text" class="form-input" placeholder="Введите название" v-model="newsTitle" />
      </div>

      <!-- Загрузка обложки -->
      <div class="upload-area mb-[24px]">
        <div class="upload-placeholder">
          <p class="text-[#38949B] font-semibold mb-2">Загрузите обложку новости</p>
          <p class="text-xs text-[#6B7280] leading-relaxed text-center">
            Оптимальный размер: 1200х630 пикселей. <br/>
            Минимальное разрешение: 600х315 пикселей.<br/>
            Формат: JPEG, PNG.<br/>
            Пропорции: Соотношение сторон 16:9<br/>
            Размер файла: Не превышать 1–2 MB.
          </p>
        </div>
      </div>

      <!-- Текст новости -->
      <div class="form-group mb-[24px]">
        <label class="label">Заполните основной текст новости</label>

        <div class="editor-toolbar flex gap-2 mb-2">
          <button class="editor-btn">B</button>
          <button class="editor-btn">I</button>
          <button class="editor-btn">U</button>
          <button class="editor-btn">•</button>
          <button class="editor-btn">1.</button>
          <button class="editor-btn">🅣</button>
        </div>

        <textarea
            v-model="newsContent"
            class="form-textarea"
            placeholder="Введите текст новости..."
        ></textarea>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref } from 'vue';
const router = useRouter();

const newsTitle = ref('');
const newsContent = ref('');
</script>

<style lang="scss" scoped>
.news-create {
  background: #ffffff;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.04);
  border-radius: 16px;
}

.btn-back {
  @apply flex items-center bg-[#EEEEEE] text-[#224C4F] rounded-md px-[16px] py-[10px] font-medium text-sm;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 6px;
}

.form-select, .form-input {
  border: none;
  border-bottom: 1px solid #d1d5db;
  padding: 8px 0;
  font-size: 16px;
  background: transparent;
  outline: none;

  &:focus {
    border-color: #224C4F;
  }
}

.upload-area {
  width: 100%;
  min-height: 300px;
  border: 1px dashed #38949B;
  border-radius: 8px;
  background: #F9FAFB;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-placeholder {
  text-align: center;
}

.editor-toolbar {
  button {
    @apply bg-[#F3F4F6] text-[#374151] rounded-md p-2 text-sm font-bold;
    min-width: 32px;
    height: 32px;
  }
}

.form-textarea {
  width: 100%;
  min-height: 200px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 12px;
  resize: vertical;
  font-size: 14px;
  background: #F9FAFB;
}
</style>
