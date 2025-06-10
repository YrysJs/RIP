import { useNuxtApp } from '#app'

function getNotifications(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8092/api/v1/notifications',
        params,
    })
}

export {
    getNotifications
}
