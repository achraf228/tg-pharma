import api from './api'

const clean = (params) => Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== false))

export const listPharmacies = (params = {}) => api.get('/pharmacies/', { params: clean(params) }).then((r) => r.data)
export const getPharmacy = (id, coords = {}) => api.get(`/pharmacies/${id}/`, { params: clean(coords) }).then((r) => r.data)
export const setFavorite = (id, on) => (on ? api.post(`/pharmacies/${id}/favorite/`) : api.delete(`/pharmacies/${id}/favorite/`)).then((r) => r.data)
export const getGardeWeek = () => api.get('/gardes/current/').then((r) => r.data)
export const getQuartiers = () => api.get('/quartiers/').then((r) => r.data)

export const createRequest = ({ pharmacy, kind, product_name, file }) => {
  const form = new FormData()
  form.append('pharmacy', pharmacy)
  form.append('kind', kind)
  if (product_name) form.append('product_name', product_name)
  if (file) form.append('prescription', file)
  return api.post('/requests/', form).then((r) => r.data)
}
export const myRequests = (params = {}) => api.get('/requests/', { params: clean(params) }).then((r) => r.data)
export const askQuestion = (text) => api.post('/questions/', { text }).then((r) => r.data)
export const myQuestions = () => api.get('/questions/').then((r) => r.data)
