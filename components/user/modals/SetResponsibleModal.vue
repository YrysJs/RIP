<script setup>
const emit = defineEmits(['close', 'finish'])

defineProps(['users'])
const responsible = ref(0)

function close() {
  emit('close')
}

async function run () {
  if(responsible.value) {
    emit('choose', responsible.value)
  }
}


</script>

<template>
  <div class="modal fixed min-w-full min-h-[100vh] flex justify-center items-center z-50">
    <div class="bg-white rounded-md max-w-[500px] w-full p-[24px] relative">
      <button class="absolute right-[24px] top-[24px]" @click="close">&#10005;</button>
      <div class="flex flex-col">
        <h3 class="text-2xl font-bold font-roboto text-left text-[#222222] mb-[8px]">
          Назначить ответственного
        </h3>

        <div class="mt-[24px] mb-[24px]">
          <p class="text-sm font-roboto text-[#222222]">Ответственный</p>
          <select v-model="responsible" class="w-full border-2 border-[#939393] pl-[16px] rounded-lg h-[60px] pr-[16px] select" placeholder="Ответственный">
            <option v-for="item in users" :key="item.id" :value="item.id">{{ item.surname }} {{ item.name }} {{ item.patronymic }}</option>
          </select>
        </div>
        <button class="bg-[#F7F7F7] h-[51px] rounded-lg text-[#222222] font-semibold font-roboto" :class="{ '!bg-[#38949B] text-white': responsible }" @click="run">Назначить</button>
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