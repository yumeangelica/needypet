// Use this axios instance to make requests to the backend in user and pet stores.
import axios, { AxiosInstance } from 'axios';

const baseURL: string = import.meta.env.VITE_APP_BACKEND_URL;

export const axiosInstance: AxiosInstance = axios.create({ baseURL });
