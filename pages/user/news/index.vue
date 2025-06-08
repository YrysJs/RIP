<template>
  <NuxtLayout name="user">
    <div class="news-list w-full bg-white rounded-[16px] mt-[20px] p-[20px]">
      <div class="flex justify-between items-center mb-[20px] flex-wrap gap-4">
        <div class="flex gap-4 flex-wrap">
          <select v-model="categoryId" class="filter-select">
            <option value="">Категория</option>
            <option value="1">Объявления</option>
            <option value="2">Социальная поддержка</option>
            <option value="3">Изменения в законодательстве</option>
          </select>

          <select v-model="statusId" class="filter-select">
            <option value="">Статус</option>
            <option value="1">Активный</option>
            <option value="2">Не активный</option>
          </select>

          <select v-model="sortingType" class="filter-select">
            <option value="desc">Сначала новые</option>
            <option value="asc">Сначала старые</option>
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
          <img :src="news.coverImageUrl" alt="cover" class="w-[200px] h-[150px] object-cover" />

          <div class="flex flex-col justify-between p-[16px] flex-1">
            <div>
              <span class="category-badge">{{ news.category?.name }}</span>
              <h3 class="font-semibold text-lg mt-[6px] mb-[8px]">{{ news.title }}</h3>
              <p class="text-sm text-[#6B7280] leading-[18px]">{{ news.content }}</p>
            </div>

            <div class="flex justify-between items-center mt-[12px]">
              <span class="text-sm text-[#6B7280]">{{ new Date(news.registrationDate).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</span>

              <div class="flex items-center gap-2">
              <span
                  class="status"
                  :class="{
                  'status--active': news.newsStatus?.value === 'active',
                  'status--draft': news.newsStatus?.value === 'draft'
                }"
              >
                {{ statusText(news.newsStatus?.nameRu) }}
              </span>
                <button class="open-btn" @click="router.push('/user/news/' + news.id)">Открыть</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </NuxtLayout>
</template>

<script setup>
import { getNews } from '~/services/akimat'
const router = useRouter();
const newsList = ref([])

const categoryId = ref('')
const statusId = ref('')
const sortingType = ref('desc')

const fetchNews = async () => {
  try {
    const response = await getNews({
      categoryId: categoryId.value || undefined,
      statusId: statusId.value || undefined,
      sortingType: sortingType.value
    })
    newsList.value = response.data
  } catch (error) {
    console.error('Ошибка при получении новостей:', error)
  }
}

watch([categoryId, statusId, sortingType], fetchNews, { immediate: true })

const statusText = (status) => {
  if (status === 1) return 'Активно';
  if (status === 2) return 'Черновик';
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
