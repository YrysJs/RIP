import { useNuxtApp } from '#app'

function processCardPayment(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: 'http://194.32.140.209:8081/api/v1/payments/card',
        data
    })
}

function getProducts(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8080/api/v1/products',
        params,
        headers: {
            'Authorization': null,
            'accept': 'application/json'
        }
    })
}

function getProductById(id) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: `http://194.32.140.209:8080/api/v1/products/${id}`,
        headers: {
            'accept': 'application/json'
        }
    })
}

function getProductReviews(productId, params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: `http://194.32.140.209:8080/api/v1/reviews/products/${productId}`,
        params,
        headers: {
            'accept': 'application/json'
        }
    })
}

function getProviderReviews(providerId, params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: `http://194.32.140.209:8080/api/v1/reviews/providers/${providerId}`,
        params,
        headers: {
            'accept': 'application/json'
        }
    })
}

function getGraves(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8082/api/v1/graves',
        params,
        headers: {
            'accept': 'application/json'
        }
    })
}

function getGraveById(id) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: `http://194.32.140.209:8082/api/v1/graves/${id}`,
        headers: {
            'accept': 'application/json'
        }
    })
}

function createDeceased(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: 'http://194.32.140.209:8082/api/v1/admin/deceased',
        data,
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer 10_manager_manager@example.com',
            'Content-Type': 'application/json'
        }
    })
}

function getDeceasedById(id) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: `http://194.32.140.209:8082/api/v1/deceased/${id}`,
        headers: {
            'accept': 'application/json'
        }
    })
}

function getCart() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8080/api/v1/cart',
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer 11_provider_provider@example.com'
        }
    })
}

function addToCart(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: 'http://194.32.140.209:8080/api/v1/cart',
        data,
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer 14_provider_provider@example.com',
            'Content-Type': 'application/json'
        }
    })
}

function removeFromCart(productId) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'DELETE',
        url: `http://194.32.140.209:8080/api/v1/cart/${productId}`,
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer 11_provider_provider@example.com'
        }
    })
}

function clearCart() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'DELETE',
        url: 'http://194.32.140.209:8080/api/v1/cart',
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer 11_provider_provider@example.com'
        }
    })
}

function getOrders(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8080/api/v1/orders',
        params,
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer 11_provider_provider@example.com'
        }
    })
}

function getBurialRequests(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8082/api/v1/burial-requests',
        params,
        headers: {
            'Authorization': 'Bearer 11_provider_provider@example.com',
            'accept': 'application/json'
        }
    })
}

function updateBurialRequestStatus(requestId, data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PATCH',
        url: `http://194.32.140.209:8082/api/v1/burial-requests/${requestId}/status`,
        data,
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
}

function uploadBurialRequestDocument(requestId, document) {
    const { $axios } = useNuxtApp()
    
    const formData = new FormData()
    formData.append('document', document)
    
    return $axios({
        method: 'POST',
        url: `http://194.32.140.209:8082/api/v1/burial-requests/${requestId}/document`,
        data: formData,
        headers: {
            'accept': 'application/json',
            'Content-Type': 'multipart/form-data'
        }
    })
}

function createBurialRequest(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: 'http://194.32.140.209:8082/api/v1/burial-requests',
        data,
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
}

function createOrder(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: 'http://194.32.140.209:8080/api/v1/orders',
        data,
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer 11_provider_provider@example.com',
            'Content-Type': 'application/json'
        }
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
        url: 'http://194.32.140.209:8080/api/v1/reviews',
        data: formData,
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer 11_provider_provider@example.com',
            'Content-Type': 'multipart/form-data'
        }
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
    updateBurialRequestStatus,
    uploadBurialRequestDocument,
    createBurialRequest,
    createOrder,
    postReview
}
