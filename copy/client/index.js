import { useNuxtApp } from '#app'

function getAppeals(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v3/rip-government/v1/appeal',
        params,
    })
}

function getMyAppeals(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v3/rip-government/v1/appeal/my',
        params,
    })
}

function createAppeal(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PUT',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v3/rip-government/v1/appeal',
        data,
    })
}

function createRequest(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PUT',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v3/rip-government/v1/request',
        data,
    })
}

function processCardPayment(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v1/payments/card',
        data
    })
}

function getProducts(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v1/products',
        params,
    })
}

function getProductById(id) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v1/products/${id}`,
    })
}

function getProductReviews(productId, params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v1/reviews/products/${productId}`,
        params,
    })
}

function getProviderReviews(providerId, params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v1/reviews/providers/${providerId}`,
        params,
    })
}

function getGraves(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v1/graves',
        params,
    })
}

function getGraveById(id) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v1/graves/${id}`,
    })
}

function getGraveImages(id) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v1/graves/${id}/photos`,
    })
}

function createDeceased(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v9/deceased',
        data,
    })
}

function getDeceasedById(id) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v9/deceased/${id}`,
    })
}

function getCart() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v1/cart',
    })
}

function addToCart(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v1/cart',
        data,
    })
}

function removeFromCart(productId) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'DELETE',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v1/cart/${productId}`,
    })
}

function updateCartCount(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PATCH',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v1/cart/${data.id}`,
        data: data.data
    })
}

function clearCart() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'DELETE',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v1/cart',
    })
}

function getOrders(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v1/orders',
        params,
    })
}

function getBurialRequests(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v8/burial-requests/my',
        params,
    })
}

function getBurialRequestById(id) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v8/burial-requests/${id}`,
    })
}

function updateBurialRequestStatus(requestId, data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PATCH',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v8/burial-requests/${requestId}/status`,
        data,
    })
}

function updateBurialRequestData(requestId, data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PUT',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v8/burial-requests/${requestId}`,
        data,
    })
}

function uploadBurialRequestDocument(requestId, document) {
    const { $axios } = useNuxtApp()
    
    const formData = new FormData()
    formData.append('document', document)
    
    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v8/burial-requests/${requestId}/document`,
        data: formData,
    })
}

function uploadDeceasedDeathCertificate(deceasedId, certificate) {
    const { $axios } = useNuxtApp()

    const formData = new FormData()
    // API ожидает массив файлов, поэтому добавляем файл с индексом
    formData.append('files', certificate)

    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v7/deceased/death_certificate/${deceasedId}`,
        data: formData,
    })
}

function createBurialRequest(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v8/burial-requests',
        data,
    })
}

function createOrder(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v1/orders',
        data,
    })
}

function postReview(data) {
    const { $axios } = useNuxtApp()
    
    const formData = new FormData()
    
    if (data.provider_id) formData.append('provider_id', data.provider_id)
    if (data.product_id) formData.append('product_id', data.product_id)
    if (data.rating) formData.append('rating', data.rating)
    if (data.comment) formData.append('comment', data.comment)
    
    if (data.images) {
        if (Array.isArray(data.images)) {
            data.images.forEach(image => formData.append('images', image))
        } else {
            formData.append('images', data.images)
        }
    }
    
    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v1/reviews',
        data: formData,
    })
}

function createProductReview(data) {
    const { $axios } = useNuxtApp()
    
    const formData = new FormData()
    
    if (data.supplier_phone) formData.append('supplier_phone', data.supplier_phone)
    if (data.product_id) formData.append('product_id', data.product_id)
    if (data.rating) formData.append('rating', data.rating)
    if (data.comment) formData.append('comment', data.comment)
    
    if (data.images) {
        if (Array.isArray(data.images)) {
            data.images.forEach(image => formData.append('images', image))
        } else {
            formData.append('images', data.images)
        }
    }
    
    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v1/reviews/products',
        data: formData,
    })
}

function getMemorials(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v1/memorials',
        params,
    })
}

function searchDeceased(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v9/search-requests',
        data,
    })
}

function createMemorial(data) {
    const { $axios } = useNuxtApp()
    
    const formData = new FormData()
    
    if (data.deceased_id) formData.append('deceased_id', data.deceased_id)
    if (data.epitaph) formData.append('epitaph', data.epitaph)
    if (data.about_person) formData.append('about_person', data.about_person)
    if (data.is_public !== undefined) formData.append('is_public', data.is_public)
    
    if (data.photos) {
        if (Array.isArray(data.photos)) {
            data.photos.forEach(photo => formData.append('photos', photo))
        } else {
            formData.append('photos', data.photos)
        }
    }
    
    if (data.achievements) {
        if (Array.isArray(data.achievements)) {
            data.achievements.forEach(achievement => formData.append('achievements', achievement))
        } else {
            formData.append('achievements', data.achievements)
        }
    }
    
    if (data.video_urls) {
        if (Array.isArray(data.video_urls)) {
            data.video_urls.forEach(url => formData.append('video_urls', url))
        } else {
            formData.append('video_urls', data.video_urls)
        }
    }
    
    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v1/memorials',
        data: formData,
    })
}

function updateMemorial(id, data) {
    const { $axios } = useNuxtApp()

    // Всегда используем FormData
    const formData = new FormData()

    if (data.deceased_id) formData.append('deceased_id', data.deceased_id)
    if (data.epitaph) formData.append('epitaph', data.epitaph)
    if (data.about_person) formData.append('about_person', data.about_person)
    if (data.is_public !== undefined) formData.append('is_public', data.is_public)

    if (data.photos) {
        if (Array.isArray(data.photos)) {
            data.photos.forEach(photo => formData.append('photos', photo))
        } else {
            formData.append('photos', data.photos)
        }
    }

    if (data.achievements) {
        if (Array.isArray(data.achievements)) {
            data.achievements.forEach(achievement => formData.append('achievements', achievement))
        } else {
            formData.append('achievements', data.achievements)
        }
    }

    if (data.video_urls) {
        if (Array.isArray(data.video_urls)) {
            data.video_urls.forEach(url => formData.append('video_urls', url))
        } else {
            formData.append('video_urls', data.video_urls)
        }
    }

    return $axios({
        method: 'PUT',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v1/memorials/' + data.id,
        data: formData,
    })
}


function getMemorialById(id) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v1/memorials/${id}`,
    })
}

export {
    processCardPayment,
    getProducts,
    getProductById,
    getProductReviews,
    getProviderReviews,
    getGraves,
    getGraveById,
    createDeceased,
    getDeceasedById,
    getCart,
    addToCart,
    removeFromCart,
    clearCart,
    getOrders,
    getBurialRequests,
    getBurialRequestById,
    updateBurialRequestStatus,
    updateBurialRequestData,
    uploadBurialRequestDocument,
    uploadDeceasedDeathCertificate,
    createBurialRequest,
    createOrder,
    postReview,
    getGraveImages,
    getMemorials,
    createMemorial,
    getMemorialById,
    searchDeceased,
    getAppeals,
    createAppeal,
    createProductReview,
    createRequest,
    updateMemorial,
    getMyAppeals,
    updateCartCount
}
