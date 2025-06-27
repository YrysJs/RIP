<script setup>
import { signupGov } from '~/services/login/index.js'
const emit = defineEmits(['close', 'finish'])

const phone_number = ref('')
const iin = ref('')
const name = ref('')
const surname = ref('')
const roleId = ref(0)
const patronymic = ref('')

function close() {
  emit('close')
}

async function run () {
  try {
    await signupGov({
      data: {
        phone: extractDigits(phone_number.value),
        iin: iin.value,
        name: name.value,
        surname: surname.value,
        patronymic: patronymic.value,
      },
      params: {
        roleId: roleId.value
      }
    })
    emit('finish')
  } catch (error) {
    console.error('Ошибка при логине:', error)

  } finally {
    console.log('login')

  }
}

function extractDigits(phone) {
  return phone.replace(/\D/g, '');
}


</script>

<template>
  <div class="modal fixed min-w-full min-h-[100vh] flex justify-center items-center z-50">
    <div class="bg-white rounded-md max-w-[500px] w-full p-[24px] relative">
      <button class="absolute right-[24px] top-[24px]" @click="close">&#10005;</button>
      <div class="flex flex-col">
        <h3 class="text-2xl font-bold font-roboto text-left text-[#222222] mb-[8px]">
          Приглашение на регистрацию
        </h3>
        <p class="text-sm font-roboto">
          Укажите данные сотрудника и мы отправим ссылку регистрации
        </p>
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
        <div class="mt-[24px]">
          <p class="text-sm font-roboto text-[#222222]">ИИН</p>
          <input v-model="iin" class="w-full border-2 border-[#939393] pl-[16px] rounded-lg h-[60px]" type="text" placeholder="Введите ИИН">
        </div>
        <div class="mt-[24px]">
          <p class="text-sm font-roboto text-[#222222]">Телефон</p>
          <input v-model="phone_number" v-mask="'+7 (###) ###-##-##'" class="w-full border-2 border-[#939393] pl-[16px] rounded-lg h-[60px]" type="text" placeholder="Введите номер телефона">
        </div>
        <div class="mt-[24px] mb-[24px]">
          <p class="text-sm font-roboto text-[#222222]">Роль</p>
          <select v-model="roleId" class="w-full border-2 border-[#939393] pl-[16px] rounded-lg h-[60px] pr-[16px] select" placeholder="Роль">
            <option :value="8">Менеджер</option>
            <option :value="7">Админ</option>
          </select>
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