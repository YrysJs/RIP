<script setup>
import { onMounted } from "vue";
import { useI18n } from 'vue-i18n';
// import { getBurialRequests } from "~/services/client";
// import { useUserStore } from "~/store/user";

const { t } = useI18n();
// const userStore = useUserStore();

const burialRequests = ref([]);
const loading = ref(true);

const localePath = useLocalePath();

// onMounted(async () => {
//   try {
//     const response = await getBurialRequests({
//       status: "pending",
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
        status: "pending",
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
    console.error(t('errors.fetchError'), error);
    const { $toast } = useNuxtApp();
    $toast.error(t('common.serverUnavailable'));
    burialRequests.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <NuxtLayout name="client" content-class="bg-transparent max-sm:bg-white">
    <template v-if="burialRequests && burialRequests.length > 0">
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
            {{ $t('client.tickets.active.reservation') }}
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
            <p class="min-w-[150px] black-16">{{ $t('client.tickets.active.reservationPeriod') }}</p>
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
              <p class="min-w-[150px] grey-14">{{ $t('client.tickets.active.cemetery') }}</p>
              <p class="black-16">{{ request.cemetery_name }}</p>
            </div>
            <div class="flex text-base">
              <p class="min-w-[150px] grey-14">{{ $t('client.tickets.active.sector') }}</p>
              <p class="black-16">{{ request.sector_number }}</p>
            </div>
            <div class="flex text-base">
              <p class="min-w-[150px] grey-14">{{ $t('client.tickets.active.place') }}</p>
              <p class="black-16">{{ request.grave_id }}</p>
            </div>
          </div>
        </div>
        <div
          class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px] max-sm:mt-3 max-sm:pb-3"
        >
          <div class="font-medium flex flex-col gap-[10px]">
            <div class="flex text-base">
              <p class="min-w-[150px] max-w-[150px] grey-14">{{ $t('client.tickets.active.deceasedFullName') }}</p>
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
            <p v-else class="text-base text-[#DB1414]">
              Необходимо указать даты похорон
            </p>
          </div>
        </div>
        <div
          class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px] max-sm:mt-3 max-sm:pb-3"
        >
          <div class="font-medium flex flex-col gap-[10px]">
            <div class="flex text-base">
              <p class="min-w-[150px] max-w-[150px] grey-14">Cтатус:</p>
              <div
                class="flex items-center gap-[10px]"
                v-if="request.status === 'pending'"
              >
                <img src="/icons/warning.svg" alt="" />
                <p class="text-sm text-[#17212A]">Ожидает оплаты</p>
              </div>
              <div
                class="flex items-center gap-[10px]"
                v-if="request.status === 'paid'"
              >
                <img src="/icons/paid-tick.svg" alt="" />
                <p class="text-sm text-[#17212A]">Оплачено</p>
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
        <NuxtLink
          class="block w-fit py-[15px] px-5 rounded-lg bg-[#E9B949] text-black text-sm font-medium mt-[16px] max-sm:w-full text-center hover:bg-[#D1A53F] active:bg-[#B88F34] transition"
          :to="
            localePath({
              name: 'client-tickets-active-id',
              params: { id: request.id },
            })
          "
        >
          Завершить оформление
        </NuxtLink>
      </div>
    </template>
    <div
      v-else
      class="w-full bg-white rounded-[16px] py-[20px] px-[12px] text-center"
    >
      <p class="text-lg">Нет активных заявок</p>
    </div>
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
</style>
