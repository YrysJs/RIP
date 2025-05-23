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
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4NDc3NTYzMzAsInJvbGUiOiJjZW1ldGVyeV9tYW5hZ2VyIiwic3ViIjoiNzc3NzczMTgyNDMifQ.nRLOpu4ywdPHL7sHjGWCprEMt6PtwHVBltNQSNNDa0c'
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
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4NDc3NTYzMzAsInJvbGUiOiJjZW1ldGVyeV9tYW5hZ2VyIiwic3ViIjoiNzc3NzczMTgyNDMifQ.nRLOpu4ywdPHL7sHjGWCprEMt6PtwHVBltNQSNNDa0c'
        }
    })
}


export {
    getGraves,
    getCemeteries,
    getCemeteryById
}
