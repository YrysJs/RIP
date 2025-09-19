<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { createAppeal } from '~/services/client'
import { getCurrentUser } from '~/services/login'

const router = useRouter()

const userInfo = ref(null)

const appeal_types = ref([
  { id: 1, value: 'COMPLAINT',        nameRu: 'Жалоба' },
  { id: 2, value: 'OFFER',            nameRu: 'Предложение' },
  { id: 3, value: 'REQUEST_FOR_INFO', nameRu: 'Запросы информации' }
])

const selected_appeal_type = ref(null)
const appeal_content = ref('')

const attachments = ref([])

/* files */
const pushFileWithPreview = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    attachments.value.push({ id: Date.now() + Math.random(), url: e.target.result, file })
  }
  reader.readAsDataURL(file)
}
const onDrop = (e) => { e.preventDefault(); Array.from(e.dataTransfer?.files || []).forEach(pushFileWithPreview) }
const onPickFiles = (e) => { Array.from(e.target.files).forEach(pushFileWithPreview); e.target.value = '' }
const removeFile = (i, ev) => { ev?.stopPropagation?.(); attachments.value.splice(i, 1) }

/* submit */
async function userCreateAppeal () {
  try {
    if (!selected_appeal_type.value) return
    await createAppeal({
      userPhone: userInfo.value.phone,
      typeId: selected_appeal_type.value,
      content: appeal_content.value,
      akimatId: 6,
    })
    router.push('/client/goverment/requests')
  } catch (e) {
    console.error(e)
  }
}

onMounted(async () => {
  const res = await getCurrentUser({ id: localStorage.getItem('user_id') })
  userInfo.value = res.data
})

const maxLen = 3500
const cnt = computed(() => `${appeal_content.value.length}/${maxLen}`)
</script>

<template>
  <NuxtLayout name="client">
    <div class="page-head">
      <h1 class="page-title">Создание обращения в акимат</h1>
    </div>

    <div class="form-card">
      <div class="form-grid">
        <!-- Тип обращения -->
        <div class="field">
          <label class="field__label">Тип обращения:</label>
          <div class="select-wrap">
            <select v-model="selected_appeal_type" class="select">
              <option :value="null" disabled>Выберите обращение</option>
              <option v-for="t in appeal_types" :key="t.id" :value="t.id">
                {{ t.nameRu }}
              </option>
            </select>
          </div>
        </div>

        <!-- Текст обращения -->
        <div class="field">
          <label class="field__label">Обращение:</label>
          <div class="textarea-wrap">
            <textarea
              v-model="appeal_content"
              :maxlength="maxLen"
              class="textarea"
              placeholder="Напишите текст вашего обращения ...."
            />
            <div class="counter">{{ cnt }}</div>
          </div>
        </div>

        <!-- Документ -->
        <div class="field">
          <div class="field__label">Документ:</div>

          <div
            v-if="!attachments.length"
            class="dropzone"
            @click="$refs.fileInput.click()"
            @dragover.prevent
            @drop="onDrop"
          >
            <input ref="fileInput" type="file" multiple class="hidden" @change="onPickFiles" />
            <div class="dz-row">
              <svg viewBox="0 0 24 24" class="dz-ico" aria-hidden="true">
                <path d="M12 3v12m0-12l-4 4m4-4l4 4M4 15v4a2 2 0 002 2h12a2 2 0 002-2v-4"
                      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span class="dz-accent">Загрузите файлы</span>
              <span class="dz-sub">или перетащите их</span>
            </div>
          </div>

          <div v-else class="gallery-center">
            <div class="gallery-grid">
              <div
                v-for="(doc, i) in attachments"
                :key="doc.id"
                class="image-preview-container"
                @click.stop
                title="Документ"
              >
                <img src="/images/doc.png" alt="" class="image-preview" />
                <div class="image-overlay">
                  <button class="remove-btn" @click="removeFile(i, $event)">✕</button>
                </div>
                <div class="image-number">{{ i + 1 }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Кнопка без линии -->
      <div class="actions">
        <button class="btn-yellow" @click="userCreateAppeal">Создать обращение</button>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
/* Заголовок */
.page-head{ background:#fff; border-radius:16px; padding:16px 20px; display:flex; align-items:center;}
.page-title{ font-family:"FoglihtenNo06", serif; font-weight:700; letter-spacing:.02em; font-size:28px; color:#1C140E; margin:0; }

/* Карточка */
.form-card{ background:#fff; border-radius:16px; padding:20px 16px; }
.form-grid{ display:flex; flex-direction:column; gap:16px; }

/* Поля */
.field{ display:flex; flex-direction:column; gap:8px; }
.field__label{ color:#1F2937; font-size:14px; }

.select-wrap{ position:relative; border:1px solid #E6E6E6; border-radius:10px; height:44px; overflow:hidden; }
.select{
  appearance:none; width:100%; height:44px; padding:0 44px 0 12px; font-size:14px; color:#111827; outline:none; border:none;
  background:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="%238C8C8C" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>') no-repeat right 12px center/18px;
}

.textarea-wrap{ position:relative; }
.textarea{ width:100%; min-height:120px; resize:vertical; border:1px solid #E6E6E6; border-radius:10px; padding:10px 12px; font-size:14px; outline:none; }
.counter{ position:absolute; right:12px; bottom:8px; font-size:12px; color:#8C8C8C; }

/* Дроп-зона */
.dropzone{ border:1px dashed #E6E6E6; border-radius:12px; min-height:120px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background .15s ease; padding:14px; }
.dropzone:hover{ background:#FAFAFA; }
.dz-row{ display:flex; align-items:center; gap:8px; white-space:nowrap; }
.dz-ico{ width:22px; height:22px; color:#9AA0A6; }
.dz-accent{ font-weight:800; color:#F7B500; }
.dz-sub{ font-size:14px; color:#8C8C8C; }

/* Превью документов */
.gallery-center{ display:flex; justify-content:center; }
.gallery-grid{ margin-top:8px; display:flex; flex-wrap:wrap; gap:16px; justify-content:center; }
.image-preview-container{ width:120px; height:120px; position:relative; border-radius:8px; overflow:hidden; border:2px solid #E5E7EB; }
.image-preview{ width:120px; height:100%; display:block; }
.image-overlay{ position:absolute; inset:0; background:rgba(0,0,0,.7); display:flex; align-items:center; justify-content:center; gap:12px; opacity:0; transition:opacity .25s ease; }
.image-preview-container:hover .image-overlay{ opacity:1; }
.remove-btn{ background:#EF4444; color:#fff; font-size:18px; padding:4px 8px; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; border:none; cursor:pointer; }
.image-number{ position:absolute; top:4px; left:4px; background:rgba(0,0,0,.7); color:#fff; font-size:12px; font-weight:600; padding:2px 6px; border-radius:4px; min-width:20px; text-align:center; }

/* Кнопка (без линии) */
.actions{ position:sticky; bottom:12px; margin-top:24px; display:flex; justify-content:flex-end; }
.btn-yellow{ background:#F7B500; color:#1F2937; font-weight:700; border:none; cursor:pointer; height:44px; padding:0 18px; border-radius:10px; transition:filter .15s ease; box-shadow:0 1px 0 rgba(0,0,0,.06); }
.btn-yellow:hover{ filter:brightness(.98); }

/* утилита */
.hidden{ display:none; }
</style>
