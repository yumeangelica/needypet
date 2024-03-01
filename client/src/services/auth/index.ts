
import router from '@/router';
import axios, { AxiosInstance } from 'axios';

const baseUrl: string = import.meta.env.VITE_APP_BACKEND_URL;

const serverUrl: string = baseUrl + '/auth';

const ax: AxiosInstance = axios.create({ baseURL: serverUrl });


export const checkAndValidateToken = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('Token not found');
    return false;
  }

  try {
    const response = await ax({
      method: 'post',
      url: '/validatetoken',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.status === 200) {
      console.log('Token is valid');
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return true;
    }
  } catch (error) {
    console.error('Error during token validation:', error.response?.status);
    localStorage.removeItem('token');

    return false;
  }
};


export const loginUser = async (userName: string, password: string) => {
  try {
    const response = await ax({
      method: 'post',
      url: '/login',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        userName,
        password
      }
    });

    if (response.status !== 200) {
      return false;
    }
    console.log('Login successful');
    localStorage.setItem('id', response.data.user.id);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('userName', response.data.user.userName);

    router.push({ name: 'home' });
    return true;

  } catch (error) {
    return false;
  }
}
