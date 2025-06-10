import { useNuxtApp } from '#app'

function getBurialRequests(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8092/api/v1/burial-requests',
        params,
    })
}

function getSalesStats() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8090/api/v1/user/supplier/sales/stats',
    })
}

function getOrders(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8090/api/v1/user/supplier/orders',
        params,
    })
}

function getProducts(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8090/api/v1/user/supplier/products',
        params,
    })
}

function getAllProducts(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8090/api/v1/products',
        params,
    })
}

function getCategories() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8090/api/v1/categories',
    })
}

function getProductById(id) {
    const { $axios } = useNuxtApp()
    
    if (!id) {
        throw new Error('Product ID is required')
    }
    
    return $axios({
        method: 'GET',
        url: `http://194.32.140.209:8090/api/v1/products/${id}`,
    })
}

function updateProductStatus(id, status) {
    const { $axios } = useNuxtApp()
    
    if (!id) {
        throw new Error('Product ID is required')
    }
    
    return $axios({
        method: 'PATCH',
        url: `http://194.32.140.209:8090/api/v1/products/${id}/status`,
        data: { status },
    })
}

function getReviews() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8090/api/v1/user/supplier/reviews',
    })
}

function getOrderById(id) {
    const { $axios } = useNuxtApp()
    
    if (!id) {
        throw new Error('Order ID is required')
    }
    
    return $axios({
        method: 'GET',
        url: `http://194.32.140.209:8090/api/v1/orders/${id}`,
    })
}

function updateOrderStatus(id, status) {
    const { $axios } = useNuxtApp()
    
    if (!id) {
        throw new Error('Order ID is required')
    }
    
    if (!status) {
        throw new Error('Status is required')
    }
    
    return $axios({
        method: 'PATCH',
        url: `http://194.32.140.209:8090/api/v1/orders/${id}/status`,
        data: { status },
    })
}

function createProduct(data) {
    const { $axios } = useNuxtApp()
    
    const formData = new FormData()
    
    // Add all fields to formData
    if (data.name) formData.append('name', data.name)
    if (data.description) formData.append('description', data.description)
    if (data.price) formData.append('price', +data.price)
    if (data.category_id) formData.append('category_id', data.category_id)
    if (data.type) formData.append('type', data.type)
    if (data.availability !== undefined) formData.append('availability', data.availability)
    if (data.country) formData.append('country', data.country)
    if (data.city) formData.append('city', data.city)
    if (data.service_time) formData.append('service_time', data.service_time)
    
    // Handle images
    if (data.images) {
        if (Array.isArray(data.images)) {
            data.images.forEach(image => formData.append('images', image))
        } else {
            formData.append('images', data.images)
        }
    }
    
    return $axios({
        method: 'POST',
        url: 'http://194.32.140.209:8090/api/v1/products',
        data: formData,
    })
}

function updateProduct(id, data) {
    const { $axios } = useNuxtApp()
    
    if (!id) {
        throw new Error('Product ID is required for update')
    }
    
    const formData = new FormData()
    
    // Add all fields to formData
    if (data.name) formData.append('name', data.name)
    if (data.description) formData.append('description', data.description)
    if (data.price) formData.append('price', data.price)
    if (data.category_id) formData.append('category_id', data.category_id)
    if (data.type) formData.append('type', data.type)
    if (data.availability !== undefined) formData.append('availability', data.availability)
    if (data.country) formData.append('country', data.country)
    if (data.city) formData.append('city', data.city)
    if (data.service_time) formData.append('service_time', data.service_time)
    
    // Handle images
    if (data.images) {
        if (Array.isArray(data.images)) {
            data.images.forEach(image => formData.append('images', image))
        } else {
            formData.append('images', data.images)
        }
    }
    
    return $axios({
        method: 'PUT',
        url: `http://194.32.140.209:8090/api/v1/products/${id}`,
        data: formData,
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
    getSalesStats
}
