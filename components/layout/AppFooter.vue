<template>
  <footer class="app-footer" id="contact">
    <div class="container">
      <h3>{{ $t('footer.contacts') }}</h3>
      <p>{{ $t('footer.consultationHours') }}</p>
      <ul class="contacts__list">
        <li>
          <img src="/icons/whatsapp1.svg" alt="Whatsapp icon" />
          <a class="underlined" href="http://wa.me/77758100110" target="_blank">+7 (775) 810-01-10</a>
        </li>
        <li>
          <a class="underlined" href="mailto:info@ripservice.kz "
            >info@ripservice.kz</a
          >
        </li>
      </ul>
      <div class="footer__links">
        <ul class="links__left">
          <li><a :href="getLinkHref('main')" class="underlined">{{ $t('footer.main') }}</a></li>
          <li><a :href="getLinkHref('about')" class="underlined">{{ $t('footer.about') }}</a></li>
          <li><a :href="getLinkHref('services')" class="underlined">{{ $t('footer.services') }}</a></li>
          <li><a :href="getLinkHref('contact')" class="underlined">{{ $t('footer.contact') }}</a></li>
        </ul>
        <div class="links__middle">
          <RouterLink to="/instructions" class="underlined"
            >{{ $t('footer.privacyPolicy') }}</RouterLink
          >
          <ul>
            <li>
              <a
                href="http://www.instagram.com/ripservice.kz/profilecard/?igsh=NWlmZzJieW9lMGFt"
                target="_blank"
              >
                <img src="/icons/instagram.svg" alt="Instagram icon" />
              </a>
            </li>
            <li>
              <a
                href="http://www.facebook.com/share/19H52AYpDA/?mibextid=wwXIfr"
                target="_blank"
              >
                <img src="/icons/facebook.svg" alt="Facebook icon" />
              </a>
            </li>
          </ul>
        </div>
        <ul class="links__right">
          <li>
            <img src="/icons/whatsapp1.svg" alt="Whatsapp icon" />
            <a href="http://wa.me/77758100110" target="_blank">+7 (775) 810-01-10</a>
          </li>
          <li>
            <img src="/icons/pin.svg" alt="Pin icon" />
            <span>{{ $t('footer.location') }}</span>
          </li>
        </ul>
      </div>
    </div>
    <Teleport to="body">
      <SuccessModal
        v-if="showSuccessModal"
        :title="$t('footer.bookingPrice')"
        :show-button="true"
        @close="closeSuccessModal"
      />
    </Teleport>
  </footer>
</template>

<script setup>
import SuccessModal from "~/components/layout/modals/SuccessModal.vue";
import { RouterLink } from "#vue-router";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const showSuccessModal = ref(false);
const route = useRoute(); // useRoute доступен через автоимпорт в Nuxt 3

const closeSuccessModal = () => {
  showSuccessModal.value = false;
};

// Функция для формирования правильной ссылки
const getLinkHref = (anchor) => {
  // Если мы на главной странице, используем якорь
  if (route.path === '/') {
    return `#${anchor}`;
  }
  // На других страницах ведем на главную с якорем
  return `/#${anchor}`;
};
</script>

<style lang="scss" scoped>
.app-footer {
  background-color: #faf7ee;
  padding: clamp(48px, 2vw, 120px) clamp(26px, 2vw, 107px)
    clamp(80.75px, 2vw, 62px);

  h3 {
    font-family: "Manrope", sans-serif;
    font-size: clamp(2rem, 5vw, 4.125rem);
    color: #201001;

    @media (max-width: 540px) {
      font-size: 28px;
    }
  }

  p {
    margin-top: clamp(8px, 2vw, 20px);
    margin-bottom: clamp(16px, 5vw, 60px);
    font-family: "Manrope", sans-serif;
    font-size: 21px;
    color: #212121b3;
    text-align: center;

    @media (max-width: 540px) {
      font-size: 13px;
    }
  }

  .contacts__list {
    padding-bottom: 41px;
    display: flex;
    justify-content: space-between;
    width: 100%;
    font-family: "Manrope", sans-serif;
    font-size: clamp(16px, 2vw, 26px);
    color: #201001;
    border-bottom: 1px solid #2010011f;

    li {
      display: flex;
      align-items: center;
      gap: 12px;
      
      img {
        width: 24px;
        height: 24px;
      }
    }

    @media (max-width: 540px) {
      flex-direction: column;
      align-items: center;
      padding-bottom: 0;
      border-bottom: none;
    }
  }

  .footer__links {
    padding-top: clamp(2rem, 4vw, 3.5rem);
    width: 100%;
    display: flex;
    justify-content: space-between;

    @media (max-width: 540px) {
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
    }

    .links__left {
      display: flex;
      order: 1;
      flex-direction: column;
      gap: 10px;
      font-size: 16px;
      color: #20100180;

      @media (max-width: 540px) {
        width: 130px;
      }
    }

    .links__middle {
      display: flex;
      order: 2;
      flex-direction: column-reverse;
      justify-content: flex-end;
      gap: 24px;
      font-size: 16px;
      ul {
        display: flex;
        justify-content: space-around;
      }

      @media (max-width: 540px) {
        order: 3;
        margin-top: 24px;
        flex-direction: column;
        gap: 16px;
      }
    }

    .links__right {
      display: flex;
      flex-direction: column;
      gap: 22px;
      order: 3;
      li {
        display: flex;
        align-items: center;
        gap: 20px;
        img {
          width: 24px;
          height: 24px;
        }
      }

      @media (max-width: 540px) {
        order: 2;
        width: 181px;
      }
    }
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.underlined {
  transition: all 0.4ms ease;
  &:hover {
    text-decoration: underline;
  }
}
</style>
