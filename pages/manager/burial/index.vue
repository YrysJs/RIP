<script setup>

import {getBurialRequests} from "~/services/manager"
const burials = [
  {
    id: 2,
    request_number: "BR-1748006974-1",
    cemetery_id: 1,
    grave_id: 2,
    deceased_id: 4,
    deceased: {
      id: 4,
      grave_id: 2,
      full_name: "Testov2 Test Testovich",
      inn: "661212301298",
      death_date: "2025-10-09T00:00:00Z",
      death_cert_url: "https://s3.eu-north-1.amazonaws.com/ripservicebucket/deceased_docs/death_certificate/4/2025-05-23/Zulufov R охотникум.pdf",
      created_at: "2025-05-23T13:29:34.447644Z",
      updated_at: "2025-05-23T13:30:58.539566Z"
    },
    burial_date: "2025-10-10T00:00:00Z",
    burial_time: "15:00",
    user_phone: "77777318243",
    status: "paid",
    is_complete: false,
    created_at: "2025-05-23T13:29:34.447644Z",
    updated_at: "2025-05-23T13:29:34.447644Z"
  }
]

onMounted(() => {
  getBurialRequests({
    status: 'paid'
  }).then((response) => {
    console.log(response)
  })
})

</script>

<template>
  <NuxtLayout name="manager">
    <div class="burial-list">
      <div v-for="burial in burials" :key="burial.id" class="burial-card">
        <div class="burial-header">
          <div class="flex items-center gap-4">
            <span>Захоронение: <a href="#">{{ burial.request_number }}</a></span>
            <span class="burial-date">Дата брони: {{ new Date(burial.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</span>
          </div>

          <span class="burial-date__bold">Дата похорон: {{ new Date(burial.burial_date).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) }} {{ burial.burial_time }}</span>
        </div>
        <div class="font-medium text-base mt-2">ФИО покойного: <span class="font-bold ml-1">{{ burial.deceased.full_name }}</span></div>

        <div class="flex justify-between items-center mt-4">
          <div class="burial-info">
            <span class="badge"><span class="font-medium">{{ burial.cemetery ? burial.cemetery : 'Северное кладбище' }}</span></span>
<!--            <span class="badge">Сектор: <span class="font-medium ml-1">{{ burial.sector }}</span></span>-->
            <span class="badge">Место: <span class="font-medium ml-1">{{ burial.grave_id }}</span> </span>

          </div>
          <div class="flex items-center gap-4">
            <span
                class="status"
                :class="{
                'status--pending': burial.status === 'paid',
                'status--confirmed': burial.status === 'confirmed',
              }"
            >
              {{ burial.status === 'paid' ? 'Ожидает подтверждения' : 'Подтверждено' }}
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
