<template>
  <div v-if="visible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="payment-form">
        <h2 class="title">{{ $t('payment.orderPayment') }}</h2>
        
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
      isProcessing: false
    }
  },
  methods: {
    closeModal() {
      if (!this.isProcessing) {
        this.$emit('close')
      }
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
    async parse3DSecureFromURL(secure3DURL) {
      // Делаем запрос на URL чтобы получить HTML форму
      const { $axios } = useNuxtApp()
      try {
        const response = await $axios.get(secure3DURL, {
          responseType: 'text'
        })
        
        // Создаем временный DOM элемент для парсинга HTML
        const parser = new DOMParser()
        const doc = parser.parseFromString(response.data, 'text/html')
        
        // Ищем форму на странице
        const form = doc.querySelector('form')
        if (!form) {
          throw new Error('Форма не найдена на странице 3D Secure')
        }
        
        // Извлекаем action формы
        const action = form.action || secure3DURL
        
        // Извлекаем значения полей из формы
        const paReqInput = form.querySelector('input[name="PaReq"], input[name="paReq"]')
        const mdInput = form.querySelector('input[name="MD"], input[name="md"]')
        const termUrlInput = form.querySelector('input[name="TermUrl"], input[name="termUrl"]')
        
        return {
          action: action,
          paReq: paReqInput ? paReqInput.value : '',
          md: mdInput ? mdInput.value : '',
          termUrl: termUrlInput ? termUrlInput.value : ''
        }
      } catch (error) {
        console.error('Ошибка при парсинге 3D Secure URL:', error)
        throw error
      }
    },
    open3DSecureForm(action, paReq, md, termUrl) {
      // Создать форму динамически
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = action
      form.style.display = 'none'
      
      // Добавить скрытые поля
      const paReqInput = document.createElement('input')
      paReqInput.type = 'hidden'
      paReqInput.name = 'PaReq'
      paReqInput.value = paReq
      form.appendChild(paReqInput)
      
      const mdInput = document.createElement('input')
      mdInput.type = 'hidden'
      mdInput.name = 'MD'
      mdInput.value = md
      form.appendChild(mdInput)
      
      const termUrlInput = document.createElement('input')
      termUrlInput.type = 'hidden'
      termUrlInput.name = 'TermUrl'
      termUrlInput.value = termUrl
      form.appendChild(termUrlInput)
      
      document.body.appendChild(form)
      
      // Открыть в новом окне/popup
      const popup = window.open('', '3DSecure', 'width=600,height=600,scrollbars=yes')
      form.target = '3DSecure'
      form.submit()
      
      // Отслеживать закрытие popup
      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup)
          // Проверить статус платежа через API можно здесь
          console.log('3D Secure popup closed')
        }
      }, 500)
      
      // Удалить форму после отправки
      setTimeout(() => form.remove(), 100)
      
      return popup
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

        // 1. Выполняем платеж
        const paymentResponse = await processCardPayment(paymentData)

        // Получаем transaction_id из ответа платежа
        const transactionId = paymentResponse.data.data.paymentInfo.id
        let requires3DSecure = false

        // Проверяем, требуется ли 3D Secure
        if (paymentResponse.data.data.requires3DSecure && paymentResponse.data.data.secure3D) {
          // Новый формат API - данные уже в JSON
          requires3DSecure = true
          const { paReq, md, action } = paymentResponse.data.data.secure3D
          const termUrl = paymentResponse.data.data.termUrl
          
          // Открываем 3D Secure форму
          this.open3DSecureForm(action, paReq, md, termUrl)
          
          // Примечание: после прохождения 3D Secure пользователь будет перенаправлен на страницу результата
          // Бэкенд обработает результат и подтвердит платеж автоматически
        } else if (paymentResponse.data.data.secure3DURL) {
          // Старый формат API - получаем URL, парсим HTML и извлекаем данные
          requires3DSecure = true
          
          try {
            // Парсим URL и извлекаем данные формы
            const secure3DData = await this.parse3DSecureFromURL(paymentResponse.data.data.secure3DURL)
            
            // Открываем 3D Secure форму с извлеченными данными
            this.open3DSecureForm(
              secure3DData.action,
              secure3DData.paReq,
              secure3DData.md,
              secure3DData.termUrl
            )
          } catch (error) {
            console.error('Ошибка при обработке 3D Secure URL:', error)
            // Fallback - открываем URL напрямую если парсинг не удался
            window.open(paymentResponse.data.data.secure3DURL, '_blank', 'noopener,noreferrer')
          }
        }

        // 2. Создаем заказ через API с правильной структурой
        // Создаем заказ независимо от наличия burialData
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

        // Подтверждаем платеж заказа только если нет 3D Secure
        // Если есть 3D Secure, подтверждение произойдет после прохождения аутентификации
        if (!requires3DSecure && transactionId && orderResponse?.data?.id) {
          console.log('Confirming order payment...')
          await confirmOrderPayment(orderResponse.data.id, transactionId)
          console.log('Order payment confirmed')
        } else if (requires3DSecure && transactionId && orderResponse?.data?.id) {
          console.log('3D Secure required, payment confirmation will be handled by backend after authentication')
          // Платеж будет подтвержден бэкендом после успешного прохождения 3D Secure
        }


        // 3. Обрабатываем результат
        if (requires3DSecure) {
          // При 3D Secure не закрываем модалку сразу - пользователь завершит оплату в popup
          // После прохождения 3D Secure бэкенд перенаправит на страницу результата
          // Можно показать сообщение пользователю
          const { $toast } = useNuxtApp()
          $toast.info('Пожалуйста, завершите аутентификацию 3D Secure в открывшемся окне')
          // Не закрываем модалку, чтобы пользователь мог видеть процесс
          // Модалка закроется после успешного прохождения 3D Secure через страницу результата
        } else {
          // Если нет 3D Secure, закрываем модалку и сообщаем об успехе
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
</style>
