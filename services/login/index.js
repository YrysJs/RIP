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

function signupSupplier(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: 'http://91.147.92.97:8081/v1/supplier/signup/fcb',
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



export {
    getOtp,
    checkOtp,
    getUser,
    getSupplier,
    signupClient,
    signupSupplier,
    getUserData,
    signupClientFcb
}
