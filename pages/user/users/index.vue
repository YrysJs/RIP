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
          <div class="col-span-1 flex justify-end">
            <img src="/icons/arrow-right.svg" class="w-4 h-4" />
          </div>
        </div>
      </template>

    </div>
    <Teleport to="body">
      <AkimatSignUp v-if="isCreateModal" @finish="createUser" @close="isCreateModal = false" />
      <SuccessModal
          v-if="showSuccessModal"
          title="Приглашение отправлено!"
          @close="closeSuccessModal"
      />
    </Teleport>
  </NuxtLayout>
</template>

<script setup>
import AkimatSignUp from "~/components/auth/AkimatSignUp.vue";
import SuccessModal from "~/components/layout/modals/SuccessModal.vue";
import { getUsersByRole } from '~/services/login'
import { getAkimats } from '~/services/admin'
import {ref} from "vue";

const isCreateModal = ref(false)
const showSuccessModal = ref(false)

const roles = ref([])


const createUser = () => {
  isCreateModal.value = false
  showSuccessModal.value = true
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
}
onMounted((async () => {
  try {
    const response = await getUsersByRole({
      roleIds: '7,8'
    })
    // getAkimats()
    roles.value = response.data
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
