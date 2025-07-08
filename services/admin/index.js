import { useNuxtApp } from '#app'


function getTemplate() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'https://ripservice.kz/api/v1/admin/graves/template-xlsx/download',
        responseType: 'blob',
    })
}

function CreateCemetery(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: 'https://ripservice.kz/api/v1/admin/cemeteries',
        data
    })
}

function UpdateCemetery(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PUT',
        url: 'https://ripservice.kz/api/v1/admin/cemeteries/' + data.id,
        data
    })
}

function CreateAkimat(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PUT',
        url: 'http://91.147.92.97:8081/rip-government/v1/akimat',
        data
    })
}

function getAkimats() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'https://ripservice.kz/api/v3/rip-government/v1/akimats',
    })
}

function importXlsx(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: 'https://ripservice.kz/api/v1/admin/graves/import-xlsx',
        data
    })
}

function getManagers(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'https://ripservice.kz/api/v1/admin/cemetery-managers/all',
        params,
    })
}

function setCemeteryManager(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: `https://ripservice.kz/api/v1/admin/cemeteries/${data.id}/managers`,
        data
    })
}

function getReviews() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'https://ripservice.kz/api/v1/moderation/reviews'
    })
}

function moderateReview(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PATCH',
        url: `https://ripservice.kz/api/v1/moderation/reviews/${data.id}`,
        data: data.data
    })
}

function getModerateAppeals(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'https://ripservice.kz/api/v1/moderation/appeals',
        params
    })
}

function moderateAppeal(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PATCH',
        url: `https://ripservice.kz/api/v1/moderation/appeals/${data.id}`,
        data: data.data
    })
}

function getReviewById(id) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: `https://ripservice.kz/api/v1/reviews/${id}`
    })
}

function getProducts(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'https://ripservice.kz/api/v1/products',
        params,
    })
}

function updateProductStatus(id, data) {
    const { $axios } = useNuxtApp()
    
    if (!id) {
        throw new Error('Product ID is required')
    }
    
    return $axios({
        method: 'PATCH',
        url: `https://ripservice.kz/api/v1/products/${id}/status`,
        data,
    })
}

export {
    getTemplate,
    CreateCemetery,
    importXlsx,
    UpdateCemetery,
    getAkimats,
    CreateAkimat,
    getManagers,
    setCemeteryManager,
    getReviews,
    moderateReview,
    getModerateAppeals,
    moderateAppeal,
    getReviewById,
    getProducts,
    updateProductStatus
}
