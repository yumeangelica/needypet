import axios, { AxiosInstance } from 'axios';
import { getToken } from '@/services'

const baseUrl: string = import.meta.env.VITE_APP_BACKEND_URL;

const serverUrl: string = baseUrl + '/api';

const ax: AxiosInstance = axios.create({ baseURL: serverUrl });

export const getAllUserPets = async () => {
  const token = getToken();
  if (!token) {
    return false;
  }
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `bearer ${token}`
  };
  const response = await ax.get('/pets', { headers });

  if (response.status !== 200) {
    return false;
  }
  return response.data;
}