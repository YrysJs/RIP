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
  ],
  plugins: [
    "~/plugins/v-mask.js",
    "~/plugins/axios.js",
    "~/plugins/dropzone-vue.js",
  ],

  css: ["~/css/main.scss", "~/assets/styles/fonts.scss"],
  i18n: {
    locales: [
      { code: "ru", language: "ru-RU", file: "ru.json" },
      { code: "kk", language: "kk-KK", file: "kk.json" },
    ],
    defaultLocale: "ru",
  },
  runtimeConfig: {
    public: {
      twoGisApiKey: "ca092971-0505-4489-a478-a875c6dcbd2f",
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
});
