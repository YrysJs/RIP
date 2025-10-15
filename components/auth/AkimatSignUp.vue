<script setup>
import { signupAkimat } from '~/services/login'
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
    await signupAkimat({
      data: {
        user: {
          phone: extractDigits(phone_number.value),
          iin: iin.value,
          name: name.value,
          surname: surname.value,
          patronymic: patronymic.value,
        },
        userRoleId: roleId.value,
        akimatId: 6
      },
    })
    emit('finish')
  } catch (error) {
    console.error('Ошибка при логине:', error)
    
    const { $toast } = useNuxtApp();
    $toast.error("Произошла ошибка при регистрации");

  } finally {
    console.log('login')
  }
}

function extractDigits(phone) {
  return phone.replace(/\D/g, '');
}


</script>

<template>
  <div class="modal fixed inset-0 min-w-full min-h-[100vh] flex justify-center items-center z-50">
    <div class="bg-white rounded-md max-w-[500px] w-full p-8 relative max-sm:mx-4 max-sm:pt-6 max-sm:px-4 max-sm:pb-12">
      <button class="absolute right-[32px] top-[32px] text-[22px] leading-5 font-semibold" @click="close">&#10005;</button>
      <div class="flex flex-col">
        <h3 class="text-2xl font-extrabold text-left text-[#222222] mb-[32px] max-lg:text-[22px] max-lg:mb-4">
          Приглашение на регистрацию
        </h3>
        <div class="flex flex-col gap-[10px] max-lg:gap-2">
          <p class="text-lg max-lg:text-base">
            Укажите данные сотрудника:
          </p>
          <input
            v-model="name"
            class="w-full border-2 border-[#AFB5C133] px-3 py-[18px] rounded-lg max-lg:py-[14px]"
            type="text"
            placeholder="Имя"
          />
          <input
            v-model="surname"
            class="w-full border-2 border-[#AFB5C133] px-3 py-[18px] rounded-lg max-lg:py-[14px]"
            type="text"
            placeholder="Фамилия"
          />
          <input
            v-model="patronymic"
            class="w-full border-2 border-[#AFB5C133] px-3 py-[18px] rounded-lg max-lg:py-[14px]"
            type="text"
            placeholder="Отчество"
          />
          <input
            v-model="iin"
            v-mask="'############'"
            maxlength="12"
            class="w-full border-2 border-[#AFB5C133] px-3 py-[18px] rounded-lg max-lg:py-[14px]"
            type="text"
            placeholder="ИИН"
          />
          <input
            v-model="phone_number"
            v-mask="'+7 (###) ###-##-##'"
            class="w-full border-2 border-[#AFB5C133] px-3 py-[18px] rounded-lg max-lg:py-[14px]"
            type="text"
            placeholder="Номер телефона"
          />
          <select
            v-model="roleId"
            class="w-full border-2 border-[#AFB5C133] px-3 py-[18px] rounded-lg max-lg:py-[14px] mb-[32px]"
          >
            <option value="0" disabled>Роль</option>
            <option :value="8">Менеджер</option>
            <option :value="7">Админ</option>
          </select>
        </div>
        <button
          type="button"
          class="py-[18px] bg-[#E9B949] rounded-lg text-base text-[#000] font-medium mb-4 flex justify-center"
          :disabled="!iin.length || !name.length || !surname.length || !phone_number.length || !roleId"
          @click="run"
        >
          Отправить
        </button>
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