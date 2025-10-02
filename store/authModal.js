import { defineStore } from 'pinia'

export const useAuthModalStore = defineStore('authModal', {
    state: () => ({
        showLoginMenu: false,
        showAdminMenu: false,
        activeModal: ''
    }),

    actions: {
        // Методы для управления главным меню входа
        toggleLoginMenu() {
            this.showLoginMenu = !this.showLoginMenu
        },

        closeLoginMenu() {
            this.showLoginMenu = false
        },

        openLoginMenu() {
            this.showLoginMenu = true
        },

        // Методы для управления административным меню
        toggleAdminMenu() {
            this.showAdminMenu = !this.showAdminMenu
        },

        closeAdminMenu() {
            this.showAdminMenu = false
        },

        openAdminMenu() {
            this.showAdminMenu = true
        },

        // Методы для управления конкретными модалками
        openModal(type) {
            this.closeLoginMenu()
            this.closeAdminMenu()
            this.activeModal = type
        },

        closeModal() {
            this.activeModal = ''
        },

        // Конкретные методы для каждого типа модалки
        openClientModal() {
            this.openModal('client')
        },

        openManagerModal() {
            this.openModal('manager')
        },

        openSupplierModal() {
            this.openModal('supplier')
        },

        openAkimatModal() {
            this.openModal('akimat')
        }
    }
})
