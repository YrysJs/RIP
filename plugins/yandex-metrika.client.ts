// ~/plugins/yandex-metrika.client.ts
export default defineNuxtPlugin(() => {
    // id счётчика
    const COUNTER_ID = 104468348;
    const SRC = `https://mc.yandex.ru/metrika/tag.js?id=${COUNTER_ID}`;

    // если уже есть, не добавляем снова
    if ((window as any).ym && (window as any).ym.a) return;

    // создаём скрипт и добавляем в <head>
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = SRC;

    script.onload = () => {
        try {
            // Инициализация метрики:
            // Вставляем объявление функц. if not present
            (window as any).ym = (window as any).ym || function() {
                ((window as any).ym.a = (window as any).ym.a || []).push(arguments);
            };
            (window as any).ym.l = (window as any).ym.l || +new Date();

            (window as any).ym(COUNTER_ID, 'init', {
                ssr: true,
                webvisor: true,
                clickmap: true,
                ecommerce: 'dataLayer',
                accurateTrackBounce: true,
                trackLinks: true
            });
        } catch (e) {
            // не даём падать приложению
            // eslint-disable-next-line no-console
            console.error('Yandex Metrika init failed:', e);
        }
    };

    script.onerror = () => {
        // eslint-disable-next-line no-console
        console.warn('Failed to load Yandex Metrika script');
    };

    document.head.appendChild(script);
});
