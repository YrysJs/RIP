<script setup>
import MainPageModal from "~/components/layout/modals/MainPageModal.vue";
import AppHeader from "~/components/layout/AppHeader.vue";
import AppFooter from "~/components/layout/AppFooter.vue";
import { getNews } from '~/services/akimat'
import { useNewsStore } from '~/store/news.js'
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const dataId = ref(0)
const mainPageModalState = ref(false)

const showDetail = (id) => {
  dataId.value = id
  mainPageModalState.value = true
}

const slides = ref([
  {
    id: 1,
    title: 'Всеказахстанская база захоронений',
    subtitle: 'Найдите захоронения ваших близких удаленно',
    background: '/images/client/banner.jpg',
    buttons: [
      { text: 'Поиск захоронения', action: 'search' },
      { text: 'Добавить захоронение', action: 'add' }
    ]
  },
  {
    id: 1,
    title: 'Всеказахстанская база захоронений',
    subtitle: 'Найдите захоронения ваших близких удаленно',
    background: '/images/client/banner.jpg',
    buttons: [
      { text: 'Поиск захоронения', action: 'search' },
      { text: 'Добавить захоронение', action: 'add' }
    ]
  },
  {
    id: 1,
    title: 'Всеказахстанская база захоронений',
    subtitle: 'Найдите захоронения ваших близких удаленно',
    background: '/images/client/banner.jpg',
    buttons: [
      { text: 'Поиск захоронения', action: 'search' },
      { text: 'Добавить захоронение', action: 'add' }
    ]
  }
])

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
      <div class="relative">
        <Swiper
            :modules="[Navigation, Pagination, Autoplay]"
            :slides-per-view="1"
            :loop="true"
            :autoplay="{
                delay: 5000,
                disableOnInteraction: false,
            }"
            :navigation="{
                nextEl: '.swiper-button-next-custom',
                prevEl: '.swiper-button-prev-custom',
            }"
            :pagination="{
                el: '.swiper-pagination-custom',
                clickable: true,
            }"
            class="main-swiper"
        >
            <SwiperSlide v-for="slide in slides" :key="slide.id">
                <div class="main-slide bg-cover" :style="{ backgroundImage: `url(${slide.background})` }">
                    <div class="container">
                        <div class="py-[210px] max-w-[476px] relative z-10">
                            <h1 class="font-montserrat font-semibold text-white text-5xl">{{ slide.title }}</h1>
                            <p class="text-white text-xl mt-[12px] mb-[24px] opacity-90">{{ slide.subtitle }}</p>
                            <div class="flex gap-[24px] mt-[24px]">
                                <button 
                                    v-for="button in slide.buttons" 
                                    :key="button.action"
                                    @click="router.push('/search')"
                                    class="border-2 border-[#E9EDED] text-white text-base p-[12px] rounded-lg hover:bg-white hover:text-[#224C4F] transition-all duration-300"
                                >
                                    {{ button.text }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </SwiperSlide>
        </Swiper>
        <div class="swiper-button-prev-custom absolute left-[20px] top-1/2 transform -translate-y-1/2 z-20 w-[50px] h-[50px] bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all duration-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <div class="swiper-button-next-custom absolute right-[20px] top-1/2 transform -translate-y-1/2 z-20 w-[50px] h-[50px] bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all duration-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <div class="swiper-pagination-custom absolute bottom-[20px] left-1/2 transform -translate-x-1/2 z-20"></div>
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
                    <a href="#services" class="w-fit ml-auto text-xl text-[#224C4F] flex items-center gap-[14px]">Подробнее <img src="/icons/bi_arrow-right.svg" alt="arrow"></a>
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
        <div class="container py-[80px]" id="services">
            <h3 class="text-4xl text-[#224C4F] font-semibold">Услуги</h3>
            <div class="flex justify-evenly items-stretch flex-wrap gap-[25px] mt-[42px]">
                <div class="rounded-lg max-w-[376px] flex flex-col">
                    <img class="rounded-t-lg max-w-[376px] max-h-[240px] h-[240px] w-full object-cover overflow-hidden" src="/images/client/banner.jpg" alt="">
                    <div class="card p-[22px] flex flex-col flex-1">
                        <h3 class="font-montserrat font-semibold text-2xl text-[#224C4F]">Поиск захоронения</h3>
                        <p class="text-base text-[#224C4F] mt-[16px] flex-1 service-description">
                            Вы можете заказать у нас точные координаты захоронения на цифровой карте кладбища с подробным описанием маршрута.
                        </p>
                        <button class="w-fit ml-auto text-xl text-[#224C4F] flex items-center gap-[14px] mt-[16px]" @click="showDetail(0)">Подробнее <img src="/icons/bi_arrow-right.svg" alt="arrow"></button>
                    </div>
                </div>
                <div class="rounded-lg max-w-[376px] flex flex-col">
                    <img class="rounded-t-lg max-w-[376px] max-h-[240px] h-[240px] w-full object-cover overflow-hidden" src="/images/client/banner.jpg" alt="">
                    <div class="card p-[22px] flex flex-col flex-1">
                        <h3 class="font-montserrat font-semibold text-2xl text-[#224C4F]">Благоустройство</h3>
                        <p class="text-base text-[#224C4F] mt-[16px] flex-1 service-description">
                            Мы предоставляем комплексный спектр услуг по благоустройству и уходу за захоронениями Ваших родственников и друзей.
                        </p>
                        <button class="w-fit ml-auto text-xl text-[#224C4F] flex items-center gap-[14px] mt-[16px]" @click="showDetail(1)">Подробнее <img src="/icons/bi_arrow-right.svg" alt="arrow"></button>
                    </div>
                </div>
                <div class="rounded-lg max-w-[376px] flex flex-col">
                    <img class="rounded-t-lg max-w-[376px] max-h-[240px] h-[240px] w-full object-cover overflow-hidden" src="/images/client/banner.jpg" alt="">
                    <div class="card p-[22px] flex flex-col flex-1">
                        <h3 class="font-montserrat font-semibold text-2xl text-[#224C4F]">Цифровой мемориал и древо памяти</h3>
                        <p class="text-base text-[#224C4F] mt-[16px] flex-1 service-description">
                            Создайте виртуальный памятник, в котором будет собрана вся информация о Вашем близком человеке и кто с ним связан.
                        </p>
                        <button class="w-fit ml-auto text-xl text-[#224C4F] flex items-center gap-[14px] mt-[16px]" @click="showDetail(2)">Подробнее <img src="/icons/bi_arrow-right.svg" alt="arrow"></button>
                    </div>
                </div>
                <div class="rounded-lg max-w-[376px] flex flex-col">
                    <img class="rounded-t-lg max-w-[376px] max-h-[240px] h-[240px] w-full object-cover overflow-hidden" src="/images/client/banner.jpg" alt="">
                    <div class="card p-[22px] flex flex-col flex-1">
                        <h3 class="font-montserrat font-semibold text-2xl text-[#224C4F]">Ритуальные услуги</h3>
                        <p class="text-base text-[#224C4F] mt-[16px] flex-1 service-description">
                            Полный комплекс мероприятий, включая оформление документов, подготовку церемонии и сопровождение. Обеспечиваем соблюдение всех традиций и пожеланий семьи. Гарантируем профессиональный подход и внимание к деталям.
                        </p>
                        <button class="w-fit ml-auto text-xl text-[#224C4F] flex items-center gap-[14px] mt-[16px]" @click="showDetail(3)">Подробнее <img src="/icons/bi_arrow-right.svg" alt="arrow"></button>
                    </div>
                </div>
                <div class="rounded-lg max-w-[376px] flex flex-col">
                    <img class="rounded-t-lg max-w-[376px] max-h-[240px] h-[240px] w-full object-cover overflow-hidden" src="/images/client/banner.jpg" alt="">
                    <div class="card p-[22px] flex flex-col flex-1">
                        <h3 class="font-montserrat font-semibold text-2xl text-[#224C4F]">Ритуальные товары</h3>
                        <p class="text-base text-[#224C4F] mt-[16px] flex-1 service-description">
                            Мы предлагаем широкий ассортимент ритуальных товаров, необходимых для организации похорон с учетом всех традиций и пожеланий:
                        </p>
                        <button class="w-fit ml-auto text-xl text-[#224C4F] flex items-center gap-[14px] mt-[16px]" @click="showDetail(4)">Подробнее <img src="/icons/bi_arrow-right.svg" alt="arrow"></button>
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
        <div class="bg-[#F4F4F4] py-[70px]">
            <div class="max-w-[976px] w-full mx-auto bg-[#fff] py-[70px] px-[100px] rounded-2xl flex justify-between items-center gap-[50px]">
                <div>
                    <h3 class="text-[40px] text-[#224C4F] font-semibold leading-[initial]">
                        У вас есть вопросы? Свяжитесь с нами
                    </h3>
                    <a href="mailto:info@rip-service.kz" class="text-[36px] text-[#9C9C9C]">info@rip-service.kz</a>
                </div>
                <div class="flex flex-col gap-[10px] min-w-[200px]">
                    <a href="tel:+77077777777" class="text-[20px] text-[#9C9C9C]">+7 (707) 777-77-77</a>
                    <a href="tel:+77077777777" class="text-[20px] text-[#9C9C9C]">+7 (707) 777-77-77</a>
                </div>
            </div>
        </div>
        <AppFooter />
    </div>
    <Teleport to="body">
        <MainPageModal :dataId="dataId" :visible="mainPageModalState" @close="mainPageModalState = false"/>
    </Teleport>
</template>

<style lang="scss" scoped>
// .main {
//     background: url('/images/client/banner.jpg');
//     background-size: cover;
//     background-repeat: no-repeat;
// }
.container {
    max-width: 1200px;
    width: 100%;
    margin: auto;
}
.card {
    box-shadow: 0px 4px 10px -5px #000;
}

.service-description {
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.5;
    height: 96px; /* Фиксированная высота для 4 строк */
}

.swiper-pagination-custom :deep(.swiper-pagination-bullet) {
    background: white;
    opacity: 0.5;
    margin: 0 5px;
}

.swiper-pagination-custom :deep(.swiper-pagination-bullet-active) {
    opacity: 1;
    background: white;
}
</style>