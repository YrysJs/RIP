import { useNuxtApp } from '#app'

function getBurialRequests(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8092/api/v1/burial-requests',
        params,
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI3Nzc3NzMxODI0MiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc0ODY0MDA2MCwiZXhwIjoxNzQ4NzI2NDYwfQ.SNW4IGu1vEAVdheIu2BnNYFNqCk_sCnASLjEylJ736tmwdYjgltOOU9QK6Uf96RZcFOAA5VqMOydDe7hn7kg4w'
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
            'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI3Nzc3NzMxODI0MiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc0ODY0MDA2MCwiZXhwIjoxNzQ4NzI2NDYwfQ.SNW4IGu1vEAVdheIu2BnNYFNqCk_sCnASLjEylJ736tmwdYjgltOOU9QK6Uf96RZcFOAA5VqMOydDe7hn7kg4w'
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
            'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI3Nzc3NzMxODI0MiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc0ODY0MDA2MCwiZXhwIjoxNzQ4NzI2NDYwfQ.SNW4IGu1vEAVdheIu2BnNYFNqCk_sCnASLjEylJ736tmwdYjgltOOU9QK6Uf96RZcFOAA5VqMOydDe7hn7kg4w'
        }
    })
}


export {
    getBurialRequests,
    getBurialRequestById,
    getBurialRequestStatus
}
