<template>
<div class="flex text-base">
<p class="min-w-[120px] text-[#5C6771]">Кладбище:</p>
<p class="font-medium">{{ request.cemetery_name }}</p>
</div>
<div class="flex text-base">
<p class="min-w-[120px] text-[#5C6771]">Сектор:</p>
<p class="font-medium">{{ request.sector_number }}</p>
</div>
<div class="flex text-base">
<p class="min-w-[120px] text-[#5C6771]">Место:</p>
<p class="font-medium">{{ request.grave_id }}</p>
</div>
</div>
</div>


<div class="border-b-2 border-[#EEE] py-3">
<div class="flex text-base">
<p class="min-w-[120px] text-[#5C6771]">ФИО покойного:</p>
<p class="font-medium">{{ request.deceased?.full_name }}</p>
</div>
</div>


<div class="border-b-2 border-[#EEE] py-3">
<div class="flex text-base">
<p class="min-w-[120px] text-[#5C6771]">Дата похорон:</p>
<p v-if="request.burial_date" class="font-medium">
{{ new Date(request.burial_date).toLocaleDateString('ru-RU') }}, {{ request.burial_time }}
</p>
<p v-else class="text-[#DB1414]">Необходимо указать даты похорон</p>
</div>
</div>


<div class="border-b-2 border-[#EEE] py-3">
<div class="flex items-center gap-2 text-base">
<p class="min-w-[120px] text-[#5C6771]">Статус:</p>
<div v-if="request.status === 'pending'" class="flex items-center gap-2">
<img src="/icons/warning.svg" alt="" />
<p class="text-sm">Ожидает оплаты</p>
</div>
<div v-else class="flex items-center gap-2">
<img src="/icons/paid-tick.svg" alt="" />
<p class="text-sm">Оплачено</p>
</div>
</div>
</div>


<div class="py-3">
<div class="flex text-base items-center gap-2">
<p class="min-w-[120px] text-[#5C6771]">Доп. услуги:</p>
<p class="px-2 py-1 rounded-md bg-[#F6F6F6]">Отсутствуют</p>
</div>
</div>


<button
class="mt-4 py-[15px] px-5 rounded-lg bg-[#E9B949] text-black text-sm font-medium w-full"
@click="$router.push(`/client/tickets/active/${request.id}`)"
>
Завершить оформление
</button>
</div>
</template>


<script setup lang="ts">
const {request} = defineProps<{ request: any }>()
</script>