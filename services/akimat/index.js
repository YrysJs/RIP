import { useNuxtApp } from '#app'


function getRequests(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97:8081/rip-government/v1/request',
        params,
    })
}

function getAppeals(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97:8081/rip-government/v1/appeal',
        params,
    })
}


function getRequestsStats(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97:8081/rip-government/v1/request/stats',
        params,
    })
}

function getTypes() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97:8081/rip-government/v1/request/types',
    })
}

function getStatuses() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97:8081/rip-government/v1/request/status',
    })
}

function getComments(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97:8081/rip-government/v1/request/comments',
        params
    })
}

function exportRequestsReport(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97:8081/rip-government/v1/request/export',
        params
    })
}


function exportAppealsReport(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97:8081/rip-government/v1/appeal/export',
        params
    })
}

function getAppealComment(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97:8081/rip-government/v1/appeal/comments',
        params
    })
}

function getNews(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97:8081/rip-government/v1/news',
        params,
    })
}

function getNewsStats(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97:8081/rip-government/v1/news/stats',
        params,
    })
}

function changeNewsStatus(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PATCH',
        url: `http://91.147.92.97:8081/rip-government/v1/news/status`,
        data,
    })
}

function createNews(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PUT',
        url: `http://91.147.92.97:8081/rip-government/v1/news`,
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
    getAppealComment
}
