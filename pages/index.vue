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

const dataId = ref(0);
const mainPageModalState = ref(false);
const loadingStore = useLoadingStore();

const showDetail = (id) => {
  dataId.value = id;
  mainPageModalState.value = true;
};

const slides = ref([
  {
    id: 1,
    title: "Общедоступная база захоронений",
    subtitle: "Социальный проект по поиску захоронений и уходу за ними",
    background: "/images/client/intro-desk.jpg",
    buttons: [
      {
        text: "Поиск захоронения",
        action: "search",
        icon: "search",
      },
      { text: "Забронировать место", action: "reserve", icon: "pencil" },
    ],
  },
  {
    id: 1,
    title: "Всеказахстанская база захоронений",
    subtitle: "Найдите захоронения ваших близких удаленно",
    background: "/images/client/banner.jpg",
    buttons: [
      { text: "Поиск захоронения", action: "search" },
      { text: "Добавить захоронение", action: "add" },
    ],
  },
  {
    id: 1,
    title: "Всеказахстанская база захоронений",
    subtitle: "Найдите захоронения ваших близких удаленно",
    background: "/images/client/banner.jpg",
    buttons: [
      { text: "Поиск захоронения", action: "search" },
      { text: "Добавить захоронение", action: "add" },
    ],
  },
]);

const services = [
  {
    id: 1,
    title: "Поиск захоронения",
    img: "/images/main_service/f1.jpg",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ",
    link: "",
  },
  {
    id: 2,
    title: "Благо-устройство",
    img: "/images/main_service/f2.jpg",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ",
    link: "",
  },
  {
    id: 3,
    title: "Цифровой мемориал и древо памяти",
    img: "/images/main_service/f3.jpg",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ",
    link: "",
  },
  {
    id: 4,
    title: "Ритуальные услуги",
    img: "/images/main_service/f4.jpg",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ",
    link: "",
  },
  {
    id: 5,
    title: "Ритуальные товары",
    img: "/images/main_service/f5.jpg",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ",
    link: "",
  },
];

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
    console.error("Ошибка при получении новостей:", error);
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
  <main class="relative mt-[77px]">
    <AppLoader v-if="loadingStore.loading" />
    <AppHeader type="client" />
    <section class="relative">
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
            :style="{ backgroundImage: `url(${slide.background})` }"
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
                  class="intro__btns flex justify-center gap-[32px] mt-[65px]"
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
    <div class="container">
      <section class="about">
        <div class="about__inner">
          <h3 class="about__title">О проекте</h3>
          <p class="about__paragraph">
            Мы компания RIP - первая в&nbsp;Казахстане единая база захоронений,
            с&nbsp;помощью которой вы сможете удалённо найти захоронение своих
            близких и&nbsp;родных, посмотреть в&nbsp;каком состоянии оно сейчас
            находится и&nbsp;организовать дальнейшее сопровождение
            по&nbsp;уходу, где бы вы не&nbsp;находились.
          </p>
          <a href="#services" class="about__link">
            <img src="/icons/arrow.svg" alt="" aria-hidden="true" />
            Подробнее
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
        <h3>Наша миссия</h3>
        <p>
          Создать единую базу для поиска, организации и&nbsp;услуг по&nbsp;уходу
          за&nbsp;захоронениями и&nbsp;сделать её доступной для&nbsp;населения.
        </p>
      </div>
    </div>
    <div class="container services" id="services">
      <h3 class="services__title">Услуги</h3>
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
          <button :href="`${service.link}`" class="service__btn">
            Подробнее
          </button>
        </li>
      </ul>
    </div>
    <section class="questions">
      <div class="questions__inner">
        <p>Можете связаться с нами в любое время!</p>
        <button>
          <img src="/icons/whatsapp.svg" alt="Whatsapp icon" />
          Написать на WhatsApp
        </button>
      </div>
    </section>
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

  .intro__img {
    width: clamp(12.25rem, 20vw, 14.5rem);
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

    &--search {
      background-color: #fff;
    }

    &--reserve {
      background-color: #e9b949;
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
    font-family: "FoglihtenNo06", sans-serif;
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
  margin: clamp(4rem, 8vw, 6.125rem) auto 0;
  max-width: 650px;
  text-align: center;

  h3 {
    margin: 0 auto 20px;
    width: fit-content;
    position: relative;
    font-family: "FoglihtenNo06", sans-serif;
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
  padding: clamp(3rem, 5vw, 4rem) 0 2.75rem;

  .services__title {
    height: clamp(4.6rem, 5vw, 5.25rem);
    width: fit-content;
    margin: 0 auto clamp(2rem, 2vw, 3.125rem);
    font-family: "FoglihtenNo06", sans-serif;
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
      font-family: "FoglihtenNo06", sans-serif;
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
      font-weight: 500;
      background: #e9b949;
      border-radius: 8px;
      position: relative;
      &::after {
        content: "";
        display: inline-block;
        margin-left: 8px;
        width: 16px;
        height: 16px;
        border-right: 2px solid #000;
        border-bottom: 2px solid #000;
        transform: rotate(-45deg);
        vertical-align: middle;
        @media (max-width: 540px) {
          margin-left: 4px;
          width: 12px;
          height: 12px;
        }
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
  background: url("/images/question.jpg") no-repeat center;
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
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, 5%);

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
    }
  }
}

@media (max-width: 540px) {
  html,
  body {
    font-size: 12px;
  }

  .main-slide {
    height: calc(100vh - 64px);
  }

  .intro__wrapper {
    top: auto;
    bottom: 60px;
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
      margin: 23px auto 0;
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
</style>
