import api from './api'

export const getDashboard = () => api.get('/pharmacist/dashboard/').then((r) => r.data)
export const getMyPharmacy = () => api.get('/pharmacist/pharmacy/').then((r) => r.data)
export const updateMyPharmacy = (data) => api.patch('/pharmacist/pharmacy/', data).then((r) => r.data)
export const getHours = () => api.get('/pharmacist/hours/').then((r) => r.data)
export const saveHours = (hours) => api.put('/pharmacist/hours/', hours).then((r) => r.data)
export const listRequests = (params = {}) => api.get('/pharmacist/requests/', { params }).then((r) => r.data)
export const answerRequest = (id, status) => api.post(`/pharmacist/requests/${id}/answer/`, { status }).then((r) => r.data)
export const listStock = (search = '') => api.get('/pharmacist/stock/', { params: search ? { search } : {} }).then((r) => r.data)
export const addStock = (name, in_stock = true) => api.post('/pharmacist/stock/', { name, in_stock }).then((r) => r.data)
export const setStock = (id, in_stock) => api.patch(`/pharmacist/stock/${id}/`, { in_stock }).then((r) => r.data)
export const importStock = (file) => {
  const f = new FormData()
  f.append('file', file)
  return api.post('/pharmacist/stock/import/', f).then((r) => r.data)
}
export const listGardes = () => api.get('/pharmacist/gardes/').then((r) => r.data)
export const createGarde = (start, end) => api.post('/pharmacist/gardes/', { start, end }).then((r) => r.data)
export const deleteGarde = (id) => api.delete(`/pharmacist/gardes/${id}/`)
