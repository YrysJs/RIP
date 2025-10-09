<script setup>
import AdminCemeteryCard from '@/components/admin/cemetery/AdminCemeteryCard.vue'
import {getCemeteries} from "~/services/cemetery"
import { importXlsx } from '~/services/admin'
import CemeteryMap from "~/components/map/CemeteryMap.vue";

const cemeteries = ref([])
const selectedCemetery = ref({})
const isMap = ref(false)
const router = useRouter();

definePageMeta({
  middleware: ['auth', 'admin'],
});

const selectCemetery = (cemetery) => {
  selectedCemetery.value = cemetery
  isMap.value = true
}

const uploadFile = async (data, cemetery) => {
  await importXlsx(data)
  selectCemetery(cemetery)
}

onMounted((async () => {
  try {
    const response = await getCemeteries()
    cemeteries.value = response.data.data
  } catch (error) {
    console.error('Ошибка при получении заявок:', error)
  } finally {
    console.log('finally')
  }
}))
</script>

<template>
  <NuxtLayout name="admin">
    <p class="opacity-0">{{selectedCemetery.id}}</p>
    <div class="flex justify-between items-center mb-[20px] flex-wrap gap-4">
      <div class="flex gap-4 flex-wrap">

      </div>
      <button class="create-btn" @click="router.push('/admin/cemetery/form')">
        <img src="/icons/plus.svg" class="w-4 h-4 mr-[8px]" />
        Создать кладбище
      </button>
    </div>
    <AdminCemeteryCard
        v-for="(cemetery, index) in cemeteries"
        :key="index"
        :cemetery="cemetery"
        @open-map="selectCemetery"
        @upload="uploadFile"
    />
    <Teleport to="body">
      <CemeteryMap
          :cemetery="selectedCemetery"
          :visible="isMap"
          @close="() => isMap = false"
      />
    </Teleport>
  </NuxtLayout>

</template>

<style scoped>
.create-btn {
  background: #224C4F;
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

</style>