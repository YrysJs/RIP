<template>
  <NuxtLayout name="user">
    <div class="news-detail w-full bg-white rounded-[16px] mt-[20px] p-[20px]">
      <button class="btn btn-back mb-[16px]" @click="router.push('/user/news')">
        <img src="/icons/arrow-left-primary.svg" class="w-4 h-4 mr-[10px]" />
        Назад
      </button>

      <div class="flex justify-between items-center text-sm text-[#6B7280] mb-[16px]">
        <span>{{ formatDate(newsStore.selectedNews?.registrationDate) }}</span>
        <div class="flex items-center gap-[8px]">
          <span>{{ newsStore.selectedNews?.statusText }}</span>
          <span
              class="status"
              :class="{
            'status--active': newsStore.selectedNews?.newsStatus?.id === 'active',
            'status--draft': newsStore.selectedNews?.newsStatus?.id === 'draft'
          }"
          >
          {{ statusLabel(newsStore.selectedNews?.newsStatus?.nameRu) }}
        </span>
        </div>
      </div>

      <h1 class="text-2xl font-semibold mb-[20px] leading-tight">{{ newsStore.selectedNews?.title }}</h1>

      <img :src="newsStore.selectedNews?.coverImageUrl" alt="Обложка" class="w-full h-auto rounded-[12px] mb-[24px]" />

      <p class="text-base text-[#374151] leading-6 whitespace-pre-line">
        {{ newsStore.selectedNews?.content }}
      </p>
    </div>
  </NuxtLayout>

</template>

<script setup>
import { useNewsStore } from '~/store/news.js'
const router = useRouter();

const newsStore = useNewsStore()

definePageMeta({
  middleware: ['auth', 'akimat'],
});

function formatDate(arr) {
  if (!Array.isArray(arr) || arr.length < 6) return '';

  const [year, month, day, hour, minute, second, nanoseconds = 0] = arr;
  const date = new Date(
      year,
      month - 1, // месяцы в JS начинаются с 0
      day,
      hour,
      minute,
      second,
      Math.floor(nanoseconds / 1_000_000) // наносекунды → миллисекунды
  );

  const pad = (n) => String(n).padStart(2, '0');

  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}


const statusLabel = (status) => {
  if (status === 'active') return 'Активно';
  if (status === 'draft') return 'Черновик';
  return '';
};
</script>

<style scoped>
.btn-back {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #224C4F;
  background: #EEEEEE;
  border-radius: 8px;
}

.status {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  white-space: nowrap;
}

.status--active {
  background-color: #3CBF4A;
  color: white;
}

.status--draft {
  background-color: #F7901E;
  color: white;
}
</style>
