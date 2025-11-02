import { useNuxtApp } from '#app'

function getGraves(params) {
    const { $axios } = useNuxtApp()
    return $axios.get(useRuntimeConfig().public.apiBaseUrl + '/api/v1/graves', {
        params
    })
}

function getManagerCemeteries(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v1/manager/cemeteries',
        params,
    })
}


function getCemeteries(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v1/cemeteries',
        params,
    })
}

function getCemeteryById(id) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v1/cemeteries/${id}`,
    })
}

function getGravesByCoords(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v1/graves/by-coordinates`,
        params
    })
}


export {
    getGraves,
    getCemeteries,
    getCemeteryById,
    getManagerCemeteries,
    getGravesByCoords
}
