/**
 * Tela de tratamento e acompanhamento dos alertas.
 */
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { acknowledgeAlert, listAlerts, resolveAlert } from '../../api/monitoring.api';
import { ApiError } from '../../api/client';
import { AppScreen } from '../../components/common/AppScreen';
import { EmptyState } from '../../components/common/EmptyState';
import { HouseholdSelector } from '../../components/common/HouseholdSelector';
import { LoadingState } from '../../components/common/LoadingState';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SectionCard } from '../../components/common/SectionCard';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { StatusPill } from '../../components/common/StatusPill';
import { appConfig } from '../../config/env';
import { theme } from '../../config/theme';
import { useAuth } from '../../hooks/useAuth';
import { useHousehold } from '../../hooks/useHousehold';
import { formatDateTime, getSeverityColor } from '../../utils/format';
import type { AlertStatus } from '../../types/api';

type AlertFilter = 'ALL' | AlertStatus;

export function AlertsScreen() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const { selectedHouseholdId, selectedHousehold } = useHousehold();
  const [filter, setFilter] = useState<AlertFilter>('ALL');

  const alertsQuery = useQuery({
    queryKey: ['alerts', selectedHouseholdId],
    queryFn: async () => listAlerts(token!, selectedHouseholdId!),
    enabled: Boolean(token && selectedHouseholdId),
    staleTime: appConfig.queryStaleTimeMs,
    refetchInterval: appConfig.alertsPollMs
  });

  const acknowledgeMutation = useMutation({
    mutationFn: async (alertId: string) => acknowledgeAlert(token!, alertId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['alerts', selectedHouseholdId] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', selectedHouseholdId] });
    }
  });

  const resolveMutation = useMutation({
    mutationFn: async (alertId: string) => resolveAlert(token!, alertId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['alerts', selectedHouseholdId] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', selectedHouseholdId] });
    }
  });

  async function handleAction(action: 'acknowledge' | 'resolve', alertId: string): Promise<void> {
    try {
      if (action === 'acknowledge') {
        await acknowledgeMutation.mutateAsync(alertId);
        return;
      }

      await resolveMutation.mutateAsync(alertId);
    } catch (error) {
      Alert.alert(
        'Falha ao atualizar alerta',
        error instanceof ApiError ? error.message : 'Tente novamente.'
      );
    }
  }

  const alerts =
    filter === 'ALL'
      ? alertsQuery.data ?? []
      : (alertsQuery.data ?? []).filter((alert) => alert.status === filter);

  return (
    <AppScreen
      title="Alertas"
      subtitle={`Acompanhe emergencias, inatividade e falhas em ${selectedHousehold?.name ?? 'sua residencia'}.`}
      refreshControl={
        <RefreshControl
          refreshing={alertsQuery.isRefetching}
          onRefresh={() => {
            void alertsQuery.refetch();
          }}
          tintColor={theme.colors.white}
        />
      }
    >
      <HouseholdSelector />

      <SegmentedControl
        value={filter}
        onChange={setFilter}
        options={[
          { label: 'Todos', value: 'ALL' },
          { label: 'Abertos', value: 'OPEN' },
          { label: 'Em analise', value: 'ACKNOWLEDGED' },
          { label: 'Resolvidos', value: 'RESOLVED' }
        ]}
      />

      {alertsQuery.isLoading && !alertsQuery.data ? (
        <LoadingState label="Buscando alertas da residencia..." />
      ) : alerts.length ? (
        alerts.map((alertItem) => (
          <SectionCard key={alertItem.id} style={styles.card}>
            <View style={styles.header}>
              <View style={styles.flex}>
                <Text style={styles.title}>{alertItem.title}</Text>
                <Text style={styles.meta}>
                  {formatDateTime(alertItem.createdAt)} • {alertItem.type.replace(/_/g, ' ')}
                </Text>
              </View>
              <StatusPill label={alertItem.severity} color={getSeverityColor(alertItem.severity)} />
            </View>

            <Text style={styles.description}>{alertItem.description}</Text>
            <Text style={styles.status}>Status atual: {alertItem.status}</Text>

            {alertItem.status !== 'RESOLVED' ? (
              <View style={styles.actions}>
                {alertItem.status === 'OPEN' ? (
                  <PrimaryButton
                    label="Reconhecer"
                    variant="ghost"
                    loading={acknowledgeMutation.isPending}
                    onPress={() => {
                      void handleAction('acknowledge', alertItem.id);
                    }}
                  />
                ) : null}
                <PrimaryButton
                  label="Marcar como resolvido"
                  variant="primary"
                  loading={resolveMutation.isPending}
                  onPress={() => {
                    void handleAction('resolve', alertItem.id);
                  }}
                />
              </View>
            ) : null}
          </SectionCard>
        ))
      ) : (
        <EmptyState
          title="Nenhum alerta nesse filtro"
          description="Quando houver falha, inatividade ou pedido de ajuda, eles aparecerao aqui."
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.md
  },
  header: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-start'
  },
  flex: {
    flex: 1
  },
  title: {
    fontFamily: theme.typography.display,
    color: theme.colors.primaryDark,
    fontSize: 22
  },
  meta: {
    marginTop: 4,
    fontFamily: theme.typography.body,
    color: theme.colors.textMuted
  },
  description: {
    fontFamily: theme.typography.body,
    color: theme.colors.text,
    lineHeight: 21
  },
  status: {
    fontFamily: theme.typography.heading,
    color: theme.colors.textMuted
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap'
  }
});
