// frontend/src/lib/api/auth.ts
import axios from 'axios';
import api from '../api'; // also apply it to our custom api instance if imported

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Axios interceptor: catch PROFILE_INCOMPLETE error globally
// Add this to your main layout or _app.tsx setup file
export const setupAxiosInterceptors = (router: any) => {
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.data?.error?.code === 'PROFILE_INCOMPLETE') {
        router.push('/complete-profile');
      }
      return Promise.reject(error);
    }
  );

  // Also catch on the custom Axios instance
  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.data?.error?.code === 'PROFILE_INCOMPLETE') {
        router.push('/complete-profile');
      }
      return Promise.reject(error);
    }
  );
};
