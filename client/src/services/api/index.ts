import axios, { AxiosInstance } from 'axios';

const baseUrl: string = import.meta.env.VITE_APP_BACKEND_URL;

const serverUrl: string = baseUrl + '/api';

const ax: AxiosInstance = axios.create({ baseURL: serverUrl });

// ONLY FOR TESTING, REMOVE IN PRODUCTION
export const getAllPets = async () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `bearer ${token}`
  };
  const response = await ax.get('/pets', { headers });
  return response.data;
}
