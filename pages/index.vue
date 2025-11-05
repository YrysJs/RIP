<script setup>
import MainPageModal from "~/components/layout/modals/MainPageModal.vue";
import AppHeader from "~/components/layout/AppHeader.vue";
import AppFooter from "~/components/layout/AppFooter.vue";

import { getNews } from "~/services/akimat";
import { useNewsStore } from "~/store/news.js";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import AppLoader from "~/components/loader/AppLoader.vue";
import { useLoadingStore } from "~/store/loading.js";
import AppHeaderClient from "~/components/layout/AppHeaderClient.vue";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const dataId = ref(0);
const mainPageModalState = ref(false);
const loadingStore = useLoadingStore();

const showDetail = (id) => {
  dataId.value = id;
  mainPageModalState.value = true;
};

const slides = computed(() => [
  {
    id: 1,
    title: t('mainPage.title'),
    subtitle: "",
    background: "/images/client/intro-desk.jpg",
    backgroundMobile: "/images/client/intro-mob.jpg",
    buttons: [
      {
        text: t('mainPage.searchBurial'),
        action: "search",
        icon: "search",
      },
      { text: t('mainPage.reservePlace'), action: "reserve", icon: "pencil" },
    ],
  },
]);

const services = computed(() => [
  {
    id: 0,
    title: t('mainPage.services.searchBurial.title'),
    img: "/images/main_service/f1.jpg",
    description: t('mainPage.services.searchBurial.description'),
    link: "",
  },
  {
    id: 1,
    title: t('mainPage.services.improvement.title'),
    img: "/images/main_service/f2.jpg",
    description: t('mainPage.services.improvement.description'),
    link: "",
  },
  {
    id: 2,
    title: t('mainPage.services.digitalMemorial.title'),
    img: "/images/main_service/f3.jpg",
    description: t('mainPage.services.digitalMemorial.description'),
    link: "",
  },
  {
    id: 3,
    title: t('mainPage.services.ritualServices.title'),
    img: "/images/main_service/f4.jpg",
    description: t('mainPage.services.ritualServices.description'),
    link: "",
  },
  {
    id: 4,
    title: t('mainPage.services.ritualGoods.title'),
    img: "/images/main_service/f5.jpg",
    description: t('mainPage.services.ritualGoods.description'),
    link: "",
  },
]);

const router = useRouter();

const newsList = ref([]);
const newsStore = useNewsStore();

const fetchNews = async () => {
  try {
    const response = await getNews({
      statusId: 1,
    });
    newsList.value = response.data;
  } catch (error) {
    console.error(t('client.tickets.burial.errorFetchingRequests'), error);
    const { $toast } = useNuxtApp();
    $toast.error(t('common.serverUnavailable'));
  }
};

const goToNews = (news) => {
  newsStore.setSelected(news);
  router.push("/news/" + news.id);
};

onMounted(() => {
  fetchNews();
});
</script>

<template>
  <main class="relative">
    <AppLoader v-if="loadingStore.loading" />
    <AppHeader type="client" :style="'landing'" />
    <AppHeaderClient :style="'landing'" />
    <section class="relative" id="main">
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
          <div
            class="main-slide bg-cover"
            :style="{
              '--bg': `url(${slide.background})`,
              '--bg-mobile': `url(${
                slide.backgroundMobile || slide.background
              })`,
            }"
          >
            <div class="container">
              <div class="intro__wrapper z-10 text-center">
                <NuxtImg
                  class="intro__img mx-auto"
                  src="/images/client/rip.svg"
                  alt="Company logo"
                />
                <h1 class="intro__content intro__title text-white">
                  {{ slide.title }}
                </h1>
                <p class="intro__content text-white">
                  {{ slide.subtitle }}
                </p>
                <div
                  class="intro__btns flex justify-center gap-[32px] max-sm:mx-auto"
                >
                  <button
                    v-for="button in slide.buttons"
                    :key="button.action"
                    :class="['intro__btn', `intro__btn--${button.action}`]"
                    @click="router.push(`/${button.action}`)"
                  >
                    <img
                      :src="`/icons/${button.icon}.svg`"
                      :alt="`${button.icon} icon`"
                      class="intro__icon"
                    />
                    {{ button.text }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
      <div
        class="swiper-button-prev-custom absolute left-[20px] top-1/2 transform -translate-y-1/2 z-20 w-[50px] h-[50px] bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all duration-300"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 18L9 12L15 6"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div
        class="swiper-button-next-custom absolute right-[20px] top-1/2 transform -translate-y-1/2 z-20 w-[50px] h-[50px] bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all duration-300"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 18L15 12L9 6"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <div
        class="swiper-pagination-custom absolute bottom-[20px] left-1/2 transform -translate-x-1/2 z-20"
      ></div>
    </section>
    <div class="container" id="about">
      <section class="about">
        <div class="about__inner">
          <h3 class="about__title">{{ $t('mainPage.aboutProject') }}</h3>
          <p class="about__paragraph">
            {{ $t('mainPage.aboutText') }}
          </p>
          <a href="#services" class="about__link">
            <img src="/icons/arrow.svg" alt="" aria-hidden="true" />
            {{ $t('common.more') }}
          </a>

          <div class="about__media">
            <NuxtImg
              width="516"
              class="about__img"
              src="/images/about/about.jpg"
              alt="Иллюстрация раздела"
            />
          </div>
        </div>
      </section>
    </div>
    <div class="container">
      <div class="mission">
        <h3>{{ $t('mainPage.ourMission') }}</h3>
        <p>
          {{ $t('mainPage.missionText') }}
        </p>
      </div>
    </div>
    <div class="container services" id="services">
      <h3 class="services__title">{{ $t('mainPage.servicesTitle') }}</h3>
      <ul>
        <li
          v-for="service in services"
          :key="service.id"
          class="services__item"
        >
          <h3 class="service__title">{{ service.title }}</h3>
          <NuxtImg
            :src="`${service.img}`"
            :alt="`${service.title}`"
            class="service__img"
            loading="lazy"
          />
          <p class="service__description">{{ service.description }}</p>
          <button @click="showDetail(service.id)" class="service__btn">
            {{ $t('common.more') }}
          </button>
        </li>
      </ul>
    </div>
    <section class="questions">
      <div class="questions__inner">
        <h2 class="questions__title">{{ $t('mainPage.haveQuestions') }}</h2>
        <p>{{ $t('mainPage.contactUs') }}</p>
        <a href="http://wa.me/77758100110" target="_blank">
          <button>
            <img src="/icons/whatsapp.svg" alt="Whatsapp icon" />
            {{ $t('mainPage.writeWhatsApp') }}
          </button>
        </a>
      </div>
    </section>
    <div v-if="newsList.length" class="container news">
      <h3 class="news__title">{{ $t('mainPage.news') }}</h3>
      <Swiper
        :modules="[Navigation, Pagination]"
        :slides-per-view="1"
        :space-between="30"
        :breakpoints="{
          768: {
            slidesPerView: 2,
            spaceBetween: 30
          },
          1024: {
            slidesPerView: 2,
            spaceBetween: 40
          }
        }"
        :navigation="{
          nextEl: '.news-swiper-button-next',
          prevEl: '.news-swiper-button-prev',
        }"
        :pagination="{
          el: '.news-swiper-pagination',
          clickable: true,
        }"
        class="news-swiper"
      >
        <SwiperSlide v-for="service in newsList" :key="service.id">
          <div class="news__item">
            <NuxtImg
              :src="`${service.coverImageUrl}`"
              :alt="`${service.title}`"
              class="news__img"
              loading="lazy"
            />
            <p class="news__description"><b>{{service.title}}</b><br/>{{ service.content }}</p>
            <button @click="router.push('/news/' + service.id)" class="news__btn">
              {{ $t('common.more') }}
            </button>
          </div>
        </SwiperSlide>
      </Swiper>
      <div class="news-swiper-controls">
        <div class="news-swiper-button-prev">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="#201001"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="news-swiper-pagination"></div>
        <div class="news-swiper-button-next">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 18L15 12L9 6"
              stroke="#201001"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
    <AppFooter />
    <Teleport to="body">
      <MainPageModal
        :dataId="dataId"
        :visible="mainPageModalState"
        @close="mainPageModalState = false"
      />
    </Teleport>
  </main>
</template>

<style lang="scss" scoped>
.container {
  max-width: 1200px;
  width: 100%;
  margin: auto;
}

.main-slide {
  aspect-ratio: 16 / 9;
  background-image: var(--bg);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  @media (max-width: 1024px) {
    height: 558px;
    aspect-ratio: 0;
  }
  @media (max-width: 640px) {
    background-image: var(--bg-mobile);
  }
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

.intro__wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: "Manrope", sans-serif;
  font-size: clamp(12px, 1vw + 0.5rem, 16px);

  @media (max-width: 1024px) {
    top: auto;
    bottom: 60px;
    transform: translateX(-50%);
  }

  .intro__img {
    width: clamp(147px, 19vw, 233px);
    margin-bottom: clamp(2rem, 4vw, 3rem);
  }

  .intro__icon {
    width: clamp(1rem, 2vw, 1.5rem);
    margin-right: 8px;
  }

  .intro__content {
    font-size: clamp(1.2rem, 2vw, 1.625rem);
    text-transform: uppercase;
    line-height: 1.25;
  }

  .intro__title {
    margin-bottom: clamp(2rem, 4vw, 3rem);
    position: relative;
    letter-spacing: 2px;

    &::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: 100%;
      height: 4px;
      width: clamp(12rem, 77%, 31.25rem);
      margin: clamp(1rem, 2vw, 1.5rem) auto 0;
      border-radius: 2px;
      background-color: #e9b949;
    }
  }
  .intro__btns {
    margin-top: clamp(23px, 5vw, 65px);

    .intro__btn {
      padding: clamp(0.5rem, 2vw, 1rem) clamp(1em, 2vw, 1.75rem);
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: clamp(1rem, 1.5vw, 1.25rem);
      font-weight: 500;
      line-height: 1.25;
      border-radius: 8px;
      white-space: nowrap;
      transition: all 0.3ms ease;

      &--search {
        background-color: #fff;
        &:hover {
          background-color: #f1f1f2;
        }
        &:active {
          background-color: #c6c9cc;
        }
      }

      &--reserve {
        background-color: #e9b949;
        &:hover {
          background-color: #d1a53f;
        }
        &:active {
          background-color: #b88f34;
        }
      }
    }
  }
}

.about {
  padding-top: 65px;
  width: 90%;
  margin: 0 auto;

  .about__inner {
    display: grid;
    column-gap: clamp(2rem, 7vw, 6.125rem);
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "title media"
      "paragraph media"
      "link media";

    @media (max-width: 820px) {
      align-items: center;
    }

    @media (max-width: 540px) {
      align-items: center;
      column-gap: 0;
      grid-template-columns: 1fr 1fr;
      grid-template-areas:
        "title title"
        "paragraph paragraph"
        "link media";
    }
  }

  .about__title {
    grid-area: title;
    margin: 0 0 clamp(1rem, 5vw, 2.8rem);
    font-family: "Manrope", sans-serif;
    font-size: clamp(2rem, 4vw, 4rem);
  }

  .about__paragraph {
    grid-area: paragraph;
    position: relative;
    margin: 0 0 24px;
    font-family: "Manrope", sans-serif;
    font-size: clamp(14px, 1.5vw, 20px);
    color: #224c4f;
    line-height: 1.6;
  }

  .about__link {
    grid-area: link;
    display: inline-flex;
    align-items: center;
    width: max-content;
    font-family: "Manrope", sans-serif;
    font-size: clamp(16px, 2vw, 21px);
    text-decoration: none;
    font-weight: 500;
    gap: clamp(1rem, 3vw, 2rem);
    color: #201001;
    transition: all 0.4ms ease;
    &:hover {
      text-decoration: underline;
    }

    img {
      width: clamp(3rem, 6vw, 5rem);
    }
  }

  .about__media {
    grid-area: media;

    @media (max-width: 540px) {
      width: 174px;
    }
  }

  @media (max-width: 540px) {
    padding-top: 26px;
  }
}

.mission {
  margin: clamp(4rem, 17vw, 128px) auto 0;
  max-width: 650px;
  text-align: center;

  h3 {
    margin: 0 auto 20px;
    width: fit-content;
    position: relative;
    font-family: "Manrope", sans-serif;
    font-size: clamp(2rem, 5vw, 4.125rem);
    color: #201001;
    &::before {
      content: "";
      background: url("/images/about/about-bird.png") no-repeat center;
      background-size: contain;
      position: absolute;
      top: 0;
      left: 0;
      transform: translate(-51%, -72%);
      width: clamp(6rem, 10vw, 8rem);
      height: clamp(8rem, 12vw, 10.8125rem);
    }
  }

  p {
    font-family: "Manrope", sans-serif;
    font-size: 21px;
    color: #212120;
    @media (max-width: 540px) {
      font-size: 14px;
    }
  }

  @media (max-width: 540px) {
    padding: 48px 16px 0;
  }
}

.services {
  padding: clamp(3rem, 13vw, 168px) 0 2.75rem;

  .services__title {
    height: clamp(4.6rem, 5vw, 5.25rem);
    width: fit-content;
    margin: 0 auto clamp(2rem, 2vw, 3.125rem);
    font-family: "Manrope", sans-serif;
    font-size: clamp(2rem, 5vw, 4.125rem);
    color: #201001;

    @media (max-width: 540px) {
      display: flex;
      align-items: end;
    }
  }

  .services__item {
    display: grid;
    padding: clamp(2rem, 2vw, 2.75rem) clamp(1rem, 2vw, 2.125rem);
    border-top: 1px solid #e9b949;
    justify-content: space-between;
    column-gap: 40px;
    grid-template-columns: 1fr 1fr 1.5fr;
    grid-template-areas:
      "headline image description"
      "headline image button";

    @media (max-width: 820px) {
      align-items: center;
      grid-template-columns: 1fr 1fr;
      grid-template-areas:
        "headline image"
        "description description"
        "button button";
    }

    .service__title {
      grid-area: headline;
      font-family: "Manrope", sans-serif;
      font-size: clamp(1rem, 3vw, 2rem);

      @media (max-width: 540px) {
        font-size: 28px;
      }
    }

    .service__img {
      grid-area: image;
      width: 100%;
      @media (max-width: 820px) {
        width: 143px;
      }
    }

    .service__description {
      grid-area: description;
      font-family: "Manrope", sans-serif;
      font-size: clamp(14px, 2vw, 16px);
      line-height: 26px;
      margin-bottom: 28px;

      @media (max-width: 820px) {
        margin-top: 28px;
      }

      @media (max-width: 540px) {
        line-height: 18px;
        margin-top: 10px;
        margin-bottom: 16px;
      }
    }

    .service__btn {
      grid-area: button;
      width: fit-content;
      padding: 16px;
      padding-left: 28px;
      font-family: "Manrope", sans-serif;
      font-size: 16px;
      height: 60px;
      font-weight: 500;
      background: #e9b949;
      border-radius: 8px;
      position: relative;
      transition: all 0.4ms ease;
      &::after {
        content: "";
        background-image: url(/icons/arrow-classic.svg);
        background-repeat: no-repeat;
        background-size: contain;
        display: inline-block;
        margin-left: 8px;
        margin-bottom: 2px;
        width: 16px;
        height: 16px;
        vertical-align: middle;
        @media (max-width: 540px) {
          margin-left: 4px;
          width: 12px;
          height: 12px;
        }
      }
      &:hover {
        background-color: #d1a53f;
      }
      &:active {
        background-color: #b88f34;
      }

      @media (max-width: 540px) {
        padding: 9px 16px;
        font-size: 14px;
      }
    }
  }
}

.questions {
  position: relative;
  background: url("/images/question1.jpg") no-repeat center;
  background-size: cover;
  width: 100vw;
  height: 410px;

  @media (max-width: 768px) {
    background-size: cover;
    height: 365px;
  }

  @media (max-width: 540px) {
    height: clamp(200px, 52vw, 265px);
  }

  .questions__inner {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .questions__title {
      font-size: 66px;
      font-weight: 700;
      color: #fff;
      text-align: center;
      margin-bottom: clamp(8px, 1vw, 16px);
      font-family: "Manrope", sans-serif;

      @media (max-width: 768px) {
        font-size: clamp(28px, 6vw, 48px);
      }

      @media (max-width: 540px) {
        font-size: clamp(24px, 5vw, 36px);
      }
    }

    p {
      font-size: clamp(14px, 2vw, 21px);
      color: #fff;
      text-align: center;
    }

    button {
      margin: clamp(8px, 4vw, 1.875rem) auto 0;
      display: flex;
      gap: 8px;
      padding: clamp(0.75rem, 2vw, 0.875rem) 20px;
      background: #e9b949;
      border-radius: 8px;
      transition: all 0.4ms ease;
      &:hover {
        background-color: #d1a53f;
      }
      &:active {
        background-color: #b88f34;
      }
    }
  }
}

@media (max-width: 540px) {
  html,
  body {
    font-size: 12px;
  }

  .intro__wrapper {
    top: auto;
    transform: translateX(-50%);
    width: 84%;
    .intro__content {
      font-size: 14px;
    }
    .intro__title::after {
      width: 260px;
    }
    .intro__btns {
      flex-direction: column;
      width: fit-content;
      align-items: center;
      justify-content: center;
      .intro__btn {
        padding: 9px 16px;
        width: fit-content;
        font-size: 14px;
        .intro__icon {
          width: 20px;
          margin-right: 4px;
        }
      }
    }
  }
}

// Стили для блока новостей (карусель)
.news {
  padding: clamp(3rem, 13vw, 168px) 0 2.75rem;
  position: relative;

  .news__title {
    height: clamp(4.6rem, 5vw, 5.25rem);
    width: fit-content;
    margin: 0 auto clamp(2rem, 2vw, 3.125rem);
    font-family: "Manrope", sans-serif;
    font-size: clamp(2rem, 5vw, 4.125rem);
    color: #201001;

    @media (max-width: 540px) {
      display: flex;
      align-items: end;
    }
  }

  .news-swiper {
    padding-bottom: 60px;
    
    .news__item {
      display: grid;
      padding: clamp(2rem, 2vw, 2.75rem) clamp(1rem, 2vw, 2.125rem);
      border-top: 1px solid #e9b949;
      justify-content: space-between;
      column-gap: 40px;
      height: 100%;
      grid-template-columns: 200px 1fr;
      grid-template-areas:
        "image description"
        "image button";

      @media (max-width: 820px) {
        align-items: center;
        grid-template-columns: 143px 1fr;
        grid-template-areas:
          "image description"
          "button button";
      }

      @media (max-width: 540px) {
        grid-template-columns: 1fr;
        grid-template-areas:
          "image"
          "description"
          "button";
      }

      .news__img {
        grid-area: image;
        width: 200px;
        height: 150px;
        object-fit: cover;
        border-radius: 8px;
        @media (max-width: 820px) {
          width: 143px;
          height: 107px;
        }
        @media (max-width: 540px) {
          width: 100%;
          height: 200px;
        }
      }

      .news__description {
        grid-area: description;
        font-family: "Manrope", sans-serif;
        font-size: clamp(14px, 2vw, 16px);
        line-height: 26px;
        margin-bottom: 28px;

        @media (max-width: 820px) {
          margin-top: 28px;
        }

        @media (max-width: 540px) {
          line-height: 18px;
          margin-top: 10px;
          margin-bottom: 16px;
        }
      }

      .news__btn {
        grid-area: button;
        width: fit-content;
        padding: 16px;
        padding-left: 28px;
        font-family: "Manrope", sans-serif;
        font-size: 16px;
        height: 60px;
        font-weight: 500;
        background: #e9b949;
        border-radius: 8px;
        position: relative;
        transition: all 0.4ms ease;
        &::after {
          content: "";
          background-image: url(/icons/arrow-classic.svg);
          background-repeat: no-repeat;
          background-size: contain;
          display: inline-block;
          margin-left: 8px;
          margin-bottom: 2px;
          width: 20px;
          height: 20px;
        }

        &:hover {
          background-color: #d4a842;
        }

        &:active {
          background-color: #b88f34;
        }

        @media (max-width: 540px) {
          padding: 9px 16px;
          font-size: 14px;
        }
      }
    }
  }

  .news-swiper-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;

    .news-swiper-button-prev,
    .news-swiper-button-next {
      width: 40px;
      height: 40px;
      background: #faf7ee;
      border: 1px solid #e9b949;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: #e9b949;
        
        svg path {
          stroke: #fff;
        }
      }

      &.swiper-button-disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .news-swiper-pagination {
      display: flex;
      justify-content: center;
      gap: 8px;

      :deep(.swiper-pagination-bullet) {
        width: 12px;
        height: 12px;
        background: #d1d5db;
        opacity: 1;
        border-radius: 50%;
        transition: all 0.3s ease;
      }

      :deep(.swiper-pagination-bullet-active) {
        background: #e9b949;
        width: 24px;
        border-radius: 6px;
      }
    }
  }
}
</style>
