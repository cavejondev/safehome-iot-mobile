/**
 * Tela principal com resumo da residencia monitorada.
 */
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { getDashboard, listEvents } from '../../api/monitoring.api';
import { AppScreen } from '../../components/common/AppScreen';
import { EmptyState } from '../../components/common/EmptyState';
import { HouseholdSelector } from '../../components/common/HouseholdSelector';
import { InsightCard } from '../../components/common/InsightCard';
import { LoadingState } from '../../components/common/LoadingState';
import { MiniBarChart } from '../../components/common/MiniBarChart';
import { ScoreRingCard } from '../../components/common/ScoreRingCard';
import { SectionCard } from '../../components/common/SectionCard';
import { StatCard } from '../../components/common/StatCard';
import { StatusPill } from '../../components/common/StatusPill';
import { appConfig } from '../../config/env';
import { theme } from '../../config/theme';
import { useAuth } from '../../hooks/useAuth';
import { useHousehold } from '../../hooks/useHousehold';
import { analyzeDashboard } from '../../utils/insights';
import {
  formatDateTime,
  formatMinutes,
  formatRelativeTime,
  getSeverityColor,
  getStatusColor,
  getStatusLabel
} from '../../utils/format';

export function DashboardScreen() {
  const { token } = useAuth();
  const { selectedHouseholdId, selectedHousehold } = useHousehold();

  const dashboardQuery = useQuery({
    queryKey: ['dashboard', selectedHouseholdId],
    queryFn: async () => getDashboard(token!, selectedHouseholdId!),
    enabled: Boolean(token && selectedHouseholdId),
    staleTime: appConfig.queryStaleTimeMs,
    refetchInterval: appConfig.dashboardPollMs
  });

  const eventsQuery = useQuery({
    queryKey: ['dashboard-events', selectedHouseholdId],
    queryFn: async () => listEvents(token!, selectedHouseholdId!, 80),
    enabled: Boolean(token && selectedHouseholdId),
    staleTime: appConfig.queryStaleTimeMs,
    refetchInterval: appConfig.dashboardPollMs
  });

  if (!selectedHouseholdId) {
    return <LoadingState label="Preparando a residencia selecionada..." />;
  }

  const dashboard = dashboardQuery.data;
  const onlineSensors = dashboard?.sensors.filter((sensor) => sensor.status === 'online').length ?? 0;
  const onlineButtons =
    dashboard?.helpButtons.filter((button) => button.status === 'online').length ?? 0;
  const criticalAlert = dashboard?.openAlerts.find((alert) => alert.severity === 'CRITICAL');
  const analytics = analyzeDashboard(dashboard, eventsQuery.data);

  return (
    <AppScreen
      title={selectedHousehold?.name ?? 'SafeHome'}
      subtitle={
        dashboard?.lastActivityAt
          ? `Ultima atividade ${formatRelativeTime(dashboard.lastActivityAt)}`
          : 'Aguardando eventos dos sensores instalados'
      }
      refreshControl={
        <RefreshControl
          refreshing={dashboardQuery.isRefetching}
          onRefresh={() => {
            void dashboardQuery.refetch();
          }}
          tintColor={theme.colors.white}
        />
      }
    >
      <HouseholdSelector />

      {appConfig.demoMode ? (
        <SectionCard style={styles.demoCard}>
          <Text style={styles.demoTitle}>Modo apresentacao ativo</Text>
          <Text style={styles.demoText}>
            Este painel esta usando dados mockados locais para demonstracao offline, sem depender da API.
          </Text>
        </SectionCard>
      ) : null}

      {criticalAlert ? (
        <SectionCard style={styles.alertCard}>
          <View style={styles.rowBetween}>
            <View style={styles.flex}>
              <Text style={styles.alertTitle}>{criticalAlert.title}</Text>
              <Text style={styles.alertDescription}>{criticalAlert.description}</Text>
            </View>
            <StatusPill label="Critico" color={getSeverityColor(criticalAlert.severity)} />
          </View>
        </SectionCard>
      ) : null}

      {analytics ? (
        <ScoreRingCard
          score={analytics.monitoringScore}
          label={`Indice ${analytics.monitoringLabel}`}
          helper={`Cobertura ${analytics.safetyCoverage}% • prontidao ${analytics.responseReadiness}% • risco de inatividade ${analytics.inactivityRiskLabel.toLowerCase()}.`}
        />
      ) : null}

      <View style={styles.statsGrid}>
        <StatCard
          eyebrow="Ultima atividade"
          value={formatMinutes(dashboard?.minutesSinceLastActivity)}
          helper={dashboard?.lastActivityAt ? formatDateTime(dashboard.lastActivityAt) : 'Sem registros'}
          accentColor={theme.colors.primary}
        />
        <StatCard
          eyebrow="Sensores online"
          value={`${onlineSensors}/${dashboard?.sensors.length ?? 0}`}
          helper="Presenca e movimento"
          accentColor={theme.colors.success}
        />
        <StatCard
          eyebrow="Botoes ativos"
          value={`${onlineButtons}/${dashboard?.helpButtons.length ?? 0}`}
          helper={dashboard?.lastButtonCheckAt ? `Ultima verificacao ${formatRelativeTime(dashboard.lastButtonCheckAt)}` : 'Sem verificacao'}
          accentColor={theme.colors.secondary}
        />
        <StatCard
          eyebrow="Alertas abertos"
          value={`${dashboard?.openAlerts.length ?? 0}`}
          helper="Emergencias, falhas e inatividade"
          accentColor={theme.colors.accent}
        />
        <StatCard
          eyebrow="Padrao dominante"
          value={analytics?.topRoutineWindow ?? '--'}
          helper={`Confianca de rotina ${analytics?.routineConfidence ?? 0}%`}
          accentColor={theme.colors.primaryDark}
        />
        <StatCard
          eyebrow="Anomalias"
          value={`${analytics?.anomalyCount ?? 0}`}
          helper={`Tendencia ${trendLabel(analytics?.activityTrend)}`}
          accentColor={theme.colors.danger}
        />
      </View>

      {analytics ? (
        <SectionCard style={styles.sectionGap}>
          <MiniBarChart
            title="Mapa de atividade das ultimas 24 horas"
            subtitle={`Nivel ${analytics.activityLevel.toLowerCase()} com pico recorrente proximo de ${analytics.topRoutineWindow}.`}
            data={analytics.hourlyActivity}
            color={theme.colors.success}
          />
        </SectionCard>
      ) : null}

      {analytics ? (
        <SectionCard style={styles.sectionGap}>
          <Text style={styles.sectionTitle}>Leitura inteligente</Text>
          {analytics.detectedPatterns.map((item) => (
            <InsightCard
              key={item.title}
              title={item.title}
              description={item.description}
              tone={item.tone}
            />
          ))}
          {(analytics.anomalies.length ? analytics.anomalies : analytics.trends).slice(0, 2).map((item) => (
            <InsightCard
              key={item.title}
              title={item.title}
              description={item.description}
              tone={item.tone}
            />
          ))}
        </SectionCard>
      ) : null}

      <SectionCard style={styles.sectionGap}>
        <Text style={styles.sectionTitle}>Status rapido dos dispositivos</Text>
        {dashboardQuery.isLoading && !dashboard ? (
          <LoadingState label="Buscando telemetria..." />
        ) : dashboard && (dashboard.sensors.length > 0 || dashboard.helpButtons.length > 0) ? (
          <>
            {dashboard.sensors.slice(0, 4).map((sensor) => (
              <View key={sensor.id} style={styles.deviceRow}>
                <View style={styles.flex}>
                  <Text style={styles.deviceName}>{sensor.name}</Text>
                  <Text style={styles.deviceMeta}>
                    {sensor.locationLabel || 'Sem local'} • {formatRelativeTime(sensor.lastSeenAt)}
                  </Text>
                </View>
                <StatusPill label={getStatusLabel(sensor.status)} color={getStatusColor(sensor.status)} />
              </View>
            ))}

            {dashboard.helpButtons.slice(0, 2).map((button) => (
              <View key={button.id} style={styles.deviceRow}>
                <View style={styles.flex}>
                  <Text style={styles.deviceName}>{button.name}</Text>
                  <Text style={styles.deviceMeta}>
                    {button.locationLabel || 'Sem local'} • {formatRelativeTime(button.lastSeenAt)}
                  </Text>
                </View>
                <StatusPill label={getStatusLabel(button.status)} color={getStatusColor(button.status)} />
              </View>
            ))}
          </>
        ) : (
          <EmptyState
            title="Nenhum dispositivo cadastrado"
            description="Cadastre sensores e botoes de ajuda para comecar o monitoramento."
          />
        )}
      </SectionCard>

      <SectionCard style={styles.sectionGap}>
        <Text style={styles.sectionTitle}>Linha do tempo recente</Text>
        {dashboard?.latestEvents.length ? (
          dashboard.latestEvents.map((event) => (
            <View key={event.id} style={styles.timelineRow}>
              <View
                style={[
                  styles.timelineDot,
                  { backgroundColor: event.type === 'help' ? theme.colors.danger : theme.colors.primary }
                ]}
              />
              <View style={styles.flex}>
                <Text style={styles.deviceName}>{event.label}</Text>
                <Text style={styles.deviceMeta}>
                  {event.type === 'help' ? 'Pedido de ajuda' : 'Movimento detectado'} •{' '}
                  {formatDateTime(event.occurredAt)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            title="Sem eventos recentes"
            description="Assim que o gateway enviar eventos, eles aparecerao aqui para acompanhamento."
          />
        )}
      </SectionCard>

      {analytics ? (
        <SectionCard style={styles.sectionGap}>
          <Text style={styles.sectionTitle}>Tendencias operacionais</Text>
          {analytics.trends.map((item) => (
            <InsightCard
              key={item.title}
              title={item.title}
              description={item.description}
              tone={item.tone}
            />
          ))}
        </SectionCard>
      ) : null}
    </AppScreen>
  );
}

function trendLabel(value?: 'up' | 'down' | 'stable'): string {
  if (value === 'up') {
    return 'em alta';
  }

  if (value === 'down') {
    return 'em queda';
  }

  return 'estavel';
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  rowBetween: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-start'
  },
  alertCard: {
    borderColor: theme.colors.accentSoft,
    backgroundColor: '#FFF2EE'
  },
  demoCard: {
    gap: theme.spacing.xs,
    backgroundColor: '#EEF7F4',
    borderColor: '#C6E5D9'
  },
  demoTitle: {
    fontFamily: theme.typography.heading,
    fontSize: 14,
    color: theme.colors.success,
    textTransform: 'uppercase',
    letterSpacing: 0.8
  },
  demoText: {
    fontFamily: theme.typography.body,
    color: theme.colors.textMuted,
    lineHeight: 20
  },
  alertTitle: {
    fontFamily: theme.typography.display,
    fontSize: 21,
    color: theme.colors.primaryDark
  },
  alertDescription: {
    marginTop: 4,
    fontFamily: theme.typography.body,
    color: theme.colors.textMuted,
    lineHeight: 20
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md
  },
  sectionGap: {
    gap: theme.spacing.md
  },
  sectionTitle: {
    fontFamily: theme.typography.display,
    fontSize: 22,
    color: theme.colors.primaryDark
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.md
  },
  deviceName: {
    fontFamily: theme.typography.heading,
    fontSize: 15,
    color: theme.colors.text
  },
  deviceMeta: {
    marginTop: 2,
    fontFamily: theme.typography.body,
    color: theme.colors.textMuted
  },
  timelineRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-start'
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: theme.radii.pill,
    marginTop: 4
  },
  summaryLine: {
    fontFamily: theme.typography.body,
    color: theme.colors.textMuted,
    lineHeight: 20
  }
});
