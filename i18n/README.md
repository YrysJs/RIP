# Конфигурация i18n

## Структура
```
i18n/
├── locales/
│   ├── ru.json  # Русские переводы
│   └── kk.json  # Казахские переводы
└── README.md    # Эта документация
```

## Как работает

### 1. Конфигурация в `nuxt.config.ts`
- Используется модуль `@nuxtjs/i18n`
- Без lazy loading - переводы загружаются через плагин
- Поддерживаются языки: `ru` (по умолчанию) и `kk`
- Стратегия: `no_prefix` (без префиксов в URL)

### 2. Плагин `plugins/i18n.client.ts`
- Загружает JSON файлы с переводами при инициализации
- Устанавливает сообщения для каждой локали
- Восстанавливает выбранный язык из localStorage

### 3. Composable `composables/useTranslation.ts`
Удобная обертка для работы с переводами:

```typescript
const { t, locale, switchLanguage, currentLocale } = useTranslation()

// Перевод
t('header.main')

// Переключить язык
switchLanguage('kk')

// Получить текущий язык
console.log(currentLocale.value)
```

## Использование в компонентах

### Шаблон (template)
```vue
<template>
  <div>{{ $t('header.main') }}</div>
</template>
```

### Script
```vue
<script setup>
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

// Использование
const title = t('mainPage.title')

// Переключение языка
const switchLanguage = (lang) => {
  locale.value = lang
  localStorage.setItem('locale', lang)
}
</script>
```

## Переключатель языка
Реализован во всех header компонентах:
- `components/layout/AppHeader.vue` (desktop)
- `components/layout/AppHeaderClient.vue` (mobile)
- `components/layout/AppHeaderManager.vue` (mobile)
- `components/layout/AppHeaderSupplier.vue` (mobile)
- `components/layout/AppHeaderUser.vue` (mobile)

## Добавление новых переводов

1. Откройте `i18n/locales/ru.json` и добавьте новый ключ
2. Добавьте аналогичный ключ в `i18n/locales/kk.json`
3. Используйте в компонентах через `t('ваш.ключ')`

### Пример:
```json
// ru.json
{
  "mySection": {
    "myKey": "Мой текст"
  }
}

// kk.json
{
  "mySection": {
    "myKey": "Менің мәтінім"
  }
}
```

```vue
<!-- В компоненте -->
<template>
  <div>{{ $t('mySection.myKey') }}</div>
</template>
```

## Устранение неполадок

Если переводы не работают:

1. Очистите кэш:
```bash
rm -rf .nuxt node_modules/.vite node_modules/.cache
```

2. Перезапустите dev сервер:
```bash
npm run dev
```

3. Проверьте в консоли браузера:
```javascript
console.log($i18n.messages)
```

4. Убедитесь, что ключи в JSON файлах существуют и не содержат опечаток

