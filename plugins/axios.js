import axios from 'axios'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
    // const { public: publicConfig } = useRuntimeConfig()

    const api = axios.create({
        baseURL: 'http://194.32.140.209:8082/',
        headers: {
            'Authorization': '101_manager_manager@example.com',
            'Content-Type': 'application/json',
        }
    })


    return {
        provide: {
            axios: api
        }
    }
})