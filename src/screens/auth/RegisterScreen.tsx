/**
 * Tela de cadastro do familiar responsavel.
 */
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text } from 'react-native';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ApiError } from '../../api/client';
import { AuthShell } from '../../components/common/AuthShell';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { TextField } from '../../components/common/TextField';
import { theme } from '../../config/theme';
import { useAuth } from '../../hooks/useAuth';

const registerSchema = z
  .object({
    fullName: z.string().min(3, 'Informe o nome completo.'),
    email: z.email('Informe um e-mail valido.'),
    phone: z.string().min(8, 'Informe um telefone valido.').optional().or(z.literal('')),
    password: z.string().min(8, 'A senha precisa ter ao menos 8 caracteres.'),
    confirmPassword: z.string().min(8, 'Confirme sua senha.')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas precisam ser iguais.',
    path: ['confirmPassword']
  });

type RegisterForm = z.infer<typeof registerSchema>;

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export function RegisterScreen({
  navigation
}: NativeStackScreenProps<AuthStackParamList, 'Register'>) {
  const { signUp } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    }
  });

  async function onSubmit(values: RegisterForm): Promise<void> {
    try {
      setApiError(null);
      await signUp({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone || undefined,
        password: values.password
      });
    } catch (error) {
      setApiError(error instanceof ApiError ? error.message : 'Nao foi possivel criar a conta.');
    }
  }

  return (
    <AuthShell
      title="Crie o acesso do familiar."
      subtitle="Depois do cadastro voce ja consegue configurar a residencia e conectar a central SafeHome."
      footer={
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.footerLink}>Ja tenho conta, voltar para o login</Text>
        </Pressable>
      }
    >
      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Nome completo"
            placeholder="Ex.: Maria de Souza"
            value={value}
            onChangeText={onChange}
            error={errors.fullName?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextField
            label="E-mail"
            placeholder="maria@email.com"
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
        name="phone"
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Telefone"
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
            value={value}
            onChangeText={onChange}
            error={errors.phone?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Senha"
            placeholder="Crie uma senha forte"
            secureTextEntry
            value={value}
            onChangeText={onChange}
            error={errors.password?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, value } }) => (
          <TextField
            label="Confirmar senha"
            placeholder="Repita a senha"
            secureTextEntry
            value={value}
            onChangeText={onChange}
            error={errors.confirmPassword?.message}
          />
        )}
      />

      {apiError ? <Text style={styles.error}>{apiError}</Text> : null}

      <PrimaryButton label="Criar conta e continuar" loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  error: {
    fontFamily: theme.typography.body,
    color: theme.colors.danger
  },
  footerLink: {
    fontFamily: theme.typography.heading,
    color: theme.colors.primary
  }
});
