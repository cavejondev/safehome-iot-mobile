/**
 * Helpers de apresentacao para datas, status e severidade.
 */
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';

import type { AlertSeverity, DeviceStatus } from '../types/api';
import { theme } from '../config/theme';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

export function formatDateTime(date?: string | null): string {
  if (!date) {
    return 'Sem registro';
  }

  return dayjs(date).format('DD/MM/YYYY [às] HH:mm');
}

export function formatRelativeTime(date?: string | null): string {
  if (!date) {
    return 'Sem registro';
  }

  return dayjs(date).fromNow();
}

export function formatMinutes(value?: number | null): string {
  if (value === null || value === undefined) {
    return 'Sem atividade';
  }

  if (value < 60) {
    return `${value} min`;
  }

  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}min`;
}

export function getStatusLabel(status: DeviceStatus): string {
  if (status === 'online') {
    return 'Online';
  }

  if (status === 'offline') {
    return 'Offline';
  }

  return 'Desativado';
}

export function getStatusColor(status: DeviceStatus): string {
  if (status === 'online') {
    return theme.colors.success;
  }

  if (status === 'offline') {
    return theme.colors.danger;
  }

  return theme.colors.textMuted;
}

export function getSeverityColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'CRITICAL':
      return theme.colors.danger;
    case 'HIGH':
      return theme.colors.accent;
    case 'MEDIUM':
      return theme.colors.warning;
    default:
      return theme.colors.primary;
  }
}

export function planLabel(plan: string): string {
  switch (plan) {
    case 'PREMIUM':
      return 'Premium';
    case 'CARE':
      return 'Care';
    default:
      return 'Free';
  }
}
