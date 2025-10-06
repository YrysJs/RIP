import { useNuxtApp } from '#app'

function getBurialRequests(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v8/burial-requests/my',
        params,
    })
}

function getBurialRequestById(id) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v8/burial-requests/${id}`,
    })
}

function getBurialRequestStatus(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PATCH',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v8/burial-requests/${data.id}/status`,
        data: {
            status: data.status,
            comment: data.comment,
        },
    })
}

function burialRequestComplete(id) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PUT',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v8/burial-requests/${id}/complete`,
        data: {
            "is_complete": true
        },
    })
}


export {
    getBurialRequests,
    getBurialRequestById,
    getBurialRequestStatus,
    burialRequestComplete
}
