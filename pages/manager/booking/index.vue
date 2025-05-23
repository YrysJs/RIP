<script setup>

import {getBurialRequests} from "~/services/manager"

const router = useRouter();

const bookings = [

    {
      id: 36,
      request_number: "BR-1748007385-1",
      cemetery_id: 1,
      grave_id: 5,
      deceased_id: 39,
      deceased: {
        id: 39,
        grave_id: 5,
        full_name: "Testov3 Test Testovich",
        inn: "661212301297",
        death_date: null,
        created_at: "2025-05-23T13:36:25.821755Z",
        updated_at: "2025-05-23T13:37:46.5552Z"
      },
      burial_date: "2025-10-10T00:00:00Z",
      burial_time: "10:00",
      user_phone: "77777318243",
      status: "pending",
      is_complete: false,
      created_at: "2025-05-23T13:36:25.821755Z",
      updated_at: "2025-05-23T13:37:46.549021Z"
    },
    {
      id: 1,
      request_number: "BR-1748006583-1",
      cemetery_id: 1,
      grave_id: 1,
      deceased_id: 1,
      deceased: {
        id: 1,
        grave_id: 1,
        full_name: "Testov Test Testovich",
        inn: "661212301299",
        death_date: null,
        created_at: "2025-05-23T13:23:03.159768Z",
        updated_at: "2025-05-23T13:23:03.159768Z"
      },
      burial_date: null,
      burial_time: "",
      user_phone: "77777318243",
      status: "pending",
      is_complete: false,
      created_at: "2025-05-23T13:23:03.217137Z",
      updated_at: "2025-05-23T13:23:03.217137Z"
    }
  ]


onMounted(() => {
  getBurialRequests({
    status: 'pending'
  }).then((response) => {
    console.log(response)
  })
})
</script>

<template>
  <NuxtLayout name="manager">
    <div class="booking-list">
      <div v-for="booking in bookings" :key="booking.id" class="booking-card">
        <div class="booking-header">
          <span>Бронирование: <a href="#">{{ booking.request_number }}</a></span>
          <span class="booking-date">Дата брони: {{ new Date(booking.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</span>
        </div>
        <div class="flex justify-between items-center mt-4">
          <div class="booking-info">
            <span class="badge"><span class="font-medium">{{ booking.cemetery ? booking.cemetery : 'Северное кладбище' }}</span></span>
<!--            <span class="badge">Сектор: <span class="font-medium ml-1">{{ booking.sector }}</span></span>-->
            <span class="badge">Место: <span class="font-medium ml-1">{{ booking.grave_id }}</span> </span>
          </div>
          <button class="details-btn" @click="router.push(`/manager/booking/${booking.id}`)">Подробнее</button>
        </div>

      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
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