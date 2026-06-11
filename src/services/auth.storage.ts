/**
 * Persistencia local de sessao e residencia selecionada.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { appConfig } from '../config/env';
import type { AuthSession } from '../types/api';

export async function saveSession(session: AuthSession): Promise<void> {
  await AsyncStorage.setItem(appConfig.sessionStorageKey, JSON.stringify(session));
}

export async function loadSession(): Promise<AuthSession | null> {
  const rawValue = await AsyncStorage.getItem(appConfig.sessionStorageKey);

  if (!rawValue) {
    return null;
  }

  return JSON.parse(rawValue) as AuthSession;
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(appConfig.sessionStorageKey);
  await AsyncStorage.removeItem(appConfig.selectedHouseholdKey);
}

export async function saveSelectedHouseholdId(householdId: string): Promise<void> {
  await AsyncStorage.setItem(appConfig.selectedHouseholdKey, householdId);
}

export async function loadSelectedHouseholdId(): Promise<string | null> {
  return AsyncStorage.getItem(appConfig.selectedHouseholdKey);
}
