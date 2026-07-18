import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const attachAuthInterceptors = (store, { refreshSession, logoutLocal }) => {
  api.interceptors.request.use((config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/refresh-token')
      ) {
        originalRequest._retry = true;
        const result = await store.dispatch(refreshSession());

        if (refreshSession.fulfilled.match(result)) {
          originalRequest.headers.Authorization = `Bearer ${result.payload.accessToken}`;
          return api(originalRequest);
        }

        store.dispatch(logoutLocal());
      }

      return Promise.reject(error);
    }
  );
};
