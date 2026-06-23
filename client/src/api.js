import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const posts = {
  list: (params) => api.get('/posts', { params }),
  get: (id) => api.get(`/posts/${id}`),
  create: (data) => api.post('/posts', data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
  like: (id) => api.post(`/posts/${id}/like`),
  dislike: (id) => api.post(`/posts/${id}/dislike`),
  wishlist: (id) => api.post(`/posts/${id}/wishlist`),
  related: (id) => api.get(`/posts/${id}/related`),
  trendingTags: () => api.get('/users/trending-tags'),
};

export const comments = {
  list: (postId) => api.get(`/posts/${postId}/comments`),
  create: (postId, data) => api.post(`/posts/${postId}/comments`, data),
  update: (postId, commentId, data) => api.put(`/posts/${postId}/comments/${commentId}`, data),
  delete: (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}`),
};

export const users = {
  get: (id) => api.get(`/users/${id}`),
  getPosts: (id, params) => api.get(`/users/${id}/posts`, { params }),
  getWishlist: (id) => api.get(`/users/${id}/wishlist`),
  updateProfile: (data) => api.put('/users/profile', data),
  follow: (id) => api.post(`/users/${id}/follow`),
};

export const notifications = {
  list: () => api.get('/notifications'),
  markRead: () => api.put('/notifications/read'),
};

export default api;
