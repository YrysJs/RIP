<template>
  <div class="w-full bg-white rounded-[16px] py-[20px] px-[12px]">
    <button class="btn btn-back mr-4" @click="router.push('/manager/ennoblement')">
      <img class="w-4 h-4 mr-[10px]" src="/icons/arrow-left-primary.svg" alt="">
      Назад
    </button>

    <div class="flex justify-between items-center border-b-2 border-[#EEEEEE] pb-[16px] mt-[16px]">
      <h3 class="text-lg font-medium">Запрос № {{ request.id }}</h3>
      <p class="text-sm">Дата и время заявки: {{ request.createdAt }}</p>
    </div>

    <div class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
      <div class="min-w-[580px] font-medium flex flex-col gap-[10px]">
        <div class="flex text-base"><p class="min-w-[150px]">Кладбище:</p><p class="font-bold">{{ request.cemetery }}</p></div>
        <div class="flex text-base"><p class="min-w-[150px]">Сектор</p><p class="font-bold">{{ request.sector }}</p></div>
        <div class="flex text-base"><p class="min-w-[150px]">Место:</p><p class="font-bold">{{ request.place }}</p></div>
        <div class="flex text-base"><p class="min-w-[150px]">ФИО покойного:</p><p class="font-bold">{{ request.deceased }}</p></div>
      </div>
      <button class="rounded-md w-[140px] h-[30px] text-sm text-[#224C4F] font-semibold bg-[#EEEEEE]">Данные участка</button>
    </div>

    <div class="flex justify-between items-start mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
      <div class="min-w-[580px] font-medium flex flex-col gap-[10px]">
        <div class="flex text-base"><p class="min-w-[150px]">Заказчик:</p><p class="font-bold">{{ request.client }}</p></div>
        <div class="flex text-base"><p class="min-w-[150px]">Контакты:</p><p class="font-bold">{{ request.phone }}</p></div>
      </div>
    </div>

    <div class="mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
      <p class="font-medium text-base mb-[10px]">Услуги:</p>
      <ul class="flex flex-col gap-[8px]">
        <li
            v-for="(service, index) in localServices"
            :key="index"
            class="flex items-center gap-[8px] cursor-pointer"
            @click="toggleService(index)"
        >
          <input
              type="checkbox"
              class="checkbox"
              :checked="service.checked"
              @change.stop="toggleService(index)"
          />
          <span class="text-base font-medium select-none">
        {{ service.label }}
      </span>
        </li>
      </ul>
    </div>

    <div class="mt-[16px] border-b-2 border-[#EEEEEE] pb-[16px]">
      <p class="font-medium text-base mb-[4px]">Комментарий</p>
      <p class="text-base">{{ request.comment }}</p>
    </div>

    <div class="flex justify-between items-start mt-[16px]">
      <div class="flex flex-col gap-[8px]">
        <div class="flex text-base">
          <p class="min-w-[150px] font-medium">Статус:</p>
          <p class="p-[4px] rounded-md bg-[#DC6E29] text-sm font-bold text-white ml-[8px]">
            {{ request.status }}
          </p>
        </div>
        <div class="flex items-center gap-[8px] text-base font-medium text-[#1F2937]">
          <img src="/icons/receipt.svg" class="w-[18px] h-[18px]" />
          Чек об оплате
        </div>
      </div>

      <button class="w-[225px] h-[51px] rounded-md bg-[#38949B] text-white text-base font-semibold">
        Подтвердить исполнение
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['request']);
const router = useRouter();

// создаём локальное копируемое состояние, чтобы не мутировать напрямую пропсы
const localServices = ref(
    props.request.services.map((s) => ({ ...s }))
);

const toggleService = (index) => {
  localServices.value[index].checked = !localServices.value[index].checked;
};
</script>

<style scoped>
.btn-back {
  height: 40px;
  padding: 12px 16px;
  font-size: 14px;
  color: #224C4F;
  background: #EEEEEE;
}
</style>
