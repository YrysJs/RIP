export default defineNuxtPlugin(() => {
    if (typeof window !== 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://mapgl.2gis.com/api/js/v1';
        script.async = true;
        document.head.appendChild(script);
    }
});