<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "submit"]);

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

function close() {
  open.value = false;
}

function onEsc(e) {
  if (e.key === "Escape") close();
}
onMounted(() => window.addEventListener("keydown", onEsc));
onBeforeUnmount(() => window.removeEventListener("keydown", onEsc));

/* ----- form state ----- */
const rating = ref(0);
const comment = ref("");
const maxLen = 500;

const files = ref([]); // File[]
const previews = ref([]); // {url, name, size}
const maxFiles = 5;
const maxSize = 5 * 1024 * 1024; // 5MB

function setRating(n) {
  rating.value = n;
}

function handleFiles(list) {
  const arr = Array.from(list || []);
  for (const f of arr) {
    const okType = /image\/(png|jpeg)/.test(f.type);
    const okSize = f.size <= maxSize;
    if (!okType || !okSize) continue;
    if (files.value.length >= maxFiles) break;
    files.value.push(f);
    previews.value.push({
      url: URL.createObjectURL(f),
      name: f.name,
      size: f.size,
    });
  }
}
function removeFile(i) {
  URL.revokeObjectURL(previews.value[i].url);
  previews.value.splice(i, 1);
  files.value.splice(i, 1);
}

const isValid = computed(
  () =>
    rating.value > 0 &&
    comment.value.trim().length > 0 &&
    comment.value.length <= maxLen
);

function submit() {
  if (!isValid.value) return;
  emit("submit", {
    rating: rating.value,
    comment: comment.value.trim(),
    files: files.value,
  });
  // по желанию — сразу закрывать:
  close();
}
</script>

<template>
  <transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-[1000] flex items-center justify-center"
      @click.self="close"
    >
      <!-- overlay -->
      <div class="absolute inset-0 bg-black/40"></div>

      <!-- modal -->
      <div
        class="relative w-[92vw] max-w-[560px] bg-white rounded-2xl shadow-xl p-4 md:p-8 z-10 max"
      >
        <!-- header -->
        <div class="flex items-start justify-between gap-4 mb-8">
          <h3 class="text-2xl font-extrabold">{{ $t('modals.addReview.title') }}</h3>
          <button
            type="button"
            :aria-label="$t('common.close')"
            class="shrink-0 text-2xl font-semibold grid place-items-center rounded-lg hover:bg-black/5"
            @click="close"
          >
            ✕
          </button>
        </div>

        <!-- rating -->
        <div class="mb-[18px]">
          <label class="text-[15px] font-medium text-[#5C6771]">
            Рейтинг:<span class="text-red-500">*</span>
          </label>
          <div class="mt-[14px] flex">
            <button
              v-for="i in 5"
              :key="i"
              type="button"
              class="w-[14px] h-[14px]"
              :aria-pressed="rating >= i"
              @click="setRating(i)"
            >
              <!-- Залитая -->
              <svg
                v-if="rating >= i"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                xmlns="http://www.w3.org/2000/svg"
                class="w-full h-full"
              >
                <path
                  d="M7 0.5L9.4687 4.10213L13.6574 5.33688L10.9944 8.79787L11.1145 13.1631L7 11.7L2.8855 13.1631L3.00556 8.79787L0.342604 5.33688L4.5313 4.10213L7 0.5Z"
                  fill="#E9B949"
                />
              </svg>

              <!-- Пустая -->
              <svg
                v-else
                width="14"
                height="14"
                viewBox="0 0 14 14"
                xmlns="http://www.w3.org/2000/svg"
                class="w-full h-full"
              >
                <path
                  d="M7 0.5L9.4687 4.10213L13.6574 5.33688L10.9944 8.79787L11.1145 13.1631L7 11.7L2.8855 13.1631L3.00556 8.79787L0.342604 5.33688L4.5313 4.10213L7 0.5Z"
                  fill="#E9B949"
                  fill-opacity="0.3"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- comment -->
        <div class="mb-[10px]">
          <label class="text-[15px] font-medium text-[#5C6771]">
            Комментарий:<span class="text-red-500">*</span>
          </label>
          <div class="mt-2 relative">
            <textarea
              v-model="comment"
              :maxlength="maxLen"
              rows="4"
              placeholder="Пару слов о проделанной работе..."
              class="w-full rounded-lg border border-[#D6DADF] focus:outline-none focus:ring-2 focus:ring-[#E9B949] focus:border-transparent p-3 text-base pr-14 pb-8"
            />
            <!-- Счётчик внутри -->
            <div
              class="absolute bottom-2 right-3 text-sm text-[#5C6771] bg-white/80 px-1 rounded"
            >
              {{ comment.length }}/{{ maxLen }} символов
            </div>
          </div>
        </div>

        <!-- uploader -->
        <div class="mb-5">
          <p class="text-sm text-[#5C6771]">
            Перетащите файлы или загрузите файлы до 5 МБ в формате: .png, .jpeg
            (максимум {{ maxFiles }} фотографий)
          </p>

          <div
            class="mt-2 rounded-xl border border-dashed border-[#D6DADF] bg-[#F8F9FA] hover:bg-[#eef1f4] p-4 cursor-pointer transition"
            @dragover.prevent
            @drop.prevent="handleFiles($event.dataTransfer.files)"
          >
            <div class="flex flex-col items-center gap-3">
              <div class="grid place-items-center">
                <img src="/icons/upload.svg" alt="" />
              </div>
              <p class="text-sm font-semibold">Загрузите фотографии</p>

              <label
                class="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-[#D6DADF] bg-white text-sm cursor-pointer hover:bg-[#F5F6F7]"
              >
                Загрузить
                <input
                  type="file"
                  class="hidden"
                  accept="image/png,image/jpeg"
                  multiple
                  @change="
                    handleFiles($event.target.files);
                    $event.target.value = null;
                  "
                />
              </label>
            </div>

            <!-- previews -->
            <div v-if="previews.length" class="mt-4 grid grid-cols-3 gap-3">
              <div
                v-for="(p, i) in previews"
                :key="p.url"
                class="relative group rounded-lg overflow-hidden border border-[#E5E7EB]"
              >
                <img :src="p.url" alt="" class="w-full h-24 object-cover" />
                <button
                  type="button"
                  class="absolute top-1 right-1 w-7 h-7 rounded-md bg-black/60 text-white text-sm opacity-0 group-hover:opacity-100 transition"
                  @click="removeFile(i)"
                  aria-label="Удалить"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- footer -->
        <div class="pt-2">
          <button
            class="w-full rounded-lg py-3 text-sm font-medium transition"
            :class="
              isValid
                ? 'bg-[#E9B949] text-black hover:opacity-90'
                : 'bg-[#E9B949] text-black opacity-50 cursor-not-allowed'
            "
            :disabled="!isValid"
            @click="submit"
          >
            Отправить отзыв
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal {
  top: 0;
  background: #0000005b;
  z-index: 999;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
