<template>
  <div class="request-card">
    <div class="request-header">
      <div class="flex items-center gap-4">
        <span>Запрос № {{ request.id }}</span>
        <span class="request-date">Дата заявки: {{ request.date }}</span>
      </div>
    </div>

    <div class="request-info">
      <div class="info-row"><p>Заказчик:</p> <p class="font-bold">{{ request.client }}</p></div>
      <div class="info-row"><p>Контакты:</p> <p class="font-bold">{{ request.phone }}</p></div>
      <div class="info-row"><p>ФИО покойного:</p> <p class="font-bold">{{ request.deceased }}</p></div>
    </div>

    <div class="request-services">
      <p class="font-medium mb-1">Услуги:</p>

      <ul class="flex flex-col gap-1">
        <li v-for="(service, index) in request.services" :key="index" class="flex items-center gap-2">
          <input type="checkbox" :checked="service.checked" disabled class="checkbox" />
          <span>{{ service.label }}</span>
        </li>
      </ul>
    </div>

    <div class="flex justify-between items-center flex-wrap gap-2 mt-4">
      <div class="request-tags">
        <span class="badge">{{ request.cemetery }}</span>
        <span class="badge">Сектор {{ request.sector }}</span>
        <span class="badge">Место: {{ request.place }}</span>
      </div>
      <div class="flex items-center gap-4">
        <span
            class="status"
            :class="{
            'status--pending': request.status === 'pending',
            'status--done': request.status === 'done'
          }"
        >
          {{ request.status === 'pending' ? 'Ожидает исполнения' : 'Завершена' }}
        </span>
        <button class="details-btn" @click="router.push('/manager/ennoblement/' + request.id)">Подробнее</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps(['request'])

const router = useRouter();
</script>

<style scoped>
.request-card {
  @apply bg-white rounded-[16px] p-[16px] mb-[20px];
  border: 1px solid #f3f3f3;
}

.request-header {
  @apply flex justify-between items-center pb-[12px] border-b border-[#EEEEEE];
  font-size: 16px;
  font-weight: 600;
}

.request-date {
  font-size: 14px;
  color: #6b7280;
  font-weight: 400;
}

.request-info {
  @apply flex flex-col gap-[6px] mt-[12px];
  font-size: 14px;
}

.info-row {
  @apply flex;
  gap: 8px;
}

.request-services {
  @apply mt-[16px];
  font-size: 14px;
}


.badge {
  @apply inline-block rounded-md bg-[#F1F5F9] text-[#1F2937] text-sm font-medium px-2 py-[2px] mr-2;
}

.status {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  white-space: nowrap;
}

.status--pending {
  background-color: #F7901E;
  color: #fff;
}

.status--done {
  background-color: #3CBF4A;
  color: white;
}

.details-btn {
  background-color: #224C4F;
  color: white;
  font-size: 14px;
  padding: 6px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}
</style>
