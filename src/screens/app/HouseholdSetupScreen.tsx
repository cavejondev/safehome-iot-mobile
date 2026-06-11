/**
 * Tela exibida quando o usuario ainda nao cadastrou nenhuma residencia.
 */
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createHousehold } from '../../api/households.api';
import { ApiError } from '../../api/client';
import { AppScreen } from '../../components/common/AppScreen';
import { HouseholdSelector } from '../../components/common/HouseholdSelector';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SectionCard } from '../../components/common/SectionCard';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { TextField } from '../../components/common/TextField';
import { theme } from '../../config/theme';
import { useAuth } from '../../hooks/useAuth';
import { useHousehold } from '../../hooks/useHousehold';
import type { PlanTier } from '../../types/api';

export function HouseholdSetupScreen() {
  const queryClient = useQueryClient();
  const { token, user } = useAuth();
  const { refetchHouseholds, selectHousehold } = useHousehold();
  const [form, setForm] = useState({
    name: 'Casa Principal',
    residentName: '',
    addressLabel: '',
    timezone: 'America/Sao_Paulo'
  });
  const [plan, setPlan] = useState<PlanTier>('CARE');

  const createHouseholdMutation = useMutation({
    mutationFn: async () =>
      createHousehold(token!, {
        ...form,
        addressLabel: form.addressLabel || undefined,
        timezone: form.timezone || undefined,
        plan
      }),
    onSuccess: async (createdHousehold) => {
      await queryClient.invalidateQueries({ queryKey: ['households'] });
      await refetchHouseholds();
      await selectHousehold(createdHousehold.id);
      Alert.alert('Residencia criada', 'O painel SafeHome ja esta pronto para uso.');
    }
  });

  async function handleCreateHousehold(): Promise<void> {
    if (!form.name || !form.residentName) {
      Alert.alert('Campos obrigatorios', 'Preencha ao menos o nome da residencia e do morador.');
      return;
    }

    try {
      await createHouseholdMutation.mutateAsync();
    } catch (error) {
      Alert.alert(
        'Nao foi possivel criar',
        error instanceof ApiError ? error.message : 'Tente novamente em instantes.'
      );
    }
  }

  return (
    <AppScreen
      title="Primeira residencia"
      subtitle={`Vamos preparar a casa monitorada de ${user?.fullName ?? 'sua familia'} em poucos passos.`}
    >
      <HouseholdSelector />

      <SectionCard style={styles.card}>
        <Text style={styles.title}>Dados iniciais da residencia</Text>
        <Text style={styles.description}>
          Este cadastro conecta familiares, sensores, botoes de ajuda e relatorios em um unico ambiente.
        </Text>

        <TextField
          label="Nome da residencia"
          value={form.name}
          onChangeText={(value) => setForm((current) => ({ ...current, name: value }))}
          placeholder="Ex.: Casa Principal"
        />

        <TextField
          label="Nome do morador"
          value={form.residentName}
          onChangeText={(value) => setForm((current) => ({ ...current, residentName: value }))}
          placeholder="Ex.: Dona Helena"
        />

        <TextField
          label="Endereco ou apelido"
          value={form.addressLabel}
          onChangeText={(value) => setForm((current) => ({ ...current, addressLabel: value }))}
          placeholder="Ex.: Rua das Flores, 45"
        />

        <TextField
          label="Timezone"
          value={form.timezone}
          onChangeText={(value) => setForm((current) => ({ ...current, timezone: value }))}
          placeholder="America/Sao_Paulo"
        />

        <View style={styles.planBlock}>
          <Text style={styles.planLabel}>Plano para relatorios</Text>
          <SegmentedControl
            value={plan}
            onChange={setPlan}
            options={[
              { label: 'Free', value: 'FREE' },
              { label: 'Care', value: 'CARE' },
              { label: 'Premium', value: 'PREMIUM' }
            ]}
          />
        </View>

        <PrimaryButton
          label="Criar residencia e abrir painel"
          loading={createHouseholdMutation.isPending}
          onPress={() => {
            void handleCreateHousehold();
          }}
        />
      </SectionCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.md
  },
  title: {
    fontFamily: theme.typography.display,
    color: theme.colors.primaryDark,
    fontSize: 24
  },
  description: {
    fontFamily: theme.typography.body,
    color: theme.colors.textMuted,
    lineHeight: 22
  },
  planBlock: {
    gap: theme.spacing.xs
  },
  planLabel: {
    fontFamily: theme.typography.heading,
    color: theme.colors.text
  }
});
