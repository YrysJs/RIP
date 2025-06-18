import { useNuxtApp } from '#app'

function getNotifications(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97:8092/api/v1/notifications',
        params,
    })
}

export {
    getNotifications
}
