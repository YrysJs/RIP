import axios from 'axios'
import { defineNuxtPlugin } from '#app'
import Cookies from 'js-cookie'

export default defineNuxtPlugin(() => {
    const api = axios.create({
        baseURL: 'https://ripservice.kz/'
    })
    
    // Добавляем токен из Cookies перед каждым запросом
    api.interceptors.request.use(config => {
        const token = Cookies.get('token')
        if (token) {
            config.headers.Authorization = 'Bearer ' + token
        }
        return config
    }, error => {
        return Promise.reject(error)
    })

    // Обработка 401: удаляем токен и роль из куков
    api.interceptors.response.use(response => {
        return response
    }, error => {
        if (error.response?.status === 401) {
            Cookies.remove('token')
            Cookies.remove('role')
            // Можно перенаправить на /login:
            // window.location.href = '/login'
        }
        return Promise.reject(error)
    })

    return {
        provide: {
            axios: api
        }
    }
})
