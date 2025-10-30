const SUPPORTED_LOCALES = ['ru', 'kk'] as const
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export default defineNuxtPlugin((nuxtApp) => {
  if (!process.client) {
    return
  }

  const applySavedLocale = async () => {
    const savedLocale = localStorage.getItem('locale')
    if (!savedLocale || !SUPPORTED_LOCALES.includes(savedLocale as SupportedLocale)) {
      return
    }

    const i18n = nuxtApp.$i18n
    if (!i18n) {
      return
    }

    // Используем setLocale для правильной загрузки lazy локалей
    if (typeof i18n.setLocale === 'function') {
      await i18n.setLocale(savedLocale)
      return
    }

    if (i18n.locale && 'value' in i18n.locale && i18n.locale.value !== savedLocale) {
      i18n.locale.value = savedLocale
    }
  }

  applySavedLocale()
  nuxtApp.hook('app:mounted', applySavedLocale)
})

