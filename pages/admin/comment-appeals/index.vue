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
  
        <div class="grid grid-cols-3 text-sm font-semibold text-[#6B7280] py-[10px] border-b border-[#EEEEEE]">
          <div>Поставщик</div>
          <div>ID Обращения</div>
        </div>
        <div
            v-for="user in suppliers"
            :key="user.id"
            class="grid grid-cols-3 items-center text-sm py-[14px] border-b border-[#EEEEEE] hover:bg-[#F9FAFB] transition cursor-pointer"
            @click="showModerateModal(user)"
        >
          <div>{{ formatPhoneNumber(user.supplier_phone) }}</div>
          <div>{{ user.id }}</div>
  
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
  