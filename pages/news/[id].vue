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


const fetchNews = async () => {
  try {
    const response = await getNews({
      statusId: 1,
    })
    newsList.value = response.data
  } catch (error) {
    console.error('Ошибка при получении новостей:', error)
  }
}

const goToNews = (news) => {
  newsStore.setSelected(news)
  router.push('/user/news/' + news.id)
}

onMounted(() => {
  fetchNews()
})

function goBack() {
    router.go(-1)
}
</script>

<template>
    <AppHeader type="client" />
    <div class="container py-[80px]">
        <button class="flex gap-[15px] items-center text-sm font-semibold" @click="goBack">
            <img src="/icons/back-icon-blue.svg" alt=""> Назад
        </button>

        <div class="flex justify-between items-start gap-[24px] mt-[24px]">
            <div class="max-w-[876px]">
                <div class="flex gap-[10px] items-center">
                    <div class="bg-[#224C4F26] text-[#4E4E4E] text-xs py-[2px] px-[6px] w-fit">{{ newsStore.selectedNews?.category?.name }}</div>
                    <div class="bg-[#224C4F26] text-[#4E4E4E] text-xs py-[2px] px-[6px] w-fit">{{ formatDate(newsStore.selectedNews?.registrationDate) }}</div>
                </div>

                <h1 class="text-4xl text-[#333333] font-medium font-roboto pt-[4px] pb-[27px]">
                  {{ newsStore.selectedNews?.title }}
                </h1>

                <img class="rounded-lg h-[475px] w-full object-cover overflow-hidden" :src="newsStore.selectedNews?.coverImageUrl" alt="image">


                <p class="text-base text-[#333333] font-normal font-roboto">
                  {{ newsStore.selectedNews?.content }}
                </p>
            </div>
            <div class="pt-[100px]">
                <h3 class="text-base text-[#333333] font-semibold font-roboto pb-[17px]">Может быть интересно:</h3>
                <div class="flex flex-col gap-[12px]">
                    <div
                        class="p-[12px] rounded-lg bg-[#E9EDED] flex flex-col"
                        v-for="news in newsList.slice(0, 3)"
                        :key="news.id"
                        @click="goToNews(news)"
                    >
                        <div class="bg-[#224C4F26] text-[#4E4E4E] text-xs py-[2px] px-[6px] w-fit">{{ news.category?.name }}</div>
                        <h3 class="text-sm text-[#333333] font-medium font-roboto py-[10px]">{{news.title}}</h3>
                        <p class="text-sm text-[#333333] font-medium font-roboto">{{ formatDate(news.registrationDate) }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <AppFooter />
</template>

<style lang="css" scoped>
.container {
    max-width: 1200px;
    width: 100%;
    margin: auto;
}
.card {
    box-shadow: 0px 4px 10px -5px #000;
}
</style>