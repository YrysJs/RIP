import { useNuxtApp } from '#app'


function getRequests(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8081/rip-government/v1/request',
        params,
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI3NzA1NzI5NTA1OSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc0ODc3NjMzNSwiZXhwIjoxNzQ4ODYyNzM1fQ.1A2BgGAczacXX2zCe_sNoi7RYdbjInfdzimGKrvv-yShPvfBYdJskGJbgwxqvGbVg8M-dEDCVeQG6QZP6GNkXQ'

        }
    })
}


export {
    getRequests,
}
