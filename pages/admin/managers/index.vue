<template>
  <NuxtLayout name="admin">
    <div class="w-full bg-white rounded-[16px] p-[20px] mt-[20px]">
      <div class="flex justify-between items-center mb-[16px]">
        <h2 class="text-2xl font-semibold">Менеджеры</h2>
        <button class="invite-btn" @click="isCreateModal = true">
          <img src="/icons/plus.svg" alt="Пригласить" class="w-4 h-4 mr-2" />
          Пригласить
        </button>
      </div>

      <div class="grid grid-cols-12 text-sm font-semibold text-[#6B7280] py-[10px] border-b border-[#EEEEEE]">
        <div class="col-span-6">Фио пользователя</div>
        <div class="col-span-3">Телефон</div>
        <div class="col-span-3">Кладбище</div>
      </div>
        <div
            v-for="user in roles"
            :key="user.id"
            class="grid grid-cols-12 items-center text-sm py-[14px] border-b border-[#EEEEEE] hover:bg-[#F9FAFB] transition"
        >
          <div class="col-span-6">{{ user.surname }} {{ user.name }} {{ user.patronymic }}</div>
          <div class="col-span-3">{{ formatPhoneNumber(user.cemetery_manager_phone) }}</div>
          <div class="col-span-3">
            <template v-if="user.cemetery_id">
              {{getNameById(user.cemetery_id)}}
            </template>
            <button v-else class="invite-btn" @click="openSetCemeteryModal(user.cemetery_manager_phone)">
              Назначить
            </button>
          </div>
        </div>

    </div>
    <Teleport to="body">
      <ManagerSignUp v-if="isCreateModal" @finish="createUser" @close="isCreateModal = false" />
      <SetCemeteryModal v-if="isSetCemeteryModal" :cemeteries="cemeteries" @finish="setCemetery" @close="isSetCemeteryModal = false" />
      <SuccessModal
          v-if="showSuccessModal"
          :title="successText"
          @close="closeSuccessModal"
      />
    </Teleport>
  </NuxtLayout>
</template>

<script setup>
import ManagerSignUp from "~/components/auth/ManagerSignUp.vue";
import SuccessModal from "~/components/layout/modals/SuccessModal.vue";
import SetCemeteryModal from "~/components/admin/managers/SetCemeteryModal.vue";
import { getManagers, setCemeteryManager } from '~/services/admin'
import {ref} from "vue";
import {getCemeteries} from "~/services/cemetery/index.js";

definePageMeta({
  middleware: ['auth', 'admin'],
});

const isCreateModal = ref(false)
const isSetCemeteryModal = ref(false)
const showSuccessModal = ref(false)
const selectedManagerPhone = ref('')
const successText = ref('')

const roles = ref([])
const cemeteries = ref([])

function formatPhoneNumber(phone) {
  if (!/^\d{11}$/.test(phone)) return 'Неверный формат номера';

  return `+${phone[0]} (${phone.slice(1, 4)}) ${phone.slice(4, 7)} ${phone.slice(7, 9)} ${phone.slice(9, 11)}`;
}

function getNameById(id) {
  const item = cemeteries.value.find(obj => obj.id === id);
  return item ? item.name : null;
}

const setCemetery = async (id) => {
  try {
    await setCemeteryManager({
      id,
      cemetery_manager_phone: selectedManagerPhone.value
    })
    successText.value = 'Менеджер назначен!'
    isSetCemeteryModal.value = false
    showSuccessModal.value = true
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error)
  } finally {
  }
}

const openSetCemeteryModal = (phone) => {
  selectedManagerPhone.value = phone
  isSetCemeteryModal.value = true
}

const createUser = () => {
  isCreateModal.value = false
  successText.value = 'Приглашение отправлено!'
  showSuccessModal.value = true
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
}
onMounted((async () => {
  try {
    const response = await getManagers()
    roles.value = response.data.data
    const res = await getCemeteries()
    cemeteries.value = res.data.data
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
