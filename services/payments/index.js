import { useNuxtApp } from '#app'

function processCardPayment(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v1/payments/card',
        data: data,
    })
}

function confirmOrderPayment(orderId, transactionId) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v1/orders/${orderId}/confirm-payment`,
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        },
        data: {
            transaction_id: transactionId
        }
    })
}

function confirmBurialPayment(burialRequestId, transactionId) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v8/burial-requests/${burialRequestId}/confirm-payment`,
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        },
        data: {
            transaction_id: transactionId
        }
    })
}

function getPaymentReceipt(receiptId) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: useRuntimeConfig().public.apiBaseUrl + `/api/v1/payments/receipt/${receiptId}`,
        headers: {
            'accept': 'application/json',
        }
    })
}

function createInvoice(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v1/payments/create-invoice',
        data: data,
    })
}

function generateToken(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v1/payments/generate-token',
        data: data,
    })
}

function clientPayment(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: useRuntimeConfig().public.apiBaseUrl + '/api/v1/payments/mobile/callback',
        data: data,
    })
}

export {
    processCardPayment,
    confirmOrderPayment,
    confirmBurialPayment,
    getPaymentReceipt,
    createInvoice,
    generateToken,
    clientPayment
} 