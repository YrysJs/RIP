<template>
    <NuxtLayout name="admin">
      <div class="w-full bg-white rounded-[16px] p-[20px] mt-[20px]">
        <div class="flex justify-between items-center mb-[16px]">
          <h2 class="text-2xl font-semibold">Обращения</h2>
          <!--        <button class="invite-btn" @click="isCreateModal = true">-->
          <!--          <img src="/icons/plus.svg" alt="Пригласить" class="w-4 h-4 mr-2" />-->
          <!--          Пригласить-->
          <!--        </button>-->
        </div>
  
        <div class="grid grid-cols-5 text-sm font-semibold text-[#6B7280] py-[10px] border-b border-[#EEEEEE]">
          <div>Поставщик</div>
          <div>ID Обращения</div>
          <div>Статус</div>
          <div>Ответ администратора</div>
          <div></div>
        </div>
        <div
            v-for="user in suppliers"
            :key="user.id"
            class="grid grid-cols-5 items-center text-sm py-[14px] border-b border-[#EEEEEE] hover:bg-[#F9FAFB] transition cursor-pointer"
            @click="showModerateModal(user)"
        >
          <div>{{ formatPhoneNumber(user.supplier_phone) }}</div>
          <div>{{ user.id }}</div>
          <div>
            <span :class="getStatusClass(user.status)" class="status">
              {{ getStatusText(user.status) }}
            </span>
          </div>
          <div class="truncate max-w-[200px]" :title="user.admin_response || 'Нет ответа'">
            {{ user.admin_response || 'Нет ответа' }}
          </div>
          <div class="flex justify-end">
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
        <ModerateAppealModal
          :visible="isModerateModal"
          :appeal="selectedComment"
          @finish="moderate"
          @close="isModerateModal = false"
        />
      </Teleport>
    </NuxtLayout>
  </template>
  
  <script setup>
  import SuccessModal from "~/components/layout/modals/SuccessModal.vue";
import ModerateAppealModal from "~/components/admin/comments/ModerateAppealModal.vue";

import { getModerateAppeals, moderateAppeal } from '~/services/admin'
  import {ref} from "vue";
  
  
  
  definePageMeta({
    middleware: ['auth', 'admin'],
  });
  
  const showSuccessModal = ref(false)
  const isModerateModal = ref(false)
  const suppliers = ref([])
  const selectedComment = ref({})
  
  
  
  const moderate = async (data) => {
  try {
    await moderateAppeal({
      id: selectedComment.value.id,
      data: {
        admin_response: data.admin_response,
        status: data.status
      }
    })
    
    // Обновляем список после модерации
    const response = await getModerateAppeals()
    suppliers.value = response.data?.items
    
    isModerateModal.value = false
    showSuccessModal.value = true
  } catch (error) {
    console.error('Ошибка при модерации обращения:', error)
  }
}
  
  const showModerateModal = (comment) => {
    isModerateModal.value = true
    selectedComment.value = comment
  }
  
  function formatPhoneNumber(phone) {
    if (!/^\d{11}$/.test(phone)) return 'Неверный формат номера';
  
    return `+${phone[0]} (${phone.slice(1, 4)}) ${phone.slice(4, 7)} ${phone.slice(7, 9)} ${phone.slice(9, 11)}`;
  }

  function getStatusText(status) {
    switch (status) {
      case 'approved':
        return 'Одобрено';
      case 'rejected':
        return 'Отклонено';
      case 'pending':
        return 'В ожидании';
      default:
        return 'Неизвестно';
    }
  }

  function getStatusClass(status) {
    switch (status) {
      case 'approved':
        return 'status--active';
      case 'rejected':
        return 'status--blocked';
      case 'pending':
        return 'status--pending';
      default:
        return 'status--pending';
    }
  }
  
  const closeSuccessModal = () => {
    showSuccessModal.value = false
  }
  onMounted((async () => {
    try {
      const response = await getModerateAppeals()
      suppliers.value = response.data?.items
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
  