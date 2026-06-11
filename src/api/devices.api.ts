/**
 * Endpoints de gateway, sensores e botoes de ajuda.
 */
import { appConfig } from '../config/env';
import { mockBackend } from '../services/mock.backend';
import type {
  Gateway,
  GatewayCreationPayload,
  GatewayCreationResponse,
  HelpButton,
  HelpButtonPayload,
  HelpButtonUpdatePayload,
  Sensor,
  SensorPayload,
  SensorUpdatePayload
} from '../types/api';
import { apiRequest } from './client';

export function listGateways(token: string, householdId: string): Promise<Gateway[]> {
  if (appConfig.demoMode) {
    return mockBackend.listGateways(householdId);
  }

  return apiRequest<Gateway[]>(`/households/${householdId}/gateways`, {
    token
  });
}

export function createGateway(
  token: string,
  householdId: string,
  payload: GatewayCreationPayload
): Promise<GatewayCreationResponse> {
  if (appConfig.demoMode) {
    return mockBackend.createGateway(householdId, payload);
  }

  return apiRequest<GatewayCreationResponse>(`/households/${householdId}/gateways`, {
    method: 'POST',
    token,
    body: payload
  });
}

export function rotateGatewayToken(
  token: string,
  gatewayId: string
): Promise<GatewayCreationResponse> {
  if (appConfig.demoMode) {
    return mockBackend.rotateGatewayToken(gatewayId);
  }

  return apiRequest<GatewayCreationResponse>(`/households/gateways/${gatewayId}/rotate-token`, {
    method: 'POST',
    token
  });
}

export function listSensors(token: string, householdId: string): Promise<Sensor[]> {
  if (appConfig.demoMode) {
    return mockBackend.listSensors(householdId);
  }

  return apiRequest<Sensor[]>(`/households/${householdId}/sensors`, {
    token
  });
}

export function createSensor(token: string, householdId: string, payload: SensorPayload): Promise<Sensor> {
  if (appConfig.demoMode) {
    return mockBackend.createSensor(householdId, payload);
  }

  return apiRequest<Sensor>(`/households/${householdId}/sensors`, {
    method: 'POST',
    token,
    body: payload
  });
}

export function updateSensor(token: string, sensorId: string, payload: SensorUpdatePayload): Promise<Sensor> {
  if (appConfig.demoMode) {
    return mockBackend.updateSensor(sensorId, payload);
  }

  return apiRequest<Sensor>(`/households/sensors/${sensorId}`, {
    method: 'PATCH',
    token,
    body: payload
  });
}

export function removeSensor(token: string, sensorId: string): Promise<Sensor> {
  if (appConfig.demoMode) {
    return mockBackend.removeSensor(sensorId);
  }

  return apiRequest<Sensor>(`/households/sensors/${sensorId}`, {
    method: 'DELETE',
    token
  });
}

export function listHelpButtons(token: string, householdId: string): Promise<HelpButton[]> {
  if (appConfig.demoMode) {
    return mockBackend.listHelpButtons(householdId);
  }

  return apiRequest<HelpButton[]>(`/households/${householdId}/help-buttons`, {
    token
  });
}

export function createHelpButton(
  token: string,
  householdId: string,
  payload: HelpButtonPayload
): Promise<HelpButton> {
  if (appConfig.demoMode) {
    return mockBackend.createHelpButton(householdId, payload);
  }

  return apiRequest<HelpButton>(`/households/${householdId}/help-buttons`, {
    method: 'POST',
    token,
    body: payload
  });
}

export function updateHelpButton(
  token: string,
  buttonId: string,
  payload: HelpButtonUpdatePayload
): Promise<HelpButton> {
  if (appConfig.demoMode) {
    return mockBackend.updateHelpButton(buttonId, payload);
  }

  return apiRequest<HelpButton>(`/households/help-buttons/${buttonId}`, {
    method: 'PATCH',
    token,
    body: payload
  });
}

export function removeHelpButton(token: string, buttonId: string): Promise<HelpButton> {
  if (appConfig.demoMode) {
    return mockBackend.removeHelpButton(buttonId);
  }

  return apiRequest<HelpButton>(`/households/help-buttons/${buttonId}`, {
    method: 'DELETE',
    token
  });
}
