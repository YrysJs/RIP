// http://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  modules: [
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/fonts",
    "@nuxt/eslint",
    "@pinia/nuxt",
    "@nuxtjs/i18n",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/sitemap",
    "@nuxtjs/robots",
    "@vee-validate/nuxt",
    "nuxt-schema-org",
    "nuxt-swiper",
    "six-dropzone",
    'vue-yandex-maps/nuxt',
  ],
  plugins: [
    "~/plugins/v-mask.js",
    "~/plugins/axios.js",
    "~/plugins/dropzone-vue.js",
    "~/plugins/toast.client.js",
    "~/plugins/halyk.client.js",
  ],
  yandexMaps: {
    apikey: 'c8be6d3f-5040-4607-8cb1-082ea246eb81',
    lang: 'ru_RU',
    version: '3.0',
  },
  css: ["~/css/main.scss", "~/assets/styles/fonts.scss"],
  i18n: {
    vueI18n: './i18n.config.ts',
    locales: [
      {
        code: 'ru',
        iso: 'ru-RU',
        name: 'Русский',
        file: 'ru.json'
      },
      {
        code: 'kk',
        iso: 'kk-KZ',
        name: 'Қазақша',
        file: 'kk.json'
      }
    ],
    lazy: true,
    langDir: 'locales',
    defaultLocale: 'ru',
    strategy: 'no_prefix',
    compilation: {
      strictMessage: false,
      escapeHtml: false
    }
  },
  runtimeConfig: {
    public: {
      googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || 'G-CG64RCB9FR',
      apiBaseUrl: 'https://stage.ripservice.kz',
      twoGisApiKey: "0b75b800-a23a-42d2-a943-3d04be6ebfc3",
      yandexMapApiKey: "c8be6d3f-5040-4607-8cb1-082ea246eb81",
    },
  },
  tailwindcss: {
    cssPath: "~/assets/css/tailwind.css",
    config: {},
    viewer: true,
    exposeConfig: false,
  },

  schemaOrg: {
    defaults: false,
  },

  robots: {
    disallow: ["/secret", "/admin"],
    allow: "/admin/login",
  },

  sitemap: {
    xslColumns: [
      { label: "URL", width: "50%" },
      { label: "Last Modified", select: "sitemap:lastmod", width: "25%" },
      { label: "Priority", select: "sitemap:priority", width: "12.5%" },
      {
        label: "Change Frequency",
        select: "sitemap:changefreq",
        width: "12.5%",
      },
    ],
  },

  vite: {
    server: {
      allowedHosts: ["ripservice.kz", "localhost", "127.0.0.1"],
    },
  },

  fonts: {
    families: [{ name: "Manrope", provider: "google" }],
  },

  app: {
    head: {
      script: [
        {
          // Единственный корректный блок вставки Yandex.Metrika
          // использую `children` вместо `innerHTML`
          children: `
            (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {
                if (document.scripts[j].src === r) { return; }
              }
              k=e.createElement(t),a=e.getElementsByTagName(t)[0];
              k.async=1;k.src=r;a.parentNode.insertBefore(k,a);
            })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=104468348', 'ym');

            ym(104468348, 'init', {
              ssr: true,
              webvisor: true,
              clickmap: true,
              ecommerce: "dataLayer",
              accurateTrackBounce: true,
              trackLinks: true
            });
          `,
          type: 'text/javascript',
          // опционально: уникальный id, чтобы Nuxt не дублировал его
          hid: 'yandex-metrika'
        },
        {
          children: `
            (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {
                if (document.scripts[j].src === r) { return; }
              }
              k=e.createElement(t),a=e.getElementsByTagName(t)[0];
              k.async=1;k.src=r;a.parentNode.insertBefore(k,a);
            })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=104468348', 'ym');

            ym(104468348, 'init', {
              ssr: true,
              webvisor: true,
              clickmap: true,
              ecommerce: "dataLayer",
              accurateTrackBounce: true,
              trackLinks: true
            });
          `,
          type: 'text/javascript',
          hid: 'yandex-metrika'
        },

        // --- Google gtag (async загрузчик) ---
        {
          src: 'https://www.googletagmanager.com/gtag/js?id=G-CG64RCB9FR',
          async: true,
          hid: 'gtag-js'
        },

        // --- Инициализация gtag ---
        {
          children: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CG64RCB9FR', { send_page_view: false });
          `,
          type: 'text/javascript',
          hid: 'gtag-init'
        }
      ],

      noscript: [
        {
          children: '<div><img src="https://mc.yandex.ru/watch/104468348" style="position:absolute; left:-9999px;" alt="" /></div>'
        }
      ]
    }
  }
});