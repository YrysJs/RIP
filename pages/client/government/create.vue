<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { createAppeal } from "~/services/client";
import { getCurrentUser } from "~/services/login";

const router = useRouter();

const userInfo = ref(null);
const loading = ref(false);

const appeal_types = ref([
  { id: 1, value: "COMPLAINT", nameRu: "Жалоба" },
  { id: 2, value: "OFFER", nameRu: "Предложение" },
  { id: 3, value: "REQUEST_FOR_INFO", nameRu: "Запросы информации" },
]);

const selected_appeal_type = ref(null);
const appeal_content = ref("");

// ----------- ДОКУМЕНТЫ -----------
const grave_doc = ref([]); // File[]
const errors = ref([]);

const ACCEPT_MIME = ["application/pdf", "image/jpeg", "image/png"];
const MAX_FILES = 5;
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

function prettySize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function validateFiles(fileList) {
  const incoming = Array.from(fileList || []);
  const msgs = [];
  const filtered = [];

  // лимит по количеству
  if (grave_doc.value.length + incoming.length > MAX_FILES) {
    msgs.push(`Можно загрузить не более ${MAX_FILES} файлов.`);
  }

  for (const f of incoming) {
    if (!ACCEPT_MIME.includes(f.type)) {
      msgs.push(`"${f.name}" — недопустимый тип. Разрешено: PDF/JPEG/PNG.`);
      continue;
    }
    if (f.size > MAX_SIZE_BYTES) {
      msgs.push(
        `"${f.name}" превышает ${MAX_SIZE_MB} MB (${prettySize(f.size)}).`
      );
      continue;
    }
    // дедуп по name+size+lastModified
    const key = `${f.name}_${f.size}_${f.lastModified}`;
    const exists = grave_doc.value.some(
      (g) => `${g.name}_${g.size}_${g.lastModified}` === key
    );
    if (exists) continue;

    filtered.push(f);
  }

  return { filtered, msgs };
}

function pushFiles(files) {
  const { filtered, msgs } = validateFiles(files);
  errors.value = msgs.length ? msgs : [];
  if (filtered.length) grave_doc.value.push(...filtered);
}

function handleUpload(e) {
  pushFiles(e.target.files);
  e.target.value = "";
}

function onDrop(e) {
  e.preventDefault();
  if (e.dataTransfer?.files?.length) pushFiles(e.dataTransfer.files);
}

function removeFile(index, e) {
  e?.stopPropagation?.();
  grave_doc.value.splice(index, 1);
}

/* submit */
async function userCreateAppeal() {
  try {
    if (!selected_appeal_type.value) {
      errors.value = ["Выберите тип обращения."];
      return;
    }

    loading.value = true;
    errors.value = [];
    let payload;
    const hasFiles = grave_doc.value.length > 0;

    if (hasFiles) {
      const form = new FormData();
      form.append("userPhone", userInfo.value.phone);
      form.append("typeId", String(selected_appeal_type.value));
      form.append("content", appeal_content.value);
      form.append("akimatId", String(6));
      for (const f of grave_doc.value) form.append("graveDocuments", f, f.name);
       payload = form;
    } else {
      payload = {
        userPhone: userInfo.value.phone,
        typeId: selected_appeal_type.value,
        content: appeal_content.value,
        akimatId: 6,
      };
    }

    await createAppeal(payload);
    router.push("/client/government");
  } catch (e) {
    console.error(e);
    errors.value = ["Не удалось создать обращение. Попробуйте позже."];
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  const res = await getCurrentUser({ id: localStorage.getItem("user_id") });
  userInfo.value = res.data;
});

const maxLen = 3500;
const cnt = computed(() => `${appeal_content.value.length}/${maxLen}`);
</script>

<template>
  <NuxtLayout name="client">
    <div>
      <div class="page-head">
        <h1 class="page-title">{{ $t('governmentCreate.title') }}</h1>
      </div>

      <div class="form-card">
        <div class="form-grid">
          <!-- Тип обращения -->
          <div class="field">
            <label class="field__label">{{ $t('governmentCreate.appealType') }}</label>
            <div class="select-wrap">
              <select v-model="selected_appeal_type" class="select">
                <option :value="null" disabled>{{ $t('governmentCreate.selectAppeal') }}</option>
                <option v-for="t in appeal_types" :key="t.id" :value="t.id">
                  {{ t.nameRu }}
                </option>
              </select>
            </div>
          </div>

          <!-- Текст обращения -->
          <div class="field">
            <label class="field__label">{{ $t('governmentCreate.appeal') }}</label>
            <div class="textarea-wrap">
              <textarea
                v-model="appeal_content"
                :maxlength="maxLen"
                class="textarea"
                :placeholder="$t('governmentCreate.appealPlaceholder')"
              />
              <div class="counter">{{ cnt }}</div>
            </div>
          </div>

<!--          <div class="field">-->
<!--            <div class="field__label">Документ:</div>-->

<!--            <div-->
<!--              v-if="!grave_doc.length"-->
<!--              class="dropzone"-->
<!--              @click="$refs.gdInput.click()"-->
<!--              @dragover.prevent-->
<!--              @drop="onDrop"-->
<!--            >-->
<!--              <input-->
<!--                ref="gdInput"-->
<!--                type="file"-->
<!--                multiple-->
<!--                accept=".pdf,image/jpeg,image/png"-->
<!--                class="hidden"-->
<!--                @change="handleUpload"-->
<!--              />-->
<!--              <div class="dz-in">-->
<!--                <img class="dz-ico" src="/icons/upload.svg" alt="" />-->
<!--                <p class="dz-accent">-->
<!--                  Загрузите файлы <span class="dz-sub">или перетащите их</span>-->
<!--                </p>-->
<!--              </div>-->
<!--            </div>-->

<!--            <div v-else class="gallery-center">-->
<!--              <div class="gallery-grid">-->
<!--                <div-->
<!--                  v-for="(file, index) in grave_doc"-->
<!--                  :key="index"-->
<!--                  class="file-card"-->
<!--                >-->
<!--                  <div class="image-preview-container">-->
<!--                    <img-->
<!--                      src="/images/doc.png"-->
<!--                      alt="Документ"-->
<!--                      class="image-preview"-->
<!--                    />-->
<!--                    <div class="image-overlay">-->
<!--                      <button-->
<!--                        class="remove-btn"-->
<!--                        @click="removeFile(index, $event)"-->
<!--                      >-->
<!--                        ✕-->
<!--                      </button>-->
<!--                    </div>-->
<!--                    <div class="image-number">{{ index + 1 }}</div>-->
<!--                  </div>-->
<!--                  <p class="gallery-in">-->
<!--                    {{ file.name }}-->
<!--                  </p>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->

<!--            <p v-if="errors.length" class="text-sm text-[#D63C3C] mt-2">-->
<!--              <span v-for="(m, i) in errors" :key="i">{{ m }}<br /></span>-->
<!--            </p>-->
<!--          </div>-->
        </div>

        <!-- Кнопка -->
        <div class="actions">
          <button
            class="btn-yellow"
            :disabled="
              loading || !selected_appeal_type || !appeal_content.trim()
            "
            @click="userCreateAppeal"
          >
            {{ loading ? $t('common.creating') : $t('client.government.createAppeal') }}
          </button>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
/* Заголовок */
.page-head {
  margin-bottom: 16px;
}
.page-title {
  font-family: "FoglihtenNo06", serif;
  font-size: clamp(24px, 3vw, 32px);
  color: #201001;
}

/* Карточка */
.form-card {
  background: #fff;
  border-radius: 16px;
}
.form-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Поля */
.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.field__label {
  color: #1f2937;
  font-size: 14px;
}

.select-wrap {
  position: relative;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  height: 44px;
  overflow: hidden;
}
.select {
  appearance: none;
  width: 100%;
  height: 44px;
  padding: 0 44px 0 12px;
  font-size: 14px;
  color: #111827;
  outline: none;
  border: none;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="%238C8C8C" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>')
    no-repeat right 12px center/18px;
}

.textarea-wrap {
  position: relative;
}
.textarea {
  width: 100%;
  min-height: 120px;
  resize: vertical;
  border: 1px solid #e6e6e6;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  outline: none;
}
.counter {
  position: absolute;
  right: 12px;
  bottom: 8px;
  font-size: 12px;
  color: #8c8c8c;
}

/* Кнопка */
.actions {
  position: sticky;
  bottom: 12px;
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}
.btn-yellow {
  background: #e9b949;
  color: #000;
  font-weight: 500;
  font-size: 14px;
  border: none;
  cursor: pointer;
  height: 44px;
  padding: 0 18px;
  border-radius: 10px;
  transition: filter 0.15s ease;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
}
.btn-yellow:hover {
  background-color: #d1a53f;
}
.btn-yellow:active {
  background-color: #b88f34;
}
.btn-yellow[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
  filter: none;
}
@media (max-width: 639px) {
  .btn-yellow {
    width: 100%;
  }
}

/* Дроп-зона */
.dropzone {
  background-color: #f3f4f6;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 14px;
}
.dropzone:hover {
  background-color: #e5e7eb;
  border-color: #9ca3af;
}
.dz-ico {
  margin: 0 auto 8px;
}
.dz-accent {
  font-weight: 500;
  color: #e9b949;
}
.dz-sub {
  font-size: 16px;
  color: #17212a;
}

/* Галерея карточек — центр */
.gallery-center {
  display: flex;
  justify-content: center;
}
.gallery-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}
.gallery-in {
  margin-top: 8px;
  font-size: 14px;
  text-align: center;
}
.file-card {
  width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Плитка документа (как у тебя была) */
.image-preview-container {
  width: 120px;
  height: 120px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
}
.image-preview {
  width: 120px;
  height: 100%;
  display: block;
}
.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.25s ease;
}
.image-preview-container:hover .image-overlay {
  opacity: 1;
}
.remove-btn {
  background: #ef4444;
  color: #fff;
  font-size: 18px;
  padding: 4px 8px;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
}
.image-number {
  position: absolute;
  top: 4px;
  left: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  min-width: 20px;
  text-align: center;
}
</style>
