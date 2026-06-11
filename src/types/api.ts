/**
 * Tipagens compartilhadas entre telas, contexto e cliente HTTP.
 * Elas espelham os contratos principais da API SafeHome.
 */
export type PlanTier = 'FREE' | 'CARE' | 'PREMIUM';
export type DeviceStatus = 'online' | 'offline' | 'disabled';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface HouseholdSettings {
  id: string;
  householdId: string;
  inactivityThresholdMinutes: number;
  sensorCheckIntervalMinutes: number;
  buttonCheckIntervalMinutes: number;
  sleepModeStart?: string | null;
  sleepModeEnd?: string | null;
  quietHoursEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdSummary {
  id: string;
  name: string;
  residentName: string;
  addressLabel?: string | null;
  plan: PlanTier;
  timezone: string;
  createdAt: string;
  updatedAt: string;
  settings: HouseholdSettings | null;
  _count: {
    sensors: number;
    helpButtons: number;
    alerts: number;
  };
}

export interface HouseholdPayload {
  name: string;
  residentName: string;
  addressLabel?: string;
  timezone?: string;
  plan?: PlanTier;
}

export interface Gateway {
  id: string;
  householdId: string;
  name: string;
  serialNumber: string;
  firmwareVersion?: string | null;
  isActive: boolean;
  lastSeenAt?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    sensors: number;
    helpButtons: number;
  };
}

export interface GatewayCreationPayload {
  name: string;
  serialNumber: string;
  firmwareVersion?: string;
}

export interface GatewayCreationResponse {
  gateway: Gateway;
  gatewayToken: string;
}

export interface Sensor {
  id: string;
  householdId: string;
  gatewayId: string;
  name: string;
  externalId: string;
  locationLabel?: string | null;
  isActive: boolean;
  lastSeenAt?: string | null;
  lastTriggeredAt?: string | null;
  createdAt: string;
  updatedAt: string;
  status: DeviceStatus;
}

export interface SensorPayload {
  gatewayId: string;
  name: string;
  externalId: string;
  locationLabel?: string;
}

export interface SensorUpdatePayload {
  name?: string;
  locationLabel?: string | null;
  isActive?: boolean;
}

export interface HelpButton {
  id: string;
  householdId: string;
  gatewayId: string;
  name: string;
  externalId: string;
  locationLabel?: string | null;
  isActive: boolean;
  lastSeenAt?: string | null;
  lastPressedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  status: DeviceStatus;
}

export interface HelpButtonPayload {
  gatewayId: string;
  name: string;
  externalId: string;
  locationLabel?: string;
}

export interface HelpButtonUpdatePayload {
  name?: string;
  locationLabel?: string | null;
  isActive?: boolean;
}

export interface AlertItem {
  id: string;
  householdId: string;
  type: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  subjectType?: string | null;
  subjectId?: string | null;
  createdAt: string;
  updatedAt: string;
  acknowledgedAt?: string | null;
  resolvedAt?: string | null;
}

export interface TimelineEvent {
  id: string;
  type: 'presence' | 'help';
  occurredAt: string;
  deviceId: string;
  deviceName: string;
  locationLabel?: string | null;
}

export interface DashboardEvent {
  id: string;
  type: 'presence' | 'help';
  occurredAt: string;
  label: string;
}

export interface DashboardResponse {
  household: {
    id: string;
    name: string;
    residentName: string;
    plan: PlanTier;
    timezone: string;
  } | null;
  lastActivityAt?: string | null;
  minutesSinceLastActivity?: number | null;
  lastButtonCheckAt?: string | null;
  openAlerts: AlertItem[];
  sensors: Sensor[];
  helpButtons: HelpButton[];
  gateways: Array<
    Pick<Gateway, 'id' | 'name' | 'serialNumber' | 'firmwareVersion' | 'lastSeenAt'> & {
      status: DeviceStatus;
    }
  >;
  latestEvents: DashboardEvent[];
}

export interface ReportResponse {
  household: {
    id: string;
    name: string;
    plan: PlanTier;
  };
  period: {
    startDate: string;
    endDate: string;
    retentionDaysAllowed: number;
    appliedDays: number;
  };
  summary: {
    movementEvents: number;
    helpRequests: number;
    generatedAlerts: number;
    inactivityAlerts: number;
  };
  movementEvents: Array<{
    id: string;
    detectedAt: string;
    sensorName: string;
    locationLabel?: string | null;
  }>;
  helpEvents: Array<{
    id: string;
    triggeredAt: string;
    buttonName: string;
    locationLabel?: string | null;
  }>;
  alerts: Array<{
    id: string;
    type: string;
    severity: AlertSeverity;
    status: AlertStatus;
    title: string;
    description: string;
    createdAt: string;
  }>;
}
