<template>
  <NuxtLayout name="user">
    <div class="news-list w-full bg-white rounded-[16px] mt-[20px] p-[20px]">
      <div class="flex justify-between items-center mb-[20px] flex-wrap gap-4">
        <div class="flex gap-4 flex-wrap">
            <select class="filter-select">
              <option value="value">Категория</option>
            </select>

          <select class="filter-select">
            <option value="value">Статус</option>
          </select>
          <select class="filter-select">
            <option value="value">Сначала новые</option>
          </select>
        </div>
        <button class="create-btn" @click="router.push('/user/news/form')">
          <img src="/icons/plus.svg" class="w-4 h-4 mr-[8px]" />
          Создать новость
        </button>
      </div>

      <div class="flex flex-col gap-[16px]">
        <div
            v-for="news in newsList"
            :key="news.id"
            class="news-card flex rounded-[12px] overflow-hidden shadow-sm border border-[#EEEEEE]"
        >
          <img :src="news.image" alt="cover" class="w-[200px] h-[150px] object-cover" />

          <div class="flex flex-col justify-between p-[16px] flex-1">
            <div>
              <span class="category-badge">{{ news.category }}</span>
              <h3 class="font-semibold text-lg mt-[6px] mb-[8px]">{{ news.title }}</h3>
              <p class="text-sm text-[#6B7280] leading-[18px]">{{ news.preview }}</p>
            </div>

            <div class="flex justify-between items-center mt-[12px]">
              <span class="text-sm text-[#6B7280]">{{ news.date }}</span>

              <div class="flex items-center gap-2">
              <span
                  class="status"
                  :class="{
                  'status--active': news.status === 'active',
                  'status--draft': news.status === 'draft'
                }"
              >
                {{ statusText(news.status) }}
              </span>
                <button class="open-btn" @click="router.push('/user/news/1')">Открыть</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>

const router = useRouter();
const newsList = [
  {
    id: 1,
    category: 'Перезахоронение',
    title: 'Правила захоронения на кладбищах изменили в Казахстане',
    preview: 'Поправками предусмотрено, что акимат города размещает актуальную информацию по участкам...',
    date: '15 мая 2025, 09:45',
    status: 'active',
    image: '/images/news1.png'
  },
  {
    id: 2,
    category: 'Новое правило по уходу за могилами',
    title: 'Каждый год для ясности по сметному расчету надо утвердить новые цен...',
    preview: 'Этот закон вступает в силу с первого июля текущего года...',
    date: '15 мая 2025, 09:45',
    status: 'active',
    image: '/images/new2.png'
  },
  {
    id: 3,
    category: 'Цифровизация учета захоронений',
    title: 'Внедрение системы электронного учета позволит оптимизировать проце...',
    preview: 'Проект ожидается внедрить до конца следующего финансового года...',
    date: '15 мая 2025, 09:45',
    status: 'draft',
    image: '/images/new3.png'
  },
  {
    id: 4,
    category: 'Экологические материалы для памятников',
    title: 'Ученые работают над созданием памятников из биоразлагаемых материал...',
    preview: 'Процесс исследований и испытаний продлится до следующего года...',
    date: '15 мая 2025, 09:45',
    status: 'active',
    image: '/images/new4.png'
  }
];

const statusText = (status) => {
  if (status === 'active') return 'Активно';
  if (status === 'draft') return 'Черновик';
  return '';
};
</script>

<style scoped>

.create-btn {
  background: #224C4F;
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.category-badge {
  background: #F1F5F9;
  color: #374151;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.status {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  white-space: nowrap;
}

.status--active {
  background: #3CBF4A;
  color: white;
}

.status--draft {
  background: #9CA3AF;
  color: white;
}

.open-btn {
  background: #224C4F;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
}
</style>
