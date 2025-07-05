<template>
  <NuxtLayout name="user">
    <div class="w-full bg-white rounded-[16px] p-[20px] mt-[20px]">
      <div class="flex justify-between items-center mb-[16px]">
        <h2 class="text-2xl font-semibold">Пользователи</h2>
        <button class="invite-btn" @click="isCreateModal = true">
          <img src="/icons/plus.svg" alt="Пригласить" class="w-4 h-4 mr-2" />
          Пригласить
        </button>
      </div>

      <div class="grid grid-cols-12 text-sm font-semibold text-[#6B7280] py-[10px] border-b border-[#EEEEEE]">
        <div class="col-span-3">Роль</div>
        <div class="col-span-6">Фио пользователя</div>
        <div class="col-span-3">Статус</div>
      </div>
      <template v-for="role in roles" :key="role.role">
        <div
            v-for="user in role.users"
            :key="user.id"
            class="grid grid-cols-12 items-center text-sm py-[14px] border-b border-[#EEEEEE] hover:bg-[#F9FAFB] transition"
        >
          <div class="col-span-3">{{ role.role === 'AKIMAT_ADMIN' ? 'Админ' : 'Менеджер' }}</div>
          <div class="col-span-6">{{ user.surname }} {{ user.name }} {{ user.patronymic }}</div>
          <div class="col-span-2">
        <span
            class="status"
            :class="{
            'status--active': true,
            'status--pending': user.status === 'pending',
            'status--blocked': user.status === 'blocked'
          }"
        >
<!--          {{ statusText(user.status) }}-->
          Активен
        </span>
          </div>
          <div class="col-span-1 flex justify-end pr-2 relative">
            <img src="/icons/menu.svg" class="w-4 h-4 cursor-pointer" @click="toggleDropdown" />
            <div
                v-if="showDropdownMenu"
                class="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
            >
              <button
                  class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  @click="openUpdateModal(user)"
              >
                Редактировать
              </button>
              <button
                  class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  @click="showConfirmModal"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      </template>

    </div>
    <Teleport to="body">
      <AkimatSignUp v-if="isCreateModal" @finish="createUser" @close="isCreateModal = false" />
      <AkimatUserUpdate v-if="isUpdateModal" :user="selectedUser" @finish="updateUser" @close="isUpdateModal = false" />
      <SuccessModal
          v-if="showSuccessModal"
          :title="successText"
          @close="closeSuccessModal"
      />
      <ConfirmModal
          v-if="isConfirmModal"
          title="Вы уверены что хотите удалить пользователя?"
          @close="closeConfirmModal"
          @confirm="deleteUser"
      />
    </Teleport>
  </NuxtLayout>
</template>

<script setup>
import AkimatSignUp from "~/components/auth/AkimatSignUp.vue";
import AkimatUserUpdate from "~/components/auth/AkimatUserUpdate.vue";
import SuccessModal from "~/components/layout/modals/SuccessModal.vue";
import ConfirmModal from "~/components/layout/modals/ConfirmModal.vue";
import { getUsersByRole, deleteAkimatUser } from '~/services/login'
import {ref} from "vue";

const isCreateModal = ref(false)
const showSuccessModal = ref(false)
const isConfirmModal = ref(false)
const isUpdateModal = ref(false)
const selectedUser = ref({})
const successText = ref('')

const roles = ref([])
const showDropdownMenu = ref(false)

definePageMeta({
  middleware: ['auth', 'akimat'],
});

const createUser = () => {
  isCreateModal.value = false
  successText.value = 'Приглашение отправлено!'
  showSuccessModal.value = true
}

const updateUser = () => {
  isUpdateModal.value = false
  successText.value = 'Данные изменены!'
  showSuccessModal.value = true
  fetchUsers()
}

function toggleDropdown() {
  showDropdownMenu.value = !showDropdownMenu.value
}

const openUpdateModal = (user) => {
  selectedUser.value = user
  toggleDropdown()
  isUpdateModal.value = true
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
}

const showConfirmModal = (user) => {
  selectedUser.value = user
  toggleDropdown()
  isConfirmModal.value = true
}

const closeConfirmModal = () => {
  isConfirmModal.value = false
}
const deleteUser = async () => {
  try {
    await deleteAkimatUser({
      data: {
        akimatId: 1,
        employeeId: selectedUser.value.id,
        phone: selectedUser.value.phone
      },
    })
    isConfirmModal.value = false
    fetchUsers()
  } catch (error) {
    console.error('Ошибка при логине:', error)

  } finally {
    console.log('login')

  }

}

const fetchUsers = async () => {
  try {
    const response = await getUsersByRole({
      roleIds: '7,8'
    })
    roles.value = response.data
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error)
  } finally {
    console.log('finally')
  }
}

onMounted((() => {
  fetchUsers()
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
