<template>
  <footer class="app-footer">
    <div class="container">
      <h3>Контакты</h3>
      <p>Мы проводим консультации ежедневно с 09:00 до 18:00</p>
      <ul class="contacts__list">
        <li>г. Алматы, Ул. Тимирязева. 428</li>
        <li>
          <a href="tel:+77776109828">+7 (777) 610-98-28</a>
        </li>
        <li>
          <a href="mailto:john@ripservice.com ">john@ripservice.com</a>
        </li>
      </ul>
      <div class="footer__links">
        <ul class="links__left">
          <li>Главная</li>
          <li>О компании</li>
          <li>Услуги</li>
          <li>Контакты</li>
        </ul>
        <div class="links__middle">
          <a>Политика конфиденциальности</a>
          <ul>
            <li>
              <a><img src="/icons/telegram.svg" alt="Telegram icon" /></a>
            </li>
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
            <span>7 777 707 77 77</span>
          </li>
          <li>
            <img src="/icons/telegram.svg" alt="Telegram icon" />
            <span>@ripservice</span>
          </li>
          <li>
            <img src="/icons/pin.svg" alt="Pin icon" />
            <span>Алматы, Казахстан</span>
          </li>
        </ul>
      </div>
    </div>
    <Teleport to="body">
      <SuccessModal
        v-if="showSuccessModal"
        title="Цена бронирования 10.000 тенге"
        @close="closeSuccessModal"
      />
    </Teleport>
  </footer>
</template>

<script setup>
import SuccessModal from "~/components/layout/modals/SuccessModal.vue";

const showSuccessModal = ref(false);

const closeSuccessModal = () => {
  showSuccessModal.value = false;
};
</script>

<style lang="scss" scoped>
.app-footer {
  background-color: #faf7ee;
  padding: clamp(48px, 2vw, 120px) clamp(26px, 2vw, 107px)
    clamp(80.75px, 2vw, 62px);

  h3 {
    font-family: "FoglihtenNo06", sans-serif;
    font-size: clamp(2rem, 5vw, 4.125rem);
    color: #201001;
  }

  p {
    margin-top: 20px;
    margin-bottom: 60px;
    font-family: "Manrope", sans-serif;
    font-size: 21px;
    color: #212121;
  }

  .contacts__list {
    padding-bottom: 41px;
    display: flex;
    justify-content: space-between;
    width: 100%;
    font-family: "Manrope", sans-serif;
    font-size: 26px;
    color: #201001;
    border-bottom: 1px solid #2010011f;
    &:first-child {
      max-width: 244px;
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
</style>
