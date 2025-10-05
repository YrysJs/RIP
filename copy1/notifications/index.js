import { useNuxtApp } from '#app'

function getNotifications(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.103:8096/api/v1/my/notifications',
        params,
    })
}

function markAsRead(notificationId) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: `http://91.147.92.97:8096/api/v1/my/notifications/${notificationId}/read`
    })
}

function markAsReadAll() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: 'http://91.147.92.97:8096/api/v1/my/notifications/read-all',
    })
}

function getUnreadNotifications() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.103:8096/api/v1/my/notifications/unread',
    })
}

export {
    getNotifications,
    markAsReadAll,
    markAsRead,
    getUnreadNotifications
}
