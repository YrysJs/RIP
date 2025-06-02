import { useNuxtApp } from '#app'


function getRequests(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8082/v1/request',
        params,
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI3Nzc3NzMxODI0MiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc0ODY5NTU4NSwiZXhwIjoxNzQ4NzgxOTg1fQ.eXvXUdYmxVBBW9AUyWJTRnRAyhoaYkcIrcBJdKVSfUT59QCv1ieztjQENS7GherryhnmBoE6wYedsmNV9skrGg'
        }
    })
}


export {
    getRequests,
}
