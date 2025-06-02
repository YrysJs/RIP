import { useNuxtApp } from '#app'

function processCardPayment(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: 'http://194.32.140.209:8091/api/v1/payments/card',
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

export {
    processCardPayment
} 