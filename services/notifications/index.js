import { useNuxtApp } from '#app'

function getNotifications(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v10/my/notifications?channel=push',
        params,
    })
}

function markAsRead(notificationId) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v10/my/notifications/${notificationId}/read`
    })
}

function markAsReadAll() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v10/my/notifications/read-all',
    })
}

function getUnreadNotifications() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v10/my/notifications/unread',
    })
}

export {
    getNotifications,
    markAsReadAll,
    markAsRead,
    getUnreadNotifications
}
