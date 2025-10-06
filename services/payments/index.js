import { useNuxtApp } from '#app'

function processCardPayment(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: 'http://194.32.140.103:8091/api/v1/payments/card',
        data: {
            amount: data.amount,
            cardNumber: data.cardNumber,
            currency: data.currency || 'KZT',
            cvc: data.cvc,
            description: data.description,
            email: data.email,
            expDate: data.expDate,
            invoiceID: data.invoiceID,
            phone: data.phone
        },
    })
}

function confirmOrderPayment(orderId, transactionId) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: `http://194.32.140.103:8090/api/v1/orders/${orderId}/confirm-payment`,
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
        url: `http://194.32.140.103:8094/api/v1/burial-requests/${burialRequestId}/confirm-payment`,
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
        url: `http://194.32.140.103:8091/api/v1/payments/receipt/${receiptId}`,
        headers: {
            'accept': 'application/json',
        }
    })
}

export {
    processCardPayment,
    confirmOrderPayment,
    confirmBurialPayment,
    getPaymentReceipt
} 