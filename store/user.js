import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: '',
        user: null,
        authType: '',
        supplierIsActive: true // по умолчанию активен
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

        setSupplierIsActive(isActive) {
            this.supplierIsActive = isActive
        },

        logout() {
            this.token = ''
            this.user = null
            this.supplierIsActive = true
        }
    }
})
