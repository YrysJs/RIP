import { useNuxtApp } from '#app'


function getOtp(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v2/otp',
        data,
    })
}

function checkWhatsappOtp(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v2/otp/whatsapp/verify`,
        data: params,
    })
}
function getWhatsappOtp(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v2/otp/whatsapp/send`,
        data,
    })
}

function checkOtp(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v2/otp/check',
        data: params,
    })
}

function signupGov(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PUT',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v2/gov/signup',
        data: data.data,
        params: data.params
    })
}

function signupAkimat(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PUT',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v3/rip-government/v1/akimat/user',
        data: data.data,
    })
}

function deleteAkimatUser(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'DELETE',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v3/rip-government/v1/akimat/user',
        data: data.data,
    })
}

function deleteUser(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'DELETE',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v2/user/${data}`,
    })
}


function updateUser(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PATCH',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v2/user',
        data: data.data,
    })
}

function signupClient(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PUT',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v2/user/signup',
        data
    })
}

function signupClientWhatsapp(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PUT',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v2/user/signup/whatsapp',
        data
    })
}

function signupClientFcb(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PUT',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v2/user/signup/fcb',
        data
    })
}

function getUserData(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v3/rip-fcb/v1/individual',
        params,
    })
}

function getUsersByRole(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v2/user/list-by-role',
        params,
    })
}

function signupSupplier(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PUT',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v2/supplier/signup',
        data
    })
}

function getUser(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v2/user',
        params,
    })
}

function getSupplier(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v2/supplier',
        params,
    })
}

function getCurrentUser() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v2/user/current',
    })
}

function setSupplierFiles(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v7/suppliers/docs',
        data
    })
}

function getSuppliers(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v2/supplier/list',
        params,
    })
}

function activateSupplier(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PATCH',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v2/supplier/activate',
        data
    })
}

function getPkbToken() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v5/token'
    })
}

function getPkbRequest(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v5/individual/send/request',
        params: data.params,
        data: data.data,
        headers: {
            'Content-Type': 'text/plain' // или 'application/json' если строка — это JSON-строка
        }
    })
}

function pkbGetData(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v5/individual/request/${data.id}`,
        params: data.params,
        data: data.data,
        headers: {
            'Content-Type': 'text/plain' // или 'application/json' если строка — это JSON-строка
        }
    })
}

function pkbGetDeceasedData(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v5/deceased`,
        params: data,
    })
}

function pkbGetJurData(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v5/jur`,
        params: data,
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
    activateSupplier,
    deleteUser,
    getPkbToken,
    getPkbRequest,
    pkbGetData,
    pkbGetDeceasedData,
    checkWhatsappOtp,
    getWhatsappOtp,
    signupClientWhatsapp,
    pkbGetJurData
}
