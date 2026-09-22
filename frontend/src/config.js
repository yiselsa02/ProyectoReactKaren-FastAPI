const API_URL = (
  import.meta.env.VITE_API_URL ||
  'https://cellworld-backend.vercel.app'
).replace(/\/$/, '')

export { API_URL }
export default API_URL
