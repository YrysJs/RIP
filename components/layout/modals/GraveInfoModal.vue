<script setup>
import { onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  data: {
    type: Object,
    default: () => ({
      image: "/images/main_service/f1.jpg",
      title: "Северное кладбище",
      sector: "11",
      place: "3",
      description:
        "Участок расположен на ровной местности, что обеспечивает устойчивость и простоту в обустройстве памятника и территории. Размер участка составляет 2,5 x 1,5 метра, для индивидуального захоронения. Территория находится в солнечной части кладбища с легким уклоном, обеспечивающим естественный дренаж. Участок доступен для посещения, имеется удобный подъезд.",
      note: "Участок расположен в небольшой низине, защищенной от ветров.",
    }),
  },
  closeOnBackdrop: { type: Boolean, default: true },
});

const emit = defineEmits(["update:modelValue", "close"]);

function close() {
  emit("update:modelValue", false);
  emit("close");
}

function onKey(e) {
  if (e.key === "Escape") close();
}

onMounted(() => window.addEventListener("keydown", onKey));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));

function onBackdrop(e) {
  if (props.closeOnBackdrop && e.target === e.currentTarget) close();
}
</script>

<template>
  <Teleport to="body">
    <transition name="fade">
      <div v-if="modelValue" class="modal fixed inset-0" @click="onBackdrop">
        <div
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[544px] h-[584px] max-w-[94vw] max-h-[94vh] rounded-2xl shadow-2xl overflow-hidden bg-white"
          role="dialog"
          aria-modal="true"
        >
          <!-- Картинка -->
          <div class="relative h-[260px] w-full">
            <img
              :src="data.image"
              alt=""
              class="absolute inset-0 w-full h-full object-cover"
            />
            <!-- Кнопка закрытия -->
            <button
              class="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 hover:bg-white transition shadow"
              aria-label="Закрыть"
              @click.stop="close"
            >
              ✕
            </button>
          </div>

          <!-- Контент -->
          <div class="h-[324px] overflow-auto px-6 pb-6 pt-5">
            <h3 class="text-xl font-semibold text-[#17212A]">
              {{ data.title }}
            </h3>

            <!-- Теги -->
            <div class="mt-3 flex flex-wrap gap-2">
              <span
                class="rounded-full bg-[#F0F1F2] px-3 py-1 text-xs font-medium text-[#5C6771]"
              >
                Сектор: {{ data.sector }}
              </span>
              <span
                class="rounded-full bg-[#F0F1F2] px-3 py-1 text-xs font-medium text-[#5C6771]"
              >
                Место: {{ data.place }}
              </span>
            </div>

            <!-- Описание -->
            <p class="mt-4 text-sm leading-6 text-[#222]">
              {{ data.description }}
            </p>

            <!-- Примечание -->
            <p class="mt-4 text-sm leading-6">
              <span class="font-semibold">Примечание:</span>
              <span class="text-[#222]">{{ data.note }}</span>
            </p>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.modal {
  top: 0;
  background: #0000005b;
  z-index: 999;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
