<template>
  <button
    class="w-full text-left bg-white rounded-lg p-4 shadow-sm border border-[#eee] active:opacity-90"
    @click="$emit('open', request)"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs text-[#999]">Бронирование</p>
        <h3 class="text-lg font-medium text-[#201001]">
          <span class="text-[#B88F34]">#{{ request.request_number }}</span>
        </h3>
      </div>
      <span
        v-if="request.status === 'pending'"
        class="inline-flex items-center gap-2 text-xs px-2 py-1 rounded bg-[#FFF7E0] border border-[#E9B949]"
      >
        <img src="/icons/warning.svg" alt="" /> Ожидает оплаты
      </span>
      <span
        v-else
        class="inline-flex items-center gap-2 text-xs px-2 py-1 rounded bg-[#E9FFE8] border border-[#43DC49]"
      >
        <img src="/icons/paid-tick.svg" alt="" /> Оплачено
      </span>
    </div>

    <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
      <div>
        <p class="text-[#777]">Кладбище</p>
        <p class="font-medium">{{ request.cemetery_name }}</p>
      </div>
      <div>
        <p class="text-[#777]">Место</p>
        <p class="font-medium">{{ request.grave_id }}</p>
      </div>
      <div>
        <p class="text-[#777]">Дата заявки</p>
        <p class="font-medium">
          {{
            new Date(request.created_at).toLocaleString("ru-RU", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          }}
        </p>
      </div>
      <div>
        <p class="text-[#777]">Сектор</p>
        <p class="font-medium">{{ request.sector_number }}</p>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
const { request } = defineProps<{ request: unknown }>();
</script>
