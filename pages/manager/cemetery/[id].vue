<script setup lang="ts">
const form = reactive({
  title: 'Северное кладбище',
  description: 'Просторная и ухоженная, разделена на секции по типу захоронений: семейные, одиночные, мемориальные участки и колумбарий.',
  address: 'Северное кладбище',
  religion: 'all',
  iin: 'Северное кладбище',
  firstname: 'Северное кладбище',
  middle: 'Северное кладбище',
  lastname: 'Северное кладбище',
  phone: 'Северное кладбище',
  status: true
});
</script>

<template>
  <NuxtLayout name="form">
    <div class="flex items-center bg-white p-5 rounded-2xl mb-4">
      <button class="btn btn-back mr-4">
        <img class="w-4 h-4 mr-[10px]" src="/icons/arrow-left-primary.svg" alt="">
        Назад
      </button>

      <h1 class="text-[32px] font-medium">Редактирование кладбища</h1>
    </div>


    <div class="bg-white p-5 rounded-2xl space-y-4 mb-4">
      <h2 class="text-lg font-medium">Данные о кладбище</h2>

      <div>
        <label class="block text-sm mb-1">Название</label>
        <input type="text" v-model="form.title" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">Описание</label>
        <textarea v-model="form.description" rows="3" class="input textarea"></textarea>
      </div>

      <div>
        <label class="block text-sm mb-1">Адрес кладбища</label>
        <input type="text" v-model="form.address" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">Религия</label>
        <select v-model="form.religion" class="input">
          <option value="all">Все</option>
          <option value="christian">Христианство</option>
          <option value="muslim">Ислам</option>
          <option value="jewish">Иудаизм</option>
        </select>
      </div>
    </div>

    <div class="bg-white p-5 rounded-2xl space-y-4 mb-4">
      <h2 class="text-lg font-medium">Менеджер Кладбище</h2>

      <div>
        <label class="block text-sm mb-1">ИИН</label>
        <input type="text" v-model="form.iin" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">Имя</label>
        <input type="text" v-model="form.firstname" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">Отчество</label>
        <input type="text" v-model="form.middle" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">Фамилия</label>
        <input type="text" v-model="form.lastname" class="input" />
      </div>

      <div>
        <label class="block text-sm mb-1">Телефон</label>
        <input type="text" v-model="form.phone" class="input" />
      </div>

      <button class="btn btn-add">
        Добавить еще менеджера
      </button>
    </div>

    <div class="bg-white p-5 rounded-2xl space-y-4 mb-4">
      <h2 class="text-lg font-medium">Статус кладбища</h2>

      <div class="flex justify-between gap-4">
        <div class="flex justify-center items-center flex-1 h-12 rounded-lg bg-[#EEEEEE] text-center text-[#939393] font-semibold text-sm cursor-pointer" :class="{'!bg-[#224C4F] text-white': form.status}" @click="form.status=true">
          Активен
        </div>
        <div class="flex justify-center items-center flex-1 h-12 rounded-lg bg-[#EEEEEE] text-center text-[#939393] font-semibold text-sm cursor-pointer" :class="{'!bg-[#224C4F] text-white': !form.status}" @click="form.status=false">
          Не активен
        </div>
      </div>

    </div>

    <div class="bg-white p-5 rounded-2xl mb-4 flex gap-[10px] justify-end">
      <button class="btn btn-preview">
        Предпросмотр
      </button>
      <button class="btn btn-submit">
        Опубликовать
      </button>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.btn-back {
  height: 40px;
  padding: 12px 16px;
  font-size: 14px;
  color: #224C4F;
  background: #EEEEEE;
}

.btn-add {
  background: #224C4F;
  color: #fff;
  font-size: 14px;
  padding: 8px 16px;
}

.btn-preview {
  height: 52px;
  color: #222;
  background: #224C4F26;
  padding: 16px;
}

.btn-submit {
  height: 52px;
  background: #38949B;
  color: #fff;
  padding: 16px;
}
</style>