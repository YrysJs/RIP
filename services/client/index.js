import { useNuxtApp } from '#app'

function getAppeals(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97:8081/rip-government/v1/appeal',
        params,
    })
}

function createAppeal(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PUT',
        url: 'http://91.147.92.97:8081/rip-government/v1/appeal',
        data,
    })
}
function processCardPayment(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: 'http://91.147.92.97:8081/api/v1/payments/card',
        data
    })
}

function getProducts(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97:8090/api/v1/products',
        params,
    })
}

function getProductById(id) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: `http://91.147.92.97:8090/api/v1/products/${id}`,
    })
}

function getProductReviews(productId, params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: `http://91.147.92.97:8090/api/v1/reviews/products/${productId}`,
        params,
    })
}

function getProviderReviews(providerId, params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: `http://91.147.92.97:8090/api/v1/reviews/providers/${providerId}`,
        params,
    })
}

function getGraves(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97:8092/api/v1/graves',
        params,
    })
}

function getGraveById(id) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: `http://91.147.92.97:8092/api/v1/graves/${id}`,
    })
}

function getGraveImages(id) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: `http://91.147.92.97:8092/api/v1/graves/${id}/photos`,
    })
}

function createDeceased(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: 'http://91.147.92.97:8092/api/v1/admin/deceased',
        data,
    })
}

function getDeceasedById(id) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: `http://91.147.92.97:8092/api/v1/deceased/${id}`,
    })
}

function getCart() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97:8090/api/v1/cart',
    })
}

function addToCart(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: 'http://91.147.92.97:8090/api/v1/cart',
        data,
    })
}

function removeFromCart(productId) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'DELETE',
        url: `http://91.147.92.97:8090/api/v1/cart/${productId}`,
    })
}

function clearCart() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'DELETE',
        url: 'http://91.147.92.97:8090/api/v1/cart',
    })
}

function getOrders(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97:8090/api/v1/orders',
        params,
    })
}

function getBurialRequests(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97/api/v1/burial-requests',
        params,
    })
}

function getBurialRequestById(id) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: `http://91.147.92.97:8092/api/v1/burial-requests/${id}`,
    })
}

function updateBurialRequestStatus(requestId, data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PATCH',
        url: `http://91.147.92.97:8092/api/v1/burial-requests/${requestId}/status`,
        data,
    })
}

function updateBurialRequestData(requestId, data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PUT',
        url: `http://91.147.92.97:8092/api/v1/burial-requests/${requestId}`,
        data,
    })
}

function uploadBurialRequestDocument(requestId, document) {
    const { $axios } = useNuxtApp()
    
    const formData = new FormData()
    formData.append('document', document)
    
    return $axios({
        method: 'POST',
        url: `http://91.147.92.97:8092/api/v1/burial-requests/${requestId}/document`,
        data: formData,
    })
}

function uploadDeceasedDeathCertificate(deceasedId, certificate) {
    const { $axios } = useNuxtApp()
    
    const formData = new FormData()
    formData.append('certificate', certificate)
    
    return $axios({
        method: 'POST',
        url: `http://91.147.92.97:8092/api/v1/deceased/${deceasedId}/death-certificate`,
        data: formData,
    })
}

function createBurialRequest(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: 'http://91.147.92.97:8092/api/v1/burial-requests',
        data,
    })
}

function createOrder(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: 'http://91.147.92.97:8090/api/v1/orders',
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
        url: 'http://91.147.92.97:8090/api/v1/reviews',
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
        url: 'http://91.147.92.97:8090/api/v1/reviews/products',
        data: formData,
    })
}

function getMemorials(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97:8090/api/v1/memorials',
        params,
    })
}

function searchDeceased(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: 'http://91.147.92.97:8092/api/v1/deceased-search-requests',
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
            formData.append('video_urls', data.video_urls.join(','))
        } else {
            formData.append('video_urls', data.video_urls)
        }
    }
    
    return $axios({
        method: 'POST',
        url: 'http://91.147.92.97:8090/api/v1/memorials',
        data: formData,
    })
}

function getMemorialById(id) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: `http://91.147.92.97:8090/api/v1/memorials/${id}`,
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
    createProductReview
}
