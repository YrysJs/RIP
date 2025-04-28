<template>
  <NuxtLayout name="user">
    <div class="w-full bg-white rounded-[16px] p-[20px] mt-[20px]">
      <div class="flex justify-between items-center mb-[16px]">
        <h2 class="text-2xl font-semibold">Пользователи</h2>
        <button class="invite-btn">
          <img src="/icons/plus.svg" alt="Пригласить" class="w-4 h-4 mr-2" />
          Пригласить
        </button>
      </div>

      <div class="grid grid-cols-12 text-sm font-semibold text-[#6B7280] py-[10px] border-b border-[#EEEEEE]">
        <div class="col-span-3">Роль</div>
        <div class="col-span-6">Фио пользователя</div>
        <div class="col-span-3">Статус</div>
      </div>

      <div
          v-for="user in users"
          :key="user.id"
          class="grid grid-cols-12 items-center text-sm py-[14px] border-b border-[#EEEEEE] hover:bg-[#F9FAFB] transition"
      >
        <div class="col-span-3">{{ user.role }}</div>
        <div class="col-span-6">{{ user.fullName }}</div>
        <div class="col-span-2">
        <span
            class="status"
            :class="{
            'status--active': user.status === 'active',
            'status--pending': user.status === 'pending',
            'status--blocked': user.status === 'blocked'
          }"
        >
          {{ statusText(user.status) }}
        </span>
        </div>
        <div class="col-span-1 flex justify-end">
          <img src="/icons/arrow-right.svg" class="w-4 h-4" />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
const users = [
  { id: 1, role: 'Менеджер', fullName: 'Бақадыр Нурбике Бекзатқызығ', status: 'active' },
  { id: 2, role: 'Менеджер', fullName: 'Айнұр Серікбай Арманқызы', status: 'pending' },
  { id: 3, role: 'Менеджер', fullName: 'Иван Петрович Сергеев', status: 'active' },
  { id: 4, role: 'Администратор', fullName: 'Мария Александровна Иванова', status: 'active' },
  { id: 5, role: 'Писатель', fullName: 'Алексей Андреевич Смирнов', status: 'active' },
  { id: 6, role: 'Менеджер', fullName: 'Екатерина Дмитриевна Козлова', status: 'blocked' },
];

const statusText = (status) => {
  if (status === 'active') return 'Активен';
  if (status === 'pending') return 'Приглашение отправлено';
  if (status === 'blocked') return 'Заблокирован';
  return '';
};
</script>

<style scoped>
.invite-btn {
  background: #224C4F;
  color: white;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
}

.status {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 12px;
  text-align: center;
}

.status--active {
  background: #3CBF4A;
  color: white;
}

.status--pending {
  background: #F7901E;
  color: white;
}

.status--blocked {
  background: #E53935;
  color: white;
}
</style>
