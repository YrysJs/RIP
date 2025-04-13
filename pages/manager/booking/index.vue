<script setup>

const bookings = [
  {
    id: '0000023',
    date: '07.01.2025',
    cemetery: 'Северное кладбище',
    sector: 11,
    place: 233,
  },
  {
    id: '0000024',
    date: '08.01.2025',
    cemetery: 'Южное кладбище',
    sector: 12,
    place: 124,
  },
  {
    id: '0000025',
    date: '09.01.2025',
    cemetery: 'Западное кладбище',
    sector: 13,
    place: 309,
  },
]
</script>

<template>
  <NuxtLayout name="manager">
    <div class="booking-list">
      <div v-for="booking in bookings" :key="booking.id" class="booking-card">
        <div class="booking-header">
          <span>Бронирование: <a href="#">{{ booking.id }}</a></span>
          <span class="booking-date">Дата брони: {{ booking.date }}</span>
        </div>
        <div class="flex justify-between items-center mt-4">
          <div class="booking-info">
            <span class="badge"><span class="font-medium">{{ booking.cemetery }}</span></span>
            <span class="badge">Сектор: <span class="font-medium ml-1">{{ booking.sector }}</span></span>
            <span class="badge">Место: <span class="font-medium ml-1">{{ booking.place }}</span> </span>
          </div>
          <button class="details-btn">Подробнее</button>
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