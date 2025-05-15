export default defineNuxtPlugin((nuxtApp) => {
    if (typeof window !== 'undefined') {
        const script = document.createElement('script')
        script.src = 'https://maps.api.2gis.ru/2.0/loader.js?pkg=full'
        script.async = true
        document.head.appendChild(script)
    }
})
