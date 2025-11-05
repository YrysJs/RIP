<script setup>
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();
const props = defineProps(['grave', 'visible', 'images', 'memorial'])

const emit = defineEmits(['close'])

const goToMemorial = () => {
  if (props.memorial?.id) {
    router.push(`/memorial/${props.memorial.id}`);
    emit('close');
  }
}

function removeEscapedQuotes(str) {
  if (str && str.length) return str.replace(/\\"/g, '');
  else return ''
}

const closeModal = () => {
  emit('close')
}
</script>

<template>
  <div v-if="visible" class="modal fixed min-w-full min-h-[100vh] flex justify-center items-center z-[100]">
    <div class="bg-white rounded-lg max-w-[800px] w-full max-h-[90vh] overflow-y-auto m-4 max-sm:m-0 max-sm:max-h-[100vh] max-sm:rounded-none">
      <!-- Header -->
      <div class="flex justify-between items-center pt-6 px-6 pb-0 border-b max-sm:pt-4 max-sm:px-4">
        <h2 class="text-2xl font-bold max-sm:text-lg max-sm:pr-2">{{ grave.cemetery_name }}</h2>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 text-2xl max-sm:text-xl flex-shrink-0">
          &times;
        </button>
      </div>
      
      <!-- Content -->
      <div class="pt-2 px-6 pb-6 max-sm:px-4 max-sm:pb-4">
        <!-- Location info -->
        <div class="mb-6 max-sm:mb-4">
          <div class="flex gap-1 items-center mb-2 flex-wrap max-sm:gap-2">
            <span class="bg-[#E9EDED] rounded-lg px-2 py-1 text-sm max-sm:text-xs">{{ $t('modalsGrave.graveDetail.sector') }} <span class="font-bold">{{ grave?.sector_number }}</span></span>
            <span class="bg-[#E9EDED] rounded-lg px-2 py-1 text-sm max-sm:text-xs">{{ $t('modalsGrave.graveDetail.place') }} <span class="font-bold">{{ grave?.grave_number }}</span></span>
            <span class="bg-[#E9EDED] rounded-lg px-2 py-1 text-sm max-sm:text-xs">{{ $t('modalsGrave.graveDetail.perimeter') }} <span class="font-bold">{{ grave?.area || '2.5 x 1.5 м' }}</span></span>
          </div>
        </div>

        <!-- Images Gallery -->
        <div v-if="images && (Array.isArray(images) ? images.length > 0 : images.photos_urls?.length > 0)" class="mb-6 max-sm:mb-4">
          <div class="flex gap-4 overflow-x-scroll max-sm:gap-2">
            <div 
              v-for="(image, index) in (Array.isArray(images) ? images : images.photos_urls)"
              :key="index"
              class="min-w-[330px] h-[221px] aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center max-sm:min-w-[280px] max-sm:h-[200px]"
            >
              <img 
                :src="removeEscapedQuotes(image)"
                :alt="`Фото ${index + 1}`"
                class="w-full h-full object-contain hover:scale-105 transition-transform cursor-pointer"
              />
            </div>
          </div>
        </div>
        <div v-else class="mb-6">
          <div class="flex gap-4 overflow-x-scroll">
            <div 
              class="w-[752px] h-[221px] aspect-square rounded-lg overflow-hidden bg-gray-100 flex overflow-x-scroll"
            >
              <img 
                src="/images/placeholder.png"
                :alt="$t('alts.photo')"
                class="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
              />
              <img 
                src="/images/placeholder.png"
                :alt="$t('alts.photo')"
                class="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
              />
            </div>
          </div>
        </div>

        <!-- Deceased Information -->
        <div v-if="grave?.deceased && grave.deceased.length > 0" class="mb-6 p-4 bg-gray-50 rounded-lg max-sm:mb-4 max-sm:p-3">
          <h3 class="text-lg font-semibold mb-3 text-gray-800 max-sm:text-base max-sm:mb-2">{{ $t('modalsGrave.graveDetail.deceasedInfo') }}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-sm:gap-3">
            <div>
              <p class="text-sm text-gray-600 mb-1">{{ $t('modalsGrave.graveDetail.fullName') }}</p>
              <p class="font-medium text-gray-900">{{ grave.deceased[0].full_name }}</p>
            </div>
            <div v-if="grave.deceased[0].death_date">
              <p class="text-sm text-gray-600 mb-1">{{ $t('modalsGrave.graveDetail.deathDate') }}</p>
              <p class="font-medium text-gray-900">{{ new Date(grave.deceased[0].death_date).toLocaleDateString('ru-RU') }}</p>
            </div>
            <div v-if="grave.deceased[0].inn">
              <p class="text-sm text-gray-600 mb-1">{{ $t('modalsGrave.graveDetail.iin') }}</p>
              <p class="font-medium text-gray-900">{{ grave.deceased[0].inn }}</p>
            </div>
            <div v-if="grave.deceased[0].is_reburial !== undefined">
              <p class="text-sm text-gray-600 mb-1">{{ $t('modalsGrave.graveDetail.reburial') }}</p>
              <p class="font-medium text-gray-900">{{ grave.deceased[0].is_reburial ? $t('common.yes') : $t('common.no') }}</p>
            </div>
          </div>
          <div v-if="grave.deceased[0].death_cert_url" class="mt-3">
            <p class="text-sm text-gray-600 mb-1">{{ $t('modalsGrave.graveDetail.deathCertificate') }}</p>
            <a 
              :href="grave.deceased[0].death_cert_url" 
              target="_blank" 
              class="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              {{ $t('modalsGrave.graveDetail.openDocument') }}
            </a>
          </div>
          <div v-if="memorial?.id" class="mt-3">
            <p class="text-sm text-gray-600 mb-1">{{ $t('memorial.memorial') }}</p>
            <button 
              @click="goToMemorial"
              class="text-blue-600 hover:text-blue-800 underline text-sm cursor-pointer bg-transparent border-none p-0 text-left"
            >
              {{ $t('common.open') || 'Открыть' }} → /memorial/{{ memorial.id }}
            </button>
          </div>
        </div>

        <!-- Description -->
        <div class="mb-6 max-sm:mb-4">
          <p class="max-sm:text-sm">
            {{ grave?.description }}
          </p>
        </div>

        <!-- Additional info -->
        <div class="mb-6 max-sm:mb-4">
          <h3 class="text-lg font-semibold max-sm:text-base">{{ $t('modalsGrave.graveDetail.note') }}</h3>
          <p class="text-sm text-gray-600">
            {{ grave?.notes }}
          </p>
        </div>

        <!-- Coordinates -->
        <div class="flex items-center justify-between">
          <button 
            v-if="grave?.coordinates" 
            @click="$emit('showCoordinates', grave.coordinates)"
            class="flex items-center gap-1 text-sm font-semibold"
          >
            <img src="/icons/share.svg" alt="share" class="w-4 h-4 mr-1">
            {{ $t('modals.shareCoord.shareCoordinates') }}
          </button>
          
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
</style> 