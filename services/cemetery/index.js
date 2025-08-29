import { useNuxtApp } from '#app'

function getGraves(params) {
    const { $axios } = useNuxtApp()
    return $axios.get('https://194.32.140.103:8092/api/v1/graves', {
        params
    })
}


function getCemeteries(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'https://194.32.140.103:8092/api/v1/cemeteries',
        params,
    })
}

function getCemeteryById(id) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: `https://194.32.140.103:8092/api/v1/cemeteries/${id}`,
    })
}


export {
    getGraves,
    getCemeteries,
    getCemeteryById
}
