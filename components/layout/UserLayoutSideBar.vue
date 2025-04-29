<template>
  <aside class="sidebar bg-white h-full w-[308px]">
    <nav class="flex flex-col">
      <NuxtLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          class="sidebar-item flex items-center justify-between p-3 hover:bg-[#F1F5F9] transition"
          :class="{ 'active': isActive(item.to) }"
      >
        <div class="flex items-center gap-3">
          <img :src="isActive(item.to) ? item.active : item.icon" alt="icon" class="w-[20px] h-[20px]" />
          <span class="text-sm font-semibold">{{ item.label }}</span>
        </div>
        <span v-if="item.badge" class="badge">{{ item.badge }}</span>
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup>
import { useRoute } from 'vue-router';

defineProps({
  items: {
    type: Array,
    required: true
  }
});

const route = useRoute();

const isActive = (path) => {
  return route.path.startsWith(path);
};
</script>

<style scoped lang="scss">
.sidebar {
  border-right: 1px solid #E5E7EB;
}

.sidebar-item {
  color: #111827;
}

.sidebar-item.active {
  background: #224C4F0D;
  color: #38949B;
}

.badge {
  background: #F7901E;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 9999px;
}
</style>
