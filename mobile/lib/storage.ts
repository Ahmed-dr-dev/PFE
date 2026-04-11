import * as SecureStore from 'expo-secure-store'

const USER_ID_KEY = 'pfe_user_id'
const USER_DATA_KEY = 'pfe_user_data'

export async function saveSession(userId: string, user: object) {
  await SecureStore.setItemAsync(USER_ID_KEY, userId)
  await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(user))
}

export async function getStoredUserId(): Promise<string | null> {
  return SecureStore.getItemAsync(USER_ID_KEY)
}

export async function getStoredUser<T = any>(): Promise<T | null> {
  const raw = await SecureStore.getItemAsync(USER_DATA_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) as T } catch { return null }
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(USER_ID_KEY)
  await SecureStore.deleteItemAsync(USER_DATA_KEY)
}
