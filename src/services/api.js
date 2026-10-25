import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const TOKEN_KEY = 'tp_token'

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

const api = axios.create({ baseURL: API_URL, timeout: 15000 })

api.interceptors.request.use((config) => {
  const t = tokenStore.get()
  if (t) config.headers.Authorization = `Token ${t}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && tokenStore.get()) {
      tokenStore.clear()
      window.dispatchEvent(new Event('tp:unauthorized'))
    }
    return Promise.reject(error)
  },
)

/** Message d'erreur lisible à partir d'une erreur Axios. */
export function errorMessage(error) {
  if (!error.response) return 'Impossible de joindre le serveur. Vérifiez votre connexion.'
  const { detail, errors } = error.response.data || {}
  const first = errors && typeof errors === 'object' ? Object.values(errors).flat()[0] : null
  return (typeof first === 'string' && first) || detail || 'Une erreur est survenue.'
}

export default api
