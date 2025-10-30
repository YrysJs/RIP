<template>
  <div class="manager-bottom-nav">
    <NuxtLink to="/manager/burial" class="nav-item" :class="{ active: $route.path === '/manager/burial' }">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="nav-label">{{ $t('manager.bottomNav.requests') }}</span>
    </NuxtLink>

    <NuxtLink to="/manager/cemetery" class="nav-item" :class="{ active: $route.path === '/manager/cemetery' }">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/>
        <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2"/>
      </svg>
      <span class="nav-label">{{ $t('manager.bottomNav.cemeteries') }}</span>
    </NuxtLink>

    <NuxtLink to="/manager/notifications" class="nav-item" :class="{ active: $route.path === '/manager/notifications' }">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="nav-label">{{ $t('manager.bottomNav.notifications') }}</span>
    </NuxtLink>
  </div>
</template>

<script setup>
// Bottom navigation для manager на мобильных устройствах
</script>

<style scoped>
.manager-bottom-nav {
  display: none; /* Скрыто по умолчанию */
}

/* Показать только на мобильных устройствах */
@media (max-width: 768px) {
  .manager-bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fff;
    border-top: 1px solid #E5E7EB;
    padding: 8px 0;
    z-index: 50;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  }

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px 4px;
    text-decoration: none;
    color: #6B7280;
    transition: color 0.2s ease;
    min-height: 60px;
  }

  .nav-item.active {
    color: #F7B500;
  }

  .nav-icon {
    width: 24px;
    height: 24px;
    margin-bottom: 4px;
  }

  .nav-label {
    font-size: 12px;
    font-weight: 500;
    text-align: center;
  }
}

/* Скрыть на десктопе */
@media (min-width: 769px) {
  .manager-bottom-nav {
    display: none;
  }
}
</style>
