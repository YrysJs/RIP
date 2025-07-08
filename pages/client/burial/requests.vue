<script setup>
import { ref } from 'vue'
import { getRequests } from '~/services/akimat'

const router = useRouter()
const appeals = ref([])

async function getUserAppeals() {
  const response = await getRequests()
  appeals.value = response.data
}

function formatPhoneNumber(phone) {
  if (!/^\d{11}$/.test(phone)) return 'Неверный формат номера';

  return `+${phone[0]} (${phone.slice(1, 4)}) ${phone.slice(4, 7)} ${phone.slice(7, 9)} ${phone.slice(9, 11)}`;
}


onMounted(async () => {
  await getUserAppeals()
})

</script>

<template>
  <NuxtLayout name="client">
    <div class="w-full p-5 flex items-center bg-white rounded-[16px] text-lg font-semibold flex justify-between items-center">
      <h1>Заявки на перезахоронение</h1> <button @click="router.push('/client/burial/create')" class="bg-[#38949B] text-white px-[16px] py-[8px] rounded-[8px]">Создать заявку</button>
    </div>
    <div class="flex flex-col gap-[16px] mt-[20px]">
      <div
          v-for="request in appeals"
          :key="request.id"
          class="flex justify-between items-center rounded-[12px] bg-white p-[16px] border border-[#EEEEEE] shadow-sm hover:bg-[#F9FAFB]"
      >
        <div>
          <h3 class="text-base font-semibold mb-1">Заявка № {{ request.id }}</h3>
          <p class="text-sm">Заявитель: {{ request.user ? request.user.surname + ' ' + request.user.name + ' ' +  request.user.patronymic : formatPhoneNumber(request.userPhone) }}</p>
          <p class="text-sm">Причина: {{ request.reason }}</p>
<!--          <p class="text-sm text-[#6B7280]">-->
<!--            Ответственный исполнитель:-->
<!--            <span v-if="request.responsibleUser?.id" class="font-semibold">{{ request.responsibleUser.surname }} {{ request.responsibleUser.name }} {{ request.responsibleUser.patronymic }}</span>-->
<!--            <span v-else class="text-[#9CA3AF] cursor-pointer" @click="openSetResponsibleModal(request.id)">не назначен</span>-->
<!--          </p>-->


        </div>

        <div class="flex flex-col items-end">
          <!--              <span class="text-sm text-[#6B7280] mb-[8px]">Дата заявки: {{ request.date }}</span>-->
<!--          <button class="details-btn" @click="router.push('/user/tickets/' + request.id)">Подробнее</button>-->
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
</style>