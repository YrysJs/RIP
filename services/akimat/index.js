import { useNuxtApp } from '#app'


function getRequests(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'https://ripservice.kz/api/v3/rip-government/v1/request',
        params,
    })
}

function getAppeals(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'https://ripservice.kz/api/v3/rip-government/v1/appeal',
        params,
    })
}

function getMyRequests(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'https://ripservice.kz/api/v3/rip-government/v1/request/my',
        params,
    })
}

function getMyAppeals(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'https://ripservice.kz/api/v3/rip-government/v1/appeal/my',
        params,
    })
}


function getRequestsStats(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'https://ripservice.kz/api/v3/rip-government/v1/request/stats',
        params,
    })
}

function getTypes() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'https://ripservice.kz/api/v3/rip-government/v1/request/types',
    })
}

function getStatuses() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'https://ripservice.kz/api/v3/rip-government/v1/request/statuses',
    })
}

function getComments(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'https://ripservice.kz/api/v3/rip-government/v1/request/comments',
        params
    })
}

function exportRequestsReport(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'https://ripservice.kz/api/v3/rip-government/v1/request/export',
        params
    })
}


function exportAppealsReport(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'https://ripservice.kz/api/v3/rip-government/v1/appeal/export',
        params
    })
}

function getAppealComment(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'https://ripservice.kz/api/v3/rip-government/v1/appeal/comments',
        params
    })
}

function getNews(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'https://ripservice.kz/api/v3/rip-government/v1/news',
        params,
    })
}

function getNewsStats(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'https://ripservice.kz/api/v3/rip-government/v1/news/stats',
        params,
    })
}

function changeNewsStatus(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PATCH',
        url: `https://ripservice.kz/api/v3/rip-government/v1/news/status`,
        data,
    })
}

function createNews(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PUT',
        url: `https://ripservice.kz/api/v3/rip-government/v1/news`,
        data,
    })
}

function getBurialRequestStats(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'https://ripservice.kz/api/v1/admin/statistics/burial-requests',
        params,
    })
}

function setAkimatFile(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: 'https://ripservice.kz/api/v7/akimat/files',
        data
    })
}

function setRequestResponsible(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PATCH',
        url: `https://ripservice.kz/api/v3/rip-government/v1/request/responsible`,
        data,
    })
}

export {
    getRequests,
    createNews,
    getNews,
    getNewsStats,
    changeNewsStatus,
    getRequestsStats,
    getTypes,
    getStatuses,
    getComments,
    exportRequestsReport,
    getAppeals,
    exportAppealsReport,
    getAppealComment,
    getBurialRequestStats,
    setAkimatFile,
    setRequestResponsible,
    getMyRequests,
    getMyAppeals
}
