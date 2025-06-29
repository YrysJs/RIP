<template>
  <NuxtLayout name="user">
    <div class="dashboard grid grid-cols-1 gap-6">
      <!-- Количество заявок -->
      <div class="card flex flex-wrap justify-between items-center p-6">
        <div class="mr-8">
          <h2 class="text-sm text-[#6B7280] font-semibold mb-2">Количество заявок всего</h2>
          <p class="text-4xl font-bold">{{ requestStats.count }}</p>
        </div>
        <div v-if="requestStats?.statuses?.length" class="flex flex-wrap gap-4 text-sm font-semibold">
          <span
              v-for="status in requestStats?.statuses"
              :key="status.status.id"
              :class="{'text-[#3CBF4A]': status.status.id === 1, 'text-[#E53935]': status.status.id === 1, 'text-[#38949B]': status.status.id === 1, 'text-[#F7901E]': status.status.id === 1,}">
            {{status.status.nameRu}}: {{ status.count }}
          </span>
        </div>
        <div class="flex gap-3">
          <button class="btn" type="button" @click="exportRequests">Отчет по заявкам</button>
          <button class="btn" type="button" @click="exportAppeals">Отчет по обращениям</button>
        </div>

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
<!--            <div class="w-[180px] h-[180px]">-->
<!--              <img src="/images/pie.png" alt="Chart" class="w-full h-full object-contain" />-->
<!--            </div>-->

<!--            &lt;!&ndash; Легенда &ndash;&gt;-->
<!--            <div class="flex flex-col gap-2 mt-8">-->
<!--              <div class="legend-item">-->
<!--                <span class="legend-color bg-[#66CDD8]"></span>-->
<!--                <span class="legend-text text-[#66CDD8]">Обращения: 54</span>-->
<!--              </div>-->
<!--              <div class="legend-item">-->
<!--                <span class="legend-color bg-[#22686F]"></span>-->
<!--                <span class="legend-text text-[#374151]">Перезахоронение: 17</span>-->
<!--              </div>-->
<!--            </div>-->
            <Doughnut
                :data="types"
                :options="{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    }
                  },
                }" />
          </div>
        </div>

        <!-- Сейчас в работе -->
        <div class="card p-6 flex flex-col">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-sm text-[#6B7280] font-semibold">Сейчас в работе</h2>
          </div>
          <div v-if="requestStats?.inWork?.length" class="flex flex-col overflow-y-auto max-h-[300px] pr-2">
            <div
                v-for="item in requestStats?.inWork"
                :key="item.id"
                class="flex justify-between items-center py-2 text-sm font-semibold hover:bg-[#F9FAFB] rounded-[8px] px-2"
            >
              <p>{{ item.status.nameRu }} №{{ item.requestNumber }}</p>
              <img src="/icons/arrow-right.svg" class="w-4 h-4" />
            </div>
          </div>
          <div v-else class="text-[#939393]">
            В работе ничего нет
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
        <div class="mr-8">
          <h2 class="text-sm text-[#6B7280] font-semibold mb-2">Новостей всего</h2>
          <p class="text-4xl font-bold">{{ newsStats?.count }}</p>
        </div>
        <div v-if="newsStats?.newsStatuses?.length" class="flex flex-wrap items-end gap-4 text-sm font-semibold">
          <span v-for="status in newsStats.newsStatuses" :key="status.status.id" :class="{'text-[#3CBF4A]': status.status.id === 1, 'text-[#9CA3AF]': status.status.id === 2}">{{status.status.nameRu}}: {{ status.count }}</span>
        </div>
        <select class="filter-select ml-auto w-[140px]">
          <option>За все время</option>
        </select>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { getNewsStats, getRequestsStats, exportAppealsReport, exportRequestsReport } from '~/services/akimat'
import {downloadBase64File} from '~/utils/downloadBase64.js'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'

definePageMeta({
  middleware: ['auth', 'akimat'],
});

ChartJS.register(ArcElement, Tooltip, Legend)
const loading = ref(false)
const newsStats = ref({})
const requestStats = ref({})
const types = ref({
  labels: ['Обращения', 'Перезахоронение'],
  datasets: [
    {
      backgroundColor: ['#66CDD8', '#22686F'],
      data: [54, 17]
    }
  ]
})

const topNews = [
  { title: 'Типовые правила погребения и организации дела', views: 234 },
  { title: 'Законы и правила захоронений в Казахстане', views: 200 },
  { title: 'Причины и моральные аспекты перезахоронения', views: 198 },
  { title: 'Как выбрать место на кладбище', views: 150 },
  { title: 'Современные технологии на кладбищах', views: 145 }
];

const exportAppeals = async () => {
  const res = await exportAppealsReport()
  downloadBase64File(res.data.base64, 'Отчет по обращениям.xslx')
}

const exportRequests = async () => {
  const res = await exportRequestsReport()
  downloadBase64File(res.data.base64, 'Отчет по заявкам.xslx')
}

onMounted((async () => {
  try {
    loading.value = true
    const newsRes = await getNewsStats();
    const requestRes = await getRequestsStats();
    newsStats.value = newsRes.data
    requestStats.value = requestRes.data
    if (requestStats.value?.types?.length > 0) {
      types.value = {
        labels: [requestStats.value?.types[0].type.nameRu, requestStats.value?.types[1].type.nameRu],
        datasets: [
          {
            backgroundColor: ['#66CDD8', '#22686F'],
            data: [requestStats.value?.types[0].count, requestStats.value?.types[1].count]
          }
        ]
      }
    }
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

.btn {
  height: 32px;
  background: #224C4F;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  padding: 8px 16px;
}
</style>
