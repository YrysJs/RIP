<script setup>
import { ref, onMounted } from "vue";
import { getBurialRequests } from "~/services/client";
import ShareCoordModal from "~/components/layout/modals/ShareCoordModal.vue";
import GraveDataModal from "~/components/layout/modals/GraveDetailModal.vue";
import { getGraveById } from "~/services/client";
import { getCemeteryById } from "~/services/cemetery";
import { useUserStore } from "~/store/user";

const userStore = useUserStore();

const burialRequests = ref([]);
const loading = ref(true);
const shareCoordModalState = ref(false);
const graveDataModalState = ref(false);
const graveData = ref(null);
const cemeteryData = ref(null);

const fetchGraveData = async (id) => {
  const response = await getGraveById(id);
  graveData.value = response.data.data;
};

const fetchCemeteryData = async (id) => {
  const response = await getCemeteryById(id);
  cemeteryData.value = response.data.data;
};

// onMounted(async () => {
//   try {
//     const response = await getBurialRequests({
//       status: "paid",
//       user_phone: userStore.user?.phone,
//     });
//     burialRequests.value = response.data.data.data;
//   } catch (error) {
//     console.error("Ошибка при получении заявок:", error);
//   } finally {
//     loading.value = false;
//   }
// });

onMounted(async () => {
  try {
    // Фейковые данные вместо API
    burialRequests.value = [
      {
        id: 1,
        request_number: "BR-001",
        created_at: "2025-09-10T12:30:00Z",
        reservation_expires_at: "2025-09-20T12:30:00Z",
        cemetery_name: "Кладбище №1",
        sector_number: "Сектор 12",
        grave_id: "Место 45",
        deceased: { full_name: "Иванов Иван Иванович" },
        burial_date: "2025-09-15",
        burial_time: "14:00",
        status: "canceled",
      },
      {
        id: 2,
        request_number: "BR-002",
        created_at: "2025-09-12T09:15:00Z",
        reservation_expires_at: "2025-09-22T09:15:00Z",
        cemetery_name: "Кладбище №3",
        sector_number: "Сектор 5",
        grave_id: "Место 101",
        deceased: { full_name: "Петров Петр Петрович" },
        burial_date: null,
        burial_time: null,
        status: "paid",
      },
    ];
  } catch (error) {
    console.error("Ошибка при подстановке тестовых данных:", error);
    burialRequests.value = [];
  } finally {
    loading.value = false;
  }
});

const graveLat = ref(null);
const graveLng = ref(null);

const shareGraveData = async (grave_id) => {
  await fetchGraveData(grave_id);
  shareCoordModalState.value = true;

  graveLat.value = graveData.value.polygon_data.coordinates[0][1];
  graveLng.value = graveData.value.polygon_data.coordinates[0][0];
};

const showGraveDataModal = async (id) => {
  await fetchGraveData(id);
  graveDataModalState.value = true;
};
</script>

<template>
  <NuxtLayout name="client" content-class="bg-transparent max-sm:bg-white">
    <div
      v-if="!burialRequests || burialRequests?.length === 0"
      class="flex justify-center items-center p-10"
    >
      <p class="text-xl">Нет оплаченных заявок на захоронение</p>
    </div>
    <template v-else>
      <div
        v-for="request in burialRequests"
        :key="request.id"
        class="bg-white py-6 px-[18px] rounded-lg max-sm:p-0"
      >
        <div
          class="flex justify-between items-start pb-4 border-b-2 border-b-[#eee] max-lg:flex-col max-sm:border-none max-sm:pb-0"
        >
          <h3
            class="font-foglihten text-fluid font-medium text-[#201001] leading-[48px]"
          >
            Заявка на захоронение:
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
              <p class="min-w-[150px] grey-14">Кладбище:</p>
              <p class="black-16">{{ request.cemetery_name }}</p>
            </div>
            <div class="flex text-base h-[38px] items-center max-sm:h-[26px]">
              <p class="min-w-[150px] grey-14">Сектор</p>
              <p class="black-16">{{ request.sector_number }}</p>
            </div>
            <div class="flex text-base h-[38px] items-center max-sm:h-[26px]">
              <p class="min-w-[150px] grey-14">Место:</p>
              <p class="black-16">{{ request.grave_id }}</p>
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
              <p class="min-w-[150px] max-w-[150px] grey-14">ФИО покойного:</p>
              <p class="black-16">{{ request.deceased?.full_name }}</p>
            </div>
          </div>
        </div>
        <div
          class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px] max-sm:mt-3 max-sm:pb-3"
        >
          <div class="flex text-base">
            <p class="min-w-[150px] max-w-[150px] grey-14">Дата похорон:</p>
            <p v-if="request.burial_date">
              {{ new Date(request.burial_date).toLocaleDateString("ru-RU") }},
              {{ request.burial_time }}
            </p>
            <p v-else class="text-[#DB1414]">Необходимо указать даты похорон</p>
          </div>
        </div>
        <div
          class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]"
        >
          <div class="font-medium flex flex-col gap-[10px]">
            <div class="flex text-base">
              <p class="min-w-[150px] max-w-[150px] grey-14">Cтатус:</p>
              <div
                v-if="request.status === 'paid'"
                class="flex items-center gap-[10px]"
              >
                <img src="/icons/paid-tick.svg" alt="" />
                <p class="p-[4px] rounded-md text-sm text-[#17212A] mr-4">
                  Оплачено
                </p>
              </div>
              <div
                v-if="request.status === 'canceled'"
                class="flex items-center gap-[10px]"
              >
                <img src="/icons/warning.svg" alt="" />
                <p class="p-[4px] rounded-md text-sm text-[#17212A] mr-4">
                  Отменено
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-between items-start mt-[16px] max-sm:mt-3">
          <div class="flex text-base">
            <p class="min-w-[150px] max-w-[150px] grey-14">
              Дополнительные услуги:
            </p>
            <p class="p-[4px] rounded-md black-16 mr-4">Отсутствуют</p>
          </div>
        </div>
        <div class="flex gap-4 mt-[16px] max-lg:flex-col">
          <button
            class="block py-[15px] px-[20px] rounded-lg bg-[#E9B949] text-black text-sm font-medium hover:bg-[#D1A53F] active:bg-[#B88F34] transition"
            @click="$router.push(`/client/memorial/create?id=${request.id}`)"
          >
            Создать мемориал
          </button>
          <button
            class="block py-[15px] px-[20px] rounded-lg bg-[#AFB5C133] text-[#17212A] text-sm font-medium hover:bg-[#AFB5C166] active:bg-[#AFB5C199] transition"
            @click="
              $router.push(
                `/client/tickets/burial/add-service?burial_id=${request.id}`
              )
            "
          >
            Добавить услуги и товары
          </button>
          <button
            class="py-[15px] px-[20px] rounded-lg text-[#17212A] bg-white text-sm font-medium flex items-center justify-center gap-[8px] hover:bg-[#F1F1F2] active:bg-[#C6C9CC] transition"
            @click="shareGraveData(request.grave_id)"
          >
            <img src="/icons/share.svg" alt="" /> Поделиться координатами
          </button>
        </div>
      </div>
    </template>
  </NuxtLayout>
  <ShareCoordModal
    :visible="shareCoordModalState"
    :lat="graveLat"
    :lng="graveLng"
    @close="shareCoordModalState = false"
  />
  <GraveDataModal
    :visible="graveDataModalState"
    :grave="graveData"
    :cemeteryData="cemeteryData"
    @close="graveDataModalState = false"
  />
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
</style>
