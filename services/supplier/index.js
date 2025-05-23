import { useNuxtApp } from '#app'

function getBurialRequests(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8092/api/v1/burial-requests',
        params,
        headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4NDc3NTYzMzAsInJvbGUiOiJzdXBwbGllciIsInN1YiI6Ijc3Nzc3MzE4MjQzIn0.ZBnE5ZCBTkyzAVuYQwj5DrLWXzOSf6cdjq3DoVYo_0o',
            'accept': 'application/json'
        }
    })
}

function getOrders(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8090/api/v1/user/supplier/orders',
        params,
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4NDc3NTYzMzAsInJvbGUiOiJzdXBwbGllciIsInN1YiI6Ijc3Nzc3MzE4MjQzIn0.ZBnE5ZCBTkyzAVuYQwj5DrLWXzOSf6cdjq3DoVYo_0o'
        }
    })
}

function getProducts(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8090/api/v1/user/supplier/products',
        params,
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4NDc3NTYzMzAsInJvbGUiOiJzdXBwbGllciIsInN1YiI6Ijc3Nzc3MzE4MjQzIn0.ZBnE5ZCBTkyzAVuYQwj5DrLWXzOSf6cdjq3DoVYo_0o'
        }
    })
}

function getAllProducts(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8090/api/v1/products',
        params,
        headers: {
            'accept': 'application/json'
        }
    })
}

function getCategories() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8090/api/v1/categories',
        headers: {
            'accept': 'application/json'
        }
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
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4NDc3NTYzMzAsInJvbGUiOiJzdXBwbGllciIsInN1YiI6Ijc3Nzc3MzE4MjQzIn0.ZBnE5ZCBTkyzAVuYQwj5DrLWXzOSf6cdjq3DoVYo_0o'
        }
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
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4NDc3NTYzMzAsInJvbGUiOiJzdXBwbGllciIsInN1YiI6Ijc3Nzc3MzE4MjQzIn0.ZBnE5ZCBTkyzAVuYQwj5DrLWXzOSf6cdjq3DoVYo_0o',
            'Content-Type': 'application/json'
        }
    })
}

function getReviews() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8090/api/v1/user/supplier/reviews',
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4NDc3NTYzMzAsInJvbGUiOiJzdXBwbGllciIsInN1YiI6Ijc3Nzc3MzE4MjQzIn0.ZBnE5ZCBTkyzAVuYQwj5DrLWXzOSf6cdjq3DoVYo_0o'
        }
    })
}

function createProduct(data) {
    const { $axios } = useNuxtApp()
    
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
        method: 'POST',
        url: 'http://194.32.140.209:8090/api/v1/products',
        data: formData,
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4NDc3NTYzMzAsInJvbGUiOiJzdXBwbGllciIsInN1YiI6Ijc3Nzc3MzE4MjQzIn0.ZBnE5ZCBTkyzAVuYQwj5DrLWXzOSf6cdjq3DoVYo_0o',
        }
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
        headers: {
            'accept': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4NDc3NTYzMzAsInJvbGUiOiJzdXBwbGllciIsInN1YiI6Ijc3Nzc3MzE4MjQzIn0.ZBnE5ZCBTkyzAVuYQwj5DrLWXzOSf6cdjq3DoVYo_0o',
            'Content-Type': 'multipart/form-data'
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
    createProduct,
    updateProduct,
    getBurialRequests
}
