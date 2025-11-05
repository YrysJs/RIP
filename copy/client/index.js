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

function uploadMemorialFiles(userPhone, files, isAchievement = false) {
    const { $axios } = useNuxtApp()

    const formData = new FormData()

    // Добавляем флаг достижения (преобразуем boolean в строку)
    formData.append('is_achievement', String(isAchievement))

    // Добавляем файлы
    if (Array.isArray(files)) {
        files.forEach(file => {
            formData.append('files', file)
        })
    } else {
        formData.append('files', files)
    }

    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v7/products/memorial/${userPhone}`,
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

function createMemorial(data) {
    const { $axios } = useNuxtApp()

    // Теперь принимаем URL-ы вместо файлов
    const payload = {
        deceased_id: data.deceased_id,
        epitaph: data.epitaph || '',
        about_person: data.about_person || '',
        is_public: data.is_public !== undefined ? data.is_public : false,
        photo_urls: data.photo_urls || [],
        achievement_urls: data.achievement_urls || [],
        video_urls: data.video_urls || []
    }

    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v1/memorials',
        data: payload,
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

function updateMemorial(id, data) {
    const { $axios } = useNuxtApp()

    // Теперь принимаем URL-ы вместо файлов
    const payload = {
        id: id || data.id,
        epitaph: data.epitaph || '',
        about_person: data.about_person || '',
        is_public: data.is_public !== undefined ? data.is_public : false,
        photo_urls: data.photo_urls || [],
        achievement_urls: data.achievement_urls || [],
        video_urls: data.video_urls || []
    }

    // Добавляем deceased_id если он есть
    if (data.deceased_id !== undefined) {
        payload.deceased_id = data.deceased_id
    }

    // Используем переданный id или id из data
    const memorialId = id || data.id

    return $axios({
        method: 'PUT',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v1/memorials/' + memorialId,
        data: payload,
        headers: {
            'Content-Type': 'application/json'
        }
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
    updateCartCount,
    uploadMemorialFiles
}
