<script setup>
const burials = [
  {
    id: '0000023',
    bookingDate: '07.01.2025',
    burialDate: '07.01.2025',
    burialTime: '10:00',
    name: 'Беляков Макар Максимович',
    cemetery: 'Северное кладбище',
    sector: 11,
    place: 233,
    status: 'pending',
  },
  {
    id: '0000023',
    bookingDate: '07.01.2025',
    burialDate: '07.01.2025',
    burialTime: '10:00',
    name: 'Шестопалова Ксения Вадимовна',
    cemetery: 'Северное кладбище',
    sector: 11,
    place: 233,
    status: 'confirmed',
  },
  {
    id: '0000023',
    bookingDate: '07.01.2025',
    burialDate: '07.01.2025',
    burialTime: '10:00',
    name: 'Сидорова Дарья Вячеславовна',
    cemetery: 'Северное кладбище',
    sector: 11,
    place: 233,
    status: 'confirmed',
  },
  {
    id: '0000023',
    bookingDate: '07.01.2025',
    burialDate: '07.01.2025',
    burialTime: '10:00',
    name: 'Никитин Михаил Ильич',
    cemetery: 'Северное кладбище',
    sector: 11,
    place: 233,
    status: 'confirmed',
  },
]
</script>

<template>
  <NuxtLayout name="manager">
    <div class="burial-list">
      <div v-for="burial in burials" :key="burial.name" class="burial-card">
        <div class="burial-header">
          <div class="flex items-center gap-4">
            <span>Захоронение: <a href="#">{{ burial.id }}</a></span>
            <span class="burial-date">Дата брони: {{ burial.bookingDate }}</span>
          </div>

          <span class="burial-date__bold">Дата похорон: {{ burial.burialDate }} {{ burial.burialTime }}</span>
        </div>
        <div class="font-medium text-base mt-2">ФИО покойного: <span class="font-bold ml-1">{{ burial.name }}</span></div>

        <div class="flex justify-between items-center mt-4">
          <div class="burial-info">
            <span class="badge"><span class="font-medium">{{ burial.cemetery }}</span></span>
            <span class="badge">Сектор: <span class="font-medium ml-1">{{ burial.sector }}</span></span>
            <span class="badge">Место: <span class="font-medium ml-1">{{ burial.place }}</span> </span>

          </div>
          <div class="flex items-center gap-4">
            <span
                class="status"
                :class="{
                'status--pending': burial.status === 'pending',
                'status--confirmed': burial.status === 'confirmed',
              }"
            >
              {{ burial.status === 'pending' ? 'Ожидает подтверждения' : 'Подтверждено' }}
            </span>
            <button class="details-btn">Подробнее</button>
          </div>

        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.burial-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .burial-card {
    border-radius: 16px;
    background: #fff;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .burial-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      font-weight: 500;
      font-size: 18px;
      gap: 8px;

      a {
        color: #0092cc;
        text-decoration: none;
      }

      .burial-date {
        color: #222;
        font-weight: 400;
        font-size: 14px;

        &__bold {
          font-size: 16px;
          font-weight: 500;
        }
      }
    }

    .burial-info {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      align-items: center;
      margin-top: 8px;

      .badge {
        background: #e9eded;
        padding: 8px 4px;
        border-radius: 8px;
        font-size: 14px;
        height: 32px;
        display: flex;
        align-items: center;
      }

    }

    .details-btn {
      background-color: #224c4f;
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

.status {
  padding: 4px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 4px;
  height: 24px;
  display: flex;
  letter-spacing: 0.56px;
  align-items: center;

  &--pending {
    background-color: #fef3e2;
    color: #cb5600;
  }

  &--confirmed {
    background-color: #d2f5dc;
    color: #007c3d;
  }
}
</style>
