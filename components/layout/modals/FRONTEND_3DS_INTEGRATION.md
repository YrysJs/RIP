# Инструкция по интеграции 3D Secure на фронтенде

## Изменения в API

Теперь бэкенд **НЕ рендерит HTML**, а отдает данные 3D Secure в JSON формате. Фронтенд должен самостоятельно построить форму и отправить её на страницу банка.

---

## 1. Создание платежа (POST /api/v1/payments/card)

### Запрос:
```json
{
  "cardNumber": "4405639999999999",
  "expDate": "1225",
  "cvc": "123",
  "amount": 1000,
  "currency": "KZT",
  "email": "user@example.com",
  "description": "Оплата услуги",
  "terminalType": "burial"
}
```

### Ответ без 3D Secure (обычная оплата):
```json
{
  "success": true,
  "data": {
    "paymentInfo": {
      "id": 123,
      "amount": 1000,
      "currency": "KZT",
      "invoiceID": "123456789012345",
      "status": "CHARGE",
      ...
    },
    "invoiceID": "123456789012345"
  }
}
```

### Ответ с 3D Secure:
```json
{
  "success": true,
  "data": {
    "requires3DSecure": true,
    "secure3D": {
      "paReq": "eJxVUl1TozAU/SsMrx1JSFuXdm7jsFZ23dbKmrabO+hYhCrYEDEFrf70JC3683XPunXPPQmcHYq98yJUnZdy5voedh0h...",
      "md": "271710719-E54F6D8F865285D4",
      "action": "https://cardsecure.kkb.kz/CommerSafeACS/pa?id=YLcP2547mFFVw"
    },
    "termUrl": "https://your-backend.kz/api/v1/payment/callback",
    "paymentInfo": {
      "id": 123,
      "amount": 1000,
      "currency": "KZT",
      "invoiceID": "123456789012345",
      ...
    },
    "invoiceID": "123456789012345",
    "message": "Требуется прохождение 3D Secure аутентификации"
  }
}
```

---

## 2. Обработка 3D Secure на фронтенде

### React/Vue/Angular пример:

```javascript
async function processPayment(paymentData) {
  try {
    const response = await fetch('https://your-backend.kz/api/v1/payments/card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + yourToken
      },
      body: JSON.stringify(paymentData)
    });

    const result = await response.json();

    if (result.success && result.data.requires3DSecure) {
      // Платеж требует 3D Secure
      const { paReq, md, action } = result.data.secure3D;
      const termUrl = result.data.termUrl;
      
      // Открыть 3D Secure форму
      open3DSecureForm(action, paReq, md, termUrl);
    } else if (result.success) {
      // Платеж успешно завершен без 3D Secure
      showSuccessMessage(result.data.paymentInfo);
    } else {
      // Ошибка платежа
      showErrorMessage(result.error);
    }
  } catch (error) {
    console.error('Payment error:', error);
    showErrorMessage('Ошибка при создании платежа');
  }
}

function open3DSecureForm(action, paReq, md, termUrl) {
  // Создать форму динамически
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = action;
  form.style.display = 'none';
  
  // Добавить скрытые поля
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
  
  // ВАРИАНТ 1: Открыть в новом окне/popup (РЕКОМЕНДУЕТСЯ)
  const popup = window.open('', '3DSecure', 'width=600,height=600,scrollbars=yes');
  form.target = '3DSecure';
  form.submit();
  
  // Опционально: отслеживать закрытие popup
  const checkPopup = setInterval(() => {
    if (popup.closed) {
      clearInterval(checkPopup);
      // Проверить статус платежа через API
      checkPaymentStatus();
    }
  }, 500);
  
  // ВАРИАНТ 2: Открыть в iframe на текущей странице
  // const iframe = document.getElementById('3ds-iframe');
  // form.target = iframe.name;
  // form.submit();
  
  // Удалить форму после отправки
  setTimeout(() => form.remove(), 100);
}
```

---

## 3. Обработка результата 3D Secure

После ввода пароля 3D Secure, банк отправит данные на `termUrl` (ваш бэкенд).
Бэкенд обработает результат и **сделает редирект на фронтенд** со статусом:

### Редирект на фронтенд:
```
https://your-frontend.com/payment-result?status=success&invoiceId=123456789012345&amount=1000&currency=KZT&paymentId=123
```

### Параметры редиректа:

| Параметр | Значение | Описание |
|----------|----------|----------|
| `status` | `success` | Платеж успешно завершен |
|          | `pending` | Платеж в обработке |
|          | `failed` | Платеж отклонен |
|          | `declined` | Платеж отклонен банком |
|          | `error` | Ошибка при обработке |
| `invoiceId` | string | Номер заказа |
| `amount` | number | Сумма платежа |
| `currency` | string | Валюта (KZT) |
| `paymentId` | number | ID платежа в системе |
| `code` | number | Код ошибки (только при ошибке) |
| `message` | string | Сообщение об ошибке (только при ошибке) |

### Пример страницы результата (`/payment-result`):

```javascript
// React пример
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function PaymentResult() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const invoiceId = searchParams.get('invoiceId');
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency');
  const message = searchParams.get('message');

  useEffect(() => {
    // Закрыть popup если был открыт
    if (window.opener) {
      window.opener.postMessage({
        type: 'payment_result',
        status: status,
        invoiceId: invoiceId,
        amount: amount
      }, '*');
      window.close();
    }
  }, [status, invoiceId, amount]);

  if (status === 'success') {
    return (
      <div className="success-page">
        <h1>✓ Платеж успешно завершен!</h1>
        <p>Номер заказа: {invoiceId}</p>
        <p>Сумма: {amount} {currency}</p>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="pending-page">
        <h1>⏳ Платеж обрабатывается</h1>
        <p>Номер заказа: {invoiceId}</p>
        <p>Статус будет обновлен автоматически</p>
      </div>
    );
  }

  return (
    <div className="error-page">
      <h1>✗ Ошибка платежа</h1>
      <p>{message || 'Платеж отклонен'}</p>
    </div>
  );
}

export default PaymentResult;
```

---

## 4. Проверка статуса платежа (опционально)

Если нужно проверить статус платежа после 3D Secure:

```javascript
async function checkPaymentStatus(paymentId) {
  try {
    const response = await fetch(`https://your-backend.kz/api/v1/payments/${paymentId}/status`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + yourToken
      }
    });

    const result = await response.json();
    
    if (result.success) {
      const payment = result.data.payment;
      
      if (payment.statusInternal === 'COMPLETED') {
        showSuccessMessage(payment);
      } else if (payment.statusInternal === 'PENDING') {
        // Продолжить ожидание
        setTimeout(() => checkPaymentStatus(paymentId), 5000);
      } else {
        showErrorMessage('Платеж не завершен');
      }
    }
  } catch (error) {
    console.error('Status check error:', error);
  }
}
```

---

## 5. Переменная окружения на бэкенде

Не забудьте добавить в `.env` бэкенда:

```env
FRONTEND_URL=https://your-frontend.com
```

Или для локальной разработки:

```env
FRONTEND_URL=http://localhost:3000
```

---

## Важные замечания:

1. **Safari совместимость**: Новый подход полностью совместим с Safari, так как форма отправляется явно через `form.submit()`, а не через JavaScript редирект.

2. **Popup блокировка**: Если браузер блокирует popup, используйте iframe на текущей странице.

3. **CORS**: Убедитесь что бэкенд настроен для CORS запросов с вашего фронтенда.

4. **Безопасность**: `termUrl` должен быть доступен публично (не требует авторизации), так как банк делает POST запрос на него.

5. **Тестирование**: Используйте тестовые карты:
   - **С 3D Secure**: 4405639999999999, 12/25, 123
   - Пароль 3D Secure на тестовом окружении обычно: `12345678`

---

## Полный пример интеграции:

```javascript
class PaymentService {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async createPayment(paymentData) {
    const response = await fetch(`${this.baseURL}/api/v1/payments/card`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(paymentData)
    });

    return await response.json();
  }

  handle3DSecure(secure3D, termUrl) {
    const { action, paReq, md } = secure3D;
    
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = action;
    form.style.display = 'none';
    
    form.innerHTML = `
      <input type="hidden" name="PaReq" value="${paReq}">
      <input type="hidden" name="MD" value="${md}">
      <input type="hidden" name="TermUrl" value="${termUrl}">
    `;
    
    document.body.appendChild(form);
    
    const popup = window.open('', '3DSecure', 'width=600,height=600');
    form.target = '3DSecure';
    form.submit();
    
    setTimeout(() => form.remove(), 100);
    
    return new Promise((resolve) => {
      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);
          resolve();
        }
      }, 500);
    });
  }

  async processPayment(paymentData) {
    try {
      const result = await this.createPayment(paymentData);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      if (result.data.requires3DSecure) {
        await this.handle3DSecure(
          result.data.secure3D,
          result.data.termUrl
        );
        // После закрытия popup пользователь будет на странице /payment-result
        return { requires3DS: true, paymentId: result.data.paymentInfo.id };
      }
      
      return { success: true, payment: result.data.paymentInfo };
    } catch (error) {
      console.error('Payment error:', error);
      throw error;
    }
  }
}

// Использование:
const paymentService = new PaymentService('https://your-backend.kz', userToken);

paymentService.processPayment({
  cardNumber: '4405639999999999',
  expDate: '1225',
  cvc: '123',
  amount: 1000,
  currency: 'KZT',
  email: 'user@example.com',
  description: 'Оплата услуги'
}).then(result => {
  if (result.requires3DS) {
    console.log('3D Secure required, waiting for result...');
  } else {
    console.log('Payment successful:', result.payment);
  }
}).catch(error => {
  console.error('Payment failed:', error);
});
```

---

## Troubleshooting:

**Проблема**: Popup блокируется браузером
**Решение**: Используйте iframe вместо popup

**Проблема**: После 3DS не возвращается на фронт
**Решение**: Проверьте что `FRONTEND_URL` правильно настроен в `.env`

**Проблема**: CORS ошибка
**Решение**: Убедитесь что фронтенд URL добавлен в `ALLOWED_ORIGINS` на бэкенде

**Проблема**: Safari не отправляет форму
**Решение**: Этот код уже совместим с Safari! Проверьте консоль на ошибки.

