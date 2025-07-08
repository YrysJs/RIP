<template>
  <NuxtLayout name="user">
    <div class="w-full bg-white rounded-[16px] mt-[20px] p-[20px]">
      <button class="btn-back mb-[16px]" @click="router.push('/user/tickets')">
        <img src="/icons/arrow-left-primary.svg" class="w-4 h-4 mr-[10px]" />
        Назад
      </button>

      <div class="flex justify-between items-center border-b border-[#E5E7EB] pb-[12px] mb-[16px]">
        <div>
          <h2 class="text-xl font-semibold">Заявка на перезахоронение № {{ request?.id }}</h2>
<!--          <p v-if="request?.responsibleUser" class="text-sm text-[#6B7280]">-->
<!--            Дата заявки: {{ request?.date }} Ответственный исполнитель: {{ request?.responsibleUser.name }}-->
<!--          </p>-->
        </div>
        <span class="status status--new">Новый запрос</span>
      </div>

      <div v-if="request?.user" class="info-block">
        <h3>Данные заявителя</h3>
        <div class="info-row"><p>Заявитель:</p><p>{{ request?.user.surname }} {{ request?.user.name }} {{ request?.user.patronymic }}</p></div>
        <div class="info-row"><p>ИИН заявителя:</p><p>{{ request?.user.iin }}</p></div>
        <div class="info-row"><p>Телефон:</p><p>{{ request?.user.phone }}</p></div>
      </div>

      <div class="info-block">
        <h3>Старое место захоронения</h3>
        <div class="flex justify-between items-start">
          <div>
            <div class="info-row"><p>Название кладбища:</p><p>{{ getNameById(request?.fromBurialId) }}</p></div>
          </div>
        </div>


      </div>

      <div class="info-block">
        <h3>Новое место захоронения</h3>
        <div class="flex justify-between items-start">
          <div>
            <div class="info-row"><p>Название кладбища:</p><p>{{ getNameById(request?.toBurialId) }}</p></div>
          </div>
        </div>


      </div>

      <div class="info-block">
        <h3>Причина перезахоронения</h3>
        <p class="text-base">{{ request?.reason }}</p>
      </div>

      <div class="info-block">
        <h3>Документы</h3>
        <div class="documents">
          <div
              v-for="doc in documents"
              :key="doc.name"
              class="document-card"
          >
            <p class="font-semibold">{{ doc.name }}</p>
            <p class="text-sm text-[#6B7280]">{{ doc.file }}</p>
            <a href="#" class="download-link">Скачать</a>
          </div>
        </div>
      </div>

<!--      <div class="flex gap-4 justify-end mt-[24px]">-->
<!--        <button class="btn btn-decline">Отказать</button>-->
<!--        <button class="btn btn-edit">Отправить на доработку</button>-->
<!--        <button class="btn btn-approve">Согласовать захоронение</button>-->
<!--      </div>-->
    </div>
  </NuxtLayout>

</template>

<script setup>
import {onMounted, ref} from "vue";
import {getCemeteries} from "~/services/cemetery/index.js";
import {getRequests} from "~/services/akimat/index.js";

const router = useRouter();
const route = useRoute()

// definePageMeta({
//   middleware: ['auth', 'akimat'],
// });

const cemeteries = ref([])
const requests = ref([])
const request = ref({})

const documents = ref([
  { name: 'Свидетельство о смерти', file: 'file232.PDF (12 MB)' },
  { name: 'Подтверждение родства заявителя', file: '442134.JPG (12 MB)' },
  { name: 'Документ на могилу', file: 'file232.PDF (12 MB)' }
])

function getNameById(id) {
  const item = cemeteries.value.find(obj => obj.id === id);
  return item ? item.name : null;
}

async function fetchRequests() {
  const response = await getRequests()
  requests.value = response.data
  request.value = requests.value.find(obj => obj.id == route.params.id);
}

onMounted((async () => {
  try {
    const response = await getCemeteries()
    cemeteries.value = response.data
    await fetchRequests()
  } catch (error) {
    console.error('Ошибка при получении заявок:', error)
  } finally {
    console.log('finally')
  }
}))
</script>

<style lang="scss" scoped>
.btn-back {
  @apply flex items-center bg-[#EEEEEE] text-[#224C4F] rounded-md px-[16px] py-[10px] font-medium text-sm;
}

.status {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  background: #3CBF4A;
  color: white;

  &--new {
    background: #3CBF4A;
  }
}

.info-block {
  margin-bottom: 24px;

  h3 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    color: #222222;
  }

  .info-row {
    display: flex;
    gap: 12px;
    margin-bottom: 6px;
    font-weight: 600;
    color: #222222;

    p:first-child {
      min-width: 180px;
      color: #222222;
      font-weight: 400;
    }
  }
}

.section-btn {
  margin-top: 12px;
  background: #EEEEEE;
  color: #224C4F;
  font-weight: 600;
  font-size: 14px;
  border-radius: 8px;
  padding: 6px 14px;
}

.documents {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.document-card {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 12px;
  flex: 1;
  min-width: 200px;
}

.download-link {
  font-size: 14px;
  color: #38949B;
  font-weight: 600;
  margin-top: 6px;
  display: inline-block;
}

.btn {
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
}

.btn-decline {
  background: #FDEAEA;
  color: #DC2626;
}

.btn-edit {
  background: #F7901E;
  color: white;
}

.btn-approve {
  background: #3CBF4A;
  color: white;
}
</style>
