<script setup>
import { ref } from 'vue'
import { createAppeal } from '~/services/client'
import {getCurrentUser} from "~/services/login/index.js";

const router = useRouter()
const userInfo = ref(null);


const appeal_types = ref([
    {
        id: 1,
        value: "COMPLAINT",
        nameRu: "Жалоба"
    },
    {
        id: 2,
        value: "OFFER",
        nameRu: "Предложение"
    },
    {
        id: 3,
        value: "REQUEST_FOR_INFO",
        nameRu: "Запросы информации"
    }
])

const selected_appeal_type = ref(null)
const appeal_content = ref('')

async function userCreateAppeal() {
    try {
        const response = await createAppeal({
            userPhone: userInfo.value.phone,
            typeId: selected_appeal_type.value,
            content: appeal_content.value,
            akimatId: 6,
        })
        console.log(response)
        router.push('/client/goverment/requests')
    } catch (error) {
        console.log(error)
    }
}

onMounted(async () => {
  const response = await getCurrentUser({
    id: localStorage.getItem('user_id')
  });

  userInfo.value = response.data;
})

</script>

<template>
     <NuxtLayout name="client">
        <div class="w-full h-[61px] pl-[20px] flex items-center bg-white rounded-[16px] text-lg font-semibold">
            Создание обращения в Акимат
        </div>
        <div class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px]">
            <div class="flex flex-col gap-[10px]">
              <div>
                <label class="block text-sm mb-1">Тип обращения</label>
                <select v-model="selected_appeal_type" class="input select">
                  <option v-for="appeal_type in appeal_types" :key="appeal_type.id" :value="appeal_type.id">{{ appeal_type.nameRu }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm mb-1">Обращение</label>
                <textarea v-model="appeal_content" rows="3" class="input textarea"></textarea>
              </div>
                <button @click="userCreateAppeal" class="bg-[#38949B] text-white px-[16px] py-[8px] rounded-[8px]">Создать обращение</button>
            </div>
        </div>
     </NuxtLayout>
</template>

<style scoped>
</style>