/**
 * Configuracoes centralizadas do app mobile.
 */
import { resolveApiBaseUrl } from '../utils/network';

export const appConfig = {
  apiBaseUrl: resolveApiBaseUrl(),
  demoMode: process.env.EXPO_PUBLIC_DEMO_MODE === 'true',
  sessionStorageKey: '@safehome:session',
  selectedHouseholdKey: '@safehome:selected-household',
  queryStaleTimeMs: 15_000,
  dashboardPollMs: 15_000,
  alertsPollMs: 12_000
};
