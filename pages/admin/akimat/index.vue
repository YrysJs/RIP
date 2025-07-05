<template>
  <NuxtLayout name="admin">
    <div class="w-full mt-[20px] booking-list">
      <div class="flex justify-between items-center mb-[16px] bg-white rounded-[16px] p-[20px]">
        <h2 class="text-2xl font-semibold">Список Акиматов</h2>
        <button class="invite-btn" @click="router.push('/admin/akimat/form')">
          <img src="/icons/plus.svg" alt="Пригласить" class="w-4 h-4 mr-2" />
          Создать
        </button>
      </div>
      <div v-for="akimat in akimats" :key="akimat.id" class="booking-card">
        <div class="booking-header">
          <span>{{ akimat.name }}</span>
        </div>
        <div class="flex justify-between items-center mt-4">
          <div class="booking-info">
            <span class="badge">Телефон: <span class="font-medium">{{ formatPhoneNumber(akimat.phone) }}</span></span>
            <span class="badge">Адрес: <span class="font-medium ml-1">{{ cities[akimat.cityId - 1] }}, {{ akimat.address }}</span></span>
          </div>
          <a :href="akimat.mapUrl" target="_blank">
            <button class="details-btn">На карте</button>
          </a>
        </div>

      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { getAkimats } from '~/services/admin'
import {ref} from "vue";

const router = useRouter();

definePageMeta({
  middleware: ['auth', 'admin'],
});

const cities = [
  'Алматы',
  'Нур-Султан',
  'Шымкент',
  'Караганда',
  'Тараз',
  'Павлодар',
  'Усть-Каменогорск',
  'Семей',
  'Актобе',
  'Костанай',
  'Кызылорда',
  'Талдыкорган',
  'Тараз',
  'Павлодар',
  'Усть-Каменогорск',
  'Семей',
  'Актобе',
  'Костанай',
  'Кызылорда'
]

const akimats = ref([])

function formatPhoneNumber(phone) {
  if (!/^\d{11}$/.test(phone)) return 'Неверный формат номера';

  return `+${phone[0]} (${phone.slice(1, 4)}) ${phone.slice(4, 7)} ${phone.slice(7, 9)} ${phone.slice(9, 11)}`;
}

onMounted((async () => {
  try {
    const response = await getAkimats()
    akimats.value = response.data
  } catch (error) {
    console.error('Ошибка при получении списка Акиматов:', error)
  } finally {
    console.log('finally')
  }
}))

</script>

<style scoped>
.invite-btn {
  background: #224C4F;
  color: white;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
}

.booking-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .booking-card {
    border-radius: 16px;
    background: #fff;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .booking-header {
      display: flex;
      justify-content: space-between;
      font-weight: 500;
      font-size: 18px;

      a {
        color: #0092cc;
        text-decoration: none;
      }

      .booking-date {
        color: #555;
        font-weight: 400;
        font-size: 14px;
      }
    }

    .booking-info {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;

      .badge {
        background: #E9EDED;
        padding: 8px 4px;
        border-radius: 8px;
        font-size: 14px;
        height: 32px;
        display: flex;
        align-items: center;
      }
    }

    .details-btn {
      background-color: #224C4F;
      color: #fff;
      border: none;
      padding: 16px;
      border-radius: 8px;
      cursor: pointer;
      height: 32px;
      display: flex;
      font-size: 14px;
      font-weight: 600;
      align-items: center;
    }
  }
}

</style>
