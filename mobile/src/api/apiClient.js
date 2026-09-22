import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

export function getDevServerHost() {
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const match = scriptURL.match(/^https?:\/\/([^/:]+)/);
    if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
      return match[1];
    }
  }
  return '10.226.48.184';
}

export const API_BASE_URL = `http://${getDevServerHost()}:8000`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000
});

apiClient.interceptors.request.use(async (config) => {
  const host = getDevServerHost();
  if (host) {
    config.baseURL = `http://${host}:8000`;
  }
  const token = await AsyncStorage.getItem('caresignal_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default apiClient;
