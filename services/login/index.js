import { useNuxtApp } from '#app'


function getOtp(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: 'http://194.32.140.209:8081/v1/otp',
        data,
        headers: {
            'accept': 'application/json',
        }
    })
}

function checkOtp(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: 'http://194.32.140.209:8081/v1/otp/check',
        data: params,
        headers: {
            'accept': 'application/json',
        }
    })
}

function getUser(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8081/v1/user',
        params,
        headers: {
            'accept': 'application/json',
        }
    })
}

function getSupplier(params) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://194.32.140.209:8081/v1/supplier',
        params,
        headers: {
            'accept': 'application/json',
        }
    })
}



export {
    getOtp,
    checkOtp,
    getUser,
    getSupplier
}
