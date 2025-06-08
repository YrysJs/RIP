<template>
  <NuxtLayout name="user">
    <div class="dashboard grid grid-cols-1 gap-6">
      <!-- Количество заявок -->
      <div class="card flex flex-wrap justify-between items-center p-6">
        <div>
          <h2 class="text-sm text-[#6B7280] font-semibold mb-2">Количество заявок всего</h2>
          <p class="text-4xl font-bold">{{ totalRequests }}</p>
        </div>
        <div class="flex flex-wrap gap-4 text-sm font-semibold">
          <span class="text-[#3CBF4A]">Согласовано: {{ approved }}</span>
          <span class="text-[#E53935]">Отказано: {{ declined }}</span>
          <span class="text-[#38949B]">В работе: {{ inWork }}</span>
          <span class="text-[#F7901E]">На доработке: {{ revision }}</span>
        </div>
        <select class="filter-select ml-auto w-[140px]">
          <option>За месяц</option>
        </select>
      </div>

      <!-- 2 карточки в ряд -->
      <div class="grid grid-cols-2 gap-6">
        <!-- Типы обращения -->
        <div class="card p-6 flex flex-col gap-6 relative">
          <!-- Заголовок блока -->
          <div class="flex justify-between items-center">
            <h2 class="text-base font-semibold text-[#111827]">Типы обращения</h2>
            <select class="filter-select w-[140px]">
              <option>За месяц</option>
            </select>
          </div>

          <!-- Диаграмма и легенда -->
          <div class="flex gap-6">
            <!-- Картинка -->
            <div class="w-[180px] h-[180px]">
              <img src="/images/pie.png" alt="Chart" class="w-full h-full object-contain" />
            </div>

            <!-- Легенда -->
            <div class="flex flex-col gap-2 mt-8">
              <div class="legend-item">
                <span class="legend-color bg-[#66CDD8]"></span>
                <span class="legend-text text-[#66CDD8]">Обращения: 54</span>
              </div>
              <div class="legend-item">
                <span class="legend-color bg-[#22686F]"></span>
                <span class="legend-text text-[#374151]">Перезахоронение: 17</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Сейчас в работе -->
        <div class="card p-6 flex flex-col">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-sm text-[#6B7280] font-semibold">Сейчас в работе</h2>
          </div>
          <div class="flex flex-col overflow-y-auto max-h-[300px] pr-2">
            <div
                v-for="item in inProgress"
                :key="item.id"
                class="flex justify-between items-center py-2 text-sm font-semibold hover:bg-[#F9FAFB] rounded-[8px] px-2"
            >
              <p>{{ item.type }} №{{ item.id }}</p>
              <img src="/icons/arrow-right.svg" class="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      <!-- Топ 5 новостей -->
      <div class="card p-6 flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-sm text-[#6B7280] font-semibold">Топ 5 просматриваемых новостей</h2>
          <select class="filter-select w-[140px]">
            <option>За все время</option>
          </select>
        </div>
        <div v-for="news in topNews" :key="news.title" class="flex justify-between items-center py-3">
          <p class="text-sm font-medium">{{ news.title }}</p>
          <div class="flex items-center gap-2 text-[#6B7280]">
            <span>{{ news.views }}</span>
            <img src="/icons/eye.svg" class="w-4 h-4" />
          </div>
        </div>
      </div>

      <!-- Новостей всего -->
      <div class="card flex flex-wrap justify-between items-center p-6">
        <div>
          <h2 class="text-sm text-[#6B7280] font-semibold mb-2">Новостей всего</h2>
          <p class="text-4xl font-bold">{{ totalNews }}</p>
        </div>
        <div class="flex flex-wrap gap-4 text-sm font-semibold">
          <span class="text-[#3CBF4A]">Активных: {{ activeNews }}</span>
          <span class="text-[#9CA3AF]">Черновики: {{ draftNews }}</span>
        </div>
        <select class="filter-select ml-auto w-[140px]">
          <option>За все время</option>
        </select>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { getNewsStats, getRequestsStats } from '~/services/akimat'

const loading = ref(false)
const newsStats = ref({})
const requestStats = ref({})

const totalRequests = 141;
const approved = 50;
const declined = 34;
const inWork = 16;
const revision = 41;

const totalNews = 12;
const activeNews = 10;
const draftNews = 2;

const inProgress = [
  { id: 351, type: 'Заявка на перезахоронение' },
  { id: 350, type: 'Заявка на перезахоронение' },
  { id: 349, type: 'Заявка на перезахоронение' },
  { id: 3345, type: 'Обращение' },
  { id: 3142, type: 'Обращение' }
];

const topNews = [
  { title: 'Типовые правила погребения и организации дела', views: 234 },
  { title: 'Законы и правила захоронений в Казахстане', views: 200 },
  { title: 'Причины и моральные аспекты перезахоронения', views: 198 },
  { title: 'Как выбрать место на кладбище', views: 150 },
  { title: 'Современные технологии на кладбищах', views: 145 }
];

onMounted((async () => {
  try {
    loading.value = true
    const newsRes = await getNewsStats();
    const requestRes = await getRequestsStats();
    newsStats.value = newsRes.data
    requestStats.value = requestRes.data
  } catch (error) {
    console.error('Ошибка при получении заявок:', error)
  } finally {
    console.log('finally')
    loading.value = false
  }
}))

</script>

<style lang="scss" scoped>
.dashboard {
  display: grid;
  gap: 24px;

  .card {
    background: white;
    border-radius: 16px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.04);
  }
}

.filter-select {
  border: 1px solid #d1d5db;
  background: #f9fafb;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  height: 36px;
}

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.04);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 10px;
  height: 10px;
  border-radius: 9999px;
}

.legend-text {
  font-size: 14px;
  font-weight: 600;
}
</style>
