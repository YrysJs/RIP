<template>
  <div class="admin-login-page">
    <AppHeader style="'landing'" />
    
    <main class="main-content">
      <div class="container">
        <div class="login-section">
          <h1 class="page-title">Вход для администрации</h1>
          <p class="page-description">Выберите тип входа для административного доступа</p>
          
          <!-- Административная модалка -->
          <div class="admin-modal-container">
            <div class="admin-modal">
              <h2 class="modal-title">Администрация</h2>
              
              <div class="login-options">
                <div class="login-option" @click="login('manager')">
                  <img src="/icons/home.svg" class="option-icon" />
                  <span class="option-text">Войти как менеджер кладбища</span>
                </div>
                
                <div class="login-option" @click="login('akimat')">
                  <img src="/icons/building.svg" class="option-icon" />
                  <span class="option-text">Кабинет Акимата</span>
                </div>
              </div>
              
              <div class="back-link">
                <NuxtLink to="/" class="back-button">
                  ← Вернуться на главную
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Фон для модалок авторизации -->
    <Teleport to="body">
      <div
        v-if="showAuthModal"
        class="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center"
        @click.self="authModalStore.closeModal"
      >
        <ManagerLogin v-if="currentAuthModal === 'manager'" @close="authModalStore.closeModal" />
        <AkimatLogin v-if="currentAuthModal === 'akimat'" @close="authModalStore.closeModal" />
      </div>
    </Teleport>

    <AppFooter />
  </div>
</template>

<script setup>
import { useUserStore } from "~/store/user.js";
import { useAuthModalStore } from "~/store/authModal.js";
import AkimatLogin from "~/components/auth/AkimatLogin.vue";
import ManagerLogin from "~/components/auth/ManagerLogin.vue";
import AppHeader from "~/components/layout/AppHeader.vue";
import AppFooter from "~/components/layout/AppFooter.vue";

// SEO
useHead({
  title: 'Вход для администрации',
  meta: [
    { name: 'description', content: 'Административный вход для менеджеров кладбища и сотрудников Акимата' }
  ]
})

const userStore = useUserStore();
const authModalStore = useAuthModalStore();

// Computed свойства для модалок
const showAuthModal = computed(() => {
  return authModalStore.activeModal && authModalStore.activeModal !== '';
});

const currentAuthModal = computed(() => {
  return authModalStore.activeModal || '';
});

function login(type) {
  userStore.setAuthType(type);
  authModalStore.openModal(type);
}
</script>

<style lang="scss" scoped>
.admin-login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.main-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120px 24px 60px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.login-section {
  text-align: center;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  color: #224C4F;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
}

.page-description {
  font-size: 1.2rem;
  color: #6B7280;
  margin-bottom: 48px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 32px;
  }
}

.admin-modal-container {
  display: flex;
  justify-content: center;
}

.admin-modal {
  background: white;
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 500px;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 32px 24px;
    margin: 0 16px;
  }
}

.modal-title {
  font-size: 2rem;
  font-weight: 600;
  color: #224C4F;
  margin-bottom: 32px;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 24px;
  }
}

.login-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.login-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #FAFAFA;
  
  &:hover {
    border-color: #224C4F;
    background: #F0F9FF;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(34, 76, 79, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
}

.option-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.option-text {
  font-size: 1.1rem;
  font-weight: 500;
  color: #374151;
  text-align: left;
}

.back-link {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #E5E7EB;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #6B7280;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  
  &:hover {
    color: #224C4F;
  }
}
</style>






































