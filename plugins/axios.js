import axios from 'axios'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
    // const { public: publicConfig } = useRuntimeConfig()

    const api = axios.create({
        baseURL: 'http://194.32.140.209:8092/',
        headers: {
            'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4NDc3NTYzMzAsInJvbGUiOiJjZW1ldGVyeV9tYW5hZ2VyIiwic3ViIjoiNzc3NzczMTgyNDMifQ.nRLOpu4ywdPHL7sHjGWCprEMt6PtwHVBltNQSNNDa0c',
            'Content-Type': 'application/json',
        }
    })


    return {
        provide: {
            axios: api
        }
    }
})