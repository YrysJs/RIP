import { useNuxtApp } from '#app'


function getTemplate() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97/api/v1/admin/graves/template-xlsx/download',
        responseType: 'blob',
    })
}

function CreateCemetery(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: 'http://91.147.92.97/api/v1/admin/cemeteries',
        data
    })
}

function UpdateCemetery(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PUT',
        url: 'http://91.147.92.97/api/v1/admin/cemeteries/' + data.id,
        data
    })
}

function CreateAkimat(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'PUT',
        url: 'http://91.147.92.97:8081/rip-government/v1/akimat',
        data
    })
}

function getAkimats() {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'GET',
        url: 'http://91.147.92.97:8081/rip-government/v1/akimats',
    })
}

function importXlsx(data) {
    const { $axios } = useNuxtApp()
    return $axios({
        method: 'POST',
        url: 'http://91.147.92.97/api/v1/admin/graves/import-xlsx',
        data
    })
}

export {
    getTemplate,
    CreateCemetery,
    importXlsx,
    UpdateCemetery,
    getAkimats,
    CreateAkimat
}
