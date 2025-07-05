<script setup>
import { updateUser } from '~/services/login'
const emit = defineEmits(['close', 'finish'])
const props = defineProps(['user'])

const iin = ref('')
const name = ref('')
const surname = ref('')
const patronymic = ref('')

function close() {
  emit('close')
}

async function run () {
  try {
    await updateUser({
      data: {
        userId: props.user.id,
        iin: iin.value,
        name: name.value,
        surname: surname.value,
        patronymic: patronymic.value,
      },
    })
    emit('finish')
  } catch (error) {
    console.error('Ошибка при логине:', error)

  } finally {
    console.log('login')

  }
}

onMounted(() => {
  iin.value = props.user.iin
  name.value = props.user.name
  surname.value = props.user.surname
  patronymic.value = props.user.patronymic
})


</script>

<template>
  <div class="modal fixed min-w-full min-h-[100vh] flex justify-center items-center z-50">
    <div class="bg-white rounded-md max-w-[500px] w-full p-[24px] relative">
      <button class="absolute right-[24px] top-[24px]" @click="close">&#10005;</button>
      <div class="flex flex-col">
        <h3 class="text-2xl font-bold font-roboto text-left text-[#222222] mb-[8px]">
          Редактировать пользователя
        </h3>
        <div class="mt-[24px]">
          <p class="text-sm font-roboto text-[#222222]">Имя</p>
          <input v-model="name" class="w-full border-2 border-[#939393] pl-[16px] rounded-lg h-[60px]" type="text" placeholder="Введите ФИО">
        </div>
        <div class="mt-[24px]">
          <p class="text-sm font-roboto text-[#222222]">Фамилия</p>
          <input v-model="surname" class="w-full border-2 border-[#939393] pl-[16px] rounded-lg h-[60px]" type="text" placeholder="Введите ФИО">
        </div>
        <div class="mt-[24px]">
          <p class="text-sm font-roboto text-[#222222]">Отчество</p>
          <input v-model="patronymic" class="w-full border-2 border-[#939393] pl-[16px] rounded-lg h-[60px]" type="text" placeholder="Введите ФИО">
        </div>
        <div class="mt-[24px] mb-[24px]">
          <p class="text-sm font-roboto text-[#222222]">ИИН</p>
          <input v-model="iin" class="w-full border-2 border-[#939393] pl-[16px] rounded-lg h-[60px]" type="text" placeholder="Введите ИИН">
        </div>
        <button class="bg-[#F7F7F7] h-[51px] rounded-lg text-[#222222] font-semibold font-roboto" :class="{ '!bg-[#38949B] text-white': iin.length }" @click="run">Отправить</button>
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