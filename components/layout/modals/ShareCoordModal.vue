<script setup>
import { defineProps, computed } from "vue";

const props = defineProps({
  visible: { type: Boolean, default: false },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
});

const emit = defineEmits(["close"]);

const hasCoords = computed(
  () => Number.isFinite(props.lat) && Number.isFinite(props.lng)
);

// Yandex: для метки можно pt=lng,lat; для центра — ll=lng,lat
const link = computed(() =>
  hasCoords.value
    ? `https://yandex.ru/maps/?pt=${props.lng},${props.lat}&z=17&l=map`
    : ""
);

const closeModal = () => emit("close");

const copyToClipboard = async (type) => {
  try {
    if (type === "link") {
      await navigator.clipboard.writeText(link.value);
      console.log("Ссылка скопирована!");
    } else if (type === "coords") {
      await navigator.clipboard.writeText(`${props.lat}, ${props.lng}`);
      console.log("Координаты скопированы!");
    }
  } catch (err) {
    console.error("Не удалось скопировать ссылку:", err);
  }
};
</script>

<template>
  <div
    v-if="visible"
    class="modal fixed min-w-full min-h-[100vh] flex justify-center items-center z-50"
  >
    <div
      class="bg-white rounded-lg max-w-[655px] w-full max-h-[90vh] overflow-y-auto m-4"
    >
      <!-- Header -->
      <div class="flex justify-end items-start pt-6 pl-6 pr-6 pb-0">
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 text-4xl ml-4"
        >
          &times;
        </button>
      </div>

      <div class="pt-2 pl-6 pr-6 pb-6">
        <div class="flex flex-col gap-[12px]">
          <div
            class="mb-6 w-full flex justify-between items-center gap-[10px] flex-wrap"
          >
            <div class="flex flex-col gap-[10px] w-fluid">
              <p class="text-base text-[#939393]">Ссылка</p>
              <p class="font-bold truncate-middle">
                {{ hasCoords ? link : "Координаты недоступны" }}
              </p>
            </div>
            <button
              class="bg-[#EEEEEE] text-[#224C4F] px-[16px] py-[8px] rounded-[8px] font-semibold"
              @click="copyToClipboard('link')"
            >
              Скопировать
            </button>
          </div>
          <div
            class="mb-6 w-full flex justify-between items-center gap-[10px] flex-wrap"
          >
            <div class="flex flex-col gap-[10px] w-fluid">
              <p class="text-base text-[#939393]">Координаты места</p>
              <p class="font-bold truncate-middle">
                {{ hasCoords ? `${props.lat}, ${props.lng}` : "—" }}
              </p>
            </div>
            <button
              class="bg-[#EEEEEE] text-[#224C4F] px-[16px] py-[8px] rounded-[8px] font-semibold"
              @click="copyToClipboard('coords')"
            >
              Скопировать
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal {
  top: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
}
.truncate-middle {
  max-width: 400px; /* или сколько нужно */
  display: inline-block;
  vertical-align: middle;
  font-weight: bold;

  /* три части: обрезка + "..." + остальное */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  text-align: left;
}

.w-fluid {
  width: clamp(295px, 45vw, 400px);
}
</style>
