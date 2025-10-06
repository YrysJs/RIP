import axios from 'axios'
import { defineNuxtPlugin } from '#app'
import Cookies from 'js-cookie'
import { toast } from 'vue3-toastify'

export default defineNuxtPlugin(() => {
    const api = axios.create({
        baseURL: 'http://ripservice.kz/'
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

    // Обработка ошибок: показываем тост и обрабатываем 401
    api.interceptors.response.use(response => {
        return response
    }, error => {
        // Показываем тост об ошибке сервера
        
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
