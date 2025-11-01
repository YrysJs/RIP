<script setup>
import { ref, onMounted, computed } from "vue";
import { getBurialRequests, getGraveById } from "~/services/client";
import ShareCoordModal from "~/components/layout/modals/ShareCoordModal.vue";
import GraveDataModal from "~/components/layout/modals/GraveDetailModal.vue";
// import { getCemeteryById } from "~/services/cemetery";
import { useUserStore } from "~/store/user";
import { useI18n } from 'vue-i18n';

const userStore = useUserStore();
const { t } = useI18n();

// Функция для получения конфигурации статуса
const getStatusConfig = (status) => {
  switch (status) {
    case 'pending':
      return {
        text: t('client.tickets.burial.status_pending'),
        icon: '/icons/warning.svg',
        color: 'text-[#D97706]'
      };
    case 'paid':
      return {
        text: t('client.tickets.burial.status_paid'),
        icon: '/icons/paid-tick.svg',
        color: 'text-[#1EB676]'
      };
    case 'cancelled':
      return {
        text: t('client.tickets.burial.status_cancelled'),
        icon: '/icons/warning.svg',
        color: 'text-[#DC2626]'
      };
    case 'confirmed':
      return {
        text: t('client.tickets.burial.status_confirmed'),
        icon: '/icons/paid-tick.svg',
        color: 'text-[#059669]'
      };
    default:
      return {
        text: t('client.tickets.burial.status_unknown'),
        icon: '/icons/warning.svg',
        color: 'text-[#6B7280]'
      };
  }
};

const burialRequests = ref([]);
const loading = ref(true);
const shareCoordModalState = ref(false);
const graveDataModalState = ref(false);
const graveData = ref(null);
const cemeteryData = ref(null);

/* Функция для объединения всех мест */
const getAllGraves = (request) => {
  const places = []
  
  // Основное место
  if (request.grave_number) {
    places.push(request.grave_number)
  }
  
  // Дополнительные места
  if (request.adjacent_graves && request.adjacent_graves.length > 0) {
    request.adjacent_graves.forEach(grave => {
      if (grave.grave_number) {
        places.push(grave.grave_number)
      }
    })
  }
  
  return places.join(', ')
}

const fetchGraveData = async (id) => {
  const response = await getGraveById(id);
  const grave = response.data; // <-- тут уже весь объект
  graveData.value = grave;
  return grave; // возвращаем наружу
};

// const fetchCemeteryData = async (id) => {
//   const response = await getCemeteryById(id);
//   cemeteryData.value = response.data.data;
// };

onMounted(async () => {
  try {
    const response = await getBurialRequests({
      user_phone: userStore.user?.phone,
    });
    burialRequests.value = response.data.data.data;
  } catch (error) {
    console.error(t('client.tickets.burial.errorFetchingRequests'), error);
    const { $toast } = useNuxtApp()
    $toast.error(t('client.tickets.burial.serverUnavailable'))
  } finally {
    loading.value = false;
  }
});

const graveLat = ref(null);
const graveLng = ref(null);

const shareGraveData = async (grave_id) => {
  const grave = await fetchGraveData(grave_id);

  const poly = grave?.polygon_data;
  if (!poly || !Array.isArray(poly.coordinates)) {
    console.error(t('client.tickets.burial.noCoordinates'), poly);
    return;
  }

  // первая пара — [lng, lat]
  const [lng, lat] = poly.coordinates[0];

  graveLat.value = lat;
  graveLng.value = lng;

  shareCoordModalState.value = true;
};

// const showGraveDataModal = async (id) => {
//   await fetchGraveData(id);
//   graveDataModalState.value = true;
// };
</script>

<template>
  <NuxtLayout name="client" content-class="bg-transparent max-sm:bg-white">
    <div
      v-if="!burialRequests || burialRequests?.length === 0"
      class="flex justify-center items-center p-10"
    >
      <p class="text-xl">{{ $t('client.tickets.burial.noRequests') }}</p>
    </div>
    <template v-else>
      <div
        v-for="request in burialRequests"
        :key="request.id"
        class="bg-white py-6 px-[18px] rounded-lg max-sm:p-0"
      >
        <template v-if="request.status === 'pending'">
          <div
            class="flex justify-between items-start pb-4 border-b-2 border-b-[#eee] max-lg:flex-col max-sm:border-none max-sm:pb-0"
          >
            <h3
              class="font-foglihten text-fluid font-medium text-[#201001] leading-[48px]"
            >
              {{ $t('client.tickets.burial.reservation') }}
              <span class="text-[#B88F34]">{{ request.request_number }}</span>
            </h3>
            <p class="text-sm text-[#999]">
              {{
                new Date(request.created_at).toLocaleString("ru-RU", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }}
            </p>
          </div>
          <div
            class="border-b-2 border-[#EEEEEE] pt-4 pb-[14px] max-sm:pt-0 max-sm:pb-0"
          >
            <div class="h-10 flex items-center text-base font-medium">
              <p class="min-w-[150px] black-16">{{ $t('client.tickets.burial.reservationPeriod') }}</p>
              <div class="flex items-center gap-[5px]">
                <p class="grey-14">
                  {{
                    new Date(request.reservation_expires_at).toLocaleString(
                      "ru-RU",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )
                  }}
                </p>
                <img src="/icons/info.svg" alt="" />
              </div>
            </div>
          </div>
          <div
            class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px] max-sm:mt-3 max-sm:pb-3"
          >
            <div
              class="min-w-[580px] font-medium flex flex-col gap-[10px] max-sm:gap-0"
            >
              <div class="flex text-base">
                <p class="min-w-[150px] grey-14">{{ $t('client.tickets.burial.cemetery') }}</p>
                <p class="black-16">{{ request.cemetery_name }}</p>
              </div>
              <div class="flex text-base">
                <p class="min-w-[150px] grey-14">{{ $t('client.tickets.burial.sector') }}</p>
                <p class="black-16">{{ request.sector_number }}</p>
              </div>
              <div class="flex text-base">
                <p class="min-w-[150px] grey-14">{{ $t('client.tickets.burial.row') }}</p>
                <p class="black-16">{{ request.row_number }}</p>
              </div>
              <div class="flex text-base">
                <p class="min-w-[150px] grey-14">{{ $t('client.tickets.burial.place') }}</p>
                <p class="black-16">{{ getAllGraves(request) }}</p>
              </div>
            </div>
          </div>
          <div
            class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px] max-sm:mt-3 max-sm:pb-3"
          >
            <div class="font-medium flex flex-col gap-[10px]">
              <div class="flex text-base">
                <p class="min-w-[150px] max-w-[150px] grey-14">
                  {{ $t('client.tickets.burial.deceasedFullName') }}
                </p>
                <p class="black-16">{{ request.deceased?.full_name }}</p>
              </div>
            </div>
          </div>
          <div
            class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px] max-sm:mt-3 max-sm:pb-3"
          >
            <div class="flex text-base">
              <p class="min-w-[150px] max-w-[150px] grey-14">{{ $t('client.tickets.burial.burialDate') }}</p>
              <p v-if="request.burial_date">
                {{ new Date(request.burial_date).toLocaleDateString("ru-RU") }},
                {{ request.burial_time }}
              </p>
              <p v-else class="text-base text-[#DB1414]">
                {{ $t('client.tickets.burial.needBurialDate') }}
              </p>
            </div>
          </div>
          <div
            class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px] max-sm:mt-3 max-sm:pb-3"
          >
            <div class="font-medium flex flex-col gap-[10px]">
              <div class="flex text-base">
                <p class="min-w-[150px] max-w-[150px] grey-14">{{ $t('client.tickets.burial.status') }}</p>
                <div class="flex items-center gap-[10px]">
                  <img :src="getStatusConfig(request.status).icon" alt="" />
                  <p class="text-sm" :class="getStatusConfig(request.status).color">
                    {{ getStatusConfig(request.status).text }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-between items-start mt-[16px] max-sm:mt-3">
            <div class="flex text-base">
              <p class="min-w-[150px] max-w-[150px] grey-14">
                {{ $t('client.tickets.burial.additionalServices') }}
              </p>
              <div v-if="request.products && request.products.length > 0">
                <p v-for="product in request.products" :key="product.id" class="p-[4px] block rounded-md black-16 mr-4">{{ product.items[0]?.name }}</p>
              </div>
              <p v-else class="p-[4px] block rounded-md black-16 mr-4">{{ $t('client.tickets.burial.noAdditionalServices') }}</p>
            </div>
          </div>
          <NuxtLink
            class="block w-fit py-[15px] px-5 rounded-lg bg-[#E9B949] text-black text-sm font-medium mt-[16px] max-sm:w-full text-center hover:bg-[#D1A53F] active:bg-[#B88F34] transition"
            :to="`/client/tickets/active/${request.id}`"
          >
            {{ $t('client.tickets.burial.completeRegistration') }}
          </NuxtLink>
        </template>
        <template v-else>
          <div
            class="flex justify-between items-start pb-4 border-b-2 border-b-[#eee] max-lg:flex-col max-sm:border-none max-sm:pb-0"
          >
            <h3
              class="flex flex-wrap font-foglihten text-fluid font-medium text-[#201001]"
            >
              <span class="mr-2">{{ $t('client.tickets.burial.burialRequest') }}</span>
              <span class="text-[#B88F34]">{{ request.request_number }}</span>
            </h3>
            <p class="text-sm text-[#999]">
              {{
                new Date(request.created_at).toLocaleString("ru-RU", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }}
            </p>
          </div>
          <div
            class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[8px] max-sm:mt-3 max-sm:pb-3 max-lg:flex-col"
          >
            <div
              class="min-w-[580px] font-medium flex flex-col gap-[8px] max-sm:gap-0"
            >
              <div class="flex text-base h-[38px] items-center max-sm:h-[26px]">
                <p class="min-w-[150px] grey-14">{{ $t('client.tickets.burial.cemetery') }}</p>
                <p class="black-16">{{ request.cemetery_name }}</p>
              </div>
              <div class="flex text-base h-[38px] items-center max-sm:h-[26px]">
                <p class="min-w-[150px] grey-14">{{ $t('client.tickets.burial.sector') }}</p>
                <p class="black-16">{{ request.sector_number }}</p>
              </div>
              <div class="flex text-base">
                <p class="min-w-[150px] grey-14">{{ $t('client.tickets.burial.row') }}</p>
                <p class="black-16">{{ request.row_number }}</p>
              </div>
              <div class="flex text-base h-[38px] items-center max-sm:h-[26px]">
                <p class="min-w-[150px] grey-14">{{ $t('client.tickets.burial.place') }}</p>
                <p class="black-16">{{ getAllGraves(request) }}</p>
              </div>
            </div>
            <!-- <button
              class="rounded-md w-[140px] h-[30px] text-sm text-[#224C4F] font-semibold bg-[#EEEEEE]"
              @click="showGraveDataModal(request.grave_id)"
            >
              Данные участка
            </button> -->
          </div>
          <div
            class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px] max-sm:mt-3 max-sm:pb-3"
          >
            <div class="font-medium flex flex-col gap-[10px]">
              <div class="flex text-base">
                <p class="min-w-[150px] max-w-[150px] grey-14">
                  {{ $t('client.tickets.burial.deceasedFullName') }}
                </p>
                <p class="black-16">{{ request.deceased?.full_name }}</p>
              </div>
            </div>
          </div>
          <div
            class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px] max-sm:mt-3 max-sm:pb-3"
          >
            <div class="flex text-base">
              <p class="min-w-[150px] max-w-[150px] grey-14">{{ $t('client.tickets.burial.burialDate') }}</p>
              <p v-if="request.burial_date">
                {{ new Date(request.burial_date).toLocaleDateString("ru-RU") }},
                {{ request.burial_time }}
              </p>
              <p v-else class="text-[#DB1414]">
                {{ $t('client.tickets.burial.needBurialDate') }}
              </p>
            </div>
          </div>
          <div
            class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]"
          >
            <div class="font-medium flex flex-col gap-[10px]">
              <div class="flex text-base">
                <p class="min-w-[150px] max-w-[150px] grey-14">{{ $t('client.tickets.burial.status') }}</p>
                <div class="flex items-center gap-[10px]">
                  <img :src="getStatusConfig(request.status).icon" alt="" />
                  <p class="p-[4px] rounded-md text-sm mr-4" :class="getStatusConfig(request.status).color">
                    {{ getStatusConfig(request.status).text }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div
              class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px] max-sm:mt-3 max-sm:pb-3"
          >
            <div class="flex text-base">
              <p class="min-w-[150px] max-w-[150px] grey-14">{{ $t('client.tickets.burial.completed') }}</p>
              <p class="font-bold">
                {{ request.is_complete ? $t('client.tickets.burial.yes') : $t('client.tickets.burial.no') }}
              </p>
            </div>
          </div>

          <div class="flex justify-between items-start mt-[16px] max-sm:mt-3">
            <div class="flex text-base">
              <p class="min-w-[150px] max-w-[150px] grey-14">
                {{ $t('client.tickets.burial.additionalServices') }}
              </p>
              <div v-if="request.products && request.products.length > 0">
                <p v-for="product in request.products" :key="product.id" class="p-[4px] block rounded-md black-16 mr-4">{{ product.items[0]?.product.name }}</p>
              </div>
              <p v-else class="p-[4px] block rounded-md black-16 mr-4">{{ $t('client.tickets.burial.noAdditionalServices') }}</p>
            </div>
          </div>
          <div class="flex gap-4 mt-[16px] max-lg:flex-col">
            <template v-if="request.status !== 'cancelled'">
              <button
                  v-if="!request.deceased.has_memorial"
                  class="block py-[15px] px-[20px] rounded-lg bg-[#E9B949] text-black text-sm font-medium hover:bg-[#D1A53F] active:bg-[#B88F34] transition"
                  @click="$router.push(`/client/memorial/create?id=${request.id}`)"
              >
                {{ $t('client.tickets.burial.createMemorial') }}
              </button>
              <button
                  v-if="!request.is_complete && request.status !== 'confirmed'"
                  class="block py-[15px] px-[20px] rounded-lg bg-[#AFB5C133] text-[#17212A] text-sm font-medium hover:bg-[#AFB5C166] active:bg-[#AFB5C199] transition"
                  @click="
                $router.push(
                  `/client/tickets/burial/add-service?burial_id=${request.id}`
                )
              "
              >
                {{ $t('client.tickets.burial.addServicesAndProducts') }}
              </button>
            </template>
            <button
              class="py-[15px] px-[20px] rounded-lg text-[#17212A] bg-white text-sm font-medium flex items-center justify-center gap-[8px] hover:bg-[#F1F1F2] active:bg-[#C6C9CC] transition"
              @click="shareGraveData(request.grave_id)"
            >
              <img src="/icons/share.svg" alt="" /> {{ $t('client.tickets.burial.shareCoordinates') }}
            </button>
          </div>
        </template>
      </div>
    </template>
    <Teleport to="body">
      <ShareCoordModal
          :visible="shareCoordModalState"
          :lat="Number.isFinite(Number(graveLat)) ? Number(graveLat) : null"
          :lng="Number.isFinite(Number(graveLng)) ? Number(graveLng) : null"
          @close="shareCoordModalState = false"
      />
      <GraveDataModal
          :visible="graveDataModalState"
          :grave="graveData"
          :cemeteryData="cemeteryData"
          @close="graveDataModalState = false"
      />
    </Teleport>

  </NuxtLayout>
</template>

<style lang="scss" scoped>
.status {
  padding: 4px;
  border-radius: 4px;

  font-family: Roboto;
  font-weight: 600;
  font-size: 14px;
  line-height: 100%;
  letter-spacing: 4.5%;
  color: #fff;

  &-danger {
    background: #dc6e29;
  }
  &-cancel {
    background: #d63c3c;
  }
  &-close {
    background: #339b38;
  }
}

.rip-table {
  &__header,
  &__content {
    display: grid;
    grid-template-columns: 202px 249px 127px 127px;
    gap: 16px;
  }

  &__header {
    font-family: Roboto;
    font-weight: 400;
    font-size: 14px;
    line-height: 100%;
    color: #565656;
    padding-top: 12px;
    padding-bottom: 12px;
  }
  &__content {
    padding-top: 12px;
    padding-bottom: 12px;

    &-val {
      font-family: Roboto;
      font-weight: 400;
      font-size: 14px;
      line-height: 100%;
    }
  }
}

.text-fluid {
  font-size: clamp(24px, 3vw, 32px);
}

.grey-14 {
  font-size: 14px;
  color: #999;
}

.black-16 {
  font-size: 16px;
  color: #050202;
}

/* Стили для дополнительных могил */
.adjacent-graves {
  margin-top: 8px;
}

.grave-info {
  margin-bottom: 12px;
}

.graves-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.grave-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
}

.grave-details {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

/* Адаптив для мобильных устройств */
@media (max-width: 640px) {
  .grave-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
