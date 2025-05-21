// src/Services/api.ts
import axios from 'axios';
import { getOrCreateSessionId } from '../lib/session';

const client = axios.create({
  baseURL: 'https://api-gocami-test.gocami.com/api/',
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use(async (config) => {
  const sessionId = await getOrCreateSessionId();
  if (config.headers) {
    config.headers['x-session'] = sessionId;
  }
  return config;
});

export default client;
