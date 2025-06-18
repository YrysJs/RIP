<script setup>
import { getMemorials } from '~/services/client'

const memorials = ref([])
const loading = ref(true)

const loadMemorials = async () => {
    try {
        const response = await getMemorials()
        memorials.value = response.data || []
    } catch (error) {
        console.error('Ошибка при загрузке мемориалов:', error)
        memorials.value = []
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    loadMemorials()
})
</script>

<template>
    <NuxtLayout name="client">
        <div class="flex flex-col gap-[24px]">
            <ClientOnly>
                <div v-if="loading" class="flex justify-center items-center bg-white rounded-[16px] py-[20px] px-[12px]">
                    <p>Загрузка...</p>
                </div>
                <div v-else-if="memorials.length === 0" class="flex justify-center items-center bg-white rounded-[16px] py-[20px] px-[12px]">
                    <p>Мемориалы не найдены</p>
                </div>
                <div v-else v-for="memorial in memorials" :key="memorial.id" class="flex justify-between items-center bg-white rounded-[16px] py-[20px] px-[12px] gap-[30px]">
                    <div>
                        <h3 class="text-2xl font-medium">{{ memorial.about_person }}</h3>
                        <p>{{ memorial.is_public ? 'Публичный' : 'Доступен только по ссылке' }}</p>
                    </div>
                    <div class="flex gap-4">
                        <button class="bg-[#EEEEEE] w-[84px] h-[28px] font-semibold text-[#D63C3C] rounded-lg">Скрыть</button>
                        <button class="bg-[#EEEEEE] w-[91px] h-[28px] font-semibold text-[#224C4F] rounded-lg" @click="$router.push(`/client/memorial/${memorial.id}`)">Открыть</button>
                    </div>
                </div>
                <template #fallback>
                    <div class="flex justify-center items-center bg-white rounded-[16px] py-[20px] px-[12px]">
                        <p>Загрузка...</p>
                    </div>
                </template>
            </ClientOnly>
        </div>
    </NuxtLayout>
</template>

<style lang=scss scoped>

</style>