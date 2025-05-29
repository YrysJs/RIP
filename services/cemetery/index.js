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
            'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI3Nzc3NzMxODI0MiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc0ODU1MTc4NywiZXhwIjoxNzQ4NjM4MTg3fQ.pbhSsgiWvlgUWihkyVIWHPLIWltZBS4wBpAKVZ8ogbddT-xHP3jXGsdeBrXZ7CAFEedKxmqLAI4gZnrhKO13wQ'
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
            'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI3Nzc3NzMxODI0MiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc0ODU1MTc4NywiZXhwIjoxNzQ4NjM4MTg3fQ.pbhSsgiWvlgUWihkyVIWHPLIWltZBS4wBpAKVZ8ogbddT-xHP3jXGsdeBrXZ7CAFEedKxmqLAI4gZnrhKO13wQ'
        }
    })
}


export {
    getGraves,
    getCemeteries,
    getCemeteryById
}
