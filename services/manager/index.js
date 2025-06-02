import { useNuxtApp } from '#app'

function getBurialRequests(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8092/api/v1/burial-requests',
        params,
        headers: {
            'accept': 'application/json',
        }
    })
}

function getBurialRequestById(id) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: `http://194.32.140.209:8092/api/v1/burial-requests/${id}`,
        headers: {
            'accept': 'application/json',
        }
    })
}

function getBurialRequestStatus(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PATCH',
        url: `http://194.32.140.209:8092/api/v1/burial-requests/${data.id}/status`,
        data: {
            status: data.status
        },
        headers: {
            'accept': 'application/json',
        }
    })
}


export {
    getBurialRequests,
    getBurialRequestById,
    getBurialRequestStatus
}
