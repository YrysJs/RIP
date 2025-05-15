<script setup>
import {getGraves, getCemeteries} from "~/services/cemetery"

onMounted(() => {
  getGraves()
  getCemeteries()
})
</script>

<template>
  <div>
    asdasd
  </div>
</template>

<style lang="scss" scoped>

</style>