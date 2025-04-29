<script setup>
</script>

<template>
    <NuxtLayout name="client">
        <div class="flex flex-col gap-[24px]">
            <div class="flex justify-between items-center bg-white rounded-[16px] py-[20px] px-[12px] gap-[30px]">
                <div>
                    <h3 class="text-2xl font-medium">Беляков Макар Максимович</h3>
                    <p>Доступен только по ссылке</p>
                </div>
                <div class="flex gap-4">
                    <button class="bg-[#EEEEEE] w-[84px] h-[28px] font-semibold text-[#D63C3C] rounded-lg">Скрыть</button>
                    <button class="bg-[#EEEEEE] w-[91px] h-[28px] font-semibold text-[#224C4F] rounded-lg" @click="$router.push('/client/memorial/1')">Открыть</button>
                </div>
            </div>
        </div>
    </NuxtLayout>
</template>

<style lang=scss scoped>

</style>