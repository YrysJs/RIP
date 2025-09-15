<script setup>
import {onMounted, ref} from 'vue'
import { createRequest } from '~/services/client'
import { setAkimatFile } from '~/services/akimat'
import {getCemeteries} from "~/services/cemetery/index.js";
import {getUser} from "~/services/login/index.js";
import Cookies from "js-cookie";
import {parseJwt} from '~/utils/parseJwt';

const router = useRouter()
const token = ref(Cookies.get('token'))

const foreign_cemetry = ref('')
const reason = ref('')
const cemeteries = ref([])
const fromBurialId = ref(0)
const toBurialId = ref(0)
const death_certificate = ref([])
const proof_of_relation = ref([])
const grave_doc = ref([])
const userInfo = ref(null);


const removeDeathSert = (index) => {
  death_certificate.value.splice(index, 1)
}

const removeProof = (index) => {
  proof_of_relation.value.splice(index, 1)
}

const removeDoc = (index) => {
  grave_doc.value.splice(index, 1)
}

const handleSertUpload = (event) => {
  const files = Array.from(event.target.files)

  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      death_certificate.value.push({
        id: Date.now() + Math.random(),
        url: e.target.result,
        file: file
      })
    }
    reader.readAsDataURL(file)
  })
  event.target.value = ''
}

const handleProofUpload = (event) => {
  const files = Array.from(event.target.files)

  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      proof_of_relation.value.push({
        id: Date.now() + Math.random(),
        url: e.target.result,
        file: file
      })
    }
    reader.readAsDataURL(file)
  })
  event.target.value = ''
}

const handleDocumentUpload = (event) => {
  const files = Array.from(event.target.files)

  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      grave_doc.value.push({
        id: Date.now() + Math.random(),
        url: e.target.result,
        file: file
      })
    }
    reader.readAsDataURL(file)
  })
  event.target.value = ''
}

async function userCreateAppeal() {
  try {
    const sertFormData = new FormData()
    const proofFormData = new FormData()
    const docFormData = new FormData()
    let sertRes
    let proofRes
    let docRes
    sertFormData.append('Authorization', Cookies.get('token'))
    if (death_certificate.value.length) {
      if (Array.isArray(death_certificate.value)) {
        death_certificate.value.forEach(achievement => sertFormData.append('files', achievement.file))
      } else {
        sertFormData.append('files', death_certificate.value.file)
      }
      sertRes = await setAkimatFile(sertFormData)
    }

    proofFormData.append('Authorization', Cookies.get('token'))
    if (proof_of_relation.value.length) {
      if (Array.isArray(proof_of_relation.value)) {
        proof_of_relation.value.forEach(achievement => proofFormData.append('files', achievement.file))
      } else {
        proofFormData.append('files', proof_of_relation.value.file)
      }
      proofRes = await setAkimatFile(proofFormData)
    }

    docFormData.append('Authorization', Cookies.get('token'))
    if (grave_doc.value.length) {
      if (Array.isArray(grave_doc.value)) {
        grave_doc.value.forEach(achievement => docFormData.append('files', achievement.file))
      } else {
        docFormData.append('files', grave_doc.value.file)
      }
      docRes = await setAkimatFile(docFormData)
    }


    const response = await createRequest({
      userPhone: userInfo.value.phone,
      fromBurialId: fromBurialId.value,
      toBurialId: toBurialId.value,
      reason: reason.value,
      foreign_cemetry: foreign_cemetry.value,
      akimatId: 6,
      death_certificate: death_certificate.value.length ? sertRes.data.files[0].fileUrl : '',
      proof_of_relation: proof_of_relation.value.length ? proofRes.data.files[0].fileUrl : '',
      grave_doc: grave_doc.value.length ? docRes.data.files[0].fileUrl: ''
    })
    router.push('/client/goverment/requests')
    console.log(response)

  } catch (error) {
    console.log(error)
  }
}

onMounted((async () => {
  const parsedToken = parseJwt(token.value)
  const response = await getUser({
    phone: parsedToken.sub
  });

  userInfo.value = response.data;
  try {
    const response = await getCemeteries()
    cemeteries.value = response.data
  } catch (error) {
    console.error('Ошибка при получении заявок:', error)
  } finally {
    console.log('finally')
  }
}))

</script>

<template>
  <NuxtLayout name="client">
    <div class="w-full h-[61px] pl-[20px] flex items-center bg-white rounded-[16px] text-lg font-semibold">
      Создание заявки на перезахоронение
    </div>
    <div class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px]">
      <div class="flex flex-col gap-[10px]">
        <div>
          <label class="block text-sm mb-1">Старое место захоронения</label>
          <select v-model="fromBurialId" class="input select">
            <option v-for="cemetery in cemeteries" :key="cemetery.id" :value="cemetery.id">
              {{ cemetery.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm mb-1">Новое место захоронения</label>
          <select v-model="toBurialId" class="input select">
            <option v-for="cemetery in cemeteries" :key="cemetery.id" :value="cemetery.id">
              {{ cemetery.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm mb-1">Причина</label>
          <textarea v-model="reason" rows="3" class="input textarea"></textarea>
        </div>
        <div>
          <h3 class="text-[18px] font-medium mb-1">
            Свидетельство о смерти
          </h3>

          <!-- Кнопка загрузки фото -->
          <button
              @click="$refs.sertFileInput.click()"
              class="bg-[#EEEEEE] w-[120px] h-[28px] font-semibold text-[#224C4F] rounded-lg hover:bg-[#DDD] transition-colors mb-4"
          >
            Добавить
          </button>

          <!-- Скрытый input для файлов -->
          <input
              ref="sertFileInput"
              type="file"
              multiple
              @change="handleSertUpload"
              class="hidden"
          >
          <!-- Галерея фото достижений -->
          <div v-if="death_certificate.length > 0" class="achievement-photos-gallery">

            <div class="gallery-grid">
              <div
                  v-for="(photo, index) in death_certificate"
                  :key="photo.id"
                  class="image-preview-container"
              >
                <img src="/images/doc.png" alt="Achievement photo" class="image-preview">
                <div class="image-overlay">
                  <button
                      @click="removeDeathSert(index)"
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
            Подтверждение родства заявителя
          </h3>

          <!-- Кнопка загрузки фото -->
          <button
              @click="$refs.proofFileInput.click()"
              class="bg-[#EEEEEE] w-[120px] h-[28px] font-semibold text-[#224C4F] rounded-lg hover:bg-[#DDD] transition-colors mb-4"
          >
            Добавить
          </button>

          <!-- Скрытый input для файлов -->
          <input
              ref="proofFileInput"
              type="file"
              multiple
              @change="handleProofUpload"
              class="hidden"
          >
          <!-- Галерея фото достижений -->
          <div v-if="proof_of_relation.length > 0" class="achievement-photos-gallery">

            <div class="gallery-grid">
              <div
                  v-for="(photo, index) in proof_of_relation"
                  :key="photo.id"
                  class="image-preview-container"
              >
                <img src="/images/doc.png" alt="Achievement photo" class="image-preview">
                <div class="image-overlay">
                  <button
                      @click="removeProof(index)"
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
            Документ на могилу
          </h3>

          <!-- Кнопка загрузки фото -->
          <button
              @click="$refs.docFileInput.click()"
              class="bg-[#EEEEEE] w-[120px] h-[28px] font-semibold text-[#224C4F] rounded-lg hover:bg-[#DDD] transition-colors mb-4"
          >
            Добавить
          </button>

          <!-- Скрытый input для файлов -->
          <input
              ref="docFileInput"
              type="file"
              multiple
              @change="handleDocumentUpload"
              class="hidden"
          >
          <!-- Галерея фото достижений -->
          <div v-if="grave_doc.length > 0" class="achievement-photos-gallery">

            <div class="gallery-grid">
              <div
                  v-for="(photo, index) in grave_doc"
                  :key="photo.id"
                  class="image-preview-container"
              >
                <img src="/images/doc.png" alt="Achievement photo" class="image-preview">
                <div class="image-overlay">
                  <button
                      @click="removeDoc(index)"
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

        <button @click="userCreateAppeal" class="bg-[#38949B] text-white px-[16px] py-[8px] rounded-[8px]">Создать заявку</button>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>

.achievement-photos-gallery {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.gallery-grid {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.image-preview-container {
  width: 120px;
  height: 120px;
  position: relative;

  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #E5E7EB;
}

.image-preview {
  width: 120px;
  height: 100%;
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
</style>