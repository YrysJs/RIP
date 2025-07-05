import { useNuxtApp } from '#app'

function getNotifications(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'https://ripservice.kz/api/v1/user-notifications',
        params,
    })
}

export {
    getNotifications
}
