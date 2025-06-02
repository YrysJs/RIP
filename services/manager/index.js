import { useNuxtApp } from '#app'

function getBurialRequests(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8092/api/v1/burial-requests',
        params,
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI3Nzc3NzMxODI0MiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc0ODg2NjM5MywiZXhwIjoxNzQ4OTUyNzkzfQ.kHADa28FVctH5nwSu8cjEpTWcY6WpFMy1Tg66Qkd0ub0mbIkTFIf2xWbnk2XVDKFVsBlzuomSvqF2FepiNj9Ag'
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
            'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI3Nzc3NzMxODI0MiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc0ODgzNzk5NSwiZXhwIjoxNzQ4OTI0Mzk1fQ.nFXyEAwHxle1q8bqLUkjlwF7c9pfY7soI7KfsSNFDeKXgb_VF8A4leiVBZvafAv39rUnsntLXj2-G9QcSS-bLw'
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
            'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI3Nzc3NzMxODI0MiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc0ODgzNzk5NSwiZXhwIjoxNzQ4OTI0Mzk1fQ.nFXyEAwHxle1q8bqLUkjlwF7c9pfY7soI7KfsSNFDeKXgb_VF8A4leiVBZvafAv39rUnsntLXj2-G9QcSS-bLw'
        }
    })
}


export {
    getBurialRequests,
    getBurialRequestById,
    getBurialRequestStatus
}
