<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import Cookies from "js-cookie";

import { createRequest } from "~/services/client";
import { setAkimatFile } from "~/services/akimat";
import { getCemeteries } from "~/services/cemetery";
import { getUser } from "~/services/login";
import { parseJwt } from "~/utils/parseJwt";
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();
const router = useRouter();

/* ---- state ---- */
const token = ref(Cookies.get("token"));
const userInfo = ref(null);

const cemeteries = ref([]);
const fromBurialId = ref(0);
const toBurialId = ref(0);
const reason = ref("");
const foreign_cemetry = ref("");

/* файлы */
const death_certificate = ref([]); // свидетельство о смерти
const proof_of_relation = ref([]); // подтверждение родства
const grave_doc = ref([]); // документ на могилу

/* ---- helpers: превью + drag&drop ---- */
const onDrop = (list, e) => {
  e.preventDefault();
  const files = Array.from(e.dataTransfer?.files || []);
  list.push(...files);
};

/* инпуты */
const handleUpload = (list, e) => {
  const files = Array.from(e.target.files || []);
  list.push(...files);
  if (e.target) e.target.value = "";
};

/* удалить */
const removeFile = (list, i, ev) => {
  ev?.stopPropagation?.();
  list.splice(i, 1);
};

/* ---- submit (как у тебя) ---- */
const uploadToAkimat = async (files) => {
  if (!files?.length) return "";
  const fd = new FormData();
  fd.append("Authorization", Cookies.get("token")); // если бэку нужен именно field
  for (const f of files) fd.append("files", f); // массив File
  const res = await setAkimatFile(fd);
  return res?.data?.files?.[0]?.fileUrl || "";
};

async function userCreateAppeal() {
  try {
    const dcUrl = await uploadToAkimat(death_certificate.value);
    const prUrl = await uploadToAkimat(proof_of_relation.value);
    const gdUrl = await uploadToAkimat(grave_doc.value);

    await createRequest({
      userPhone: userInfo.value.phone,
      fromBurialId: fromBurialId.value,
      toBurialId: toBurialId.value,
      reason: reason.value,
      foreign_cemetry: foreign_cemetry.value,
      akimatId: 6,
      death_certificate: dcUrl,
      proof_of_relation: prUrl,
      grave_doc: gdUrl,
    });

    router.push("/client/burial");
  } catch (e) {
    console.error(t('errors.fetchError'), e);
  }
}

/* ---- кладбища ---- */
const fallbackCemeteries = [
  { id: 101, name: "Центральное кладбище" },
  { id: 102, name: "Северное кладбище" },
  { id: 103, name: "Южное кладбище" },
];
const cemeteryOptions = computed(() =>
  Array.isArray(cemeteries.value) && cemeteries.value.length
    ? cemeteries.value
    : fallbackCemeteries
);

const isFormValid = computed(() => {
  return (
    fromBurialId.value > 0 &&
    toBurialId.value > 0 &&
    reason.value.trim().length > 0 &&
    death_certificate.value.length > 0 &&
    proof_of_relation.value.length > 0 &&
    grave_doc.value.length > 0
  );
});

onMounted(async () => {
  const parsed = parseJwt(token.value);
  const u = await getUser({ phone: parsed.sub });
  userInfo.value = u.data;

  try {
    const c = await getCemeteries();
    cemeteries.value = c.data.data || [];
  } catch {
    cemeteries.value = [];
  }
});
</script>

<template>
  <NuxtLayout name="client">
    <!-- Заголовок -->
    <div>
      <h1 class="page-title">{{ $t('burialCreate.title') }}</h1>

      <!-- Форма -->
      <div class="form-card">
        <div class="form-grid">
          <!-- Старое место -->
          <div class="field">
            <label class="field__label">{{ $t('burialCreate.oldBurialPlace') }}</label>
            <div class="select-wrap">
              <select v-model="fromBurialId" class="select">
                <option value="0" disabled>{{ $t('burialCreate.selectCemetery') }}</option>
                <option
                  v-for="cem in cemeteries"
                  :key="cem.id"
                  :value="cem.id"
                >
                  {{ locale === 'kk' && cem.name_kz ? cem.name_kz : cem.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Новое место -->
          <div class="field">
            <label class="field__label">{{ $t('burialCreate.newBurialPlace') }}</label>
            <div class="select-wrap">
              <select v-model="toBurialId" class="select">
                <option value="0" disabled>{{ $t('burialCreate.selectCemetery') }}</option>
                <option
                  v-for="cem in cemeteries"
                  :key="cem.id"
                  :value="cem.id"
                >
                  {{ locale === 'kk' && cem.name_kz ? cem.name_kz : cem.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Причина -->
          <div class="field">
            <label class="field__label">{{ $t('burialCreate.reason') }}</label>
            <div class="textarea-wrap">
              <textarea
                v-model="reason"
                maxlength="500"
                class="textarea"
                :placeholder="$t('burialCreate.reasonPlaceholder')"
              />
              <div class="counter">{{ reason.length }}/500</div>
            </div>
          </div>

          <!-- Свидетельство о смерти -->
          <div class="field">
            <div class="field__label">{{ $t('burialCreate.deathCertificate') }}</div>

            <!-- нет файлов — дроп-зона -->
            <div
              v-if="!death_certificate.length"
              class="dropzone"
              @click="$refs.dcInput.click()"
              @dragover.prevent
              @drop="onDrop(death_certificate, $event)"
            >
              <input
                ref="dcInput"
                type="file"
                multiple
                class="hidden"
                @change="handleUpload(death_certificate, $event)"
              />
              <div class="dz-in">
                <img class="dz-ico" src="/icons/upload.svg" alt="" />
                <p class="dz-accent">
                  {{ $t('burialCreate.uploadFiles') }} <span class="dz-sub">{{ $t('burialCreate.orDrag') }}</span>
                </p>
              </div>
            </div>

            <!-- есть файлы — центр карточки -->
            <div v-else class="gallery-center">
              <div class="gallery-grid">
                <div
                  v-for="(file, index) in death_certificate"
                  :key="index"
                  class="file-card"
                >
                  <div class="image-preview-container">
                    <img
                      src="/images/doc.png"
                      :alt="$t('burialCreate.document')"
                      class="image-preview"
                    />
                    <div class="image-overlay">
                      <button
                        class="remove-btn"
                        @click="removeFile(death_certificate, index, $event)"
                      >
                        ✕
                      </button>
                    </div>
                    <div class="image-number">{{ index + 1 }}</div>
                  </div>
                  <p class="gallery-in">
                    {{ file.name }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Подтверждение родства заявителя -->
          <div class="field">
            <div class="field__label">{{ $t('burialCreate.proofOfRelation') }}</div>

            <div
              v-if="!proof_of_relation.length"
              class="dropzone"
              @click="$refs.prInput.click()"
              @dragover.prevent
              @drop="onDrop(proof_of_relation, $event)"
            >
              <input
                ref="prInput"
                type="file"
                multiple
                class="hidden"
                @change="handleUpload(proof_of_relation, $event)"
              />
              <div class="dz-in">
                <img class="dz-ico" src="/icons/upload.svg" alt="" />
                <p class="dz-accent">
                  {{ $t('burialCreate.uploadFiles') }} <span class="dz-sub">{{ $t('burialCreate.orDrag') }}</span>
                </p>
              </div>
            </div>

            <div v-else class="gallery-center">
              <div class="gallery-grid">
                <div
                  v-for="(file, index) in proof_of_relation"
                  :key="index"
                  class="file-card"
                >
                  <div class="image-preview-container">
                    <img
                      src="/images/doc.png"
                      :alt="$t('burialCreate.document')"
                      class="image-preview"
                    />
                    <div class="image-overlay">
                      <button
                        class="remove-btn"
                        @click="removeFile(proof_of_relation, index, $event)"
                      >
                        ✕
                      </button>
                    </div>
                    <div class="image-number">{{ index + 1 }}</div>
                  </div>
                  <p class="gallery-in">
                    {{ file.name }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Документ на могилу -->
          <div class="field">
            <div class="field__label">{{ $t('burialCreate.graveDocument') }}</div>

            <div
              v-if="!grave_doc.length"
              class="dropzone"
              @click="$refs.gdInput.click()"
              @dragover.prevent
              @drop="onDrop(grave_doc, $event)"
            >
              <input
                ref="gdInput"
                type="file"
                multiple
                class="hidden"
                @change="handleUpload(grave_doc, $event)"
              />
              <div class="dz-in">
                <img class="dz-ico" src="/icons/upload.svg" alt="" />
                <p class="dz-accent">
                  {{ $t('burialCreate.uploadFiles') }} <span class="dz-sub">{{ $t('burialCreate.orDrag') }}</span>
                </p>
              </div>
            </div>

            <div v-else class="gallery-center">
              <div class="gallery-grid">
                <div
                  v-for="(file, index) in grave_doc"
                  :key="index"
                  class="file-card"
                >
                  <div class="image-preview-container">
                    <img
                      src="/images/doc.png"
                      :alt="$t('burialCreate.document')"
                      class="image-preview"
                    />
                    <div class="image-overlay">
                      <button
                        class="remove-btn"
                        @click="removeFile(grave_doc, index, $event)"
                      >
                        ✕
                      </button>
                    </div>
                    <div class="image-number">{{ index + 1 }}</div>
                  </div>
                  <p class="gallery-in">
                    {{ file.name }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопка -->
        <div class="actions">
          <button 
            class="btn-yellow" 
            :disabled="!isFormValid"
            :class="{ 'btn-disabled': !isFormValid }"
            @click="userCreateAppeal"
          >
            {{ $t('burialCreate.createRequest') }}
          </button>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
/* Заголовок */
.page-title {
  font-family: "Manrope", serif;
  letter-spacing: 0.02em;
  font-size: clamp(24px, 3vw, 32px);
  color: #1c140e;
  margin: 0;
}

/* Карточка */
.form-card {
  background: #fff;
  margin-top: 16px;
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
  color: #000;
  font-size: 18px;
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
  min-height: 100px;
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

/* Кнопка */
.actions {
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
.btn-disabled {
  background-color: #d1d5db !important;
  color: #9ca3af !important;
  cursor: not-allowed !important;
  opacity: 0.6;
}
.btn-disabled:hover {
  background-color: #d1d5db !important;
}

/* утилиты */
.hidden {
  display: none;
}

@media (max-width: 639px) {
  .btn-yellow {
    width: 100%;
  }
}
</style>
