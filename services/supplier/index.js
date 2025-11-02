import { useNuxtApp } from '#app'

function getSupplierInfo() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.103:8081/v1/supplier/current',
    })
}

function createReviewAppeal(data) {
    const { $axios } = useNuxtApp()

    return $axios({
        method: 'POST',
        url: `http://194.32.140.103:8090/api/v1/appeals`,
        data: data
    })
}

function getReviewAppeals(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.103:8090/api/v1/appeals',
        params,
    })
}

function getBurialRequests(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.103:8094/api/v1/burial-requests/my',
        params,
    })
}

function getSalesStats() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.103:8090/api/v1/user/supplier/sales/stats',
    })
}

function getOrders(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.103:8090/api/v1/user/supplier/orders',
        params,
    })
}

function getProducts(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.103:8090/api/v1/user/supplier/products',
        params,
    })
}

function getAllProducts(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.103:8090/api/v1/products',
        params,
    })
}

function getCategories() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.103:8090/api/v1/categories',
    })
}

function getProductById(id) {
    const { $axios } = useNuxtApp()

    if (!id) {
        throw new Error('Product ID is required')
    }

    return $axios({
        method: 'GET',
        url: `http://194.32.140.103:8090/api/v1/products/${id}`,
    })
}

function updateProductStatus(id, status) {
    const { $axios } = useNuxtApp()

    if (!id) {
        throw new Error('Product ID is required')
    }

    return $axios({
        method: 'PATCH',
        url: `http://194.32.140.103:8090/api/v1/products/${id}/status`,
        data: { status },
    })
}

function getReviews() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.103:8090/api/v1/user/supplier/reviews',
    })
}

function getOrderById(id) {
    const { $axios } = useNuxtApp()

    if (!id) {
        throw new Error('Order ID is required')
    }

    return $axios({
        method: 'GET',
        url: `http://194.32.140.103:8090/api/v1/orders/${id}`,
    })
}

function updateOrderStatus(id, status, itemId) {
    const { $axios } = useNuxtApp()

    if (!id) {
        throw new Error('Order ID is required')
    }

    if (!status) {
        throw new Error('Status is required')
    }

    if (!itemId) {
        throw new Error('Item is required')
    }

    return $axios({
        method: 'PATCH',
        url: `http://194.32.140.103:8090/api/v1/orders/${id}/items/${itemId}/status`,
        data: { status },
    })
}

function createProduct(data) {
    const { $axios } = useNuxtApp()

    // Подготавливаем JSON payload
    const payload = {
        name: data.name,
        description: data.description,
        price: data.price ? +data.price : 0,
        category_id: data.category_id ? +data.category_id : 1,
        type: data.type,
        availability: data.availability,
        country: data.country,
        city: data.city,
        service_time: data.service_time,
        image_urls: data.image_urls || []
    }

    // Добавляем unit только для товаров
    if (data.type === 'product' && data.unit) {
        payload.unit = data.unit
    }

    return $axios({
        method: 'POST',
        url: 'http://194.32.140.103:8090/api/v1/products',
        data: payload,
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

function loadProductFiles(phone, files) {
    const { $axios } = useNuxtApp()

    const formData = new FormData()
    formData.append('phone', phone)

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
        url: `http://194.32.140.103:8093/api/v1/products/product/${phone}`,
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

function updateProduct(id, data) {
    const { $axios } = useNuxtApp()

    if (!id) {
        throw new Error('Product ID is required for update')
    }

    // Подготавливаем JSON payload
    const payload = {
        name: data.name,
        description: data.description,
        price: data.price ? +data.price : 0,
        category_id: data.category_id ? +data.category_id : 1,
        type: data.type,
        availability: data.availability,
        country: data.country,
        city: data.city,
        service_time: data.service_time,
        image_urls: data.image_urls || []
    }

    // Добавляем unit только для товаров
    if (data.type === 'product' && data.unit) {
        payload.unit = data.unit
    }

    return $axios({
        method: 'PUT',
        url: `http://194.32.140.103:8090/api/v1/products/${id}`,
        data: payload,
        headers: {
            'Content-Type': 'application/json'
        }
    })
}


function getSupplierProductReviews(phone, page = 1, limit = 10) {
    const { $axios } = useNuxtApp()

    if (!phone) {
        throw new Error('Phone number is required')
    }

    return $axios({
        method: 'GET',
        url: `http://194.32.140.103:8090/api/v1/reviews/suppliers/${phone}/products`,
        params: {
            page,
            limit
        }
    })
}

function addReviewResponse(reviewId, comment) {
    const { $axios } = useNuxtApp()

    if (!reviewId) {
        throw new Error('Review ID is required')
    }

    if (!comment) {
        throw new Error('Comment is required')
    }

    return $axios({
        method: 'POST',
        url: `http://194.32.140.103:8090/api/v1/reviews/${reviewId}/response`,
        data: {
            comment,
            review_id: reviewId
        }
    })
}

export {
    getOrders,
    getProducts,
    getAllProducts,
    getCategories,
    getProductById,
    updateProductStatus,
    getReviews,
    getOrderById,
    updateOrderStatus,
    createProduct,
    updateProduct,
    getBurialRequests,
    getSalesStats,
    getSupplierInfo,
    getSupplierProductReviews,
    addReviewResponse,
    createReviewAppeal,
    getReviewAppeals,
    loadProductFiles
}
