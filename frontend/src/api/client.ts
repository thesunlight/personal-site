import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30000,
});

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Track retry count
  if (!config.metadata) {
    config.metadata = { retryCount: 0 };
  }
  return config;
});

client.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    const config = err.config;
    // Retry on network/timeout errors (no response from server), max 2 retries
    const isNetworkError = !err.response && (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK' || /timeout/i.test(err.message));
    if (isNetworkError && config && (config.metadata?.retryCount ?? 0) < 2) {
      config.metadata = { retryCount: (config.metadata?.retryCount ?? 0) + 1 };
      await new Promise((r) => setTimeout(r, 1000 * config.metadata.retryCount));
      return client(config).then((r: any) => r);
    }
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err.response?.data || err);
  }
);

export default client;
