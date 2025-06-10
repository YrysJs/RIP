<script setup>
import AppHeader from "~/components/layout/AppHeader.vue";
import { getNews } from '~/services/akimat'
import { useNewsStore } from '~/store/news.js'
const router = useRouter();

const newsList = ref([])
const newsStore = useNewsStore()

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
  router.push('/news/' + news.id)
}

onMounted(() => {
  fetchNews()
})
</script>

<template>
    <div class="relative mt-[77px]">

      <AppHeader type="client" />
        <div class="main">
            <div class="container">
                <div class="py-[210px] max-w-[476px]">
                    <h1 class="font-montserrat font-semibold text-white text-5xl">Всеказахстанская база захоронений</h1>
                    <div class="flex gap-[24px] mt-[24px]">
                        <button class="border-2 border-[#E9EDED] text-white text-base p-[12px] rounded-lg" @click="router.push('/search')">Поиск захоронения</button>
                        <button class="border-2 border-[#E9EDED] text-white text-base p-[12px] rounded-lg">Добавить захоронение</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="container">
            <div class="flex justify-start gap-[230px] items-center py-[113px]">
                <div class="flex flex-col gap-[35px]" @click="login = true">
                    <h3 class="font-montserrat font-semibold text-3xl text-[#224C4F]">О проекте</h3>
                    <img src="/images/client/rip.svg" alt="image">
                </div>
                <div class="max-w-[500px] flex flex-col gap-[24px]">
                    <p class="text-xl text-[#224C4F]">
                        Мы компания RIP - первая в Казахстане единая база захоронений, с помощью которой вы сможете удалённо найти захоронение своих близких и родных, посмотреть в каком состоянии оно сейчас находится и организовать дальнейшее сопровождение по уходу, где бы вы ни находились.
                    </p>
                    <nuxt-link to="/" class="w-fit ml-auto text-xl text-[#224C4F] flex items-center gap-[14px]">Подробнее <img src="/icons/bi_arrow-right.svg" alt="arrow"></nuxt-link>
                </div>
            </div>
        </div>
        <div class="container py-[43px]">
            <div class="max-w-[976px] w-full mx-auto flex justify-around items-center rounded-xl bg-[#224C4F] py-[44px] px-[100px]">
                <h3 class="text-white text-3xl">Наша миссия</h3>
                <p class="text-white text-xl max-w-[480px]">
                    Создать единую базу для поиска, организации и услуг по уходу за захоронениями и сделать её доступной для населения.
                </p>
            </div>
        </div>
        <div class="container py-[80px]">
            <h3 class="text-4xl text-[#224C4F] font-semibold">Услуги</h3>
            <div class="flex justify-evenly items-center flex-wrap gap-[25px] mt-[42px]">
                <div class="rounded-lg max-w-[376px]">
                    <img class="rounded-t-lg max-w-[376px] max-h-[240px] h-full w-full object-cover overflow-hidden" src="/images/client/banner.jpg" alt="">
                    <div class="card p-[22px]">
                        <h3 class="font-montserrat font-semibold text-2xl text-[#224C4F]">Поиск захоронения</h3>
                        <p class="text-base text-[#224C4F] mt-[16px]">
                            Вы можете заказать у нас точные координаты захоронения на цифровой карте кладбища с подробным описанием маршрута.
                        </p>
                        <nuxt-link to="/" class="w-fit ml-auto text-xl text-[#224C4F] flex items-center gap-[14px]">Подробнее <img src="/icons/bi_arrow-right.svg" alt="arrow"></nuxt-link>
                    </div>
                </div>
                <div class="rounded-lg max-w-[376px]">
                    <img class="rounded-t-lg max-w-[376px] max-h-[240px] h-full w-full object-cover overflow-hidden" src="/images/client/banner.jpg" alt="">
                    <div class="card p-[22px]">
                        <h3 class="font-montserrat font-semibold text-2xl text-[#224C4F]">Поиск захоронения</h3>
                        <p class="text-base text-[#224C4F] mt-[16px]">
                            Вы можете заказать у нас точные координаты захоронения на цифровой карте кладбища с подробным описанием маршрута.
                        </p>
                        <nuxt-link to="/" class="w-fit ml-auto text-xl text-[#224C4F] flex items-center gap-[14px]">Подробнее <img src="/icons/bi_arrow-right.svg" alt="arrow"></nuxt-link>
                    </div>
                </div>
                <div class="rounded-lg max-w-[376px]">
                    <img class="rounded-t-lg max-w-[376px] max-h-[240px] h-full w-full object-cover overflow-hidden" src="/images/client/banner.jpg" alt="">
                    <div class="card p-[22px]">
                        <h3 class="font-montserrat font-semibold text-2xl text-[#224C4F]">Поиск захоронения</h3>
                        <p class="text-base text-[#224C4F] mt-[16px]">
                            Вы можете заказать у нас точные координаты захоронения на цифровой карте кладбища с подробным описанием маршрута.
                        </p>
                        <nuxt-link to="/" class="w-fit ml-auto text-xl text-[#224C4F] flex items-center gap-[14px]">Подробнее <img src="/icons/bi_arrow-right.svg" alt="arrow"></nuxt-link>
                    </div>
                </div>
                <div class="rounded-lg max-w-[376px]">
                    <img class="rounded-t-lg max-w-[376px] max-h-[240px] h-full w-full object-cover overflow-hidden" src="/images/client/banner.jpg" alt="">
                    <div class="card p-[22px]">
                        <h3 class="font-montserrat font-semibold text-2xl text-[#224C4F]">Поиск захоронения</h3>
                        <p class="text-base text-[#224C4F] mt-[16px]">
                            Вы можете заказать у нас точные координаты захоронения на цифровой карте кладбища с подробным описанием маршрута.
                        </p>
                        <nuxt-link to="/" class="w-fit ml-auto text-xl text-[#224C4F] flex items-center gap-[14px]">Подробнее <img src="/icons/bi_arrow-right.svg" alt="arrow"></nuxt-link>
                    </div>
                </div>
            </div>
        </div>
        <div class="py-[80px] bg-[#F4F4F4]">
            <div class="container">
                <h3 class="text-4xl text-[#224C4F] font-semibold mb-[30px]">Новости</h3>
                <div class="flex flex-col gap-[30px]">
                    <div
                        class="flex items-center gap-[20px] bg-white card cursor-pointer"
                        v-for="news in newsList"
                        :key="news.id"
                        @click="goToNews(news)"
                    >
                        <img class="rounded-lg h-[167px] max-w-[264px] w-full object-cover overflow-hidden" :src="news.coverImageUrl" alt="">
                        <div class="flex flex-col gap-[4px] rounded-lg py-[18px]">
                            <div class="bg-[#224C4F26] text-[#4E4E4E] text-xs py-[2px] px-[6px] w-fit">{{ news.category?.name }}</div>
                            <h3 class="font-montserrat font-semibold text-2xl text-[#224C4F]">{{news.title}}</h3>
                            <p class="text-base text-[#224C4F]">
                              {{ news.content.length > 230 ? news.content.slice(0, 230) + '...' : news.content }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.main {
    background: url('/images/client/banner.jpg');
    background-size: cover;
    background-repeat: no-repeat;
}
.container {
    max-width: 1200px;
    width: 100%;
    margin: auto;
}
.card {
    box-shadow: 0px 4px 10px -5px #000;
}
</style>