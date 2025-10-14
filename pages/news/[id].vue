<script setup>
import { useNewsStore } from '~/store/news.js'
import {getNews} from "~/services/akimat/index.js";
import AppHeader from '~/components/layout/AppHeader.vue';
import AppFooter from '~/components/layout/AppFooter.vue';

const newsStore = useNewsStore()
const newsList = ref([])

function formatDate(arr) {
  if (!Array.isArray(arr) || arr.length < 6) return '';

  const [year, month, day, hour, minute, second, nanoseconds = 0] = arr;
  const date = new Date(
      year,
      month - 1, // месяцы в JS начинаются с 0
      day,
      hour,
      minute,
      second,
      Math.floor(nanoseconds / 1_000_000) // наносекунды → миллисекунды
  );

  const pad = (n) => String(n).padStart(2, '0');

  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}


const route = useRoute()
const router = useRouter()

const fetchNews = async () => {
  try {
    const response = await getNews({
      statusId: 1,
    })
    newsList.value = response.data
    
    // Находим новость по ID из URL
    const newsId = parseInt(route.params.id)
    const selectedNews = newsList.value.find(news => news.id === newsId)
    
    if (selectedNews) {
      newsStore.setSelected(selectedNews)
    }
  } catch (error) {
    console.error('Ошибка при получении новостей:', error)
  }
}

onMounted(() => {
  fetchNews()
})
</script>

<template>
    <AppHeader type="client" />
    <div class="container news-page">
        <div class="news-content">
            <div class="news-meta">
                <div class="news-tag">{{ newsStore.selectedNews?.category?.name }}</div>
                <div class="news-date">{{ formatDate(newsStore.selectedNews?.registrationDate) }}</div>
            </div>

            <h1 class="news-title">
              {{ newsStore.selectedNews?.title }}
            </h1>

            <img class="news-image" :src="newsStore.selectedNews?.coverImageUrl" alt="image">

            <p class="news-content-text">
              {{ newsStore.selectedNews?.content }}
            </p>
        </div>
    </div>
    <AppFooter />
</template>

<style lang="scss" scoped>
.container {
    max-width: 1200px;
    width: 100%;
    margin: auto;
}

.news-page {
    padding: clamp(2rem, 8vw, 80px) clamp(1rem, 4vw, 2rem) clamp(2rem, 8vw, 80px);
    margin-top: clamp(60px, 10vw, 110px);
}

.news-content {
    max-width: 876px;
    margin: 0 auto;
}

.news-meta {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 4px;
}

.news-tag,
.news-date {
    background: #224C4F26;
    color: #4E4E4E;
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 4px;
    white-space: nowrap;
}

.news-title {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    color: #333333;
    font-weight: 500;
    font-family: 'Roboto', sans-serif;
    line-height: 1.2;
    margin: 4px 0 27px 0;
}

.news-image {
    width: 100%;
    height: clamp(250px, 40vw, 475px);
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 24px;
}

.news-content-text {
    font-size: clamp(14px, 2vw, 16px);
    color: #333333;
    font-weight: 400;
    font-family: 'Roboto', sans-serif;
    line-height: 1.6;
    margin: 0;
}

// Адаптивность для планшетов
@media (max-width: 768px) {
    .news-page {
        padding: 40px 20px;
        margin-top: 80px;
    }
    
    .news-meta {
        gap: 8px;
    }
    
    .news-title {
        margin-bottom: 20px;
    }
    
    .news-image {
        margin-bottom: 20px;
    }
}

// Адаптивность для мобильных
@media (max-width: 480px) {
    .news-page {
        padding: 20px 16px;
        margin-top: 60px;
    }
    
    .news-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
    }
    
    .news-tag,
    .news-date {
        font-size: 11px;
        padding: 1px 4px;
    }
    
    .news-title {
        margin-bottom: 16px;
        line-height: 1.3;
    }
    
    .news-image {
        margin-bottom: 16px;
    }
    
    .news-content-text {
        line-height: 1.5;
    }
}

.card {
    box-shadow: 0px 4px 10px -5px #000;
}
</style>