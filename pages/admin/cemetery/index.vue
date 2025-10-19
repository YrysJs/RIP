<script setup>
import AdminCemeteryCard from '@/components/admin/cemetery/AdminCemeteryCard.vue'
import {getCemeteries, getGraves} from "~/services/cemetery"
import { importXlsx } from '~/services/admin'
import CemeteryMap from "~/components/map/CemeteryMap.vue";
import {getGraveById, getGraveImages} from "~/services/client/index.js";
import GraveDetailModal from "~/components/layout/modals/GraveDetailModal.vue";

const cemeteries = ref([])
const selectedCemetery = ref({})
const isMap = ref(false)
const router = useRouter();
const gravesList = ref([])

const graveDetailModalVisible = ref(false)

const grave = ref({})
const graveImages = ref([])

definePageMeta({
  middleware: ['auth', 'admin'],
});

const selectCemetery = async (cemetery) => {
  try {
    selectedCemetery.value = cemetery
    const response = await getGraves({ cemetery_id: selectedCemetery.value.id })
    gravesList.value = response.data.data || []
    isMap.value = true
  } catch (error) {
    gravesList.value = []
  }
}

const fetchGraveDetails = async (id) => {
  try {
    const response = await getGraveById(id)
    grave.value = response.data
    const images = await getGraveImages(id)
    graveImages.value = images.data
    graveDetailModalVisible.value = true

  } catch (error) {
    console.error('Ошибка при услуги:', error)
  }

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
          :polygons="gravesList"
          :visible="isMap"
          @grave-click="fetchGraveDetails"
          @close="() => isMap = false"
      />
      <GraveDetailModal :visible="graveDetailModalVisible" :grave="grave" :images="graveImages" @close=" () => graveDetailModalVisible = false" />
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