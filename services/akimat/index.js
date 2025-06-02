import { useNuxtApp } from '#app'


function getRequests(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8081/rip-government/v1/request',
        params,
    })
}


export {
    getRequests,
}
