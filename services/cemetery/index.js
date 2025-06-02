import { useNuxtApp } from '#app'

function getGraves(params) {
    const { $axios } = useNuxtApp()
    return $axios.get('/api/v1/graves', {
        params
    })
}


function getCemeteries(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8092/api/v1/cemeteries',
        params,
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI3Nzc3NzMxODI0MiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc0ODg2NjM5MywiZXhwIjoxNzQ4OTUyNzkzfQ.kHADa28FVctH5nwSu8cjEpTWcY6WpFMy1Tg66Qkd0ub0mbIkTFIf2xWbnk2XVDKFVsBlzuomSvqF2FepiNj9Ag'
        }
    })
}

function getCemeteryById(id) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: `http://194.32.140.209:8092/api/v1/cemeteries/${id}`,
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI3Nzc3NzMxODI0MiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc0ODY0MDA2MCwiZXhwIjoxNzQ4NzI2NDYwfQ.SNW4IGu1vEAVdheIu2BnNYFNqCk_sCnASLjEylJ736tmwdYjgltOOU9QK6Uf96RZcFOAA5VqMOydDe7hn7kg4w'
        }
    })
}


export {
    getGraves,
    getCemeteries,
    getCemeteryById
}
