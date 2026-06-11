/**
 * Estado visual simples de carregamento.
 */
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../config/theme';

interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = 'Carregando informacoes...' }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xxl,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.background
  },
  label: {
    fontFamily: theme.typography.body,
    color: theme.colors.textMuted
  }
});
