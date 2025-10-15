<template>
  <NuxtLayout name="admin">
    <div class="w-full bg-white rounded-[16px] p-[20px] mt-[20px]">
      <div class="flex justify-between items-center mb-[16px]">
        <h2 class="text-2xl font-semibold">Поиск захоронении</h2>
        <!--        <button class="invite-btn" @click="isCreateModal = true">-->
        <!--          <img src="/icons/plus.svg" alt="Пригласить" class="w-4 h-4 mr-2" />-->
        <!--          Пригласить-->
        <!--        </button>-->
      </div>

      <div class="grid grid-cols-4 text-sm font-semibold text-[#6B7280] py-[10px] border-b border-[#EEEEEE]">
        <div>Заявитель</div>
        <div>Телефон</div>
        <div>Покойный</div>
      </div>
      <div
          v-for="user in burials"
          :key="user.id"
          class="grid grid-cols-4 items-center text-sm py-[14px] border-b border-[#EEEEEE] hover:bg-[#F9FAFB] transition cursor-pointer"
          @click="showDetailModal(user)"
      >

        <div>{{ user.applicant_name }}</div>
        <div>{{ formatPhoneNumber(user.applicant_phone) }}</div>
        <div>{{ user.deceased_surname }} {{ user.deceased_name }} {{ user.deceased_patronym }}</div>
        <div class="col-span-1 flex justify-end">
          <img src="/icons/arrow-right.svg" class="w-4 h-4" />
        </div>
      </div>

    </div>
    <Teleport to="body">
      <SuccessModal
          v-if="showSuccessModal"
          title="Обращение обработано!"
          @close="closeSuccessModal"
      />
      <BurialDetailModal
          :visible="isDetailModal"
          :burial="selectedBurial"
          @close="isDetailModal = false"
      />
    </Teleport>
  </NuxtLayout>
</template>

<script setup>
import SuccessModal from "~/components/layout/modals/SuccessModal.vue";
import BurialDetailModal from "~/components/admin/burial/BurialDetailModal.vue";

import { getSearchRequests } from '~/services/admin'
import {ref} from "vue";



definePageMeta({
  middleware: ['auth', 'admin'],
});

const showSuccessModal = ref(false)
const isDetailModal = ref(false)
const burials = ref([])
const selectedBurial = ref({})



const showDetailModal = (burial) => {
  isDetailModal.value = true
  selectedBurial.value = burial
}

function formatPhoneNumber(phone) {
  if (!/^\d{11}$/.test(phone)) return 'Неверный формат номера';

  return `+${phone[0]} (${phone.slice(1, 4)}) ${phone.slice(4, 7)} ${phone.slice(7, 9)} ${phone.slice(9, 11)}`;
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
}
onMounted((async () => {

  try {
    const response = await  getSearchRequests();
    burials.value = response.data?.data
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error)
  } finally {
    console.log('finally')
  }
}))

</script>

<style scoped>
.invite-btn {
  background: #224C4F;
  color: white;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
}

.status {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
  text-align: center;
}

.status--active {
  background: #3CBF4A;
  color: white;
}

.status--pending {
  background: #F7901E;
  color: white;
}

.status--blocked {
  background: #E53935;
  color: white;
}
</style>
