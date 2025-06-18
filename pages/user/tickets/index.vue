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
          Обращения в акимат
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

      <div class="flex flex-col gap-[16px]">
        <div
            v-for="request in requests"
            :key="request.id"
            class="flex justify-between items-center rounded-[12px] p-[16px] border border-[#EEEEEE] shadow-sm hover:bg-[#F9FAFB]"
        >
          <div>
            <h3 class="text-base font-semibold mb-1">Заявка № {{ request.id }}</h3>
            <p class="text-sm">Заявитель: {{ request.applicant }}</p>
            <p class="text-sm text-[#6B7280]">
              Ответственный исполнитель:
              <span v-if="request.executor" class="font-semibold">{{ request.executor }}</span>
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
            <span class="text-sm text-[#6B7280] mb-[8px]">Дата заявки: {{ request.date }}</span>
            <button class="details-btn" @click="router.push('/user/tickets/1')">Подробнее</button>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref } from 'vue';
import  { getRequests, getTypes, exportReport, getStatuses, getAppeals } from '@/services/akimat'

const activeTab = ref('relocation');

const router = useRouter();

const relocationCount = 5;
const akimatCount = 0;

onMounted(() => {
  getRequests()
  getTypes()
  getStatuses()
  exportReport()
  getAppeals()
})

const requests = [
  {
    id: 351,
    applicant: 'Беляков Макар Максимович',
    executor: '',
    status: 'new',
    date: '07.01.2025'
  },
  {
    id: 352,
    applicant: 'Петрова Анна Сергеевна',
    executor: 'Бақадыр Нурбике Бекзатқызығ',
    status: 'inwork',
    date: '08.01.2025'
  },
  {
    id: 353,
    applicant: 'Сидоров Иван Александрович',
    executor: 'Бақадыр Нурбике Бекзатқызығ',
    status: 'waiting',
    date: '09.01.2025'
  },
  {
    id: 354,
    applicant: 'Кузнецова Ольга Дмитриевна',
    executor: 'Бақадыр Нурбике Бекзатқызығ',
    status: 'rejected',
    date: '10.01.2025'
  }
];

const statusText = (status) => {
  if (status === 'new') return 'Новый запрос';
  if (status === 'inwork') return 'В работе';
  if (status === 'waiting') return 'Ожидает уточнений';
  if (status === 'rejected') return 'Отклонена';
  return '';
};
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
