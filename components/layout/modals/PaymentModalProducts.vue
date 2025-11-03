<template>
  <div v-if="visible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="payment-form">
        <h2 class="title">{{ $t('payment.orderPayment') }}</h2>

        <!-- Модалка 3D Secure для мобильных устройств -->
        <div v-if="showSecure3DModal" class="secure3d-modal">
          <h3 class="secure3d-title">{{ $t('payment.secure3DTitle') }}</h3>
          <p class="secure3d-description">{{ $t('payment.secure3DDescription') }}</p>
          <a 
            :href="secure3DURL" 
            target="_blank" 
            class="secure3d-button"
          >
            {{ $t('payment.secure3DPayButton') }}
          </a>
        </div>

        <template v-else>
        <!-- Детали заказа -->
        <div class="order-summary">
          <h3 class="summary-title">{{ $t('payment.orderDetails') }}</h3>
          <template v-if="orderData.cartItems">
            <div v-for="item in orderData.cartItems" :key="item.id" class="summary-item">
              <span>{{item.product.name}}</span>
              <span>{{ item.quantity }} x {{item.product.price}} ₸</span>
            </div>
          </template>
          <div class="summary-total">
            <span>{{ $t('payment.totalToPay') }}</span>
            <span>{{ orderData.cartTotal?.toLocaleString() || '0' }} ₸</span>
          </div>
        </div>

        <div class="form-group">
          <label class="label">{{ $t('payment.cardNumber') }}</label>
          <input
              v-model="cardNumber"
              type="text"
              class="input"
              placeholder="2340 0330 0022 1331"
              maxlength="19"
              @input="formatCardNumber"
          />
        </div>

        <div class="form-group">
          <label class="label">Email</label>
          <input
              v-model="email"
              type="text"
              class="input"
              placeholder="example@test.com"
          />
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label class="label">{{ $t('payment.expiryDate') }}</label>
            <input
                v-model="expiryDate"
                type="text"
                class="input"
                placeholder="01/25"
                maxlength="5"
                @input="formatExpiryDate"
            />
          </div>

          <div class="form-group half">
            <label class="label">{{ $t('payment.cvcCode') }}</label>
            <input
                v-model="cvcCode"
                type="password"
                class="input"
                placeholder="234"
                maxlength="3"
            />
          </div>
        </div>

        <button class="pay-button" @click="processPayment" :disabled="isProcessing">
          {{ isProcessing ? $t('payment.processing') : `${$t('payment.pay')} ${orderData.cartTotal?.toLocaleString() || '0'} ₸` }}
        </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { processCardPayment, confirmOrderPayment, confirmBurialPayment } from '~/services/payments'
import { createOrder } from '~/services/client'

export default {
  name: 'PaymentModalProducts',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    orderData: {
      type: Object,
      default: () => ({})
    },
    burialData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      cardNumber: '',
      expiryDate: '',
      cvcCode: '',
      email: '',
      isProcessing: false,
      showSecure3DModal: false,
      secure3DURL: ''
    }
  },
  computed: {
    isMobile() {
      if (typeof window === 'undefined') return false;
      return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
  },
  methods: {
    closeModal() {
      if (!this.isProcessing) {
        this.showSecure3DModal = false;
        this.secure3DURL = '';
        this.$emit('close')
      }
    },
    async waitForOrderPaymentConfirmation(orderId, transactionId) {
      return new Promise((resolve, reject) => {
        const checkPayment = async () => {
          try {
            await confirmOrderPayment(orderId, transactionId);
            clearInterval(intervalId);
            resolve();
          } catch (error) {
            // Если ошибка - продолжаем попытки
            console.log('Ожидание подтверждения оплаты заказа...');
          }
        };

        // Проверяем каждые 5 секунд
        const intervalId = setInterval(checkPayment, 5000);

        // Таймаут через 5 минут
        setTimeout(() => {
          clearInterval(intervalId);
          reject(new Error('Таймаут ожидания подтверждения оплаты'));
        }, 300000);
      });
    },
    formatCardNumber(event) {
      let value = event.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '')
      let matches = value.match(/\d{4,16}/g)
      let match = matches && matches[0] || ''
      let parts = []

      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4))
      }

      if (parts.length) {
        this.cardNumber = parts.join(' ')
      } else {
        this.cardNumber = value
      }
    },
    formatExpiryDate(event) {
      let value = event.target.value.replace(/\D/g, '')
      if (value.length >= 2) {
        this.expiryDate = value.substring(0, 2) + '/' + value.substring(2, 4)
      } else {
        this.expiryDate = value
      }
    },
    async processPayment() {
      if (this.isProcessing) return

      this.isProcessing = true

      try {
        // Подготавливаем данные для оплаты
        const paymentData = {
          amount: this.orderData.cartTotal || 0,
          cardNumber: this.cardNumber.replace(/\s/g, ''),
          currency: 'KZT',
          cvc: this.cvcCode,
          email: this.email,
          expDate: this.expiryDate.replace('/', ''),
          terminalType: 'shop'
        }

        // 1. Выполняем платеж (закомментировано для тестирования)
        const paymentResponse = await processCardPayment(paymentData)

        // Получаем transaction_id из ответа платежа
        const transactionId = paymentResponse.data.data.paymentInfo.id

        if (paymentResponse.data.data.secure3DURL) {
          // Показываем модалку с ссылкой 3D Secure (для всех устройств)
          this.secure3DURL = paymentResponse.data.data.secure3DURL;
          this.showSecure3DModal = true;
          
          // На десктопе дополнительно открываем в новой вкладке
          if (!this.isMobile) {
            window.open(paymentResponse.data.data.secure3DURL, '_blank', 'noopener,noreferrer');
          }

          // Сначала создаем заказ
          console.log(this.burialData)
          const orderRequestData = {
            // Данные захоронения (если есть)
            ...(this.burialData && {
              burial_date: this.burialData.burial_date,
              burial_order_id: this.burialData.id,
              burial_time: this.burialData.burial_time,
              cemetery_id: this.burialData.cemetery_id,
              deceased_id: this.burialData.deceased_id,
              grave_id: this.burialData.grave_id,
            }),
            // Товары заказа
            order_items: this.orderData.cartItems?.map(item => ({
              delivery_arrival_time: item.delivery_arrival_time || "2025-05-17T09:00:00Z",
              delivery_destination_address: item.delivery_destination_address || "Алматы, ул. Еревагская 157",
              product_id: item.product_id,
              quantity: item.quantity
            })) || []
          }

          console.log('Order request data:', orderRequestData)
          const orderResponse = await createOrder(orderRequestData)

          // Ждем подтверждения платежа через интервал
          if (transactionId && orderResponse?.data?.id) {
            await this.waitForOrderPaymentConfirmation(orderResponse.data.id, transactionId);
          }

          // После подтверждения закрываем модалку
          this.showSecure3DModal = false;
          this.$emit('close')
          this.$emit('success')
        } else {
          // Если нет 3D Secure, создаем заказ и подтверждаем платеж сразу
          console.log(this.burialData)
          const orderRequestData = {
            // Данные захоронения (если есть)
            ...(this.burialData && {
              burial_date: this.burialData.burial_date,
              burial_order_id: this.burialData.id,
              burial_time: this.burialData.burial_time,
              cemetery_id: this.burialData.cemetery_id,
              deceased_id: this.burialData.deceased_id,
              grave_id: this.burialData.grave_id,
            }),
            // Товары заказа
            order_items: this.orderData.cartItems?.map(item => ({
              delivery_arrival_time: item.delivery_arrival_time || "2025-05-17T09:00:00Z",
              delivery_destination_address: item.delivery_destination_address || "Алматы, ул. Еревагская 157",
              product_id: item.product_id,
              quantity: item.quantity
            })) || []
          }

          console.log('Order request data:', orderRequestData)
          const orderResponse = await createOrder(orderRequestData)

          // Подтверждаем платеж заказа
          if (transactionId && orderResponse?.data?.id) {
            console.log('Confirming order payment...')
            await confirmOrderPayment(orderResponse.data.id, transactionId)
            console.log('Order payment confirmed')
          }

          // Закрываем модалку и сообщаем о успешной оплате
          this.$emit('close')
          this.$emit('success')
        }

      } catch (error) {
        console.error('Payment process failed:', error)
      } finally {
        this.isProcessing = false
      }
    }
  }
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
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-width: 450px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.payment-form {
  padding: 32px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 24px 0;
  text-align: left;
}

.order-summary {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.summary-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.form-group {
  margin-bottom: 24px;
}

.form-group.half {
  flex: 1;
}

.form-row {
  display: flex;
  gap: 16px;
}

.label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  margin-bottom: 8px;
}

.input {
  width: 100%;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  background-color: #fafafa;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  border-color: #339B38;
  background-color: white;
}

.input::placeholder {
  color: #999;
}

.pay-button {
  width: 100%;
  padding: 16px;
  background-color: #339B38;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-top: 8px;
}

.pay-button:hover {
  background-color: #2d8530;
}

.pay-button:active {
  background-color: #256b29;
}

.pay-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* Адаптивность для мобильных устройств */
@media (max-width: 480px) {
  .payment-form {
    padding: 24px;
  }

  .title {
    font-size: 20px;
    margin-bottom: 20px;
  }

  .order-summary {
    padding: 16px;
    margin-bottom: 20px;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .modal-content {
    margin: 16px;
    width: calc(100% - 32px);
  }
}

.secure3d-modal {
  text-align: center;
  padding: 24px 0;
}

.secure3d-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.secure3d-description {
  font-size: 14px;
  color: #555;
  line-height: 1.5;
  margin-bottom: 24px;
  padding: 0 16px;
}

.secure3d-button {
  display: inline-block;
  width: 100%;
  padding: 16px;
  background-color: #339B38;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-decoration: none;
  text-align: center;
  box-sizing: border-box;
}

.secure3d-button:hover {
  background-color: #2d8530;
}

.secure3d-button:active {
  background-color: #256b29;
}
</style>