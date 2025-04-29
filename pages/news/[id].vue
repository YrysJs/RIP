<script setup>
import { useRouter } from 'vue-router';

const router = useRouter()

function goBack() {
    router.go(-1)
}
</script>

<template>
    <div class="container py-[80px]">
        <button class="flex gap-[15px] items-center text-sm font-semibold" @click="goBack">
            <img src="/icons/back-icon-blue.svg" alt=""> Назад
        </button>

        <div class="flex justify-between items-start gap-[24px] mt-[24px]">
            <div class="max-w-[876px]">
                <div class="flex gap-[10px] items-center">
                    <div class="bg-[#224C4F26] text-[#4E4E4E] text-xs py-[2px] px-[6px] w-fit">Перезахоронение</div>
                    <div class="bg-[#224C4F26] text-[#4E4E4E] text-xs py-[2px] px-[6px] w-fit">15 мая 2025, 09:45</div>
                </div>

                <h1 class="text-4xl text-[#333333] font-medium font-roboto pt-[4px] pb-[27px]">
                    Правила захоронения на кладбищах изменили в Казахстане
                </h1>

                <img class="rounded-lg h-[475px] w-full object-cover overflow-hidden" src="/images/client/banner.jpg" alt="image">

                <h3 class="text-2xl text-[#333333] font-medium font-roboto py-[27px]">
                    Заместитель премьер-министра-министра национальной экономики приказом от 23 февраля 2024 года внес изменения в Типовые правила погребения и организации дела по уходу за могилами
                </h3>

                <p class="text-base text-[#333333] font-normal font-roboto">
                    При этом уточнено, что заключение договора на погребение, содержание и обслуживание кладбищ между местным исполнительным органом города республиканского значения, столицы, районного (города областного значения) и администрацией кладбища осуществляется по итогам конкурса в срок, установленный в соответствии с законодательством о государственных закупках. Напомним, согласно правилам, заказчик должен направить проект договора победителю в течение 5 рабочих дней со дня истечения срока на обжалование протокола об итогах государственных закупок способом конкурса. Победитель удостоверяет проект посредством своей ЭЦП в течение 3 рабочих дней со дня поступления на веб-портале уведомления
                    Добавлена новая норма, в соответствии с которой определение принципов проектирования и рекомендации к содержанию кладбищ, к порядку организации похоронного дела, похоронного обряда (обряда захоронения останков или праха человека), а также содержания мест захоронения и работы специализированных служб по вопросам похоронного дела в Республике Казахстан определяются "Сводом правил Республики Казахстан "Проектирование и содержание кладбищ" (СП РК3.02-141-2014).


                    Помимо этого, поправками уточнена процедура перезахоронения. Перезахоронение останков допускается только при отсутствии особо опасных инфекционных заболеваний (сибирская язва, конго-крымская геморрагическая лихорадка) у умерших людей в течение двух первых недель с момента погребения, в последующем не ранее трех лет, в песчаных грунтах не ранее одного года по согласованию государственного органа в сфере санитарно-эпидемиологического благополучия населения.
                </p>
            </div>
            <div class="pt-[100px]">
                <h3 class="text-base text-[#333333] font-semibold font-roboto pb-[17px]">Может быть интересно:</h3>
                <div class="flex flex-col gap-[12px]">
                    <nuxt-link to="/" class="p-[12px] rounded-lg bg-[#E9EDED] flex flex-col">
                        <div class="bg-[#224C4F26] text-[#4E4E4E] text-xs py-[2px] px-[6px] w-fit">Перезахоронение</div>
                        <h3 class="text-sm text-[#333333] font-medium font-roboto py-[10px]">Этот закон вступает в силу с первого числа июля текущего года...</h3>
                        <p class="text-sm text-[#333333] font-medium font-roboto">15 мая 2025, 09:45</p>
                    </nuxt-link>
                    <nuxt-link to="/" class="p-[12px] rounded-lg bg-[#E9EDED] flex flex-col">
                        <div class="bg-[#224C4F26] text-[#4E4E4E] text-xs py-[2px] px-[6px] w-fit">Перезахоронение</div>
                        <h3 class="text-sm text-[#333333] font-medium font-roboto py-[10px]">Этот закон вступает в силу с первого числа июля текущего года...</h3>
                        <p class="text-sm text-[#333333] font-medium font-roboto">15 мая 2025, 09:45</p>
                    </nuxt-link>
                    <nuxt-link to="/" class="p-[12px] rounded-lg bg-[#E9EDED] flex flex-col">
                        <div class="bg-[#224C4F26] text-[#4E4E4E] text-xs py-[2px] px-[6px] w-fit">Перезахоронение</div>
                        <h3 class="text-sm text-[#333333] font-medium font-roboto py-[10px]">Этот закон вступает в силу с первого числа июля текущего года...</h3>
                        <p class="text-sm text-[#333333] font-medium font-roboto">15 мая 2025, 09:45</p>
                    </nuxt-link>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="css" scoped>
.container {
    max-width: 1200px;
    width: 100%;
    margin: auto;
}
.card {
    box-shadow: 0px 4px 10px -5px #000;
}
</style>