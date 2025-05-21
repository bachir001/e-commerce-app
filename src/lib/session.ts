// src/lib/session.ts
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const SESSION_KEY = 'session_id';

export async function getOrCreateSessionId(): Promise<string> {
  let sessionId = await SecureStore.getItemAsync(SESSION_KEY);
  
  if (!sessionId) {
    // Generate random UUID using Expo's crypto
    sessionId = Crypto.randomUUID();
    await SecureStore.setItemAsync(SESSION_KEY, sessionId);
  }
  
  return sessionId;
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}