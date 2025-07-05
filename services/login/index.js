import { useNuxtApp } from '#app'


function getOtp(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: 'http://91.147.92.97:8081/v1/otp',
        data,
    })
}

function checkOtp(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: 'http://91.147.92.97:8081/v1/otp/check',
        data: params,
    })
}

function signupGov(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PUT',
        url: 'http://91.147.92.97:8081/v1/gov/signup',
        data: data.data,
        params: data.params
    })
}

function signupAkimat(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PUT',
        url: 'http://91.147.92.97:8081/rip-government/v1/akimat/user',
        data: data.data,
    })
}

function deleteAkimatUser(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'DELETE',
        url: 'http://91.147.92.97:8081/rip-government/v1/akimat/user',
        data: data.data,
    })
}

function updateUser(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PATCH',
        url: 'http://91.147.92.97:8081/v1/user',
        data: data.data,
    })
}

function signupClient(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PUT',
        url: 'http://91.147.92.97:8081/v1/user/signup',
        data
    })
}

function signupClientFcb(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PUT',
        url: 'http://91.147.92.97:8081/v1/user/signup/fcb',
        data
    })
}

function getUserData(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97:8081/rip-fcb/v1/individual',
        params,
    })
}

function getUsersByRole(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97:8081/v1/user/list-by-role',
        params,
    })
}

function signupSupplier(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PUT',
        url: 'http://91.147.92.97:8081/v1/supplier/signup',
        data
    })
}

function getUser(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97:8081/v1/user',
        params,
    })
}

function getSupplier(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97:8081/v1/supplier',
        params,
    })
}

function getCurrentUser() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97:8081/v1/user/current',
    })
}

function setSupplierFiles(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: 'http://91.147.92.97:8093/api/v1/suppliers/docs',
        data
    })
}

function getSuppliers(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97:8081/v1/supplier/list',
        params,
    })
}

function activateSupplier(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PATCH',
        url: 'http://91.147.92.97:8081/v1/supplier/activate',
        data
    })
}

export {
    getOtp,
    checkOtp,
    getUser,
    getSupplier,
    getCurrentUser,
    signupClient,
    signupSupplier,
    getUserData,
    signupClientFcb,
    signupGov,
    getUsersByRole,
    signupAkimat,
    deleteAkimatUser,
    updateUser,
    setSupplierFiles,
    getSuppliers,
    activateSupplier
}
