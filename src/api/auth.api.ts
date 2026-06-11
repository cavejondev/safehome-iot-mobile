/**
 * Endpoints de autenticacao do app mobile.
 */
import { appConfig } from '../config/env';
import { mockBackend } from '../services/mock.backend';
import type { AuthSession } from '../types/api';
import { apiRequest } from './client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export function login(payload: LoginPayload): Promise<AuthSession> {
  if (appConfig.demoMode) {
    return mockBackend.login();
  }

  return apiRequest<AuthSession>('/auth/login', {
    method: 'POST',
    body: payload
  });
}

export function register(payload: RegisterPayload): Promise<AuthSession> {
  if (appConfig.demoMode) {
    return mockBackend.register(payload.fullName, payload.email);
  }

  return apiRequest<AuthSession>('/auth/register', {
    method: 'POST',
    body: payload
  });
}
