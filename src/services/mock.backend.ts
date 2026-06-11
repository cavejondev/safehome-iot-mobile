/**
 * Backend fake em memoria para demonstracao offline.
 * Ele espelha os principais contratos da API para o app funcionar sem internet e sem login real.
 */
import dayjs from 'dayjs';

import type {
  AlertItem,
  AuthSession,
  DashboardResponse,
  Gateway,
  GatewayCreationResponse,
  HelpButton,
  HouseholdPayload,
  HouseholdSettings,
  HouseholdSummary,
  ReportResponse,
  Sensor,
  TimelineEvent
} from '../types/api';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function delay<T>(value: T, timeMs = 180): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(clone(value)), timeMs);
  });
}

function id(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function minutesAgo(value: number): string {
  return dayjs().subtract(value, 'minute').toISOString();
}

function daysAgo(value: number): string {
  return dayjs().subtract(value, 'day').toISOString();
}

function atHourDaysAgo(days: number, hour: number, minute: number): string {
  return dayjs().subtract(days, 'day').hour(hour).minute(minute).second(0).millisecond(0).toISOString();
}

function deviceStatus(isActive: boolean, lastSeenAt?: string | null, thresholdMinutes = 30) {
  if (!isActive) {
    return 'disabled' as const;
  }

  if (!lastSeenAt) {
    return 'offline' as const;
  }

  const diff = dayjs().diff(dayjs(lastSeenAt), 'minute');
  return diff <= thresholdMinutes ? ('online' as const) : ('offline' as const);
}

const demoSession: AuthSession = {
  token: 'demo-mode-token',
  user: {
    id: 'demo-user',
    fullName: 'Maria Souza',
    email: 'demo@safehome.local',
    phone: '(43) 99999-0000'
  }
};

type InternalMovementEvent = {
  id: string;
  sensorId: string;
  detectedAt: string;
};

type InternalHelpEvent = {
  id: string;
  helpButtonId: string;
  triggeredAt: string;
};

function buildMovementEvents(): InternalMovementEvent[] {
  const routine = [
    { sensorId: 'sensor-1', hour: 7, minute: 18 },
    { sensorId: 'sensor-2', hour: 9, minute: 5 },
    { sensorId: 'sensor-1', hour: 12, minute: 24 },
    { sensorId: 'sensor-2', hour: 15, minute: 12 },
    { sensorId: 'sensor-1', hour: 18, minute: 42 }
  ];

  const quieterRoutine = [
    { sensorId: 'sensor-2', hour: 8, minute: 8 },
    { sensorId: 'sensor-1', hour: 13, minute: 15 },
    { sensorId: 'sensor-3', hour: 19, minute: 4 }
  ];

  const records: InternalMovementEvent[] = [];

  for (let days = 0; days < 14; days += 1) {
    const base = days === 0 ? routine : days === 1 ? quieterRoutine : days % 4 === 0 ? quieterRoutine : routine;

    base.forEach((event, index) => {
      records.push({
        id: `move-h-${days}-${index}`,
        sensorId: event.sensorId,
        detectedAt: atHourDaysAgo(days, event.hour, event.minute)
      });
    });

    if (days === 0) {
      records.push({ id: 'move-live-1', sensorId: 'sensor-1', detectedAt: minutesAgo(18) });
      records.push({ id: 'move-live-2', sensorId: 'sensor-2', detectedAt: minutesAgo(53) });
      records.push({
        id: 'move-live-3',
        sensorId: 'sensor-1',
        detectedAt: dayjs().subtract(4, 'hour').toISOString()
      });
      records.push({
        id: 'move-live-4',
        sensorId: 'sensor-3',
        detectedAt: dayjs().subtract(8, 'hour').toISOString()
      });
    }
  }

  return records.sort((left, right) => dayjs(right.detectedAt).valueOf() - dayjs(left.detectedAt).valueOf());
}

function buildHelpEvents(): InternalHelpEvent[] {
  return [
    { id: 'help-1', helpButtonId: 'button-2', triggeredAt: minutesAgo(32) },
    { id: 'help-2', helpButtonId: 'button-1', triggeredAt: atHourDaysAgo(2, 22, 11) },
    { id: 'help-3', helpButtonId: 'button-2', triggeredAt: atHourDaysAgo(6, 5, 48) }
  ];
}

const settingsByHouseholdId: Record<string, HouseholdSettings> = {
  'house-1': {
    id: 'settings-1',
    householdId: 'house-1',
    inactivityThresholdMinutes: 120,
    sensorCheckIntervalMinutes: 30,
    buttonCheckIntervalMinutes: 10,
    sleepModeStart: '22:00',
    sleepModeEnd: '06:00',
    quietHoursEnabled: true,
    createdAt: daysAgo(30),
    updatedAt: minutesAgo(15)
  }
};

const households: HouseholdSummary[] = [
  {
    id: 'house-1',
    name: 'Casa Principal',
    residentName: 'Dona Helena',
    addressLabel: 'Rua das Flores, 45',
    plan: 'PREMIUM',
    timezone: 'America/Sao_Paulo',
    createdAt: daysAgo(40),
    updatedAt: minutesAgo(15),
    settings: settingsByHouseholdId['house-1'],
    _count: {
      sensors: 4,
      helpButtons: 2,
      alerts: 3
    }
  }
];

const gateways: Gateway[] = [
  {
    id: 'gateway-1',
    householdId: 'house-1',
    name: 'Central Principal',
    serialNumber: 'SAFEHOME-GW-001',
    firmwareVersion: '1.3.2',
    isActive: true,
    lastSeenAt: minutesAgo(2),
    createdAt: daysAgo(20),
    updatedAt: minutesAgo(2),
    _count: {
      sensors: 4,
      helpButtons: 2
    }
  }
];

let sensors: Sensor[] = [
  {
    id: 'sensor-1',
    householdId: 'house-1',
    gatewayId: 'gateway-1',
    name: 'Sensor Sala',
    externalId: 'pir-sala',
    locationLabel: 'Sala',
    isActive: true,
    lastSeenAt: minutesAgo(2),
    lastTriggeredAt: minutesAgo(18),
    createdAt: daysAgo(20),
    updatedAt: minutesAgo(2),
    status: 'online'
  },
  {
    id: 'sensor-2',
    householdId: 'house-1',
    gatewayId: 'gateway-1',
    name: 'Sensor Corredor',
    externalId: 'pir-corredor',
    locationLabel: 'Corredor',
    isActive: true,
    lastSeenAt: minutesAgo(4),
    lastTriggeredAt: minutesAgo(53),
    createdAt: daysAgo(20),
    updatedAt: minutesAgo(4),
    status: 'online'
  },
  {
    id: 'sensor-3',
    householdId: 'house-1',
    gatewayId: 'gateway-1',
    name: 'Sensor Quarto',
    externalId: 'pir-quarto',
    locationLabel: 'Quarto',
    isActive: true,
    lastSeenAt: minutesAgo(38),
    lastTriggeredAt: minutesAgo(185),
    createdAt: daysAgo(20),
    updatedAt: minutesAgo(38),
    status: 'offline'
  },
  {
    id: 'sensor-4',
    householdId: 'house-1',
    gatewayId: 'gateway-1',
    name: 'Sensor Cozinha',
    externalId: 'pir-cozinha',
    locationLabel: 'Cozinha',
    isActive: false,
    lastSeenAt: minutesAgo(160),
    lastTriggeredAt: minutesAgo(320),
    createdAt: daysAgo(20),
    updatedAt: minutesAgo(160),
    status: 'disabled'
  }
];

let helpButtons: HelpButton[] = [
  {
    id: 'button-1',
    householdId: 'house-1',
    gatewayId: 'gateway-1',
    name: 'Botao Quarto',
    externalId: 'btn-quarto',
    locationLabel: 'Quarto',
    isActive: true,
    lastSeenAt: minutesAgo(5),
    lastPressedAt: daysAgo(2),
    createdAt: daysAgo(20),
    updatedAt: minutesAgo(5),
    status: 'online'
  },
  {
    id: 'button-2',
    householdId: 'house-1',
    gatewayId: 'gateway-1',
    name: 'Botao Banheiro',
    externalId: 'btn-banheiro',
    locationLabel: 'Banheiro',
    isActive: true,
    lastSeenAt: minutesAgo(12),
    lastPressedAt: minutesAgo(32),
    createdAt: daysAgo(20),
    updatedAt: minutesAgo(12),
    status: 'offline'
  }
];

let movementEvents: InternalMovementEvent[] = buildMovementEvents();

let helpEvents: InternalHelpEvent[] = buildHelpEvents();

let alerts: AlertItem[] = [
  {
    id: 'alert-1',
    householdId: 'house-1',
    type: 'HELP_REQUEST',
    severity: 'CRITICAL',
    status: 'OPEN',
    title: 'Pedido de ajuda no banheiro',
    description: 'O botao fisico do banheiro foi pressionado e precisa de atencao imediata.',
    subjectType: 'HELP_BUTTON',
    subjectId: 'button-2',
    createdAt: minutesAgo(32),
    updatedAt: minutesAgo(32),
    acknowledgedAt: null,
    resolvedAt: null
  },
  {
    id: 'alert-2',
    householdId: 'house-1',
    type: 'SENSOR_OFFLINE',
    severity: 'HIGH',
    status: 'ACKNOWLEDGED',
    title: 'Sensor quarto offline',
    description: 'O sensor do quarto esta sem comunicar dentro do intervalo previsto.',
    subjectType: 'SENSOR',
    subjectId: 'sensor-3',
    createdAt: minutesAgo(40),
    updatedAt: minutesAgo(22),
    acknowledgedAt: minutesAgo(22),
    resolvedAt: null
  },
  {
    id: 'alert-3',
    householdId: 'house-1',
    type: 'INACTIVITY',
    severity: 'MEDIUM',
    status: 'RESOLVED',
    title: 'Periodo prolongado sem movimento',
    description: 'A residencia ficou acima do limite de inatividade configurado.',
    subjectType: 'HOUSEHOLD',
    subjectId: 'house-1',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    acknowledgedAt: daysAgo(1),
    resolvedAt: daysAgo(1)
  },
  {
    id: 'alert-4',
    householdId: 'house-1',
    type: 'SENSOR_OFFLINE',
    severity: 'LOW',
    status: 'RESOLVED',
    title: 'Oscilacao temporaria no sensor da sala',
    description: 'O sensor principal da sala perdeu conectividade por alguns minutos e se recuperou.',
    subjectType: 'SENSOR',
    subjectId: 'sensor-1',
    createdAt: atHourDaysAgo(4, 11, 15),
    updatedAt: atHourDaysAgo(4, 11, 28),
    acknowledgedAt: atHourDaysAgo(4, 11, 20),
    resolvedAt: atHourDaysAgo(4, 11, 28)
  },
  {
    id: 'alert-5',
    householdId: 'house-1',
    type: 'INACTIVITY',
    severity: 'MEDIUM',
    status: 'RESOLVED',
    title: 'Inatividade fora da faixa esperada',
    description: 'A ausencia de movimento durante a madrugada excedeu a janela historica configurada.',
    subjectType: 'HOUSEHOLD',
    subjectId: 'house-1',
    createdAt: atHourDaysAgo(6, 4, 40),
    updatedAt: atHourDaysAgo(6, 6, 0),
    acknowledgedAt: atHourDaysAgo(6, 5, 10),
    resolvedAt: atHourDaysAgo(6, 6, 0)
  }
];

function refreshDerivedState(): void {
  const settings = settingsByHouseholdId['house-1'];

  sensors = sensors.map((sensor) => ({
    ...sensor,
    status: deviceStatus(sensor.isActive, sensor.lastSeenAt, settings.sensorCheckIntervalMinutes)
  }));

  helpButtons = helpButtons.map((button) => ({
    ...button,
    status: deviceStatus(button.isActive, button.lastSeenAt, settings.buttonCheckIntervalMinutes)
  }));

  households[0]._count.sensors = sensors.length;
  households[0]._count.helpButtons = helpButtons.length;
  households[0]._count.alerts = alerts.filter((item) => item.status !== 'RESOLVED').length;
  households[0].settings = settingsByHouseholdId['house-1'];
  households[0].updatedAt = dayjs().toISOString();
}

function sortedEvents(): TimelineEvent[] {
  const movement = movementEvents.map((event) => {
    const sensor = sensors.find((item) => item.id === event.sensorId);

    return {
      id: event.id,
      type: 'presence' as const,
      occurredAt: event.detectedAt,
      deviceId: event.sensorId,
      deviceName: sensor?.name ?? 'Sensor',
      locationLabel: sensor?.locationLabel ?? null
    };
  });

  const helps = helpEvents.map((event) => {
    const button = helpButtons.find((item) => item.id === event.helpButtonId);

    return {
      id: event.id,
      type: 'help' as const,
      occurredAt: event.triggeredAt,
      deviceId: event.helpButtonId,
      deviceName: button?.name ?? 'Botao',
      locationLabel: button?.locationLabel ?? null
    };
  });

  return [...movement, ...helps].sort(
    (left, right) => dayjs(right.occurredAt).valueOf() - dayjs(left.occurredAt).valueOf()
  );
}

function latestActivityAt(): string | null {
  return movementEvents
    .map((event) => event.detectedAt)
    .sort((left, right) => dayjs(right).valueOf() - dayjs(left).valueOf())[0] ?? null;
}

function latestButtonCheckAt(): string | null {
  return helpButtons
    .map((item) => item.lastSeenAt)
    .filter(Boolean)
    .sort((left, right) => dayjs(right!).valueOf() - dayjs(left!).valueOf())[0] ?? null;
}

function buildDashboard(): DashboardResponse {
  refreshDerivedState();

  const lastActivity = latestActivityAt();
  const latestEvents = sortedEvents().slice(0, 10).map((event) => ({
    id: event.id,
    type: event.type,
    occurredAt: event.occurredAt,
    label: event.deviceName
  }));

  return {
    household: {
      id: households[0].id,
      name: households[0].name,
      residentName: households[0].residentName,
      plan: households[0].plan,
      timezone: households[0].timezone
    },
    lastActivityAt: lastActivity,
    minutesSinceLastActivity: lastActivity ? dayjs().diff(dayjs(lastActivity), 'minute') : null,
    lastButtonCheckAt: latestButtonCheckAt(),
    openAlerts: alerts.filter((item) => item.status !== 'RESOLVED'),
    sensors,
    helpButtons,
    gateways: gateways.map((gateway) => ({
      id: gateway.id,
      name: gateway.name,
      serialNumber: gateway.serialNumber,
      firmwareVersion: gateway.firmwareVersion,
      status: deviceStatus(gateway.isActive, gateway.lastSeenAt, 30),
      lastSeenAt: gateway.lastSeenAt
    })),
    latestEvents
  };
}

function buildReport(days: number): ReportResponse {
  refreshDerivedState();

  const endDate = dayjs();
  const startDate = endDate.subtract(days, 'day');
  const filteredMovement = movementEvents.filter((event) => dayjs(event.detectedAt).isAfter(startDate));
  const filteredHelp = helpEvents.filter((event) => dayjs(event.triggeredAt).isAfter(startDate));
  const filteredAlerts = alerts.filter((alert) => dayjs(alert.createdAt).isAfter(startDate));

  return {
    household: {
      id: households[0].id,
      name: households[0].name,
      plan: households[0].plan
    },
    period: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      retentionDaysAllowed: 90,
      appliedDays: days
    },
    summary: {
      movementEvents: filteredMovement.length,
      helpRequests: filteredHelp.length,
      generatedAlerts: filteredAlerts.length,
      inactivityAlerts: filteredAlerts.filter((item) => item.type === 'INACTIVITY').length
    },
    movementEvents: filteredMovement.map((event) => {
      const sensor = sensors.find((item) => item.id === event.sensorId);

      return {
        id: event.id,
        detectedAt: event.detectedAt,
        sensorName: sensor?.name ?? 'Sensor',
        locationLabel: sensor?.locationLabel ?? null
      };
    }),
    helpEvents: filteredHelp.map((event) => {
      const button = helpButtons.find((item) => item.id === event.helpButtonId);

      return {
        id: event.id,
        triggeredAt: event.triggeredAt,
        buttonName: button?.name ?? 'Botao',
        locationLabel: button?.locationLabel ?? null
      };
    }),
    alerts: filteredAlerts.map((item) => ({
      id: item.id,
      type: item.type,
      severity: item.severity,
      status: item.status,
      title: item.title,
      description: item.description,
      createdAt: item.createdAt
    }))
  };
}

refreshDerivedState();

export const mockBackend = {
  getDemoSession(): Promise<AuthSession> {
    return delay(demoSession);
  },

  async login(): Promise<AuthSession> {
    return delay(demoSession);
  },

  async register(fullName?: string, email?: string): Promise<AuthSession> {
    return delay({
      ...demoSession,
      user: {
        ...demoSession.user,
        fullName: fullName || demoSession.user.fullName,
        email: email || demoSession.user.email
      }
    });
  },

  listHouseholds(): Promise<HouseholdSummary[]> {
    refreshDerivedState();
    return delay(households);
  },

  createHousehold(payload: HouseholdPayload): Promise<HouseholdSummary> {
    const household: HouseholdSummary = {
      id: id('house'),
      name: payload.name,
      residentName: payload.residentName,
      addressLabel: payload.addressLabel ?? null,
      plan: payload.plan ?? 'CARE',
      timezone: payload.timezone ?? 'America/Sao_Paulo',
      createdAt: dayjs().toISOString(),
      updatedAt: dayjs().toISOString(),
      settings: null,
      _count: { sensors: 0, helpButtons: 0, alerts: 0 }
    };

    households.unshift(household);
    return delay(household);
  },

  getHouseholdSettings(householdId: string): Promise<HouseholdSettings> {
    return delay(settingsByHouseholdId[householdId]);
  },

  updateHouseholdSettings(
    householdId: string,
    payload: Partial<HouseholdSettings>
  ): Promise<HouseholdSettings> {
    settingsByHouseholdId[householdId] = {
      ...settingsByHouseholdId[householdId],
      ...payload,
      updatedAt: dayjs().toISOString()
    };

    refreshDerivedState();
    return delay(settingsByHouseholdId[householdId]);
  },

  listGateways(householdId: string): Promise<Gateway[]> {
    return delay(gateways.filter((item) => item.householdId === householdId));
  },

  createGateway(
    householdId: string,
    payload: { name: string; serialNumber: string; firmwareVersion?: string }
  ): Promise<GatewayCreationResponse> {
    const gateway: Gateway = {
      id: id('gateway'),
      householdId,
      name: payload.name,
      serialNumber: payload.serialNumber,
      firmwareVersion: payload.firmwareVersion ?? null,
      isActive: true,
      lastSeenAt: dayjs().toISOString(),
      createdAt: dayjs().toISOString(),
      updatedAt: dayjs().toISOString(),
      _count: {
        sensors: 0,
        helpButtons: 0
      }
    };

    gateways.unshift(gateway);
    return delay({
      gateway,
      gatewayToken: `SAFEHOME-DEMO-${Math.random().toString(36).slice(2, 14).toUpperCase()}`
    });
  },

  rotateGatewayToken(gatewayId: string): Promise<GatewayCreationResponse> {
    const gateway = gateways.find((item) => item.id === gatewayId)!;

    gateway.updatedAt = dayjs().toISOString();

    return delay({
      gateway,
      gatewayToken: `SAFEHOME-ROTATED-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
    });
  },

  listSensors(householdId: string): Promise<Sensor[]> {
    refreshDerivedState();
    return delay(sensors.filter((item) => item.householdId === householdId));
  },

  createSensor(
    householdId: string,
    payload: { gatewayId: string; name: string; externalId: string; locationLabel?: string }
  ): Promise<Sensor> {
    const sensor: Sensor = {
      id: id('sensor'),
      householdId,
      gatewayId: payload.gatewayId,
      name: payload.name,
      externalId: payload.externalId,
      locationLabel: payload.locationLabel ?? null,
      isActive: true,
      lastSeenAt: dayjs().toISOString(),
      lastTriggeredAt: dayjs().subtract(20, 'minute').toISOString(),
      createdAt: dayjs().toISOString(),
      updatedAt: dayjs().toISOString(),
      status: 'online'
    };

    sensors.unshift(sensor);
    refreshDerivedState();
    return delay(sensor);
  },

  updateSensor(sensorId: string, payload: { name?: string; locationLabel?: string | null; isActive?: boolean }) {
    const sensor = sensors.find((item) => item.id === sensorId)!;

    Object.assign(sensor, payload, { updatedAt: dayjs().toISOString() });
    refreshDerivedState();
    return delay(sensor);
  },

  removeSensor(sensorId: string): Promise<Sensor> {
    return this.updateSensor(sensorId, { isActive: false });
  },

  listHelpButtons(householdId: string): Promise<HelpButton[]> {
    refreshDerivedState();
    return delay(helpButtons.filter((item) => item.householdId === householdId));
  },

  createHelpButton(
    householdId: string,
    payload: { gatewayId: string; name: string; externalId: string; locationLabel?: string }
  ): Promise<HelpButton> {
    const button: HelpButton = {
      id: id('button'),
      householdId,
      gatewayId: payload.gatewayId,
      name: payload.name,
      externalId: payload.externalId,
      locationLabel: payload.locationLabel ?? null,
      isActive: true,
      lastSeenAt: dayjs().toISOString(),
      lastPressedAt: dayjs().subtract(1, 'day').toISOString(),
      createdAt: dayjs().toISOString(),
      updatedAt: dayjs().toISOString(),
      status: 'online'
    };

    helpButtons.unshift(button);
    refreshDerivedState();
    return delay(button);
  },

  updateHelpButton(
    buttonId: string,
    payload: { name?: string; locationLabel?: string | null; isActive?: boolean }
  ): Promise<HelpButton> {
    const button = helpButtons.find((item) => item.id === buttonId)!;

    Object.assign(button, payload, { updatedAt: dayjs().toISOString() });
    refreshDerivedState();
    return delay(button);
  },

  removeHelpButton(buttonId: string): Promise<HelpButton> {
    return this.updateHelpButton(buttonId, { isActive: false });
  },

  getDashboard(): Promise<DashboardResponse> {
    return delay(buildDashboard());
  },

  listAlerts(householdId: string): Promise<AlertItem[]> {
    return delay(alerts.filter((item) => item.householdId === householdId));
  },

  acknowledgeAlert(alertId: string): Promise<AlertItem> {
    const alert = alerts.find((item) => item.id === alertId)!;

    alert.status = 'ACKNOWLEDGED';
    alert.acknowledgedAt = dayjs().toISOString();
    alert.updatedAt = dayjs().toISOString();
    refreshDerivedState();

    return delay(alert);
  },

  resolveAlert(alertId: string): Promise<AlertItem> {
    const alert = alerts.find((item) => item.id === alertId)!;

    alert.status = 'RESOLVED';
    alert.resolvedAt = dayjs().toISOString();
    alert.updatedAt = dayjs().toISOString();
    refreshDerivedState();

    return delay(alert);
  },

  listEvents(limit = 40): Promise<TimelineEvent[]> {
    return delay(sortedEvents().slice(0, limit));
  },

  getActivityReport(days: number): Promise<ReportResponse> {
    return delay(buildReport(days));
  }
};
