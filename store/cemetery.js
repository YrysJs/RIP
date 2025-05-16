import { defineStore } from 'pinia'

export const useCemeteryStore = defineStore('cemetery', {
    state: () => ({
        selectedCemetery: null,
    }),
    actions: {
        setSelected(polygon) {
            this.selectedCemetery = polygon
        },
        clearSelected() {
            this.selectedCemetery = null
        },
    },
})