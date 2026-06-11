/**
 * Endpoints de residencia monitorada e configuracoes.
 */
import { appConfig } from '../config/env';
import { mockBackend } from '../services/mock.backend';
import type {
  HouseholdPayload,
  HouseholdSettings,
  HouseholdSummary
} from '../types/api';
import { apiRequest } from './client';

export function listHouseholds(token: string): Promise<HouseholdSummary[]> {
  if (appConfig.demoMode) {
    return mockBackend.listHouseholds();
  }

  return apiRequest<HouseholdSummary[]>('/households', {
    token
  });
}

export function createHousehold(token: string, payload: HouseholdPayload): Promise<HouseholdSummary> {
  if (appConfig.demoMode) {
    return mockBackend.createHousehold(payload);
  }

  return apiRequest<HouseholdSummary>('/households', {
    method: 'POST',
    token,
    body: payload
  });
}

export function getHouseholdSettings(token: string, householdId: string): Promise<HouseholdSettings> {
  if (appConfig.demoMode) {
    return mockBackend.getHouseholdSettings(householdId);
  }

  return apiRequest<HouseholdSettings>(`/households/${householdId}/settings`, {
    token
  });
}

export function updateHouseholdSettings(
  token: string,
  householdId: string,
  payload: Partial<HouseholdSettings>
): Promise<HouseholdSettings> {
  if (appConfig.demoMode) {
    return mockBackend.updateHouseholdSettings(householdId, payload);
  }

  return apiRequest<HouseholdSettings>(`/households/${householdId}/settings`, {
    method: 'PATCH',
    token,
    body: payload
  });
}
