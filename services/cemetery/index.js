import { useNuxtApp } from '#app'

function getGraves(params) {
    const { $axios } = useNuxtApp()
    return $axios.get('http://194.32.140.103:8092/api/v1/graves', {
        params
    })
}


function getCemeteries(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.103:8092/api/v1/cemeteries',
        params,
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

function getCemeteryById(id) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: `http://194.32.140.103:8092/api/v1/cemeteries/${id}`,
    })
}


export {
    getGraves,
    getCemeteries,
    getCemeteryById,
    getManagerCemeteries
}
