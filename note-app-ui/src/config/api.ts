export const getApiUrl = () => {
  return import.meta.env.VITE_SERVER_URL || 'http://127.0.0.1:8000';
};
