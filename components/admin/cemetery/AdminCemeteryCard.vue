<template>
  <div class="cemetery-card mb-4">
    <div class="cemetery-card__header">
      <h3 class="cemetery-card__title">{{ cemetery.name }}</h3>
      <p class="cemetery-card__type">{{ types[cemetery.religion] ? types[cemetery.religion] : cemetery.religion }}</p>
    </div>

    <div class="cemetery-card__info">
      <div class="cemetery-card__info-item">
        <img src="/icons/map-pin.svg" alt="map" class="cemetery-card__icon" />
        <span>{{ cemetery.country }}, {{cemetery.city}}, {{cemetery.street_name}}</span>
      </div>
      <div class="cemetery-card__info-item">
        <img src="/icons/phone.svg" alt="phone" class="cemetery-card__icon" />
        <span>{{ cemetery.phone }}</span>
      </div>
    </div>

    <div class="cemetery-card__stats">
      <span> <strong>Вместимость: {{ cemetery.capacity }}</strong></span>
      <span> <strong>Свободных мест: {{ cemetery.free_spaces }}</strong></span>
    </div>

    <div class="cemetery-card__footer flex justify-end gap-3">
      <button class="btn cemetery-card__edit-button" @click="emit('open-map', cemetery)">На карте</button>
      <button class="btn cemetery-card__edit-button" @click="triggerFileSelect">Загрузить могилы</button>
      <input
          ref="fileInput"
          type="file"
          accept=".xlsx"
          class="hidden"
          @change="onFileChange"
      />
      <button class="btn cemetery-card__edit-button" @click="router.push('/admin/cemetery/' + cemetery.id)">Редактировать</button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['cemetery'])
const router = useRouter();
const emit = defineEmits(['open-map', 'upload'])

const types = {
  muslim: 'Мусульманское кладбище',
  christ: 'Християнское кладбище',
  slavic: 'Провославное кладбище'
}
const fileInput = ref(null)


function triggerFileSelect() {
  fileInput.value?.click()
}


function onFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('cemetery_id', props.cemetery.id)

    emit('upload', formData)
  }
}

</script>


<style lang="scss" scoped>
.cemetery-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }

  &__type {
    font-size: 14px;
    color: #999;
  }

  &__info {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 14px;
    color: #444;
  }

  &__info-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__icon {
    width: 16px;
    height: 16px;
  }

  &__stats {
    display: flex;
    gap: 24px;
    font-size: 14px;
  }

  &__edit-button {
    height: 32px;
    background: #224C4F;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    padding: 8px 16px;
  }
}
</style>