import { useNuxtApp } from '#app'

function getBurialRequests(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8092/api/v1/burial-requests',
        params,
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4NDc3NTYzMzAsInJvbGUiOiJjZW1ldGVyeV9tYW5hZ2VyIiwic3ViIjoiNzc3NzczMTgyNDMifQ.nRLOpu4ywdPHL7sHjGWCprEMt6PtwHVBltNQSNNDa0c'
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
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4NDc3NTYzMzAsInJvbGUiOiJjZW1ldGVyeV9tYW5hZ2VyIiwic3ViIjoiNzc3NzczMTgyNDMifQ.nRLOpu4ywdPHL7sHjGWCprEMt6PtwHVBltNQSNNDa0c'
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
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4NDc3NTYzMzAsInJvbGUiOiJjZW1ldGVyeV9tYW5hZ2VyIiwic3ViIjoiNzc3NzczMTgyNDMifQ.nRLOpu4ywdPHL7sHjGWCprEMt6PtwHVBltNQSNNDa0c'
        }
    })
}


export {
    getBurialRequests,
    getBurialRequestById,
    getBurialRequestStatus
}
