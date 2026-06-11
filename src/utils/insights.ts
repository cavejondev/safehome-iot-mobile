import dayjs from 'dayjs';

import type { AlertItem, DashboardResponse, ReportResponse, TimelineEvent } from '../types/api';

type TrendDirection = 'up' | 'down' | 'stable';
type InsightTone = 'good' | 'warning' | 'critical' | 'neutral';

export interface ActivityPoint {
  label: string;
  value: number;
  emphasis?: boolean;
}

export interface DashboardInsight {
  title: string;
  description: string;
  tone: InsightTone;
}

export interface DashboardAnalytics {
  monitoringScore: number;
  monitoringLabel: string;
  activityLevel: string;
  activityTrend: TrendDirection;
  routineConfidence: number;
  safetyCoverage: number;
  responseReadiness: number;
  anomalyCount: number;
  topRoutineWindow: string;
  inactivityRiskLabel: string;
  detectedPatterns: DashboardInsight[];
  anomalies: DashboardInsight[];
  trends: DashboardInsight[];
  hourlyActivity: ActivityPoint[];
}

export interface ReportAnalytics {
  adherenceScore: number;
  movementTrend: TrendDirection;
  movementVariationPercent: number;
  averageDailyMovements: number;
  averageDailyAlerts: number;
  supportPressure: string;
  riskLevel: string;
  busiestDayLabel: string;
  dailySeries: ActivityPoint[];
  insights: DashboardInsight[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function average(values: number[]): number {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, current) => sum + current, 0) / values.length;
}

function getAlertWeight(alert: AlertItem): number {
  switch (alert.severity) {
    case 'CRITICAL':
      return 30;
    case 'HIGH':
      return 18;
    case 'MEDIUM':
      return 10;
    default:
      return 5;
  }
}

function getTrendDirection(current: number, baseline: number): TrendDirection {
  if (baseline === 0) {
    return current > 0 ? 'up' : 'stable';
  }

  const change = ((current - baseline) / baseline) * 100;

  if (change > 12) {
    return 'up';
  }

  if (change < -12) {
    return 'down';
  }

  return 'stable';
}

function seriesTrend(values: number[]): TrendDirection {
  if (values.length < 4) {
    return 'stable';
  }

  const midpoint = Math.ceil(values.length / 2);
  const firstHalf = average(values.slice(0, midpoint));
  const secondHalf = average(values.slice(midpoint));
  return getTrendDirection(secondHalf, firstHalf);
}

function scoreLabel(score: number): string {
  if (score >= 85) {
    return 'Excelente';
  }

  if (score >= 70) {
    return 'Estavel';
  }

  if (score >= 50) {
    return 'Atencao';
  }

  return 'Critico';
}

function buildHourlyActivity(events: TimelineEvent[]): ActivityPoint[] {
  const now = dayjs();
  const buckets = new Map<number, number>();

  for (let index = 0; index < 8; index += 1) {
    buckets.set(index, 0);
  }

  events.forEach((event) => {
    const diffHours = now.diff(dayjs(event.occurredAt), 'hour', true);

    if (diffHours < 0 || diffHours > 24) {
      return;
    }

    const bucket = Math.min(7, Math.floor(diffHours / 3));
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + (event.type === 'help' ? 2 : 1));
  });

  return Array.from(buckets.entries())
    .sort((left, right) => left[0] - right[0])
    .map(([index, value]) => {
      const start = 21 - index * 3;
      const end = start + 3;
      return {
        label: `${String((start + 24) % 24).padStart(2, '0')}h`,
        value,
        emphasis: index >= 5
      };
    })
    .reverse();
}

function buildDailySeries(report: ReportResponse): ActivityPoint[] {
  const days = Math.min(report.period.appliedDays, 7);
  const start = dayjs(report.period.endDate).subtract(days - 1, 'day').startOf('day');
  const counts = Array.from({ length: days }, (_, index) => ({
    date: start.add(index, 'day'),
    value: 0
  }));

  report.movementEvents.forEach((event) => {
    const diff = dayjs(event.detectedAt).startOf('day').diff(start, 'day');
    if (diff >= 0 && diff < days) {
      counts[diff].value += 1;
    }
  });

  report.helpEvents.forEach((event) => {
    const diff = dayjs(event.triggeredAt).startOf('day').diff(start, 'day');
    if (diff >= 0 && diff < days) {
      counts[diff].value += 2;
    }
  });

  return counts.map((entry) => ({
    label: entry.date.format('dd').toUpperCase(),
    value: entry.value,
    emphasis: entry.date.isSame(dayjs(), 'day')
  }));
}

export function analyzeDashboard(
  dashboard: DashboardResponse | undefined,
  events: TimelineEvent[] | undefined
): DashboardAnalytics | null {
  if (!dashboard) {
    return null;
  }

  const telemetry = events ?? dashboard.latestEvents.map((event) => ({
    id: event.id,
    type: event.type,
    occurredAt: event.occurredAt,
    deviceId: event.id,
    deviceName: event.label,
    locationLabel: null
  }));

  const onlineDevices =
    dashboard.sensors.filter((sensor) => sensor.status === 'online').length +
    dashboard.helpButtons.filter((button) => button.status === 'online').length;
  const totalDevices = dashboard.sensors.length + dashboard.helpButtons.length;
  const safetyCoverage = totalDevices ? Math.round((onlineDevices / totalDevices) * 100) : 0;

  const openAlertWeight = dashboard.openAlerts
    .filter((alert) => alert.status !== 'RESOLVED')
    .reduce((sum, alert) => sum + getAlertWeight(alert), 0);
  const lastActivityPenalty = dashboard.minutesSinceLastActivity
    ? clamp(Math.round(dashboard.minutesSinceLastActivity / 6), 0, 25)
    : 20;
  const helpPenalty = dashboard.openAlerts.filter((alert) => alert.type === 'HELP_REQUEST').length * 12;
  const monitoringScore = clamp(
    100 - openAlertWeight - lastActivityPenalty - helpPenalty + Math.round(safetyCoverage * 0.2),
    18,
    98
  );

  const hourlyActivity = buildHourlyActivity(telemetry);
  const hourlyValues = hourlyActivity.map((point) => point.value);
  const peakIndex = hourlyValues.findIndex((value) => value === Math.max(...hourlyValues, 0));
  const topRoutineWindow = hourlyActivity[peakIndex]?.label ?? 'Sem padrao';
  const routineConfidence = clamp(
    Math.round((Math.max(...hourlyValues, 0) / Math.max(average(hourlyValues), 1)) * 38),
    28,
    96
  );
  const responseReadiness = clamp(
    safetyCoverage -
      dashboard.helpButtons.filter((button) => button.status !== 'online').length * 14 -
      dashboard.openAlerts.filter((alert) => alert.severity === 'CRITICAL').length * 10,
    12,
    99
  );

  const anomalyCount =
    dashboard.openAlerts.filter((alert) => alert.status !== 'RESOLVED').length +
    dashboard.sensors.filter((sensor) => sensor.status === 'offline').length +
    dashboard.helpButtons.filter((button) => button.status === 'offline').length;

  const trend = seriesTrend(hourlyValues);
  const minutesSinceActivity = dashboard.minutesSinceLastActivity ?? 0;
  const inactivityRiskLabel =
    minutesSinceActivity >= 120 ? 'Elevado' : minutesSinceActivity >= 60 ? 'Moderado' : 'Baixo';

  const patterns: DashboardInsight[] = [
    {
      title: 'Rotina principal',
      description: `Maior concentracao de atividade em torno de ${topRoutineWindow}, sugerindo janela recorrente de deslocamento.`,
      tone: 'good'
    },
    {
      title: 'Cobertura operacional',
      description: `${safetyCoverage}% dos dispositivos responderam dentro do intervalo esperado de telemetria.`,
      tone: safetyCoverage >= 80 ? 'good' : 'warning'
    }
  ];

  const anomalies: DashboardInsight[] = [];

  if (dashboard.openAlerts.some((alert) => alert.severity === 'CRITICAL')) {
    anomalies.push({
      title: 'Anomalia critica detectada',
      description: 'Existe alerta critico em aberto e a residencia precisa de acompanhamento imediato.',
      tone: 'critical'
    });
  }

  if (minutesSinceActivity >= 90) {
    anomalies.push({
      title: 'Silencio acima do padrao',
      description: `A residencia esta ha ${minutesSinceActivity} minutos sem movimento, acima da rotina recente.`,
      tone: 'warning'
    });
  }

  if (dashboard.sensors.some((sensor) => sensor.status === 'offline')) {
    anomalies.push({
      title: 'Falha de monitoramento',
      description: 'Ha sensores offline reduzindo a visibilidade completa dos ambientes.',
      tone: 'warning'
    });
  }

  const trends: DashboardInsight[] = [
    {
      title: 'Tendencia de atividade',
      description:
        trend === 'up'
          ? 'O fluxo de eventos aumentou nas horas mais recentes.'
          : trend === 'down'
            ? 'A movimentacao caiu nas horas mais recentes.'
            : 'A movimentacao segue estavel nas ultimas horas.',
      tone: trend === 'down' ? 'warning' : 'neutral'
    },
    {
      title: 'Prontidao de resposta',
      description: `Indice atual de ${responseReadiness}% considerando botoes de ajuda, sensores e alertas abertos.`,
      tone: responseReadiness >= 80 ? 'good' : 'warning'
    }
  ];

  return {
    monitoringScore,
    monitoringLabel: scoreLabel(monitoringScore),
    activityLevel:
      telemetry.length >= 12 ? 'Alta' : telemetry.length >= 6 ? 'Moderada' : telemetry.length > 0 ? 'Baixa' : 'Minima',
    activityTrend: trend,
    routineConfidence,
    safetyCoverage,
    responseReadiness,
    anomalyCount,
    topRoutineWindow,
    inactivityRiskLabel,
    detectedPatterns: patterns,
    anomalies,
    trends,
    hourlyActivity
  };
}

export function analyzeReport(report: ReportResponse | undefined): ReportAnalytics | null {
  if (!report) {
    return null;
  }

  const dailySeries = buildDailySeries(report);
  const dailyValues = dailySeries.map((point) => point.value);
  const adherenceScore = clamp(
    100 -
      report.summary.generatedAlerts * 8 -
      report.summary.helpRequests * 12 +
      Math.round(report.summary.movementEvents / Math.max(report.period.appliedDays, 1)),
    22,
    97
  );
  const averageDailyMovements =
    report.period.appliedDays > 0 ? report.summary.movementEvents / report.period.appliedDays : 0;
  const averageDailyAlerts =
    report.period.appliedDays > 0 ? report.summary.generatedAlerts / report.period.appliedDays : 0;
  const midpoint = Math.ceil(dailyValues.length / 2);
  const firstHalfAverage = average(dailyValues.slice(0, midpoint));
  const secondHalfAverage = average(dailyValues.slice(midpoint));
  const movementTrend = getTrendDirection(secondHalfAverage, firstHalfAverage);
  const movementVariationPercent =
    firstHalfAverage > 0 ? Math.round(((secondHalfAverage - firstHalfAverage) / firstHalfAverage) * 100) : 0;
  const busiestValue = Math.max(...dailyValues, 0);
  const busiestDayLabel = dailySeries.find((point) => point.value === busiestValue)?.label ?? 'N/D';
  const supportPressure =
    report.summary.helpRequests >= 3 ? 'Alta' : report.summary.helpRequests >= 1 ? 'Moderada' : 'Baixa';
  const riskLevel =
    report.summary.generatedAlerts >= 4 ? 'Elevado' : report.summary.generatedAlerts >= 2 ? 'Moderado' : 'Controlado';

  const insights: DashboardInsight[] = [
    {
      title: 'Aderencia da rotina',
      description: `Indice de ${adherenceScore}% com media de ${averageDailyMovements.toFixed(1)} movimentos por dia monitorado.`,
      tone: adherenceScore >= 80 ? 'good' : 'warning'
    },
    {
      title: 'Tendencia semanal',
      description:
        movementTrend === 'up'
          ? `Movimentacao subiu ${Math.abs(movementVariationPercent)}% na segunda metade do periodo.`
          : movementTrend === 'down'
            ? `Movimentacao caiu ${Math.abs(movementVariationPercent)}% na segunda metade do periodo.`
            : 'Movimentacao sem variacao estatisticamente relevante no periodo.',
      tone: movementTrend === 'down' ? 'warning' : 'neutral'
    },
    {
      title: 'Pressao de suporte',
      description: `${supportPressure} demanda assistencial com ${report.summary.helpRequests} acionamento(s) de ajuda registrado(s).`,
      tone: supportPressure === 'Alta' ? 'critical' : supportPressure === 'Moderada' ? 'warning' : 'good'
    }
  ];

  return {
    adherenceScore,
    movementTrend,
    movementVariationPercent,
    averageDailyMovements,
    averageDailyAlerts,
    supportPressure,
    riskLevel,
    busiestDayLabel,
    dailySeries,
    insights
  };
}
