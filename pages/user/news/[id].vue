<template>
  <NuxtLayout name="user">
    <div class="news-detail w-full bg-white rounded-[16px] mt-[20px] p-[20px]">
      <button class="btn btn-back mb-[16px]" @click="router.push('/user/news')">
        <img src="/icons/arrow-left-primary.svg" class="w-4 h-4 mr-[10px]" />
        Назад
      </button>

      <div class="flex justify-between items-center text-sm text-[#6B7280] mb-[16px]">
        <span>{{ news.date }}</span>
        <div class="flex items-center gap-[8px]">
          <span>{{ news.statusText }}</span>
          <span
              class="status"
              :class="{
            'status--active': news.status === 'active',
            'status--draft': news.status === 'draft'
          }"
          >
          {{ statusLabel(news.status) }}
        </span>
        </div>
      </div>

      <h1 class="text-2xl font-semibold mb-[20px] leading-tight">{{ news.title }}</h1>

      <img :src="news.image" alt="Обложка" class="w-full h-auto rounded-[12px] mb-[24px]" />

      <h2 class="text-lg font-bold mb-[12px]">{{ news.subtitle }}</h2>

      <p class="text-base text-[#374151] leading-6 whitespace-pre-line">
        {{ news.text }}
      </p>
    </div>
  </NuxtLayout>

</template>

<script setup>
const router = useRouter();

const news = {
  title: 'Правила захоронения на кладбищах изменили в Казахстане',
  subtitle: 'Заместитель премьер-министра-министра национальной экономики приказом от 23 февраля 2024 года внес изменения в Типовые правила погребения и организации дела по уходу за могилами',
  date: '15 мая 2025, 09:45',
  status: 'active', // или 'draft'
  statusText: 'Преактивация',
  image: '/images/news-image.png', // путь к картинке
  text: `
При этом уточнено, что заключение договора на погребение, содержание и обслуживание кладбищ между местным исполнительным органом города республиканского значения, столицы, районного (города областного значения) и администратором кладбища осуществляется по итогам конкурса в срок, установленный в соответствии с законодательством о государственных закупках...

Добавлена новая норма, в соответствии с которой определены принципы проектирования и рекультивации кладбищ и порядок организации похоронного дела...
  `
};

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
