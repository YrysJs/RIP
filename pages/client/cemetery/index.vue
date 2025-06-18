<script setup>
import {getGraves, getCemeteries} from "~/services/cemetery"
import Map from '~/components/map/2GisMap.vue'
import MapSecond from '~/components/map/MapV2.vue'
import FormMap from "~/components/map/FormMap.vue";
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

const testLog = (str) => {
  alert(str)
}

onMounted(() => {
  console.log('asdas')
  getGraves().then((graves) => {
    console.log(graves)
  })
  getCemeteries().then((res) => {
    console.log(res)
    polygons.value = res
    console.log(polygons.value)
  })

})
</script>

<template>
  <div>
    asdasd
<!--    <MapSecond :polygons="polygons" />-->
    <FormMap @complete="testLog" />
  </div>
</template>

<style lang="scss" scoped>

</style>