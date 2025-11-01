<template>
    <div v-if="visible" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
            <div class="modal-header">
                <h2 class="modal-title">{{ $t('receiptPayment.title') }}</h2>
                <button @click="closeModal" class="close-button">
                    <img src="/icons/close.svg" :alt="$t('common.close')" class="w-6 h-6">
                </button>
            </div>
            
            <div v-if="loading" class="loading">
                <div class="text-center">{{ $t('receiptPayment.loading') }}</div>
            </div>
            
            <div v-else-if="receiptData" class="modal-body">
                <!-- Информация о транзакции -->
                <div class="section">
                    <h3 class="section-title">{{ $t('receiptPayment.transactionInfo') }}</h3>
                    <div class="info-row">
                        <span class="label">{{ $t('receiptPayment.operationNumber') }}:</span>
                        <span class="value">{{ receiptData.operationReference }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">{{ $t('receiptPayment.transactionDate') }}:</span>
                        <span class="value">{{ formatDate(receiptData.transactionDate) }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">{{ $t('receiptPayment.secure3D') }}:</span>
                        <span class="value">{{ receiptData.is3DSecure ? $t('receiptPayment.yes') : $t('receiptPayment.no') }}</span>
                    </div>
                </div>
                
                <!-- Информация о заказе -->
                <div class="section">
                    <h3 class="section-title">{{ $t('receiptPayment.orderInfo') }}</h3>
                    <div class="info-row">
                        <span class="label">{{ $t('receiptPayment.invoiceNumber') }}:</span>
                        <span class="value">{{ receiptData.order.invoiceId }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">{{ $t('receiptDetails.amount') }}:</span>
                        <span class="value font-bold">{{ formatAmount(receiptData.order.amount) }} {{ receiptData.order.currency }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">{{ $t('receiptDetails.fee') }}:</span>
                        <span class="value">{{ formatAmount(receiptData.order.fee) }} {{ receiptData.order.currency }}</span>
                    </div>
                </div>
                
                <!-- Информация о плательщике -->
                <div class="section">
                    <h3 class="section-title">{{ $t('receipt.payerInfo') }}</h3>
                    <div class="info-row">
                        <span class="label">{{ $t('common.name') }}:</span>
                        <span class="value">{{ receiptData.payer.name }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">{{ $t('receiptDetails.cardNumber') }}:</span>
                        <span class="value">{{ receiptData.payer.cardNumber }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Email:</span>
                        <span class="value">{{ receiptData.payer.email }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">{{ $t('receipt.phone') }}</span>
                        <span class="value">+{{ receiptData.payer.phone }}</span>
                    </div>
                </div>
                
                <!-- Информация о получателе -->
                <div class="section">
                    <h3 class="section-title">{{ $t('receipt.recipientInfo') }}</h3>
                    <div class="info-row">
                        <span class="label">{{ $t('receipt.company') }}</span>
                        <span class="value">{{ receiptData.recipient.companyName }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">{{ $t('receipt.store') }}</span>
                        <span class="value">{{ receiptData.recipient.storeName }}</span>
                    </div>
                    <div v-if="receiptData.recipient.email" class="info-row">
                        <span class="label">Email:</span>
                        <span class="value">{{ receiptData.recipient.email }}</span>
                    </div>
                    <div v-if="receiptData.recipient.phone" class="info-row">
                        <span class="label">{{ $t('receipt.phone') }}</span>
                        <span class="value">{{ receiptData.recipient.phone }}</span>
                    </div>
                </div>
                
                <!-- Дата формирования -->
                <div class="footer">
                    <p class="footer-text">{{ $t('receipt.receiptDate') }} {{ formatDate(new Date()) }}</p>
                </div>
            </div>
            
            <div v-else class="error">
                <div class="text-center text-red-600">
                    {{ $t('common.error') }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    receiptData: {
        type: Object,
        default: null
    },
    loading: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}

function formatDate(date) {
    return new Date(date).toLocaleString('ru-RU')
}

function formatAmount(amount) {
    return (amount).toLocaleString('ru-RU')
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    overflow-y: auto;
    padding: 20px;
}

.modal-content {
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 24px 16px 24px;
    border-bottom: 1px solid #e5e7eb;
}

.modal-title {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
}

.close-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: background-color 0.2s;
}

.close-button:hover {
    background-color: #f3f4f6;
}

.modal-body {
    padding: 24px;
}

.loading, .error {
    padding: 40px 24px;
    text-align: center;
    color: #6b7280;
}

.section {
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 1px solid #f3f4f6;
}

.section:last-of-type {
    border-bottom: none;
    margin-bottom: 16px;
}

.section-title {
    font-size: 16px;
    font-weight: 700;
    color: #374151;
    margin-bottom: 16px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f9fafb;
}

.info-row:last-child {
    border-bottom: none;
}

.label {
    font-weight: 500;
    color: #6b7280;
    flex: 1;
}

.value {
    color: #1f2937;
    font-weight: 500;
    text-align: right;
    flex: 1;
}

.footer {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
}

.footer-text {
    font-size: 14px;
    color: #6b7280;
    text-align: center;
    margin: 0;
}

/* Адаптивность */
@media (max-width: 640px) {
    .modal-overlay {
        padding: 10px;
    }
    
    .modal-header {
        padding: 20px 20px 16px 20px;
    }
    
    .modal-title {
        font-size: 20px;
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .info-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }
    
    .value {
        text-align: left;
        font-weight: 600;
    }
}
</style> 