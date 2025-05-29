import { useNuxtApp } from '#app'


function getRequests(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8082/v1/request',
        params,
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI3Nzc3NzMxODI0MiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc0ODU1MTM0OCwiZXhwIjoxNzQ4NjM3NzQ4fQ.1QGP1qcCW7GBrgqXp-Mrp6BbZ9lsEA1LS6O4-gM1n-u--TguRlflu3KQtgEyPO5fRQrfjX04AyParFzjZ7K5mw'
        }
    })
}


export {
    getRequests,
}
