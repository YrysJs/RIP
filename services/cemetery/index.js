import { useNuxtApp } from '#app'

function getGraves(params) {
    const { $axios } = useNuxtApp()
    return $axios.get('/api/v1/graves', {
        params
    })
}


function getCemeteries(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97:8092/api/v1/cemeteries',
        params,
    })
}

function getCemeteryById(id) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: `http://91.147.92.97:8092/api/v1/cemeteries/${id}`,
    })
}


export {
    getGraves,
    getCemeteries,
    getCemeteryById
}
