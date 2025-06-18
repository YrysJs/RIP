<script setup>
import { useRouter } from 'vue-router'
import {getBurialRequestById, getBurialRequests} from '~/services/manager'
import BurialDetailsModal from "~/components/manager/burial/BurialDetailsModal.vue";
import {getGraveById, getGraveImages} from "~/services/client/index.js";
import { getCemeteries } from '~/services/cemetery'

const router = useRouter()

const burials = ref([])
const cemeteries = ref([])
const search = ref('')
const burialDetailModalVisible = ref(false)

const grave = ref({})
const graveImages = ref([])

// новые фильтры
const dateFrom = ref('')
const dateTo = ref('')
const cemeteryId = ref(null)

const fetchBurials = async (params = { show_confirmed_and_paid: true }) => {
  try {
    const response = await getBurialRequests(params)
    burials.value = response.data
  } catch (error) {
    console.error('Ошибка при получении заявок:', error)
  }
}


const fetchBurialDetails = async (id) => {
  try {
    const res = await getBurialRequestById(id)
    burial.value = res.data
    const response = await getGraveById(id)
    grave.value = response.data
    const images = await getGraveImages(id)
    graveImages.value = images.data
  } catch (error) {
    console.error('Ошибка при услуги:', error)
  } finally {
    burialDetailModalVisible.value = true
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
        show_confirmed_and_paid: true,
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
    show_confirmed_and_paid: true,
    ...(search.value.length >= 3 ? { created_by: search.value } : {}),
    date_from: toIsoDate(dateFrom.value) || undefined,
    date_to: toIsoDate(dateTo.value) || undefined,
    cemetery_id: cemeteryId.value || undefined,
  })
})

// Фильтры: дата по
watch(dateTo, () => {
  fetchBurials({
    show_confirmed_and_paid: true,
    ...(search.value.length >= 3 ? { created_by: search.value } : {}),
    date_from: toIsoDate(dateFrom.value) || undefined,
    date_to: toIsoDate(dateTo.value) || undefined,
    cemetery_id: cemeteryId.value || undefined,
  })
})

// Фильтры: кладбище
watch(cemeteryId, () => {
  fetchBurials({
    show_confirmed_and_paid: true,
    ...(search.value.length >= 3 ? { created_by: search.value } : {}),
    date_from: toIsoDate(dateFrom.value) || undefined,
    date_to: toIsoDate(dateTo.value) || undefined,
    cemetery_id: cemeteryId.value || undefined,
  })
})
</script>

<template>
  <NuxtLayout name="manager">
    <div class="burial-list">
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
            <button class="details-btn" @click="fetchBurialDetails(burial.id)">Подробнее</button>
          </div>

        </div>
      </div>
    </div>
    <Teleport to="body">
      <BurialDetailsModal :visible="burialDetailModalVisible" :grave="grave" :images="graveImages" :booking="burial" @close="burialDetailModalVisible = false" />
    </Teleport>
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
