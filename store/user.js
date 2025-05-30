import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: '',
        user: null,
        authType: ''
    }),

    actions: {
        setToken(token) {
            this.token = token
        },

        setUser(user) {
            this.user = user
        },

        setAuthType(type) {
            this.authType = type
        },

        logout() {
            this.token = ''
            this.user = null
        }
    }
})
