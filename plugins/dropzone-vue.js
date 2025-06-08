import { defineNuxtPlugin } from '#app'
import DropZone from 'dropzone-vue'
import 'dropzone-vue/dist/dropzone-vue.common.css'

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(DropZone)
})