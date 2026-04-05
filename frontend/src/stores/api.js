import { defineStore } from 'pinia'
import { ref } from 'vue'

const BASE = 'http://localhost:3000/api'

export const useApiStore = defineStore('api', () => {
  const loading = ref(false)
  const error = ref(null)

  async function request(method, path, body = null) {
    loading.value = true
    error.value = null
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
      }
      if (body) options.body = JSON.stringify(body)
      const res = await fetch(BASE + path, options)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Orders
  const getOrders = () => request('GET', '/orders')
  const createOrder = (body) => request('POST', '/orders', body)

  // Upload
  async function uploadInvoice(file) {
    loading.value = true
    error.value = null
    try {
      const form = new FormData()
      form.append('invoice', file)
      const res = await fetch(BASE + '/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Logs
  const getLogs = (params = '') => request('GET', `/logs${params}`)
  const getPipelineStatus = () => request('GET', '/logs/pipeline-status')

  return {
    loading, error,
    getOrders, createOrder,
    uploadInvoice,
    getLogs, getPipelineStatus,
  }
})
