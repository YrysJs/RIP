<script setup>
import { useRouter } from 'vue-router'
import { getBurialRequests } from '~/services/manager'
import { getCemeteries } from '~/services/cemetery'

const router = useRouter()

const bookings = ref([])
const cemeteries = ref([])
const search = ref('')

// новые фильтры
const dateFrom = ref('')
const dateTo = ref('')
const cemeteryId = ref(null)

const fetchBurials = async (params = { status: 'pending' }) => {
  try {
    const response = await getBurialRequests(params)
    bookings.value = response.data
  } catch (error) {
    console.error('Ошибка при получении заявок:', error)
  }
}

const fetchCemeteries = async () => {
  try {
    const response = await getCemeteries()
    cemeteries.value = response.data
  } catch (error) {
    console.error('Ошибка при получении кладбищ:', error)
  }
}

onMounted(() => {
  fetchBurials()
  fetchCemeteries()
})

const toIsoDate = (dateStr) => {
  return dateStr ? `${dateStr}T00:00:00Z` : undefined
}

// Поиск (оставляем debounce)
let timeout
watch(search, (newVal) => {
  clearTimeout(timeout)

  if (newVal.length >= 3 || newVal.length === 0) {
    timeout = setTimeout(() => {
      fetchBurials({
        status: 'pending',
        ...(newVal.length >= 3 ? { created_by: newVal } : {}),
        date_from: toIsoDate(dateFrom.value) || undefined,
        date_to: toIsoDate(dateTo.value) || undefined,
        cemetery_id: cemeteryId.value || undefined,
      })
    }, 500)
  }
})

// Фильтры: дата с
watch(dateFrom, () => {
  fetchBurials({
    status: 'pending',
    ...(search.value.length >= 3 ? { created_by: search.value } : {}),
    date_from: toIsoDate(dateFrom.value) || undefined,
    date_to: toIsoDate(dateTo.value) || undefined,
    cemetery_id: cemeteryId.value || undefined,
  })
})

// Фильтры: дата по
watch(dateTo, () => {
  fetchBurials({
    status: 'pending',
    ...(search.value.length >= 3 ? { created_by: search.value } : {}),
    date_from: toIsoDate(dateFrom.value) || undefined,
    date_to: toIsoDate(dateTo.value) || undefined,
    cemetery_id: cemeteryId.value || undefined,
  })
})

// Фильтры: кладбище
watch(cemeteryId, () => {
  fetchBurials({
    status: 'pending',
    ...(search.value.length >= 3 ? { created_by: search.value } : {}),
    date_from: toIsoDate(dateFrom.value) || undefined,
    date_to: toIsoDate(dateTo.value) || undefined,
    cemetery_id: cemeteryId.value || undefined,
  })
})
</script>

<template>
  <NuxtLayout name="manager">
    <div class="booking-list">
      <div class="flex justify-between items-center flex-wrap gap-4">
        <div class="flex gap-4 flex-wrap">
          <div>
            <p>Кладбище</p>
            <select class="filter-select" v-model="cemeteryId">
              <option :value="null">Все</option>
              <option v-for="cemetery in cemeteries" :key="cemetery.id" :value="cemetery.id">
                {{ cemetery.name }}
              </option>
            </select>
          </div>
          <div>
            <p>Дата с</p>
            <input class="filter-select date" type="date" v-model="dateFrom" />
          </div>
          <div>
            <p>Дата по</p>
            <input class="filter-select date" type="date" v-model="dateTo" />
          </div>
        </div>
      </div>
      <div class="search-wrapper">
        <div class="search-box">
          <img src="/icons/search.svg" alt="Поиск" />
          <input type="text" v-model="search" placeholder="Поиск по пользователю" />
        </div>
      </div>
      <div v-for="booking in bookings" :key="booking.id" class="booking-card">
        <div class="booking-header">
          <span>Бронирование: <a href="#">{{ booking.request_number }}</a></span>
          <span class="booking-date">Дата брони: {{ new Date(booking.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}</span>
        </div>
        <div class="flex justify-between items-center mt-4">
          <div class="booking-info">
            <span class="badge"><span class="font-medium">{{ booking.cemetery_name }}</span></span>
            <span class="badge">Сектор: <span class="font-medium ml-1">{{ booking.sector_number }}</span></span>
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

.search-wrapper {
  background: #FFFFFF;
  padding: 20px;
  border-radius: 8px;
  width: 100%;
}
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px 12px;
}
.search-box input {
  border: none;
  outline: none;
  flex: 1;
  font-size: 14px;
}
.search-box img {
  width: 16px;
  height: 16px;
}
</style>