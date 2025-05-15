import { useNuxtApp } from '#app'

function getGraves(params) {
    const { $axios } = useNuxtApp()
    return $axios.get('/api/v1/graves', {
        params
    })
}


function getCemeteries(params) {
    const { $axios } = useNuxtApp()
    return $axios.get('/api/v1/cemeteries', {
        params
    })
}


export {
    getGraves,
    getCemeteries
}
