/**
 * Tela unificada de logs e relatorios.
 */
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getActivityReport, listEvents } from '../../api/monitoring.api';
import { AppScreen } from '../../components/common/AppScreen';
import { EmptyState } from '../../components/common/EmptyState';
import { HouseholdSelector } from '../../components/common/HouseholdSelector';
import { InsightCard } from '../../components/common/InsightCard';
import { LoadingState } from '../../components/common/LoadingState';
import { MiniBarChart } from '../../components/common/MiniBarChart';
import { SectionCard } from '../../components/common/SectionCard';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { StatCard } from '../../components/common/StatCard';
import { appConfig } from '../../config/env';
import { theme } from '../../config/theme';
import { useAuth } from '../../hooks/useAuth';
import { useHousehold } from '../../hooks/useHousehold';
import { formatDateTime } from '../../utils/format';
import { analyzeReport } from '../../utils/insights';

type ActivityMode = 'LOGS' | 'REPORT';
type ReportDays = '7' | '30' | '90';

export function ActivityScreen() {
  const { token } = useAuth();
  const { selectedHouseholdId, selectedHousehold } = useHousehold();
  const [mode, setMode] = useState<ActivityMode>('LOGS');
  const [reportDays, setReportDays] = useState<ReportDays>('7');

  const eventsQuery = useQuery({
    queryKey: ['events', selectedHouseholdId],
    queryFn: async () => listEvents(token!, selectedHouseholdId!, 50),
    enabled: Boolean(token && selectedHouseholdId),
    staleTime: appConfig.queryStaleTimeMs,
    refetchInterval: 20_000
  });

  const reportQuery = useQuery({
    queryKey: ['activity-report', selectedHouseholdId, reportDays],
    queryFn: async () => getActivityReport(token!, selectedHouseholdId!, Number(reportDays)),
    enabled: Boolean(token && selectedHouseholdId),
    staleTime: appConfig.queryStaleTimeMs
  });

  const currentRefreshing = mode === 'LOGS' ? eventsQuery.isRefetching : reportQuery.isRefetching;
  const reportAnalytics = analyzeReport(reportQuery.data);

  return (
    <AppScreen
      title="Atividade"
      subtitle={`Logs e relatorios de ${selectedHousehold?.residentName ?? 'sua residencia'} em um unico lugar.`}
      refreshControl={
        <RefreshControl
          refreshing={currentRefreshing}
          onRefresh={() => {
            if (mode === 'LOGS') {
              void eventsQuery.refetch();
              return;
            }

            void reportQuery.refetch();
          }}
          tintColor={theme.colors.white}
        />
      }
    >
      <HouseholdSelector />

      <SegmentedControl
        value={mode}
        onChange={setMode}
        options={[
          { label: 'Logs', value: 'LOGS' },
          { label: 'Relatorio', value: 'REPORT' }
        ]}
      />

      {mode === 'LOGS' ? (
        eventsQuery.isLoading && !eventsQuery.data ? (
          <LoadingState label="Buscando logs recentes..." />
        ) : eventsQuery.data?.length ? (
          eventsQuery.data.map((event) => (
            <SectionCard key={event.id} style={styles.logCard}>
              <View
                style={[
                  styles.eventBadge,
                  {
                    backgroundColor:
                      event.type === 'help' ? `${theme.colors.danger}16` : `${theme.colors.primary}14`
                  }
                ]}
              >
                <Text
                  style={[
                    styles.eventBadgeText,
                    { color: event.type === 'help' ? theme.colors.danger : theme.colors.primaryDark }
                  ]}
                >
                  {event.type === 'help' ? 'AJUDA' : 'MOVIMENTO'}
                </Text>
              </View>
              <Text style={styles.title}>{event.deviceName}</Text>
              <Text style={styles.description}>
                {event.locationLabel || 'Local nao informado'} • {formatDateTime(event.occurredAt)}
              </Text>
            </SectionCard>
          ))
        ) : (
          <EmptyState
            title="Ainda sem logs"
            description="Quando um sensor detectar presenca ou um botao for pressionado, o registro aparecera aqui."
          />
        )
      ) : (
        <>
          <SegmentedControl
            value={reportDays}
            onChange={setReportDays}
            options={[
              { label: '7 dias', value: '7' },
              { label: '30 dias', value: '30' },
              { label: '90 dias', value: '90' }
            ]}
          />

          {reportQuery.isLoading && !reportQuery.data ? (
            <LoadingState label="Gerando relatorio..." />
          ) : reportQuery.data ? (
            <>
              {reportAnalytics ? (
                <SectionCard style={styles.sectionGap}>
                  <Text style={styles.title}>Indicadores inteligentes</Text>
                  <Text style={styles.description}>
                    Relatorio sintetico com comportamento, risco e aderencia da rotina monitorada.
                  </Text>

                  <View style={styles.highlightRow}>
                    <View style={styles.highlightBox}>
                      <Text style={styles.highlightLabel}>Indice de aderencia</Text>
                      <Text style={styles.highlightValue}>{reportAnalytics.adherenceScore}%</Text>
                      <Text style={styles.highlightHelper}>Rotina observada com consistencia</Text>
                    </View>

                    <View style={[styles.highlightBox, styles.highlightBoxAlt]}>
                      <Text style={styles.highlightLabel}>Risco operacional</Text>
                      <Text style={styles.highlightValue}>{reportAnalytics.riskLevel}</Text>
                      <Text style={styles.highlightHelper}>
                        Pressao assistencial {reportAnalytics.supportPressure.toLowerCase()}
                      </Text>
                    </View>
                  </View>
                </SectionCard>
              ) : null}

              <View style={styles.statsGrid}>
                <StatCard
                  eyebrow="Movimentos"
                  value={`${reportQuery.data.summary.movementEvents}`}
                  helper={`Ultimos ${reportQuery.data.period.appliedDays} dias`}
                  accentColor={theme.colors.primary}
                />
                <StatCard
                  eyebrow="Pedidos de ajuda"
                  value={`${reportQuery.data.summary.helpRequests}`}
                  helper="Acionamentos do botao fisico"
                  accentColor={theme.colors.secondary}
                />
                <StatCard
                  eyebrow="Alertas gerados"
                  value={`${reportQuery.data.summary.generatedAlerts}`}
                  helper="Inclui falhas e inatividade"
                  accentColor={theme.colors.accent}
                />
                <StatCard
                  eyebrow="Inatividade"
                  value={`${reportQuery.data.summary.inactivityAlerts}`}
                  helper="Alertas desse tipo no periodo"
                  accentColor={theme.colors.danger}
                />
                <StatCard
                  eyebrow="Media diaria"
                  value={reportAnalytics ? reportAnalytics.averageDailyMovements.toFixed(1) : '--'}
                  helper="Movimentos por dia"
                  accentColor={theme.colors.success}
                />
                <StatCard
                  eyebrow="Dia mais ativo"
                  value={reportAnalytics?.busiestDayLabel ?? '--'}
                  helper={`Variacao ${formatVariation(reportAnalytics?.movementVariationPercent)}`}
                  accentColor={theme.colors.primaryDark}
                />
              </View>

              <SectionCard style={styles.sectionGap}>
                <Text style={styles.title}>Resumo do periodo</Text>
                <Text style={styles.description}>
                  De {formatDateTime(reportQuery.data.period.startDate)} ate{' '}
                  {formatDateTime(reportQuery.data.period.endDate)}. O plano atual permite consultar ate{' '}
                  {reportQuery.data.period.retentionDaysAllowed} dias.
                </Text>
              </SectionCard>

              {reportAnalytics ? (
                <SectionCard style={styles.sectionGap}>
                  <MiniBarChart
                    title="Curva de atividade recente"
                    subtitle="A barra combina movimentos e peso adicional para pedidos de ajuda."
                    data={reportAnalytics.dailySeries}
                    color={theme.colors.primary}
                  />
                </SectionCard>
              ) : null}

              {reportAnalytics ? (
                <SectionCard style={styles.sectionGap}>
                  <Text style={styles.title}>Leituras do algoritmo</Text>
                  {reportAnalytics.insights.map((item) => (
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
                <Text style={styles.title}>Movimentos recentes no relatorio</Text>
                {reportQuery.data.movementEvents.slice(0, 6).map((event) => (
                  <Text key={event.id} style={styles.listLine}>
                    • {event.sensorName} ({event.locationLabel || 'Sem local'}) em{' '}
                    {formatDateTime(event.detectedAt)}
                  </Text>
                ))}
                {!reportQuery.data.movementEvents.length ? (
                  <EmptyState
                    title="Sem movimentos no periodo"
                    description="Verifique se os sensores ja estao enviando eventos para a API."
                  />
                ) : null}
              </SectionCard>

              <SectionCard style={styles.sectionGap}>
                <Text style={styles.title}>Alertas do periodo</Text>
                {reportQuery.data.alerts.slice(0, 6).map((alertItem) => (
                  <Text key={alertItem.id} style={styles.listLine}>
                    • [{alertItem.severity}] {alertItem.title} em {formatDateTime(alertItem.createdAt)}
                  </Text>
                ))}
                {!reportQuery.data.alerts.length ? (
                  <EmptyState
                    title="Sem alertas no periodo"
                    description="Quando houver falhas, ajuda ou inatividade, o relatorio consolidara tudo aqui."
                  />
                ) : null}
              </SectionCard>
            </>
          ) : null}
        </>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md
  },
  highlightRow: {
    flexDirection: 'row',
    gap: theme.spacing.md
  },
  highlightBox: {
    flex: 1,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.primaryDark,
    padding: theme.spacing.md,
    gap: 6
  },
  highlightBoxAlt: {
    backgroundColor: theme.colors.accent
  },
  highlightLabel: {
    fontFamily: theme.typography.heading,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.72)'
  },
  highlightValue: {
    fontFamily: theme.typography.display,
    fontSize: 25,
    color: theme.colors.white
  },
  highlightHelper: {
    fontFamily: theme.typography.body,
    fontSize: 12,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.82)'
  },
  logCard: {
    gap: theme.spacing.sm
  },
  eventBadge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6
  },
  eventBadgeText: {
    fontFamily: theme.typography.heading,
    fontSize: 11,
    letterSpacing: 0.5
  },
  title: {
    fontFamily: theme.typography.display,
    fontSize: 22,
    color: theme.colors.primaryDark
  },
  description: {
    fontFamily: theme.typography.body,
    color: theme.colors.textMuted,
    lineHeight: 21
  },
  sectionGap: {
    gap: theme.spacing.md
  },
  listLine: {
    fontFamily: theme.typography.body,
    color: theme.colors.text,
    lineHeight: 22
  }
});

function formatVariation(value?: number): string {
  if (value === undefined) {
    return '--';
  }

  if (value > 0) {
    return `+${value}%`;
  }

  return `${value}%`;
}
