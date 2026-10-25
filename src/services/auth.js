import api from './api'

export const login = (username, password) => api.post('/auth/login/', { username, password }).then((r) => r.data)
export const register = (payload) => api.post('/auth/register/', payload).then((r) => r.data)
export const fetchMe = () => api.get('/auth/me/').then((r) => r.data)
export const logout = () => api.post('/auth/logout/')
