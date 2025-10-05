<script setup>
import { ref } from 'vue'
import { createAppeal } from '~/services/client'

const router = useRouter()

const appeal_types = ref([
    {
        id: 1,
        value: "COMPLAINT",
        nameRu: "Жалоба"
    },
    {
        id: 2,
        value: "OFFER",
        nameRu: "Предложение"
    },
    {
        id: 3,
        value: "REQUEST_FOR_INFO",
        nameRu: "Запросы информации"
    }
])

const selected_appeal_type = ref(null)
const appeal_content = ref('')
const isLoading = ref(false)

onMounted(() => {
  // Инициализация компонента
})

async function userCreateAppeal() {
    if (!selected_appeal_type.value || !appeal_content.value.trim()) {
        alert('Пожалуйста, заполните все поля')
        return
    }
    
    try {
        isLoading.value = true
        await createAppeal({
            typeId: selected_appeal_type.value,
            content: appeal_content.value,
            userPhone: '76112513629',
            statusId: '1',
            responsiblePhone: '73330450599',
            akimatId: 6
        })
        router.push('/supplier/goverment/requests')
    } catch (error) {
        console.log(error)
        alert('Ошибка при создании обращения')
    } finally {
        isLoading.value = false
    }
}

</script>

<template>
  <NuxtLayout name="supplier" class="government-create-page">
    <div class="w-full rounded-[16px]">
      <!-- Заголовок с кнопкой назад -->
      <div class="page-header">
        <button @click="router.back()" class="back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Назад
        </button>
        <h2 class="page-title">Создание обращения в Акимат</h2>
        </div>

      <!-- Форма -->
      <div class="form-card">
        <div class="form-content">
          <!-- Тип обращения -->
          <div class="field-group">
            <label class="field-label">Тип обращения</label>
            <div class="field relative">
              <select 
                v-model="selected_appeal_type" 
                class="field__control appearance-none w-full pr-[40px]"
                required
              >
                <option value="" disabled hidden>Выберите тип обращения</option>
                <option v-for="appeal_type in appeal_types" :key="appeal_type.id" :value="appeal_type.id">
                  {{ appeal_type.nameRu }}
                </option>
                    </select>
              <span class="field__chevron" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="#111827" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </div>
          </div>

          <!-- Текст обращения -->
          <div class="field-group">
            <label class="field-label">Обращение</label>
            <textarea 
              v-model="appeal_content" 
              class="field__control textarea"
              placeholder="Опишите ваше обращение..."
              required
            ></textarea>
          </div>

          <!-- Кнопка создания -->
          <div class="form-actions">
            <button 
              class="create-btn"
              @click="userCreateAppeal"
              :disabled="isLoading"
            >
              <div v-if="isLoading" class="btn-spinner"></div>
              {{ isLoading ? 'Создание...' : 'Создать обращение' }}
            </button>
                </div>
                </div>
            </div>
        </div>
     </NuxtLayout>
</template>

<style scoped lang="scss">
/* Заголовок страницы */
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  background: transparent;
  border-radius: 0;
  padding: 0;
  margin-bottom: 16px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #F3F4F6;
  color: #374151;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: #E5E7EB;
  color: #1F2937;
}

.page-title {
  font-family: "FoglihtenNo06", serif;
  font-weight: 700;
  letter-spacing: 0.02em;
  font-size: 24px;
  line-height: 1.2;
  margin: 0;
  color: #1c140e;
}

/* Форма */
.form-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #E5E7EB;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

/* Поля */
.field {
  position: relative;
}

.field__control {
  border: 1px solid #D2D8DF;
  background: #FFFFFF;
  padding: 12px 40px 12px 16px;
  border-radius: 12px;
  font-size: 16px;
  line-height: 24px;
  color: #111827;
  width: 100%;
  transition: all 0.2s ease;
}

.field__control:focus {
  border-color: #F7B500;
  box-shadow: 0 0 0 3px rgba(247, 181, 0, 0.1);
  outline: none;
}

.field__control::placeholder {
  color: #6B7280;
}

.textarea {
  min-height: 120px;
  padding: 12px 16px;
  resize: vertical;
}

.field__icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  pointer-events: none;
}

.field__chevron {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

select.field__control {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

select[required].field__control:invalid {
  color: #6B7280;
}

option[disabled][hidden] {
  display: none;
}

/* Кнопка */
.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #F7B500;
  color: #1F2937;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 160px;
  justify-content: center;
}

.create-btn:hover:not(:disabled) {
  background: #E6A300;
  transform: translateY(-1px);
}

.create-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Стили страницы */

/* Мобильные стили */
@media (max-width: 768px) {
  :global(.government-create-page .supplier .container) {
    margin: 0 !important;
    padding: 0 !important;
    max-width: 100% !important;
  }

  :global(.government-create-page .supplier .main-content) {
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Заголовок */
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin: 0 16px 16px;
    padding: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    border: none;
  }

  .back-btn {
    align-self: flex-start;
    height: 36px;
    padding: 6px 12px;
    font-size: 14px;
  }

  .page-title {
    font-size: 20px;
    text-align: center;
    width: 100%;
  }

  /* Форма */
  .form-card {
    margin: 0 16px 16px;
    padding: 16px;
    border-radius: 12px;
    background: #FDFCF9;
    box-shadow: 0 2px 8px rgba(46, 30, 23, 0.08);
    border: 1px solid #E0DED9;
  }

  .form-content {
    gap: 16px;
  }

  .field-label {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
  }

  .field__control {
    height: 44px;
    font-size: 16px;
    padding: 10px 40px 10px 16px;
  }

  .textarea {
    min-height: 100px;
    padding: 10px 16px;
  }

  .form-actions {
    justify-content: stretch;
  }

  .create-btn {
    width: 100%;
    height: 44px;
    font-size: 14px;
  }
}
</style>