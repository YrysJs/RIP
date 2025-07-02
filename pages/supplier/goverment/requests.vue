<script setup>
import { ref } from 'vue'
import { getAppeals } from '~/services/client'

const router = useRouter()
const appeals = ref([])

async function getUserAppeals() {
    const response = await getAppeals()
    appeals.value = response.data
}

onMounted(async () => {
    await getUserAppeals()
})

</script>

<template>
     <NuxtLayout name="supplier">
        <div class="w-full py-4 pl-[20px] flex items-center bg-white rounded-[16px] text-lg font-semibold flex justify-between items-center">
            <h1>Обращения в Акимат</h1> <button @click="router.push('/client/goverment/create')" class="bg-[#38949B] text-white px-[16px] py-[8px] rounded-[8px]">Создать обращение</button>
        </div>
        <div class="w-full bg-white rounded-[16px] mt-[20px] py-[20px] px-[12px]" v-for="appeal of appeals" :key="appeal.id">
            <div class="flex flex-col gap-[10px]">
                <div class="flex flex-col gap-[10px] text-lg font-semibold">
                    <h3>Тип обращения: <span class="ml-6 px-3 py-1 rounded-lg text-white" :class="appeal.type.value === 'COMPLAINT' ? 'bg-[#38949B]' : appeal.type.value === 'OFFER' ? 'bg-[#FFA500]' : 'bg-[#008000]'">{{ appeal.type.nameRu }}</span></h3>
                    <h3 class="my-2">Дата создания: <span>{{ new Date(appeal.createTime).toLocaleString('ru-RU') }}</span></h3>
                    <div class="flex flex-col gap-[0px]">
                        <h3>Обращение:</h3>
                        <p class="text-gray-500">
                            {{ appeal.content }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
     </NuxtLayout>
</template>

<style scoped>
</style>