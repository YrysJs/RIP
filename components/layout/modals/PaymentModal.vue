<template>
  <div v-if="visible" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="payment-form">
        <h2 class="title">Оплата картой</h2>

        <div class="form-group">
          <label class="label">Номер карты</label>
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
            type="email"
            class="input"
            placeholder="example@test.com"
          />
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label class="label">Срок действия</label>
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
            <label class="label">CVC код</label>
            <input
              v-model="cvcCode"
              type="text"
              class="input"
              placeholder="234"
              maxlength="3"
            />
          </div>
        </div>

        <button
          class="pay-button"
          @click="processPayment"
          :disabled="isProcessing"
        >
          {{ isProcessing ? "Обработка..." : "Оплатить" }}
        </button>
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
  },
  data() {
    return {
      cardNumber: "",
      expiryDate: "",
      email: "",
      cvcCode: "",
      isProcessing: false,
    };
  },
  methods: {
    closeModal() {
      if (!this.isProcessing) {
        this.$emit("close");
      }
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
          amount: 100, // Госпошлина
          cardNumber: this.cardNumber.replace(/\s/g, ""),
          currency: "KZT",
          cvc: this.cvcCode,
          email: this.email, // Можно получить из профиля пользователя
          expDate: this.expiryDate.replace("/", ""),
        };

        // 1. Выполняем платеж
        const paymentResponse = await processCardPayment(paymentData);
        console.log(paymentResponse)

        const burialId = this.$route.params.id;
        const paymentId = paymentResponse.data.data.paymentInfo.id;

        if (paymentResponse.data.data.secure3DURL) {
          window.open(paymentResponse.data.data.secure3DURL, '_blank');
          
          // Ждем подтверждения оплаты через интервал
          await this.waitForPaymentConfirmation(burialId, paymentId);
        } else {
          // Если нет 3D Secure, подтверждаем платеж сразу
          await confirmBurialPayment(burialId, paymentId);
        }

        // 2. Обновляем данные захоронения (дата и время)
        if (this.burialData?.burial_date || this.burialData?.burial_time) {
          const burialUpdateData = {
            burial_date: `${this.burialData.burial_date}T${this.burialData.burial_time}:00Z`,
            burial_time: this.burialData.burial_time,
          };
          await updateBurialRequestData(this.burialData.id, burialUpdateData);
        }

        // 4. Загружаем сертификат о смерти, если он есть
        // if (this.deathCertificateFile && this.burialData?.deceased?.id) {
        //   await uploadDeceasedDeathCertificate(
        //     this.burialData.deceased.id,
        //     this.deathCertificateFile
        //   );
        // }

        // 5. Закрываем модалку и сообщаем о успешной оплате
        this.$emit("close");
        this.$emit("success");
      } catch (error) {
        console.log(error)
        console.error("Payment process failed:", error);
        alert(
            "Ошибка при создании мемориала: " +
            (error.response?.data?.error || error.message)
        );
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
</style>
