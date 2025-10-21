import { defineStore } from 'pinia'

export const useCemeteryStore = defineStore('cemetery', {
    state: () => ({
        selectedCemetery: null,
        selectedGrave: null,
        neighborGrave: null,
    }),
    actions: {
        setSelected(cemetery) {
            this.selectedCemetery = cemetery
        },
        setSelectedGrave(grave) {
            this.selectedGrave = grave
        },
        setReservationData(cemetery, grave, neighborGrave = null) {
            this.selectedCemetery = cemetery
            this.selectedGrave = grave
            this.neighborGrave = neighborGrave
        },
        clearSelected() {
            this.selectedCemetery = null
        },
        clearSelectedGrave() {
            this.selectedGrave = null
        },
        setNeighborGrave(neighborGrave) {
            this.neighborGrave = neighborGrave
        },
        clearNeighborGrave() {
            this.neighborGrave = null
        },
        clearAll() {
            this.selectedCemetery = null
            this.selectedGrave = null
            this.neighborGrave = null
        },
    },
    getters: {
        hasCompleteSelection: (state) => {
            return state.selectedCemetery && state.selectedGrave
        },
        reservationSummary: (state) => {
            if (!state.selectedCemetery || !state.selectedGrave) return null
            
            return {
                cemetery: {
                    id: state.selectedCemetery.id,
                    name: state.selectedCemetery.name,
                    religion: state.selectedCemetery.religion,
                    address: state.selectedCemetery.street_name,
                },
                grave: {
                    id: state.selectedGrave.id,
                    sector: state.selectedGrave.sector_number,
                    place: state.selectedGrave.grave_number,
                    status: state.selectedGrave.status,
                    size: `${state.selectedGrave.width}x${state.selectedGrave.height}м`,
                }
            }
        }
    }
})