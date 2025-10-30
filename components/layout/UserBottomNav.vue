<template>
  <div class="user-bottom-nav">
    <NuxtLink 
      to="/user/tickets" 
      class="nav-item"
      :class="{ active: $route.path.startsWith('/user/tickets') }"
    >
      <div class="nav-icon-wrapper">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 19l7-7 3 3-7 7-3-3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <span class="nav-text">{{ $t('user.bottomNav.requests') }}</span>
    </NuxtLink>

    <NuxtLink 
      to="/user/reports" 
      class="nav-item"
      :class="{ active: $route.path.startsWith('/user/reports') }"
    >
      <div class="nav-icon-wrapper">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M3 3v18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M18 17V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M13 17V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 17v-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <span class="nav-text">{{ $t('user.bottomNav.reports') }}</span>
    </NuxtLink>

    <NuxtLink 
      to="/user/news" 
      class="nav-item"
      :class="{ active: $route.path.startsWith('/user/news') }"
    >
      <div class="nav-icon-wrapper">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M18 14h2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M15 18h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <span class="nav-text">{{ $t('user.bottomNav.news') }}</span>
    </NuxtLink>

    <NuxtLink 
      to="/user/users" 
      class="nav-item"
      :class="{ active: $route.path.startsWith('/user/users') }"
    >
      <div class="nav-icon-wrapper">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <span class="nav-text">{{ $t('user.bottomNav.users') }}</span>
    </NuxtLink>
  </div>
</template>

<script setup>
// Bottom navigation для акимата на мобильных устройствах
</script>

<style scoped>
.user-bottom-nav {
  display: none; /* Скрыто по умолчанию */
}

/* Показать только на мобильных устройствах */
@media (max-width: 768px) {
  .user-bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #FFFFFF;
    justify-content: space-around;
    padding: 8px 0 12px 0;
    z-index: 1000;
    border-top: 1px solid #E5E7EB;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    text-decoration: none;
    color: #9CA3AF;
    transition: color 0.2s ease;
    position: relative;
    min-width: 60px;
    flex: 1;
  }

  .nav-item.active {
    color: #F7B500;
  }

  .nav-text {
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
    text-align: center;
  }

  .nav-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
  }
}

/* Скрыть на десктопе */
@media (min-width: 769px) {
  .user-bottom-nav {
    display: none;
  }
}
</style>
