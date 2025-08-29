import { useNuxtApp } from '#app'

function getNotifications(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.103:8090/api/v1/user-notifications',
        params,
    })
}

export {
    getNotifications
}
