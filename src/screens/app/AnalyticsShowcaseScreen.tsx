import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { getActivityReport, getDashboard, listEvents } from '../../api/monitoring.api';
import { AppScreen } from '../../components/common/AppScreen';
import { HouseholdSelector } from '../../components/common/HouseholdSelector';
import { InsightCard } from '../../components/common/InsightCard';
import { LoadingState } from '../../components/common/LoadingState';
import { MiniBarChart } from '../../components/common/MiniBarChart';
import { ScoreRingCard } from '../../components/common/ScoreRingCard';
import { SectionCard } from '../../components/common/SectionCard';
import { StatCard } from '../../components/common/StatCard';
import { theme } from '../../config/theme';
import { useAuth } from '../../hooks/useAuth';
import { useHousehold } from '../../hooks/useHousehold';
import { formatDateTime, formatMinutes } from '../../utils/format';
import { analyzeDashboard, analyzeReport } from '../../utils/insights';

export function AnalyticsShowcaseScreen() {
  const { token } = useAuth();
  const { selectedHouseholdId, selectedHousehold } = useHousehold();

  const dashboardQuery = useQuery({
    queryKey: ['analytics-dashboard', selectedHouseholdId],
    queryFn: async () => getDashboard(token!, selectedHouseholdId!),
    enabled: Boolean(token && selectedHouseholdId),
    staleTime: 15_000,
    refetchInterval: 15_000
  });

  const eventsQuery = useQuery({
    queryKey: ['analytics-events', selectedHouseholdId],
    queryFn: async () => listEvents(token!, selectedHouseholdId!, 80),
    enabled: Boolean(token && selectedHouseholdId),
    staleTime: 15_000,
    refetchInterval: 15_000
  });

  const reportQuery = useQuery({
    queryKey: ['analytics-report', selectedHouseholdId],
    queryFn: async () => getActivityReport(token!, selectedHouseholdId!, 7),
    enabled: Boolean(token && selectedHouseholdId),
    staleTime: 15_000
  });

  if (!selectedHouseholdId) {
    return <LoadingState label="Preparando painel analitico..." />;
  }

  if ((dashboardQuery.isLoading && !dashboardQuery.data) || (reportQuery.isLoading && !reportQuery.data)) {
    return <LoadingState label="Calculando indicadores e metricas..." />;
  }

  const dashboard = dashboardQuery.data;
  const report = reportQuery.data;
  const dashboardAnalytics = analyzeDashboard(dashboard, eventsQuery.data);
  const reportAnalytics = analyzeReport(report);

  if (!dashboard || !report || !dashboardAnalytics || !reportAnalytics) {
    return <LoadingState label="Consolidando dados analiticos..." />;
  }

  return (
    <AppScreen
      title="Analytics"
      subtitle={`Painel demonstrativo de ${selectedHousehold?.residentName ?? 'monitoramento residencial'} para apresentacao academica.`}
      refreshControl={
        <RefreshControl
          refreshing={
            dashboardQuery.isRefetching || eventsQuery.isRefetching || reportQuery.isRefetching
          }
          onRefresh={() => {
            void dashboardQuery.refetch();
            void eventsQuery.refetch();
            void reportQuery.refetch();
          }}
          tintColor={theme.colors.white}
        />
      }
    >
      <HouseholdSelector />

      <ScoreRingCard
        score={dashboardAnalytics.monitoringScore}
        label="Dashboard Analitico"
        helper={`Indice geral ${dashboardAnalytics.monitoringLabel.toLowerCase()} com leitura em tempo real da residencia.`}
      />

      <SectionCard style={styles.sectionGap}>
        <Text style={styles.sectionTitle}>Algoritmo</Text>
        <Text style={styles.description}>
          O algoritmo cruza telemetria recente, historico de movimento, alertas abertos e cobertura
          dos dispositivos para detectar padrao, anomalia e tendencia operacional.
        </Text>
        <View style={styles.algorithmGrid}>
          <View style={styles.algorithmStep}>
            <Text style={styles.algorithmIndex}>01</Text>
            <Text style={styles.algorithmLabel}>Padrao</Text>
            <Text style={styles.algorithmText}>
              Janela dominante: {dashboardAnalytics.topRoutineWindow} com confianca de{' '}
              {dashboardAnalytics.routineConfidence}%.
            </Text>
          </View>
          <View style={styles.algorithmStep}>
            <Text style={styles.algorithmIndex}>02</Text>
            <Text style={styles.algorithmLabel}>Anomalia</Text>
            <Text style={styles.algorithmText}>
              {dashboardAnalytics.anomalyCount} ocorrencia(s) relevante(s) combinando offline,
              inatividade e criticidade.
            </Text>
          </View>
          <View style={styles.algorithmStep}>
            <Text style={styles.algorithmIndex}>03</Text>
            <Text style={styles.algorithmLabel}>Tendencia</Text>
            <Text style={styles.algorithmText}>
              Movimento {trendLabel(reportAnalytics.movementTrend)} com variacao de{' '}
              {formatVariation(reportAnalytics.movementVariationPercent)} no periodo.
            </Text>
          </View>
        </View>
      </SectionCard>

      <SectionCard style={styles.sectionGap}>
        <Text style={styles.sectionTitle}>Indicadores</Text>
        <View style={styles.statsGrid}>
          <StatCard
            eyebrow="Indice"
            value={`${dashboardAnalytics.monitoringScore}`}
            helper="Saude geral do monitoramento"
            accentColor={theme.colors.primary}
          />
          <StatCard
            eyebrow="Cobertura"
            value={`${dashboardAnalytics.safetyCoverage}%`}
            helper="Dispositivos ativos e comunicando"
            accentColor={theme.colors.success}
          />
          <StatCard
            eyebrow="Prontidao"
            value={`${dashboardAnalytics.responseReadiness}%`}
            helper="Capacidade de resposta"
            accentColor={theme.colors.secondary}
          />
          <StatCard
            eyebrow="Aderencia"
            value={`${reportAnalytics.adherenceScore}%`}
            helper="Consistencia da rotina"
            accentColor={theme.colors.accent}
          />
        </View>
      </SectionCard>

      <SectionCard style={styles.sectionGap}>
        <Text style={styles.sectionTitle}>Dashboard</Text>
        <Text style={styles.description}>
          Visual consolidado para demonstrar comportamento, risco e dinamica de uso da residencia.
        </Text>
        <MiniBarChart
          title="Atividade nas ultimas 24 horas"
          subtitle="Eventos ponderados por movimentacao e pedidos de ajuda."
          data={dashboardAnalytics.hourlyActivity}
          color={theme.colors.primary}
        />
        <MiniBarChart
          title="Metricas diarias da ultima semana"
          subtitle="Combinacao de eventos normais e eventos de atencao."
          data={reportAnalytics.dailySeries}
          color={theme.colors.success}
        />
      </SectionCard>

      <SectionCard style={styles.sectionGap}>
        <Text style={styles.sectionTitle}>Metricas</Text>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Ultima atividade relevante</Text>
          <Text style={styles.metricValue}>
            {formatMinutes(dashboard.minutesSinceLastActivity)} •{' '}
            {formatDateTime(dashboard.lastActivityAt)}
          </Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Media diaria de movimentos</Text>
          <Text style={styles.metricValue}>{reportAnalytics.averageDailyMovements.toFixed(1)}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Media diaria de alertas</Text>
          <Text style={styles.metricValue}>{reportAnalytics.averageDailyAlerts.toFixed(1)}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Nivel de risco</Text>
          <Text style={styles.metricValue}>{reportAnalytics.riskLevel}</Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Dia com maior atividade</Text>
          <Text style={styles.metricValue}>{reportAnalytics.busiestDayLabel}</Text>
        </View>
      </SectionCard>

      <SectionCard style={styles.sectionGap}>
        <Text style={styles.sectionTitle}>Leituras do sistema</Text>
        {dashboardAnalytics.detectedPatterns.map((item) => (
          <InsightCard key={item.title} title={item.title} description={item.description} tone={item.tone} />
        ))}
        {dashboardAnalytics.anomalies.map((item) => (
          <InsightCard key={item.title} title={item.title} description={item.description} tone={item.tone} />
        ))}
        {reportAnalytics.insights.map((item) => (
          <InsightCard
            key={`${item.title}-report`}
            title={item.title}
            description={item.description}
            tone={item.tone}
          />
        ))}
      </SectionCard>
    </AppScreen>
  );
}

function trendLabel(value: 'up' | 'down' | 'stable'): string {
  if (value === 'up') {
    return 'em alta';
  }

  if (value === 'down') {
    return 'em queda';
  }

  return 'estavel';
}

function formatVariation(value: number): string {
  if (value > 0) {
    return `+${value}%`;
  }

  return `${value}%`;
}

const styles = StyleSheet.create({
  sectionGap: {
    gap: theme.spacing.md
  },
  sectionTitle: {
    fontFamily: theme.typography.display,
    fontSize: 22,
    color: theme.colors.primaryDark
  },
  description: {
    fontFamily: theme.typography.body,
    color: theme.colors.textMuted,
    lineHeight: 21
  },
  algorithmGrid: {
    gap: theme.spacing.sm
  },
  algorithmStep: {
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    gap: 4
  },
  algorithmIndex: {
    fontFamily: theme.typography.heading,
    fontSize: 12,
    color: theme.colors.accent,
    letterSpacing: 1
  },
  algorithmLabel: {
    fontFamily: theme.typography.heading,
    fontSize: 16,
    color: theme.colors.primaryDark
  },
  algorithmText: {
    fontFamily: theme.typography.body,
    color: theme.colors.textMuted,
    lineHeight: 20
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md
  },
  metricRow: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
    gap: 4
  },
  metricLabel: {
    fontFamily: theme.typography.heading,
    fontSize: 14,
    color: theme.colors.text
  },
  metricValue: {
    fontFamily: theme.typography.body,
    color: theme.colors.textMuted,
    lineHeight: 20
  }
});
