<script setup>
import { computed } from 'vue'

const emit = defineEmits(['close', 'finish'])

defineProps(['cemeteries'])
const cemetery = ref(0)

const { locale } = useI18n()

// Функция для получения локализованного имени кладбища
const getCemeteryName = (cemetery) => {
  if (!cemetery) return ''
  if (locale.value === 'kk' && cemetery.name_kz) {
    return cemetery.name_kz
  }
  return cemetery.name || ''
}

function close() {
  emit('close')
}

async function run () {
  if(cemetery.value) {
    emit('finish', cemetery.value)
  }
}


</script>

<template>
  <div class="modal fixed min-w-full min-h-[100vh] flex justify-center items-center z-50">
    <div class="bg-white rounded-md max-w-[500px] w-full p-[24px] relative">
      <button class="absolute right-[24px] top-[24px]" @click="close">&#10005;</button>
      <div class="flex flex-col">
        <h3 class="text-2xl font-bold font-roboto text-left text-[#222222] mb-[8px]">
          {{ $t('setCemetery.assignManager') }}
        </h3>

        <div class="mt-[24px] mb-[24px]">
          <p class="text-sm font-roboto text-[#222222]">{{ $t('setCemetery.cemetery') }}</p>
          <select v-model="cemetery" class="w-full border-2 border-[#939393] pl-[16px] rounded-lg h-[60px] pr-[16px] select" :placeholder="$t('setCemetery.cemetery')">
            <option v-for="item in cemeteries" :key="item.id" :value="item.id">{{ getCemeteryName(item) }}</option>
          </select>
        </div>
        <button class="bg-[#F7F7F7] h-[51px] rounded-lg text-[#222222] font-semibold font-roboto" :class="{ '!bg-[#38949B] text-white': cemetery }" @click="run">{{ $t('setCemetery.assign') }}</button>
      </div>
    </div>
  </div>
</template>

<style lang=scss scoped>
.modal {
  top: 0;
  background: #0000005b;
}
</style>