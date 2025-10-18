<template>
  <NuxtLayout name="admin">
    <div class="w-full bg-white rounded-[16px] p-[20px] mt-[20px]">
      <div class="flex justify-between items-center mb-[16px]">
        <h2 class="text-2xl font-semibold">Поставщики</h2>
<!--        <button class="invite-btn" @click="isCreateModal = true">-->
<!--          <img src="/icons/plus.svg" alt="Пригласить" class="w-4 h-4 mr-2" />-->
<!--          Пригласить-->
<!--        </button>-->
      </div>

      <div class="grid grid-cols-12 text-sm font-semibold text-[#6B7280] py-[10px] border-b border-[#EEEEEE]">
        <div class="col-span-6">Фио пользователя</div>
        <div class="col-span-3">БИН</div>
        <div class="col-span-3">Статус</div>
      </div>
        <div
            v-for="user in suppliers"
            :key="user.id"
            class="grid grid-cols-12 items-center text-sm py-[14px] border-b border-[#EEEEEE] hover:bg-[#F9FAFB] transition"
        >
          <div class="col-span-6">{{ user.surname }} {{ user.name }} {{ user.patronymic }}</div>
          <div class="col-span-3">{{ user.bin }}</div>

          <div class="col-span-2">
        <span
            class="status"
            :class="{
            'status--active': user.isActive,
            'status--pending cursor-pointer': !user.isActive,
          }"
            @click="showConfirmModal(user)"
        >
          {{ user.isActive ? 'Активен' : 'Не активен' }}

        </span>
          </div>
          <div class="col-span-1 flex justify-end">
            <img src="/icons/arrow-right.svg" class="w-4 h-4" />
          </div>
        </div>

    </div>
    <Teleport to="body">
      <SuccessModal
          v-if="showSuccessModal"
          title="Приглашение отправлено!"
          :show-button="true"
          @close="closeSuccessModal"
      />
      <ConfirmModal
          v-if="isConfirmModal"
          title="Активировать постащика?"
          @close="closeConfirmModal"
          @confirm="activate"
      />
    </Teleport>
  </NuxtLayout>
</template>

<script setup>
import SuccessModal from "~/components/layout/modals/SuccessModal.vue";
import { getSuppliers, activateSupplier } from '~/services/login'
import {ref} from "vue";
import ConfirmModal from "~/components/layout/modals/ConfirmModal.vue";



definePageMeta({
  middleware: ['auth', 'admin'],
});

const showSuccessModal = ref(false)
const isConfirmModal = ref(false)
const selectedUser = ref({})

const suppliers = ref([])


const showConfirmModal = (user) => {
  if (!user.isActive) {
    selectedUser.value = user
    isConfirmModal.value = true
  }
}

const activate = async () => {

    try {await activateSupplier({
      supplierId: selectedUser.value.id
    })
    } catch (error) {
      console.error('Ошибка при получении пользователей:', error)
    } finally {
      console.log('finally')
      isConfirmModal.value = false;
      const response = await getSuppliers()
      suppliers.value = response.data
    }


}

const closeConfirmModal = () => {
  isConfirmModal.value = false
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
}
onMounted((async () => {
  try {
    const response = await getSuppliers()
    suppliers.value = response.data
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
