export const useTranslation = () => {
  const { t, locale } = useI18n()
  
  const switchLanguage = (lang: 'ru' | 'kk') => {
    locale.value = lang
    if (process.client) {
      localStorage.setItem('locale', lang)
    }
  }
  
  const currentLocale = computed(() => locale.value)
  
  return {
    t,
    locale,
    switchLanguage,
    currentLocale
  }
}

