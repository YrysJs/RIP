import { defineStore } from 'pinia'

export const useNewsStore = defineStore('news', {
    state: () => ({
        selectedNews: null,
    }),
    actions: {
        setSelected(news) {
            this.selectedNews = news
        },
        clearSelected() {
            this.selectedNews = null
        },
    }
})