<script setup>
import Login from '~/components/client/auth/login.vue';
import { useRouter } from "vue-router";
import MapSecond from "~/components/map/MapV2.vue";
import { useCemeteryStore } from '~/store/cemetery.js'

const router = useRouter()

const login = ref(false)

const selectedReligios = ref('Не выбрано')
const selectedCity = ref('')
const cityListState = ref(false)
const selectReligiosIndex = ref()

const cemeteryStore = useCemeteryStore()

const polygons = [
  {
    id: 1,
    cemetery_id: 1,
    sector_number: 1,
    grave_number: 1,
    status: "free",
    width: 1,
    height: 1,
    description: "string",
    notes: "string",
    polygon_data: {
      coordinates: [
        [
          76.81849753116644,
          43.22863096908046
        ],
        [
          76.81873342697706,
          43.228490923473494
        ],
        [
          76.81886827571084,
          43.2286179246775
        ],
        [
          76.81863237990022,
          43.22875797028447
        ],
        [
          76.81849753116644,
          43.22863096908046
        ]
      ],
      color: "string",
      stroke_width: 0,
      stroke_color: "string"
    },
    created_at: "2025-05-15T22:42:17.868456Z",
    updated_at: "2025-05-15T22:42:17.868456Z"
  },
  {
    id: 2,
    cemetery_id: 1,
    sector_number: 1,
    grave_number: 2,
    status: "free",
    width: 1,
    height: 1,
    description: "string",
    notes: "string",
    polygon_data: {
      coordinates: [
        [
          76.81875229864191,
          43.22847971982495
        ],
        [
          76.81898819445253,
          43.228339674217985
        ],
        [
          76.81912304318631,
          43.22846667542199
        ],
        [
          76.81888714737569,
          43.22860672102896
        ],
        [
          76.81875229864191,
          43.22847971982495
        ]
      ],
      color: "string",
      stroke_width: 0,
      stroke_color: "string"
    },
    created_at: "2025-05-15T22:42:42.964924Z",
    updated_at: "2025-05-15T22:42:42.964924Z"
  },
  {
    id: 3,
    cemetery_id: 1,
    sector_number: 1,
    grave_number: 3,
    status: "free",
    width: 1,
    height: 1,
    description: "string",
    notes: "string",
    polygon_data: {
      coordinates: [
        [
          76.8190070661174,
          43.228328470569444
        ],
        [
          76.81924296192801,
          43.228188424962475
        ],
        [
          76.81937781066179,
          43.22831542616648
        ],
        [
          76.81914191485117,
          43.22845547177345
        ],
        [
          76.8190070661174,
          43.228328470569444
        ]
      ],
      color: "string",
      stroke_width: 0,
      stroke_color: "string"
    },
    created_at: "2025-05-15T22:43:04.18814Z",
    updated_at: "2025-05-15T22:43:04.18814Z"
  }
]

const selected = ref(null)

const sities = [
    'Алматы',
    'Нур-Султан',
    'Шымкент',
    'Караганда',
    'Тараз',
    'Павлодар',
    'Усть-Каменогорск',
    'Семей',
    'Актобе',
    'Костанай',
    'Кызылорда',
    'Талдыкорган',
    'Тараз',
    'Павлодар',
    'Усть-Каменогорск',
    'Семей',
    'Актобе',
    'Костанай',
    'Кызылорда'
]
const religios = [
    'Ислам',
    'Христианство',
    'Иудаизм', 
    'Католицизм',
    'Буддизм'
]

const cemeteries = [
  {
    id: 1,
    name: "Кладбище дружба",
    description: "muslim",
    country: "Казахстан",
    city: "Алматы",
    street_name: "string",
    location_coords: [
      43.228737,
      76.818547
    ],
    polygon_data: {
      coordinates: [
        [
          76.814955,
          43.229526
        ],
        [
          76.816906,
          43.227977
        ],
        [
          76.819596,
          43.226554
        ],
        [
          76.820964,
          43.225587
        ],
        [
          76.821562,
          43.225741
        ],
        [
          76.820877,
          43.227161
        ],
        [
          76.818453,
          43.230305
        ],
        [
          76.817831,
          43.230164
        ],
        [
          76.81783,
          43.230164
        ],
        [
          76.815891,
          43.229788
        ],
        [
          76.815677,
          43.229746
        ],
        [
          76.814955,
          43.229526
        ]
      ],
      color: "string",
      width: 0
    },
    religion: "muslim",
    created_at: "2025-05-15T22:28:55.244237Z",
    updated_at: "2025-05-15T22:28:55.244237Z",
    status: "active",
    capacity: 19,
    free_spaces: 3
  }
]

const selectedCemetery = ref(cemeteries[0])

const islam = [
    {
        title: 'Северное кладбище',
        type: 'Мусульманское кладбище',
        address: '​Улица Сарсенбаева, 187, Алматы'
    },
    {
        title: 'Кен Сай 2',
        type: 'Мусульманское кладбище',
        address: '​Улица Сарсенбаева, 187, Алматы'
    },
    {
        title: 'Центральное кладбище',
        type: 'Мусульманское кладбище',
        address: '​Улица Сарсенбаева, 187, Алматы'
    },
]


const reserve = () => {
  login.value = true
  cemeteryStore.setSelected(selectedCemetery.value)
}

const pickCity = (item) => {
    selectedCity.value = item
    cityListState.value = false
}
</script>

<template>
   <Login v-if="login" @close="login = false"/>
    <div class="bg-[#FAFAFA] py-[24px] min-h-[100vh] rounded-lg flex gap-[24px]">
        <div class="bg-white p-[20px] max-w-[408px] w-full relative">
            <h3 class="text-2xl font-bold font-roboto text-[#222222]">Забронировать место</h3>
            <p class="text-[#222222]">0 результатов</p>

            <div class="flex justify-between items-center my-[24px]">
                <div class="flex justify-between items-center gap-[8px]">
                    <span class="text-base font-roboto text-[#222222]">Город:</span> <span class="text-base font-roboto text-[#224C4F]">{{ selectedCity }}</span>
                </div>
                <button class="bg-[#224C4F26] text-[#224C4F] font-bold font-roboto py-[8px] px-[12px] rounded-lg" @click="cityListState = true">Выбрать</button>
            </div>

            <div v-if="cityListState" class="absolute bg-white top-0 left-0 w-full p-[20px] flex flex-col gap-[8px]">
                <p v-for="item of sities" :key="item" class="text-base font-roboto text-[#222222]" @click="pickCity(item)">{{ item }}</p>
            </div>

            <select id="" v-model="selectedReligios" name="" placeholder="Религия" class="w-full border border-[#EEEEEE] rounded-lg py-[8px] px-[12px]">
                <option v-for="item of religios" :key="item" :value="item">{{ item }}</option>
            </select>

            <div class="flex flex-col gap-[24px] mt-[24px]">
                <div v-for="(item, index) of cemeteries" :key="item" class="flex justify-between items-center p-[20px]" :class="{ 'bg-[#224C4F26]' : selectedCemetery.id == item.id}" @click="selectedCemetery = item">
                    <div>
                        <h3 class="text-base font-medium font-roboto text-[#222222]">{{ item.name }}</h3>
                        <h4 class="text-sm font-normal text-[#939393]">{{ item.religion }}</h4>
                        <p class="text-sm font-normal text-[#222222]">{{ item.country }} {{ item.city }}</p>
                    </div>
                    <div class="flex flex-col gap-[14px] justify-end items-end">
                        <img class="w-[24px]" src="/icons/map-pin.svg" alt="">
                        <p class="text-sm font-normal text-[#222222]">4.67km</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="w-full">
            <div class="w-full h-[60vh] rounded-xl overflow-hidden">
              <MapSecond :polygons="polygons" v-model="selected" />
            </div>
            <div class="bg-[#FFF] p-[24px] mt-[24px] rounded-lg">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-medium font-roboto text-[#222222]">{{selectedCemetery.name}}</h3>
                    <div class="flex gap-[12px] items-center">
                        <div class="flex gap-[8px] items-center">
                            <div class="w-[36px] h-[16px] rounded-sm bg-[#43DC4966] border-2 border-[#43DC49]"></div>
                            <p class="font-roboto text-sm">Сводобные места</p>
                        </div>
                        <div class="flex gap-[8px] items-center">
                            <div class="w-[36px] h-[16px] rounded-sm bg-[#DCBA4366] border-2 border-[#DCBA43]"></div>
                            <p class="font-roboto text-sm">Сводобные места</p>
                        </div>
                        <div class="flex gap-[8px] items-center">
                            <div class="w-[36px] h-[16px] rounded-sm bg-[#93939366] border-2 border-[#939393]"></div>
                            <p class="font-roboto text-sm">Сводобные места</p>
                        </div>
                    </div>
                </div>
                <p class="text-[#939393] font-roboto text-sm mt-[4px] mb-[8px]">{{selectedCemetery.religion}}</p>
                <div class="flex gap-[24px] items-center text-[#222222]">
                    <div class="flex gap-[8px] items-center">
                        <img src="/icons/geo-icon.svg" alt=""> <span class="text-sm font-roboto">Улица Бейсебаева, 148, Алматы (4,6 км от вас)</span>
                    </div>
                    <div class="flex gap-[8px] items-center">
                        <img src="/icons/phone.svg" alt=""> <span class="text-sm font-roboto">+7 777 777 77 77</span>
                    </div>
                </div>
                <div class="flex gap-[24px] mt-[16px] mb-[32px]">
                    <span class="text-base font-medium font-roboto">Вместимость: 55 000</span>
                    <span class="text-base font-medium font-roboto">Cвободных мест: 29 750</span>
                </div>
                <p class="text-base font-roboto text-[#222222]">
                    Крупнейшее кладбище города с общей площадью 20 га. На территории расположены мемориальные зоны, посвященные жертвам войны, и семейные участки. Здесь похоронены несколько известных деятелей культуры и науки.Услуги: организация похорон, аренда мест, благоустройство.
                </p>
            </div>
            <div class="bg-[#FFF] p-[24px] mt-[24px] rounded-lg">
                <div class="flex justify-between items-center">
                    <h3 class="text-2xl font-medium font-roboto text-[#222222]">{{selectedCemetery.name}}</h3>
                    <div class="flex gap-[34px] items-center">
                        <button class="flex items-center gap-[8px] text-base font-medium font-roboto text-[#222222]">
                            <img src="/icons/share.svg" alt=""> Отправить
                        </button>
                        <button class="w-[90px] h-[50px] border-2 border-[#224C4F] rounded-lg bg-[#fff] text-[#224C4F] font-roboto text-base font-medium">
                            Отмена
                        </button>
                        <button class="w-[257px] h-[50px] border-2 border-[#224C4F] rounded-lg bg-[#224C4F] text-[#fff] font-roboto text-base font-medium" @click="reserve">
                          Забронировать место
                        </button>
                    </div>
                </div>
                <p class="text-[#939393] font-roboto text-sm mt-[4px] mb-[8px]">{{selectedCemetery.religion}}</p>
                <div class="flex gap-[24px] items-center text-[#222222]">
                    <div class="flex gap-[8px] items-center">
                        <img src="/icons/geo-icon.svg" alt=""> <span class="text-sm font-roboto">Улица Бейсебаева, 148, Алматы (4,6 км от вас)</span>
                    </div>
                    <div class="flex gap-[8px] items-center">
                        <img src="/icons/phone.svg" alt=""> <span class="text-sm font-roboto">+7 777 777 77 77</span>
                    </div>
                </div>
                <div class="flex gap-[24px] mt-[16px] mb-[32px]">
                    <span class="text-base font-medium font-roboto">Вместимость: 55 000</span>
                    <span class="text-base font-medium font-roboto">Cвободных мест: 29 750</span>
                </div>
                <p class="text-base font-roboto text-[#222222]">
                    Крупнейшее кладбище города с общей площадью 20 га. На территории расположены мемориальные зоны, посвященные жертвам войны, и семейные участки. Здесь похоронены несколько известных деятелей культуры и науки.Услуги: организация похорон, аренда мест, благоустройство.
                </p>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>

</style>