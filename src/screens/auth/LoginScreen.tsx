/**
 * Tela de login com credenciais reais da API SafeHome.
 */
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthShell } from '../../components/common/AuthShell';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { TextField } from '../../components/common/TextField';
import { appConfig } from '../../config/env';
import { theme } from '../../config/theme';
import { useAuth } from '../../hooks/useAuth';
import { ApiError } from '../../api/client';

const loginSchema = z.object({
  email: z.email('Informe um e-mail valido.'),
  password: z.string().min(8, 'A senha precisa ter ao menos 8 caracteres.')
});

type LoginForm = z.infer<typeof loginSchema>;

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export function LoginScreen({
  navigation
}: NativeStackScreenProps<AuthStackParamList, 'Login'>) {
  const { signIn } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'demo@safehome.local',
      password: 'SafeHome@123'
    }
  });

  async function onSubmit(values: LoginForm): Promise<void> {
    try {
      setApiError(null);
      await signIn(values);
    } catch (error) {
      setApiError(error instanceof ApiError ? error.message : 'Nao foi possivel entrar no app.');
    }
  }

  return (
    <AuthShell
      title="Monitoramento acolhedor, em tempo real."
      subtitle="Acompanhe atividade, receba alertas e cuide da rotina da residencia com mais seguranca."
      footer={
        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text style={styles.footerLink}>Criar conta de familiar responsavel</Text>
        </Pressable>
      }
    >
      <View style={styles.demoCard}>
        <Text style={styles.demoTitle}>Conta demo para apresentacao</Text>
        <Text style={styles.demoText}>E-mail: demo@safehome.local</Text>
        <Text style={styles.demoText}>Senha: SafeHome@123</Text>
      </View>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextField
            label="E-mail"
            placeholder="responsavel@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Senha"
            placeholder="Sua senha segura"
            secureTextEntry
            value={value}
            onChangeText={onChange}
            error={errors.password?.message}
          />
        )}
      />

      {apiError ? <Text style={styles.error}>{apiError}</Text> : null}

      <PrimaryButton label="Entrar no painel SafeHome" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />

      <Text style={styles.helper}>API detectada em: {appConfig.apiBaseUrl}</Text>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  demoCard: {
    backgroundColor: theme.colors.surfaceStrong,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4
  },
  demoTitle: {
    fontFamily: theme.typography.heading,
    color: theme.colors.primaryDark,
    fontSize: 14
  },
  demoText: {
    fontFamily: theme.typography.body,
    color: theme.colors.textMuted
  },
  error: {
    fontFamily: theme.typography.body,
    color: theme.colors.danger
  },
  helper: {
    fontFamily: theme.typography.body,
    color: theme.colors.textMuted,
    fontSize: 12
  },
  footerLink: {
    fontFamily: theme.typography.heading,
    color: theme.colors.primary
  }
});
