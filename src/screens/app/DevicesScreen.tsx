/**
 * Tela de gerenciamento de sensores e botoes de ajuda.
 */
import { Alert, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createHelpButton,
  createSensor,
  listGateways,
  listHelpButtons,
  listSensors,
  removeHelpButton,
  removeSensor,
  updateHelpButton,
  updateSensor
} from '../../api/devices.api';
import { ApiError } from '../../api/client';
import { ActionSheetModal } from '../../components/common/ActionSheetModal';
import { AppScreen } from '../../components/common/AppScreen';
import { EmptyState } from '../../components/common/EmptyState';
import { HouseholdSelector } from '../../components/common/HouseholdSelector';
import { LoadingState } from '../../components/common/LoadingState';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SectionCard } from '../../components/common/SectionCard';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { StatusPill } from '../../components/common/StatusPill';
import { TextField } from '../../components/common/TextField';
import { appConfig } from '../../config/env';
import { theme } from '../../config/theme';
import { useAuth } from '../../hooks/useAuth';
import { useHousehold } from '../../hooks/useHousehold';
import type { HelpButton, Sensor } from '../../types/api';
import { formatDateTime, getStatusColor, getStatusLabel } from '../../utils/format';

type DeviceTab = 'SENSORS' | 'BUTTONS';

interface DeviceFormState {
  gatewayId: string;
  name: string;
  externalId: string;
  locationLabel: string;
}

function getInitialForm(gatewayId?: string): DeviceFormState {
  return {
    gatewayId: gatewayId ?? '',
    name: '',
    externalId: '',
    locationLabel: ''
  };
}

export function DevicesScreen() {
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const { selectedHouseholdId, selectedHousehold } = useHousehold();
  const [tab, setTab] = useState<DeviceTab>('SENSORS');
  const [sensorModalVisible, setSensorModalVisible] = useState(false);
  const [buttonModalVisible, setButtonModalVisible] = useState(false);
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
  const [editingButton, setEditingButton] = useState<HelpButton | null>(null);
  const [sensorForm, setSensorForm] = useState<DeviceFormState>(getInitialForm());
  const [buttonForm, setButtonForm] = useState<DeviceFormState>(getInitialForm());
  const [savingSensor, setSavingSensor] = useState(false);
  const [savingButton, setSavingButton] = useState(false);

  const sensorsQuery = useQuery({
    queryKey: ['sensors', selectedHouseholdId],
    queryFn: async () => listSensors(token!, selectedHouseholdId!),
    enabled: Boolean(token && selectedHouseholdId),
    staleTime: appConfig.queryStaleTimeMs,
    refetchInterval: appConfig.dashboardPollMs
  });

  const buttonsQuery = useQuery({
    queryKey: ['help-buttons', selectedHouseholdId],
    queryFn: async () => listHelpButtons(token!, selectedHouseholdId!),
    enabled: Boolean(token && selectedHouseholdId),
    staleTime: appConfig.queryStaleTimeMs,
    refetchInterval: appConfig.dashboardPollMs
  });

  const gatewaysQuery = useQuery({
    queryKey: ['gateways', selectedHouseholdId],
    queryFn: async () => listGateways(token!, selectedHouseholdId!),
    enabled: Boolean(token && selectedHouseholdId),
    staleTime: appConfig.queryStaleTimeMs
  });

  async function refreshAll(): Promise<void> {
    await Promise.all([sensorsQuery.refetch(), buttonsQuery.refetch(), gatewaysQuery.refetch()]);
  }

  function openCreateSensor(): void {
    if (!gatewaysQuery.data?.length) {
      Alert.alert('Cadastre um gateway primeiro', 'Voce precisa adicionar a central em Ajustes.');
      return;
    }

    setEditingSensor(null);
    setSensorForm(getInitialForm(gatewaysQuery.data[0].id));
    setSensorModalVisible(true);
  }

  function openEditSensor(sensor: Sensor): void {
    setEditingSensor(sensor);
    setSensorForm({
      gatewayId: sensor.gatewayId,
      name: sensor.name,
      externalId: sensor.externalId,
      locationLabel: sensor.locationLabel ?? ''
    });
    setSensorModalVisible(true);
  }

  function openCreateButton(): void {
    if (!gatewaysQuery.data?.length) {
      Alert.alert('Cadastre um gateway primeiro', 'Voce precisa adicionar a central em Ajustes.');
      return;
    }

    setEditingButton(null);
    setButtonForm(getInitialForm(gatewaysQuery.data[0].id));
    setButtonModalVisible(true);
  }

  function openEditButton(button: HelpButton): void {
    setEditingButton(button);
    setButtonForm({
      gatewayId: button.gatewayId,
      name: button.name,
      externalId: button.externalId,
      locationLabel: button.locationLabel ?? ''
    });
    setButtonModalVisible(true);
  }

  async function handleSaveSensor(): Promise<void> {
    if (!selectedHouseholdId) {
      return;
    }

    if (!sensorForm.gatewayId || !sensorForm.name || !sensorForm.externalId) {
      Alert.alert('Campos obrigatorios', 'Escolha o gateway, informe nome e externalId.');
      return;
    }

    try {
      setSavingSensor(true);

      if (editingSensor) {
        await updateSensor(token!, editingSensor.id, {
          name: sensorForm.name,
          locationLabel: sensorForm.locationLabel || null
        });
      } else {
        await createSensor(token!, selectedHouseholdId, {
          gatewayId: sensorForm.gatewayId,
          name: sensorForm.name,
          externalId: sensorForm.externalId,
          locationLabel: sensorForm.locationLabel || undefined
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['sensors', selectedHouseholdId] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', selectedHouseholdId] });
      setSensorModalVisible(false);
    } catch (error) {
      Alert.alert(
        'Falha ao salvar sensor',
        error instanceof ApiError ? error.message : 'Tente novamente.'
      );
    } finally {
      setSavingSensor(false);
    }
  }

  async function handleSaveButton(): Promise<void> {
    if (!selectedHouseholdId) {
      return;
    }

    if (!buttonForm.gatewayId || !buttonForm.name || !buttonForm.externalId) {
      Alert.alert('Campos obrigatorios', 'Escolha o gateway, informe nome e externalId.');
      return;
    }

    try {
      setSavingButton(true);

      if (editingButton) {
        await updateHelpButton(token!, editingButton.id, {
          name: buttonForm.name,
          locationLabel: buttonForm.locationLabel || null
        });
      } else {
        await createHelpButton(token!, selectedHouseholdId, {
          gatewayId: buttonForm.gatewayId,
          name: buttonForm.name,
          externalId: buttonForm.externalId,
          locationLabel: buttonForm.locationLabel || undefined
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['help-buttons', selectedHouseholdId] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', selectedHouseholdId] });
      setButtonModalVisible(false);
    } catch (error) {
      Alert.alert(
        'Falha ao salvar botao',
        error instanceof ApiError ? error.message : 'Tente novamente.'
      );
    } finally {
      setSavingButton(false);
    }
  }

  async function handleSensorState(sensor: Sensor): Promise<void> {
    try {
      if (sensor.isActive) {
        await removeSensor(token!, sensor.id);
      } else {
        await updateSensor(token!, sensor.id, { isActive: true });
      }

      await queryClient.invalidateQueries({ queryKey: ['sensors', selectedHouseholdId] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', selectedHouseholdId] });
    } catch (error) {
      Alert.alert(
        'Falha ao atualizar sensor',
        error instanceof ApiError ? error.message : 'Tente novamente.'
      );
    }
  }

  async function handleButtonState(button: HelpButton): Promise<void> {
    try {
      if (button.isActive) {
        await removeHelpButton(token!, button.id);
      } else {
        await updateHelpButton(token!, button.id, { isActive: true });
      }

      await queryClient.invalidateQueries({ queryKey: ['help-buttons', selectedHouseholdId] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard', selectedHouseholdId] });
    } catch (error) {
      Alert.alert(
        'Falha ao atualizar botao',
        error instanceof ApiError ? error.message : 'Tente novamente.'
      );
    }
  }

  const gateways = gatewaysQuery.data ?? [];

  return (
    <AppScreen
      title="Dispositivos"
      subtitle={`Sensores e botoes da residencia ${selectedHousehold?.name ?? 'selecionada'}.`}
      refreshControl={
        <RefreshControl
          refreshing={sensorsQuery.isRefetching || buttonsQuery.isRefetching || gatewaysQuery.isRefetching}
          onRefresh={() => {
            void refreshAll();
          }}
          tintColor={theme.colors.white}
        />
      }
    >
      <HouseholdSelector />

      <SectionCard style={styles.infoCard}>
        <Text style={styles.title}>Topologia ativa</Text>
        <Text style={styles.description}>
          Gateways: {gateways.length} • Sensores: {sensorsQuery.data?.length ?? 0} • Botoes:{' '}
          {buttonsQuery.data?.length ?? 0}
        </Text>
      </SectionCard>

      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[
          { label: 'Sensores', value: 'SENSORS' },
          { label: 'Botoes de ajuda', value: 'BUTTONS' }
        ]}
      />

      {tab === 'SENSORS' ? (
        <>
          <PrimaryButton label="Adicionar sensor" onPress={openCreateSensor} />
          {sensorsQuery.isLoading && !sensorsQuery.data ? (
            <LoadingState label="Carregando sensores..." />
          ) : sensorsQuery.data?.length ? (
            sensorsQuery.data.map((sensor) => (
              <SectionCard key={sensor.id} style={styles.deviceCard}>
                <View style={styles.rowBetween}>
                  <View style={styles.flex}>
                    <Text style={styles.deviceName}>{sensor.name}</Text>
                    <Text style={styles.deviceMeta}>
                      {sensor.locationLabel || 'Sem local'} • {sensor.externalId}
                    </Text>
                    <Text style={styles.deviceMeta}>
                      Ultimo contato: {formatDateTime(sensor.lastSeenAt)}
                    </Text>
                  </View>
                  <StatusPill label={getStatusLabel(sensor.status)} color={getStatusColor(sensor.status)} />
                </View>
                <View style={styles.actions}>
                  <PrimaryButton label="Editar" variant="ghost" onPress={() => openEditSensor(sensor)} />
                  <PrimaryButton
                    label={sensor.isActive ? 'Desativar' : 'Reativar'}
                    variant={sensor.isActive ? 'danger' : 'secondary'}
                    onPress={() => {
                      void handleSensorState(sensor);
                    }}
                  />
                </View>
              </SectionCard>
            ))
          ) : (
            <EmptyState
              title="Nenhum sensor cadastrado"
              description="Adicione sensores de presenca com o mesmo externalId usado no Arduino."
            />
          )}
        </>
      ) : (
        <>
          <PrimaryButton label="Adicionar botao de ajuda" onPress={openCreateButton} />
          {buttonsQuery.isLoading && !buttonsQuery.data ? (
            <LoadingState label="Carregando botoes..." />
          ) : buttonsQuery.data?.length ? (
            buttonsQuery.data.map((button) => (
              <SectionCard key={button.id} style={styles.deviceCard}>
                <View style={styles.rowBetween}>
                  <View style={styles.flex}>
                    <Text style={styles.deviceName}>{button.name}</Text>
                    <Text style={styles.deviceMeta}>
                      {button.locationLabel || 'Sem local'} • {button.externalId}
                    </Text>
                    <Text style={styles.deviceMeta}>
                      Ultimo contato: {formatDateTime(button.lastSeenAt)}
                    </Text>
                  </View>
                  <StatusPill label={getStatusLabel(button.status)} color={getStatusColor(button.status)} />
                </View>
                <View style={styles.actions}>
                  <PrimaryButton label="Editar" variant="ghost" onPress={() => openEditButton(button)} />
                  <PrimaryButton
                    label={button.isActive ? 'Desativar' : 'Reativar'}
                    variant={button.isActive ? 'danger' : 'secondary'}
                    onPress={() => {
                      void handleButtonState(button);
                    }}
                  />
                </View>
              </SectionCard>
            ))
          ) : (
            <EmptyState
              title="Nenhum botao cadastrado"
              description="Adicione os botoes fisicos para pedidos de ajuda imediatos."
            />
          )}
        </>
      )}

      <ActionSheetModal
        visible={sensorModalVisible}
        title={editingSensor ? 'Editar sensor' : 'Novo sensor'}
        subtitle="Mantenha o externalId igual ao identificador configurado no gateway."
        onClose={() => setSensorModalVisible(false)}
      >
        <View style={styles.formBlock}>
          <Text style={styles.fieldLabel}>Gateway</Text>
          <View style={styles.gatewayRow}>
            {gateways.map((gateway) => {
              const active = gateway.id === sensorForm.gatewayId;

              return (
                <Pressable
                  key={gateway.id}
                  style={[styles.gatewayChip, active ? styles.gatewayChipActive : undefined]}
                  onPress={() => setSensorForm((current) => ({ ...current, gatewayId: gateway.id }))}
                >
                  <Text style={[styles.gatewayChipText, active ? styles.gatewayChipTextActive : undefined]}>
                    {gateway.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TextField
            label="Nome"
            value={sensorForm.name}
            onChangeText={(value) => setSensorForm((current) => ({ ...current, name: value }))}
            placeholder="Sensor da sala"
          />
          <TextField
            label="External ID"
            value={sensorForm.externalId}
            onChangeText={(value) => setSensorForm((current) => ({ ...current, externalId: value }))}
            placeholder="pir-sala"
            editable={!editingSensor}
          />
          <TextField
            label="Local"
            value={sensorForm.locationLabel}
            onChangeText={(value) => setSensorForm((current) => ({ ...current, locationLabel: value }))}
            placeholder="Sala"
          />

          <PrimaryButton label="Salvar sensor" loading={savingSensor} onPress={() => void handleSaveSensor()} />
        </View>
      </ActionSheetModal>

      <ActionSheetModal
        visible={buttonModalVisible}
        title={editingButton ? 'Editar botao' : 'Novo botao'}
        subtitle="Configure o botao fisico com o mesmo externalId usado na central."
        onClose={() => setButtonModalVisible(false)}
      >
        <View style={styles.formBlock}>
          <Text style={styles.fieldLabel}>Gateway</Text>
          <View style={styles.gatewayRow}>
            {gateways.map((gateway) => {
              const active = gateway.id === buttonForm.gatewayId;

              return (
                <Pressable
                  key={gateway.id}
                  style={[styles.gatewayChip, active ? styles.gatewayChipActive : undefined]}
                  onPress={() => setButtonForm((current) => ({ ...current, gatewayId: gateway.id }))}
                >
                  <Text style={[styles.gatewayChipText, active ? styles.gatewayChipTextActive : undefined]}>
                    {gateway.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TextField
            label="Nome"
            value={buttonForm.name}
            onChangeText={(value) => setButtonForm((current) => ({ ...current, name: value }))}
            placeholder="Botao do quarto"
          />
          <TextField
            label="External ID"
            value={buttonForm.externalId}
            onChangeText={(value) => setButtonForm((current) => ({ ...current, externalId: value }))}
            placeholder="btn-quarto"
            editable={!editingButton}
          />
          <TextField
            label="Local"
            value={buttonForm.locationLabel}
            onChangeText={(value) => setButtonForm((current) => ({ ...current, locationLabel: value }))}
            placeholder="Quarto"
          />

          <PrimaryButton label="Salvar botao" loading={savingButton} onPress={() => void handleSaveButton()} />
        </View>
      </ActionSheetModal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    gap: theme.spacing.xs
  },
  title: {
    fontFamily: theme.typography.display,
    fontSize: 22,
    color: theme.colors.primaryDark
  },
  description: {
    fontFamily: theme.typography.body,
    color: theme.colors.textMuted
  },
  deviceCard: {
    gap: theme.spacing.md
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md
  },
  flex: {
    flex: 1
  },
  deviceName: {
    fontFamily: theme.typography.display,
    fontSize: 22,
    color: theme.colors.primaryDark
  },
  deviceMeta: {
    marginTop: 4,
    fontFamily: theme.typography.body,
    color: theme.colors.textMuted
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flexWrap: 'wrap'
  },
  formBlock: {
    gap: theme.spacing.md
  },
  fieldLabel: {
    fontFamily: theme.typography.heading,
    color: theme.colors.text
  },
  gatewayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  gatewayChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.white
  },
  gatewayChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}10`
  },
  gatewayChipText: {
    fontFamily: theme.typography.heading,
    color: theme.colors.textMuted
  },
  gatewayChipTextActive: {
    color: theme.colors.primaryDark
  }
});
