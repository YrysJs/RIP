import { useNuxtApp } from '#app'

function getBurialRequests(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97/api/v1/burial-requests',
        params,
    })
}

function getBurialRequestById(id) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: `http://91.147.92.97/api/v1/burial-requests/${id}`,
    })
}

function getBurialRequestStatus(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PATCH',
        url: `http://91.147.92.97/api/v1/burial-requests/${data.id}/status`,
        data: {
            status: data.status,
            comment: data.comment,
        },
    })
}


export {
    getBurialRequests,
    getBurialRequestById,
    getBurialRequestStatus
}
