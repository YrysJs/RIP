<template>
  <div v-if="visible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="payment-form">
        <h2 class="title">{{ $t('payment.cardPayment') }}</h2>

        <!-- Iframe для 3D Secure на мобильных устройствах -->
        <div v-if="showSecure3DModal" class="secure3d-modal">
          <h3 class="secure3d-title">{{ $t('payment.secure3DTitle') }}</h3>
          <p class="secure3d-description">{{ $t('payment.secure3DDescription') }}</p>
          <iframe
            ref="secure3DIframe"
            name="3ds-iframe"
            class="secure3d-iframe"
            frameborder="0"
          ></iframe>
        </div>

        <template v-else>

        <!-- Информация о сумме и количестве могил -->
        <div class="payment-info">
          <div class="info-row">
            <span class="info-label">{{ $t('payment.gravesCount') }}</span>
            <span class="info-value">{{ gravesCount }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">{{ $t('payment.pricePerGrave') }}</span>
            <span class="info-value">{{ burialData.burial_price || 100 }} ₸</span>
          </div>
          <div class="info-row total">
            <span class="info-label">{{ $t('payment.totalToPay') }}</span>
            <span class="info-value">{{ totalAmount }} ₸</span>
          </div>
        </div>

        <div class="form-group">
          <label class="label">{{ $t('payment.cardNumber') }}</label>
          <input
              v-model="cardNumber"
              type="text"
              class="input"
              :placeholder="$t('payment.cardNumberPlaceholder')"
              maxlength="19"
              @input="formatCardNumber"
          />
        </div>

        <div class="form-group">
          <label class="label">{{ $t('payment.email') }}</label>
          <input
              v-model="email"
              type="email"
              class="input"
              :placeholder="$t('payment.emailPlaceholder')"
          />
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label class="label">{{ $t('payment.expiryDate') }}</label>
            <input
                v-model="expiryDate"
                type="text"
                class="input"
                :placeholder="$t('payment.expiryPlaceholder')"
                maxlength="5"
                @input="formatExpiryDate"
            />
          </div>

          <div class="form-group half">
            <label class="label">{{ $t('payment.cvv') }}</label>
            <input
                v-model="cvcCode"
                type="password"
                class="input"
                :placeholder="$t('payment.cvvPlaceholder')"
                maxlength="3"
            />
          </div>
        </div>

        <button
            class="pay-button"
            @click="processPayment"
            :disabled="isProcessing"
        >
          {{ isProcessing ? $t('payment.processing') : $t('payment.pay') }}
        </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { processCardPayment, confirmBurialPayment } from "~/services/payments";
import {
  updateBurialRequestStatus,
  updateBurialRequestData,
  uploadDeceasedDeathCertificate,
} from "~/services/client";

export default {
  name: "PaymentModal",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    burialData: {
      type: Object,
      default: () => ({}),
    },
    deathCertificateFile: {
      type: File,
      default: null,
    },
    deathDate: {
      type: String,
      default: "",
    }
  },
  data() {
    return {
      cardNumber: "",
      expiryDate: "",
      email: "",
      cvcCode: "",
      isProcessing: false,
      showSecure3DModal: false,
      secure3DData: null,
      termUrl: "",
      paymentId: null,
    };
  },
  computed: {
    isMobile() {
      if (typeof window === 'undefined') return false;
      return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    // Подсчет количества могил (основная + дополнительные)
    gravesCount() {
      let count = 1; // Основная могила всегда есть

      // Добавляем дополнительные могилы
      if (this.burialData?.adjacent_graves && this.burialData.adjacent_graves.length > 0) {
        count += this.burialData.adjacent_graves.length;
      }

      // Если есть только ID дополнительных мест
      if (this.burialData?.adjacent_grave_ids && this.burialData.adjacent_grave_ids.length > 0) {
        count += this.burialData.adjacent_grave_ids.length;
      }

      return count;
    },

    // Расчет итоговой стоимости с учетом количества могил
    totalAmount() {
      const basePrice = this.burialData.burial_price || 100;
      return basePrice * this.gravesCount;
    }
  },
  mounted() {
    // Добавляем обработчик сообщений от popup с результатом 3DS
    this.handlePaymentMessage = (event) => {
      if (event.data && event.data.type === 'payment_result') {
        // Результат получен из popup, можно обработать если нужно
        console.log('Payment result from 3DS:', event.data);
      }
    };
    window.addEventListener('message', this.handlePaymentMessage);
  },
  beforeUnmount() {
    // Удаляем обработчик при размонтировании компонента
    if (this.handlePaymentMessage) {
      window.removeEventListener('message', this.handlePaymentMessage);
    }
  },
  methods: {
    closeModal() {
      if (!this.isProcessing) {
        this.showSecure3DModal = false;
        this.secure3DData = null;
        this.termUrl = "";
        this.$emit("close");
      }
    },
    open3DSecureForm(action, paReq, md, termUrl) {
      // Создаем форму динамически
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = action;
      form.style.display = 'none';
      
      // Добавляем скрытые поля
      const paReqInput = document.createElement('input');
      paReqInput.type = 'hidden';
      paReqInput.name = 'PaReq';
      paReqInput.value = paReq;
      form.appendChild(paReqInput);
      
      const mdInput = document.createElement('input');
      mdInput.type = 'hidden';
      mdInput.name = 'MD';
      mdInput.value = md;
      form.appendChild(mdInput);
      
      const termUrlInput = document.createElement('input');
      termUrlInput.type = 'hidden';
      termUrlInput.name = 'TermUrl';
      termUrlInput.value = termUrl;
      form.appendChild(termUrlInput);
      
      document.body.appendChild(form);
      
      if (this.isMobile) {
        // На мобильных устройствах используем iframe
        form.target = '3ds-iframe';
        this.$nextTick(() => {
          form.submit();
        });
      } else {
        // На десктопе открываем popup
        const popup = window.open('', '3DSecure', 'width=600,height=600,scrollbars=yes');
        if (popup) {
          form.target = '3DSecure';
          form.submit();
          
          // Отслеживаем закрытие popup
          const checkPopup = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkPopup);
              // Проверяем статус платежа после закрытия popup
              this.checkPaymentStatusAfter3DS();
            }
          }, 500);
        } else {
          // Если popup заблокирован, используем iframe
          this.showSecure3DModal = true;
          form.target = '3ds-iframe';
          this.$nextTick(() => {
            form.submit();
          });
        }
      }
      
      // Удаляем форму после отправки
      setTimeout(() => form.remove(), 100);
    },
    async checkPaymentStatusAfter3DS() {
      if (!this.paymentId) return;
      
      // Ждем немного, чтобы бэкенд обработал результат 3DS
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Проверяем статус платежа через API
      const burialId = this.$route.params.id;
      await this.waitForPaymentConfirmation(burialId, this.paymentId);
      
      // После подтверждения обновляем данные
      if (this.burialData?.burial_date || this.burialData?.burial_time) {
        const burialUpdateData = {
          death_date: this.deathDate + "T00:00:00Z",
          burial_date: `${this.burialData.burial_date}T${this.burialData.burial_time}:00Z`,
          burial_time: this.burialData.burial_time,
        };
        if (this.deathCertificateFile && this.burialData?.deceased?.id) {
          const response = await uploadDeceasedDeathCertificate(
              this.burialData.deceased.id,
              this.deathCertificateFile
          );
          burialUpdateData.death_cert_url = response?.data?.files?.[0]?.fileUrl || ""
        }
        await updateBurialRequestData(this.burialData.id, burialUpdateData);
      }

      // Закрываем модалку и сообщаем о успешной оплате
      this.showSecure3DModal = false;
      this.$emit("close");
      this.$emit("success");
    },
    formatCardNumber(event) {
      let value = event.target.value.replace(/\s/g, "").replace(/[^0-9]/gi, "");
      let matches = value.match(/\d{4,16}/g);
      let match = (matches && matches[0]) || "";
      let parts = [];

      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
      }

      if (parts.length) {
        this.cardNumber = parts.join(" ");
      } else {
        this.cardNumber = value;
      }
    },
    formatExpiryDate(event) {
      let value = event.target.value.replace(/\D/g, "");
      if (value.length >= 2) {
        this.expiryDate = value.substring(0, 2) + "/" + value.substring(2, 4);
      } else {
        this.expiryDate = value;
      }
    },
    async waitForPaymentConfirmation(burialId, paymentId) {
      return new Promise((resolve, reject) => {
        const checkPayment = async () => {
          try {
            await confirmBurialPayment(burialId, paymentId);
            clearInterval(intervalId);
            resolve();
          } catch (error) {
            // Если ошибка - продолжаем попытки
            console.log('Ожидание подтверждения оплаты...');
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
    async processPayment() {
      if (this.isProcessing) return;

      this.isProcessing = true;

      try {
        // Подготавливаем данные для оплаты
        const paymentData = {
          amount: this.totalAmount, // Госпошлина с учетом количества могил
          cardNumber: this.cardNumber.replace(/\s/g, ""),
          currency: "KZT",
          cvc: this.cvcCode,
          email: this.email, // Можно получить из профиля пользователя
          expDate: this.expiryDate.replace("/", ""),
        };

        // 1. Выполняем платеж
        const paymentResponse = await processCardPayment(paymentData);

        const burialId = this.$route.params.id;
        const paymentId = paymentResponse.data.data.paymentInfo.id;
        this.paymentId = paymentId;

        // Проверяем требуется ли 3D Secure
        if (paymentResponse.data.data.requires3DSecure && paymentResponse.data.data.secure3D) {
          const { paReq, md, action } = paymentResponse.data.data.secure3D;
          const termUrl = paymentResponse.data.data.termUrl;
          this.termUrl = termUrl;
          
          // Показываем iframe на мобильных устройствах
          if (this.isMobile) {
            this.showSecure3DModal = true;
          }
          
          // Открываем форму 3D Secure
          this.open3DSecureForm(action, paReq, md, termUrl);
          
          // На мобильных устройствах ждем завершения в iframe и проверяем статус
          if (this.isMobile) {
            // Ждем подтверждения оплаты через интервал
            await this.waitForPaymentConfirmation(burialId, paymentId);
            
            // После подтверждения обновляем данные и закрываем модалку
            // 2. Обновляем данные захоронения (дата и время)
            if (this.burialData?.burial_date || this.burialData?.burial_time) {
              const burialUpdateData = {
                death_date: this.deathDate + "T00:00:00Z",
                burial_date: `${this.burialData.burial_date}T${this.burialData.burial_time}:00Z`,
                burial_time: this.burialData.burial_time,
              };
              if (this.deathCertificateFile && this.burialData?.deceased?.id) {
                const response = await uploadDeceasedDeathCertificate(
                    this.burialData.deceased.id,
                    this.deathCertificateFile
                );
                burialUpdateData.death_cert_url = response?.data?.files?.[0]?.fileUrl || ""
              }
              await updateBurialRequestData(this.burialData.id, burialUpdateData);
            }

            // Закрываем модалку и сообщаем о успешной оплате
            this.showSecure3DModal = false;
            this.$emit("close");
            this.$emit("success");
          }
          // На десктопе popup сам обработает результат, проверка статуса будет в checkPaymentStatusAfter3DS
        } else {
          // Если нет 3D Secure, подтверждаем платеж сразу
          await confirmBurialPayment(burialId, paymentId);

          // 2. Обновляем данные захоронения (дата и время)
          if (this.burialData?.burial_date || this.burialData?.burial_time) {
            const burialUpdateData = {
              death_date: this.deathDate + "T00:00:00Z",
              burial_date: `${this.burialData.burial_date}T${this.burialData.burial_time}:00Z`,
              burial_time: this.burialData.burial_time,
            };
            if (this.deathCertificateFile && this.burialData?.deceased?.id) {
              const response = await uploadDeceasedDeathCertificate(
                  this.burialData.deceased.id,
                  this.deathCertificateFile
              );
              burialUpdateData.death_cert_url = response?.data?.files?.[0]?.fileUrl || ""
            }
            await updateBurialRequestData(this.burialData.id, burialUpdateData);
          }

          // Закрываем модалку и сообщаем о успешной оплате
          this.$emit("close");
          this.$emit("success");
        }
      } catch (error) {
        console.log(error)
        console.error("Payment process failed:", error);
        const { $toast } = useNuxtApp()
        $toast.error("Ошибка при попытке оплаты: " +
            (error.response?.data?.error || error.message))
      } finally {
        this.isProcessing = false;
      }
    },
  },
};
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
  max-width: 400px;
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
  margin: 0 0 32px 0;
  text-align: left;
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
  border-color: #4caf50;
  background-color: white;
}

.input::placeholder {
  color: #999;
}

.pay-button {
  width: 100%;
  padding: 16px;
  background-color: #4caf50;
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
  background-color: #45a049;
}

.pay-button:active {
  background-color: #3d8b40;
}

.payment-info {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row.total {
  border-top: 1px solid #dee2e6;
  padding-top: 8px;
  margin-top: 8px;
  font-weight: 600;
  font-size: 16px;
}

.info-label {
  color: #6c757d;
  font-size: 14px;
}

.info-value {
  color: #212529;
  font-weight: 500;
  font-size: 14px;
}

.info-row.total .info-value {
  color: #28a745;
  font-size: 16px;
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
    margin-bottom: 24px;
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

.secure3d-iframe {
  width: 100%;
  min-height: 500px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
}

@media (max-width: 480px) {
  .secure3d-iframe {
    min-height: 400px;
  }
}
</style>