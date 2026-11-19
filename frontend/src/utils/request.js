import { api } from './api';

/**
 * Reusable request helper functions
 */
export const request = {
  get: async (url, params = {}) => {
    const res = await api.get(url, { params });
    return res.data;
  },

  post: async (url, data = {}, config = {}) => {
    const res = await api.post(url, data, config);
    return res.data;
  },

  put: async (url, data = {}, config = {}) => {
    const res = await api.put(url, data, config);
    return res.data;
  },

  delete: async (url, params = {}) => {
    const res = await api.delete(url, { params });
    return res.data;
  },
};
