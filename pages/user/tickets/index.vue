<template>
  <NuxtLayout name="user">
    <div class="w-full bg-white rounded-[16px] mt-[20px] p-[20px]">
      <h2 class="text-2xl font-semibold mb-[16px]">Новые заявки</h2>

      <div class="tabs flex gap-[24px] border-b border-[#E5E7EB] mb-[20px]">
        <button
            class="tab"
            :class="{ 'tab--active': activeTab === 'relocation' }"
            @click="activeTab = 'relocation'"
        >
          Заявки на перезахоронение
          <span class="tab-count" :class="{ 'tab-count--active': activeTab === 'relocation' }">
          {{ relocationCount }}
        </span>
        </button>

        <button
            class="tab"
            :class="{ 'tab--active': activeTab === 'akimat' }"
            @click="activeTab = 'akimat'"
        >
          Обращения в Акимат
          <span class="tab-count" :class="{ 'tab-count--active': activeTab === 'akimat' }">
          {{ akimatCount }}
        </span>
        </button>
      </div>

      <div class="flex items-center gap-4 mb-[16px]">
        <input type="text" placeholder="Введите номер заявки" class="search-input flex-2" />

        <select class="filter-select flex-1">
          <option value="">Статус</option>
        </select>


      </div>

      <div class="flex items-center gap-4 mb-[16px]">
        <select class="filter-select flex-1">
          <option value="">Период заявки</option>
        </select>

        <select class="filter-select flex-1">
          <option value="">Заявитель</option>
        </select>

        <select class="filter-select flex-1">
          <option value="">Сначала новые</option>
        </select>
      </div>

      <template v-if="activeTab === 'relocation'">
        <div class="flex flex-col gap-[16px]">
          <div
              v-for="request in requests"
              :key="request.id"
              class="flex justify-between items-center rounded-[12px] p-[16px] border border-[#EEEEEE] shadow-sm hover:bg-[#F9FAFB]"
          >
            <div>
              <h3 class="text-base font-semibold mb-1">Заявка № {{ request.id }}</h3>
              <p class="text-sm">Заявитель: {{ formatPhoneNumber(request.userPhone) }}</p>
              <p class="text-sm text-[#6B7280]">
                Ответственный исполнитель:
                <span v-if="request.responsibleUserPhone" class="font-semibold">{{ formatPhoneNumber(request.responsibleUserPhone) }}</span>
                <span v-else class="text-[#9CA3AF]">не назначен</span>
              </p>

              <div class="mt-[8px]">
            <span
                class="status"
                :class="{
                'status--new': request.status === 'new',
                'status--inwork': request.status === 'inwork',
                'status--waiting': request.status === 'waiting',
                'status--rejected': request.status === 'rejected'
              }"
            >
              {{ statusText(request.status) }}
            </span>
              </div>
            </div>

            <div class="flex flex-col items-end">
<!--              <span class="text-sm text-[#6B7280] mb-[8px]">Дата заявки: {{ request.date }}</span>-->
              <button class="details-btn" @click="router.push('/user/tickets/' + request.id)">Подробнее</button>
            </div>
          </div>
        </div>
      </template>
      <template v-if="activeTab === 'akimat'">
        <div class="w-full rounded-[12px] border border-[#EEEEEE] mt-[20px] p-[20px]" v-for="appeal of appeals" :key="appeal.id">
          <div class="flex justify-between gap-[10px] items-end">
            <div class="flex flex-col gap-[10px] text-lg font-semibold">
              <h3>Тип обращения: <span class="ml-6 px-3 py-1 rounded-lg text-white" :class="appeal.type.value === 'COMPLAINT' ? 'bg-[#38949B]' : appeal.type.value === 'OFFER' ? 'bg-[#FFA500]' : 'bg-[#008000]'">{{ appeal.type.nameRu }}</span></h3>
              <h3 class="my-2">Дата создания: <span>{{ new Date(appeal.createTime).toLocaleString('ru-RU') }}</span></h3>
              <div class="flex flex-col gap-[0px]">
                <h3>Обращение:</h3>
                <p class="text-gray-500">
                  {{ appeal.content }}
                </p>
              </div>
            </div>
            <div class="flex flex-col items-end">
              <button class="details-btn" @click="openAppealChat">Чат</button>
            </div>
          </div>
        </div>
      </template>

    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref } from 'vue';
import  { getRequests, getTypes, getAppeals, getAppealComment } from '@/services/akimat'

const activeTab = ref('relocation');

const router = useRouter();

const relocationCount = 5;
const akimatCount = 0;
const requests = ref([])
const appeals = ref([])

definePageMeta({
  middleware: ['auth', 'akimat'],
});

async function fetchAppeals() {
  const response = await getAppeals()
  appeals.value = response.data
}


async function fetchRequests() {
  const response = await getRequests()
  requests.value = response.data
}

const openAppealChat = (id) => {
  getAppealComment()
}



function formatPhoneNumber(phone) {
  if (!/^\d{11}$/.test(phone)) return 'Неверный формат номера';

  return `+${phone[0]} (${phone.slice(1, 4)}) ${phone.slice(4, 7)} ${phone.slice(7, 9)} ${phone.slice(9, 11)}`;
}

const statusText = (status) => {
  if (status === 'new') return 'Новый запрос';
  if (status === 'inwork') return 'В работе';
  if (status === 'waiting') return 'Ожидает уточнений';
  if (status === 'rejected') return 'Отклонена';
  return '';
};

onMounted(async () => {
  // try {
    await fetchRequests()
    getTypes()
    await fetchAppeals()
  // } catch (error) {
  //   console.error('Ошибка при логине:', error)
  //
  // } finally {
  //   console.log('login')
  //
  // }

  // getStatuses()
})

</script>

<style lang="scss" scoped>
.tabs {
  position: relative;
  display: flex;
  gap: 24px;
  border-bottom: 1px solid #E5E7EB;
  margin-bottom: 20px;

  .tab {
    position: relative;
    padding-bottom: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #374151;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: color 0.2s;

    &--active {
      color: #224C4F;
      border-bottom: 2px solid #224C4F;
    }

    .tab-count {
      background: #9CA3AF;
      color: white;
      position: absolute;
      top: -6px;
      right: -20px;
      font-size: 12px;
      padding: 0 6px;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;

      &--active {
        background: #F7901E;
      }
    }
  }
}

.search-input {
  border: 1px solid #d1d5db;
  background: #f9fafb;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  flex-grow: 1;
}

.status {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  white-space: nowrap;
}

.status--new {
  background: #3CBF4A;
  color: white;
}

.status--inwork {
  background: #38949B;
  color: white;
}

.status--waiting {
  background: #F7901E;
  color: white;
}

.status--rejected {
  background: #E53935;
  color: white;
}

.details-btn {
  background: #224C4F;
  color: white;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
}
</style>
