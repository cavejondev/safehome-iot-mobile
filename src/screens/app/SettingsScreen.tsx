/**
 * Tela de ajustes da residencia, monitoramento e gateway.
 */
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { createGateway, listGateways, rotateGatewayToken } from '../../api/devices.api';
import { ApiError } from '../../api/client';
import { getHouseholdSettings, updateHouseholdSettings } from '../../api/households.api';
import { ActionSheetModal } from '../../components/common/ActionSheetModal';
import { AppScreen } from '../../components/common/AppScreen';
import { HouseholdSelector } from '../../components/common/HouseholdSelector';
import { LoadingState } from '../../components/common/LoadingState';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SectionCard } from '../../components/common/SectionCard';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { TextField } from '../../components/common/TextField';
import { appConfig } from '../../config/env';
import { theme } from '../../config/theme';
import { useAuth } from '../../hooks/useAuth';
import { useHousehold } from '../../hooks/useHousehold';
import { formatDateTime, formatRelativeTime, planLabel } from '../../utils/format';

interface SettingsFormState {
  inactivityThresholdMinutes: string;
  sensorCheckIntervalMinutes: string;
  buttonCheckIntervalMinutes: string;
  sleepModeStart: string;
  sleepModeEnd: string;
}

interface GatewayFormState {
  name: string;
  serialNumber: string;
  firmwareVersion: string;
}

export function SettingsScreen() {
  const queryClient = useQueryClient();
  const { token, signOut, user } = useAuth();
  const { selectedHouseholdId, selectedHousehold } = useHousehold();
  const [settingsForm, setSettingsForm] = useState<SettingsFormState>({
    inactivityThresholdMinutes: '120',
    sensorCheckIntervalMinutes: '30',
    buttonCheckIntervalMinutes: '10',
    sleepModeStart: '22:00',
    sleepModeEnd: '06:00'
  });
  const [quietHoursEnabled, setQuietHoursEnabled] = useState<'ON' | 'OFF'>('OFF');
  const [savingSettings, setSavingSettings] = useState(false);
  const [gatewayModalVisible, setGatewayModalVisible] = useState(false);
  const [savingGateway, setSavingGateway] = useState(false);
  const [gatewayForm, setGatewayForm] = useState<GatewayFormState>({
    name: 'Central Principal',
    serialNumber: '',
    firmwareVersion: ''
  });

  const settingsQuery = useQuery({
    queryKey: ['household-settings', selectedHouseholdId],
    queryFn: async () => getHouseholdSettings(token!, selectedHouseholdId!),
    enabled: Boolean(token && selectedHouseholdId),
    staleTime: appConfig.queryStaleTimeMs
  });

  const gatewaysQuery = useQuery({
    queryKey: ['gateways', selectedHouseholdId],
    queryFn: async () => listGateways(token!, selectedHouseholdId!),
    enabled: Boolean(token && selectedHouseholdId),
    staleTime: appConfig.queryStaleTimeMs
  });

  useEffect(() => {
    if (!settingsQuery.data) {
      return;
    }

    setSettingsForm({
      inactivityThresholdMinutes: String(settingsQuery.data.inactivityThresholdMinutes),
      sensorCheckIntervalMinutes: String(settingsQuery.data.sensorCheckIntervalMinutes),
      buttonCheckIntervalMinutes: String(settingsQuery.data.buttonCheckIntervalMinutes),
      sleepModeStart: settingsQuery.data.sleepModeStart ?? '',
      sleepModeEnd: settingsQuery.data.sleepModeEnd ?? ''
    });
    setQuietHoursEnabled(settingsQuery.data.quietHoursEnabled ? 'ON' : 'OFF');
  }, [settingsQuery.data]);

  async function refreshAll(): Promise<void> {
    await Promise.all([settingsQuery.refetch(), gatewaysQuery.refetch()]);
  }

  async function handleSaveSettings(): Promise<void> {
    if (!selectedHouseholdId) {
      return;
    }

    try {
      setSavingSettings(true);

      await updateHouseholdSettings(token!, selectedHouseholdId, {
        inactivityThresholdMinutes: Number(settingsForm.inactivityThresholdMinutes),
        sensorCheckIntervalMinutes: Number(settingsForm.sensorCheckIntervalMinutes),
        buttonCheckIntervalMinutes: Number(settingsForm.buttonCheckIntervalMinutes),
        sleepModeStart: settingsForm.sleepModeStart || null,
        sleepModeEnd: settingsForm.sleepModeEnd || null,
        quietHoursEnabled: quietHoursEnabled === 'ON'
      });

      await queryClient.invalidateQueries({ queryKey: ['household-settings', selectedHouseholdId] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', selectedHouseholdId] });
      Alert.alert('Ajustes salvos', 'As novas configuracoes ja estao ativas na API.');
    } catch (error) {
      Alert.alert(
        'Falha ao salvar configuracoes',
        error instanceof ApiError ? error.message : 'Tente novamente.'
      );
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleCreateGateway(): Promise<void> {
    if (!selectedHouseholdId) {
      return;
    }

    if (!gatewayForm.name || !gatewayForm.serialNumber) {
      Alert.alert('Campos obrigatorios', 'Informe o nome e o serial do gateway.');
      return;
    }

    try {
      setSavingGateway(true);
      const result = await createGateway(token!, selectedHouseholdId, {
        name: gatewayForm.name,
        serialNumber: gatewayForm.serialNumber,
        firmwareVersion: gatewayForm.firmwareVersion || undefined
      });

      await queryClient.invalidateQueries({ queryKey: ['gateways', selectedHouseholdId] });
      setGatewayModalVisible(false);
      setGatewayForm({
        name: 'Central Principal',
        serialNumber: '',
        firmwareVersion: ''
      });

      Alert.alert(
        'Gateway criado',
        `Guarde este token com seguranca:\n\n${result.gatewayToken}`
      );
    } catch (error) {
      Alert.alert(
        'Falha ao criar gateway',
        error instanceof ApiError ? error.message : 'Tente novamente.'
      );
    } finally {
      setSavingGateway(false);
    }
  }

  async function handleRotateToken(gatewayId: string): Promise<void> {
    try {
      const result = await rotateGatewayToken(token!, gatewayId);
      await queryClient.invalidateQueries({ queryKey: ['gateways', selectedHouseholdId] });
      Alert.alert('Novo token gerado', result.gatewayToken);
    } catch (error) {
      Alert.alert(
        'Falha ao rotacionar token',
        error instanceof ApiError ? error.message : 'Tente novamente.'
      );
    }
  }

  async function handleSignOut(): Promise<void> {
    await signOut();
  }

  return (
    <AppScreen
      title="Ajustes"
      subtitle={`Configuracoes da residencia ${selectedHousehold?.name ?? 'selecionada'} e da central SafeHome.`}
      refreshControl={
        <RefreshControl
          refreshing={settingsQuery.isRefetching || gatewaysQuery.isRefetching}
          onRefresh={() => {
            void refreshAll();
          }}
          tintColor={theme.colors.white}
        />
      }
    >
      <HouseholdSelector />

      <SectionCard style={styles.card}>
        <Text style={styles.title}>Resumo da residencia</Text>
        <Text style={styles.description}>Morador: {selectedHousehold?.residentName || 'Nao informado'}</Text>
        <Text style={styles.description}>Plano: {planLabel(selectedHousehold?.plan || 'CARE')}</Text>
        <Text style={styles.description}>Timezone: {selectedHousehold?.timezone || 'America/Sao_Paulo'}</Text>
        <Text style={styles.description}>Responsavel logado: {user?.fullName}</Text>
      </SectionCard>

      {settingsQuery.isLoading && !settingsQuery.data ? (
        <LoadingState label="Carregando configuracoes..." />
      ) : (
        <SectionCard style={styles.card}>
          <Text style={styles.title}>Monitoramento automatico</Text>

          <TextField
            label="Limite de inatividade (min)"
            value={settingsForm.inactivityThresholdMinutes}
            onChangeText={(value) => setSettingsForm((current) => ({ ...current, inactivityThresholdMinutes: value }))}
            keyboardType="number-pad"
          />

          <TextField
            label="Cheque dos sensores (min)"
            value={settingsForm.sensorCheckIntervalMinutes}
            onChangeText={(value) => setSettingsForm((current) => ({ ...current, sensorCheckIntervalMinutes: value }))}
            keyboardType="number-pad"
          />

          <TextField
            label="Cheque dos botoes (min)"
            value={settingsForm.buttonCheckIntervalMinutes}
            onChangeText={(value) => setSettingsForm((current) => ({ ...current, buttonCheckIntervalMinutes: value }))}
            keyboardType="number-pad"
          />

          <TextField
            label="Inicio do modo dormir"
            value={settingsForm.sleepModeStart}
            onChangeText={(value) => setSettingsForm((current) => ({ ...current, sleepModeStart: value }))}
            placeholder="22:00"
          />

          <TextField
            label="Fim do modo dormir"
            value={settingsForm.sleepModeEnd}
            onChangeText={(value) => setSettingsForm((current) => ({ ...current, sleepModeEnd: value }))}
            placeholder="06:00"
          />

          <View style={styles.toggleBlock}>
            <Text style={styles.fieldLabel}>Ativar horarios silenciosos</Text>
            <SegmentedControl
              value={quietHoursEnabled}
              onChange={setQuietHoursEnabled}
              options={[
                { label: 'Desligado', value: 'OFF' },
                { label: 'Ligado', value: 'ON' }
              ]}
            />
          </View>

          <PrimaryButton
            label="Salvar configuracoes"
            loading={savingSettings}
            onPress={() => void handleSaveSettings()}
          />
        </SectionCard>
      )}

      <SectionCard style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.flex}>
            <Text style={styles.title}>Gateways cadastrados</Text>
            <Text style={styles.description}>
              Crie a central, registre o serial e rotacione o token quando necessario.
            </Text>
          </View>
          <PrimaryButton label="Novo gateway" variant="secondary" onPress={() => setGatewayModalVisible(true)} />
        </View>

        {(gatewaysQuery.data ?? []).map((gateway) => (
          <View key={gateway.id} style={styles.gatewayCard}>
            <Text style={styles.gatewayName}>{gateway.name}</Text>
            <Text style={styles.gatewayMeta}>Serial: {gateway.serialNumber}</Text>
            <Text style={styles.gatewayMeta}>
              Firmware: {gateway.firmwareVersion || 'Nao informado'}
            </Text>
            <Text style={styles.gatewayMeta}>
              Ultimo contato: {gateway.lastSeenAt ? formatRelativeTime(gateway.lastSeenAt) : 'Sem heartbeat'}
            </Text>
            <Text style={styles.gatewayMeta}>Criado em: {formatDateTime(gateway.createdAt)}</Text>
            <PrimaryButton
              label="Rotacionar token"
              variant="ghost"
              onPress={() => {
                void handleRotateToken(gateway.id);
              }}
            />
          </View>
        ))}

        {!gatewaysQuery.data?.length ? (
          <Text style={styles.description}>Nenhum gateway cadastrado ainda.</Text>
        ) : null}
      </SectionCard>

      <SectionCard style={styles.card}>
        <Text style={styles.title}>Sessao e conectividade</Text>
        <Text style={styles.description}>
          {appConfig.demoMode
            ? 'Modo apresentacao: o app esta operando somente com dados locais mockados.'
            : `Base da API: ${appConfig.apiBaseUrl}`}
        </Text>
        {!appConfig.demoMode ? (
          <PrimaryButton label="Sair do app" variant="danger" onPress={() => void handleSignOut()} />
        ) : null}
      </SectionCard>

      <ActionSheetModal
        visible={gatewayModalVisible}
        title="Novo gateway"
        subtitle="Cadastre a central e guarde o token retornado para configurar o Arduino."
        onClose={() => setGatewayModalVisible(false)}
      >
        <View style={styles.card}>
          <TextField
            label="Nome da central"
            value={gatewayForm.name}
            onChangeText={(value) => setGatewayForm((current) => ({ ...current, name: value }))}
            placeholder="Central Principal"
          />
          <TextField
            label="Serial do gateway"
            value={gatewayForm.serialNumber}
            onChangeText={(value) => setGatewayForm((current) => ({ ...current, serialNumber: value }))}
            placeholder="SAFEHOME-GW-001"
          />
          <TextField
            label="Versao do firmware"
            value={gatewayForm.firmwareVersion}
            onChangeText={(value) => setGatewayForm((current) => ({ ...current, firmwareVersion: value }))}
            placeholder="1.0.0"
          />
          <PrimaryButton
            label="Criar gateway"
            loading={savingGateway}
            onPress={() => void handleCreateGateway()}
          />
        </View>
      </ActionSheetModal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.md
  },
  rowBetween: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-start'
  },
  flex: {
    flex: 1
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
  fieldLabel: {
    fontFamily: theme.typography.heading,
    color: theme.colors.text
  },
  toggleBlock: {
    gap: theme.spacing.xs
  },
  gatewayCard: {
    gap: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white
  },
  gatewayName: {
    fontFamily: theme.typography.heading,
    fontSize: 16,
    color: theme.colors.text
  },
  gatewayMeta: {
    fontFamily: theme.typography.body,
    color: theme.colors.textMuted
  }
});
