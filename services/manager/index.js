import { useNuxtApp } from '#app'

function getBurialRequests(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8092/api/v1/burial-requests',
        params,
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI3Nzc3NzMxODI0MiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc0ODU1MTc4NywiZXhwIjoxNzQ4NjM4MTg3fQ.pbhSsgiWvlgUWihkyVIWHPLIWltZBS4wBpAKVZ8ogbddT-xHP3jXGsdeBrXZ7CAFEedKxmqLAI4gZnrhKO13wQ'
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
            'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI3Nzc3NzMxODI0MiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc0ODU1MTc4NywiZXhwIjoxNzQ4NjM4MTg3fQ.pbhSsgiWvlgUWihkyVIWHPLIWltZBS4wBpAKVZ8ogbddT-xHP3jXGsdeBrXZ7CAFEedKxmqLAI4gZnrhKO13wQ'
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
            'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI3Nzc3NzMxODI0MiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc0ODU1MTc4NywiZXhwIjoxNzQ4NjM4MTg3fQ.pbhSsgiWvlgUWihkyVIWHPLIWltZBS4wBpAKVZ8ogbddT-xHP3jXGsdeBrXZ7CAFEedKxmqLAI4gZnrhKO13wQ'
        }
    })
}


export {
    getBurialRequests,
    getBurialRequestById,
    getBurialRequestStatus
}
