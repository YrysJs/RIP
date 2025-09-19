<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import Cookies from "js-cookie";

import { createRequest } from "~/services/client";
import { setAkimatFile } from "~/services/akimat";
import { getCemeteries } from "~/services/cemetery";
import { getUser } from "~/services/login";
import { parseJwt } from "~/utils/parseJwt";

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
const pushFileWithPreview = (listRef, file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    listRef.value.push({
      id: Date.now() + Math.random(),
      url: e.target.result,
      file,
    });
  };
  reader.readAsDataURL(file);
};
const onDrop = (listRef, e) => {
  e.preventDefault();
  const files = Array.from(e.dataTransfer?.files || []);
  files.forEach((f) => pushFileWithPreview(listRef, f));
};

/* инпуты */
const handleSertUpload = (e) => {
  Array.from(e.target.files).forEach((f) =>
    pushFileWithPreview(death_certificate, f)
  );
  e.target.value = "";
};
const handleProofUpload = (e) => {
  Array.from(e.target.files).forEach((f) =>
    pushFileWithPreview(proof_of_relation, f)
  );
  e.target.value = "";
};
const handleDocumentUpload = (e) => {
  Array.from(e.target.files).forEach((f) => pushFileWithPreview(grave_doc, f));
  e.target.value = "";
};

/* удалить */
const removeDeathSert = (i, ev) => {
  ev?.stopPropagation?.();
  death_certificate.value.splice(i, 1);
};
const removeProof = (i, ev) => {
  ev?.stopPropagation?.();
  proof_of_relation.value.splice(i, 1);
};
const removeDoc = (i, ev) => {
  ev?.stopPropagation?.();
  grave_doc.value.splice(i, 1);
};

/* ---- submit (как у тебя) ---- */
async function userCreateAppeal() {
  try {
    const sertFormData = new FormData();
    const proofFormData = new FormData();
    const docFormData = new FormData();
    let sertRes, proofRes, docRes;

    sertFormData.append("Authorization", Cookies.get("token"));
    if (death_certificate.value.length) {
      if (Array.isArray(death_certificate.value)) {
        death_certificate.value.forEach((item) =>
          sertFormData.append("files", item.file)
        );
      } else {
        sertFormData.append("files", death_certificate.value.file);
      }
      sertRes = await setAkimatFile(sertFormData);
    }

    proofFormData.append("Authorization", Cookies.get("token"));
    if (proof_of_relation.value.length) {
      if (Array.isArray(proof_of_relation.value)) {
        proof_of_relation.value.forEach((item) =>
          proofFormData.append("files", item.file)
        );
      } else {
        proofFormData.append("files", proof_of_relation.value.file);
      }
      proofRes = await setAkimatFile(proofFormData);
    }

    docFormData.append("Authorization", Cookies.get("token"));
    if (grave_doc.value.length) {
      if (Array.isArray(grave_doc.value)) {
        grave_doc.value.forEach((item) =>
          docFormData.append("files", item.file)
        );
      } else {
        docFormData.append("files", grave_doc.value.file);
      }
      docRes = await setAkimatFile(docFormData);
    }

    await createRequest({
      userPhone: userInfo.value.phone,
      fromBurialId: fromBurialId.value,
      toBurialId: toBurialId.value,
      reason: reason.value,
      foreign_cemetry: foreign_cemetry.value,
      akimatId: 6,
      death_certificate: death_certificate.value.length
        ? sertRes.data?.files?.[0]?.fileUrl || ""
        : "",
      proof_of_relation: proof_of_relation.value.length
        ? proofRes.data?.files?.[0]?.fileUrl || ""
        : "",
      grave_doc: grave_doc.value.length
        ? docRes.data?.files?.[0]?.fileUrl || ""
        : "",
    });

    router.push("/client/goverment/requests");
  } catch (e) {
    console.error(e);
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

onMounted(async () => {
  const parsed = parseJwt(token.value);
  const u = await getUser({ phone: parsed.sub });
  userInfo.value = u.data;

  try {
    const c = await getCemeteries();
    cemeteries.value = c.data || [];
  } catch {
    cemeteries.value = [];
  }
});
</script>

<template>
  <NuxtLayout name="client">
    <!-- Заголовок -->
    <div>
      <h1 class="page-title">Создание запроса на перезахоронение</h1>

      <!-- Форма -->
      <div class="form-card">
        <div class="form-grid">
          <!-- Старое место -->
          <div class="field">
            <label class="field__label">Старое место захоронения:</label>
            <div class="select-wrap">
              <select v-model="fromBurialId" class="select">
                <option value="0" disabled>Выберите кладбище</option>
                <option
                  v-for="cem in cemeteryOptions"
                  :key="cem.id"
                  :value="cem.id"
                >
                  {{ cem.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Новое место -->
          <div class="field">
            <label class="field__label">Новое место захоронения:</label>
            <div class="select-wrap">
              <select v-model="toBurialId" class="select">
                <option value="0" disabled>Выберите кладбище</option>
                <option
                  v-for="cem in cemeteryOptions"
                  :key="cem.id"
                  :value="cem.id"
                >
                  {{ cem.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Причина -->
          <div class="field">
            <label class="field__label">Причина:</label>
            <div class="textarea-wrap">
              <textarea
                v-model="reason"
                maxlength="500"
                class="textarea"
                placeholder="Причина перезахоронения..."
              />
              <div class="counter">{{ reason.length }}/500</div>
            </div>
          </div>

          <!-- Свидетельство о смерти -->
          <div class="field">
            <div class="field__label">Свидетельство о смерти:</div>

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
                @change="handleSertUpload"
              />
              <div class="dz-row">
                <svg viewBox="0 0 24 24" class="dz-ico">
                  <path
                    d="M12 3v12m0-12l-4 4m4-4l4 4M4 15v4a2 2 0 002 2h12a2 2 0 002-2v-4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
                <span class="dz-accent">Загрузите файлы</span>
                <span class="dz-sub">или перетащите их</span>
              </div>
            </div>

            <!-- есть файлы — центр карточки -->
            <div v-else class="gallery-center">
              <div class="gallery-grid">
                <div
                  v-for="(photo, index) in death_certificate"
                  :key="photo.id"
                  class="image-preview-container"
                  @click.stop
                >
                  <img
                    src="/images/doc.png"
                    alt="Документ"
                    class="image-preview"
                  />
                  <div class="image-overlay">
                    <button
                      class="remove-btn"
                      @click="removeDeathSert(index, $event)"
                    >
                      ✕
                    </button>
                  </div>
                  <div class="image-number">{{ index + 1 }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Подтверждение родства заявителя -->
          <div class="field">
            <div class="field__label">Подтверждение родства заявителя:</div>

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
                @change="handleProofUpload"
              />
              <div class="dz-row">
                <svg viewBox="0 0 24 24" class="dz-ico">
                  <path
                    d="M12 3v12m0-12l-4 4m4-4l4 4M4 15v4a2 2 0 002 2h12a2 2 0 002-2v-4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
                <span class="dz-accent">Загрузите файлы</span>
                <span class="dz-sub">или перетащите их</span>
              </div>
            </div>

            <div v-else class="gallery-center">
              <div class="gallery-grid">
                <div
                  v-for="(photo, index) in proof_of_relation"
                  :key="photo.id"
                  class="image-preview-container"
                  @click.stop
                >
                  <img
                    src="/images/doc.png"
                    alt="Документ"
                    class="image-preview"
                  />
                  <div class="image-overlay">
                    <button
                      class="remove-btn"
                      @click="removeProof(index, $event)"
                    >
                      ✕
                    </button>
                  </div>
                  <div class="image-number">{{ index + 1 }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Документ на могилу -->
          <div class="field">
            <div class="field__label">Документ на могилу:</div>

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
                @change="handleDocumentUpload"
              />
              <div class="dz-row">
                <svg viewBox="0 0 24 24" class="dz-ico">
                  <path
                    d="M12 3v12m0-12l-4 4m4-4l4 4M4 15v4a2 2 0 002 2h12a2 2 0 002-2v-4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
                <span class="dz-accent">Загрузите файлы</span>
                <span class="dz-sub">или перетащите их</span>
              </div>
            </div>

            <div v-else class="gallery-center">
              <div class="gallery-grid">
                <div
                  v-for="(photo, index) in grave_doc"
                  :key="photo.id"
                  class="image-preview-container"
                  @click.stop
                >
                  <img
                    src="/images/doc.png"
                    alt="Документ"
                    class="image-preview"
                  />
                  <div class="image-overlay">
                    <button
                      class="remove-btn"
                      @click="removeDoc(index, $event)"
                    >
                      ✕
                    </button>
                  </div>
                  <div class="image-number">{{ index + 1 }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Кнопка -->
        <div class="actions">
          <button class="btn-yellow" @click="userCreateAppeal">
            Создать запрос в акимат
          </button>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
/* Заголовок */
.page-title {
  font-family: "FoglihtenNo06", serif;
  letter-spacing: 0.02em;
  font-size: 32px;
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
  border: 1px dashed #e6e6e6;
  border-radius: 12px;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease;
  padding: 14px;
}
.dropzone:hover {
  background: #fafafa;
}
.dz-row {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.dz-ico {
  width: 22px;
  height: 22px;
  color: #9aa0a6;
}
.dz-accent {
  font-weight: 800;
  color: #f7b500;
}
.dz-sub {
  font-size: 14px;
  color: #8c8c8c;
}

/* Галерея карточек — центр */
.gallery-center {
  display: flex;
  justify-content: center;
}
.gallery-grid {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
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
  background: #f7b500;
  color: #1f2937;
  font-weight: 700;
  border: none;
  cursor: pointer;
  height: 44px;
  padding: 0 18px;
  border-radius: 10px;
  transition: filter 0.15s ease;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
}
.btn-yellow:hover {
  filter: brightness(0.98);
}

/* утилиты */
.hidden {
  display: none;
}
</style>
