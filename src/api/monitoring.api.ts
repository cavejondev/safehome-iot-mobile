/**
 * Endpoints de dashboard, alertas, eventos e relatorios.
 */
import { appConfig } from '../config/env';
import { mockBackend } from '../services/mock.backend';
import type { AlertItem, DashboardResponse, ReportResponse, TimelineEvent } from '../types/api';
import { apiRequest } from './client';

export function getDashboard(token: string, householdId: string): Promise<DashboardResponse> {
  if (appConfig.demoMode) {
    return mockBackend.getDashboard();
  }

  return apiRequest<DashboardResponse>(`/households/${householdId}/dashboard`, {
    token
  });
}

export function listAlerts(token: string, householdId: string): Promise<AlertItem[]> {
  if (appConfig.demoMode) {
    return mockBackend.listAlerts(householdId);
  }

  return apiRequest<AlertItem[]>(`/alerts/${householdId}`, {
    token
  });
}

export function acknowledgeAlert(token: string, alertId: string): Promise<AlertItem> {
  if (appConfig.demoMode) {
    return mockBackend.acknowledgeAlert(alertId);
  }

  return apiRequest<AlertItem>(`/alerts/${alertId}/acknowledge`, {
    method: 'PATCH',
    token
  });
}

export function resolveAlert(token: string, alertId: string): Promise<AlertItem> {
  if (appConfig.demoMode) {
    return mockBackend.resolveAlert(alertId);
  }

  return apiRequest<AlertItem>(`/alerts/${alertId}/resolve`, {
    method: 'PATCH',
    token
  });
}

export function listEvents(token: string, householdId: string, limit = 40): Promise<TimelineEvent[]> {
  if (appConfig.demoMode) {
    return mockBackend.listEvents(limit);
  }

  return getDashboard(token, householdId).then((dashboard) =>
    dashboard.latestEvents.slice(0, limit).map((event) => ({
      id: event.id,
      type: event.type,
      occurredAt: event.occurredAt,
      deviceId: event.id,
      deviceName: event.label,
      locationLabel: null
    }))
  );
}

export function getActivityReport(
  token: string,
  householdId: string,
  days: number
): Promise<ReportResponse> {
  if (appConfig.demoMode) {
    return mockBackend.getActivityReport(days);
  }

  return apiRequest<ReportResponse>(`/households/${householdId}/reports/activity?days=${days}`, {
    token
  });
}
