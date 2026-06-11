/**
 * Cartao numerico compacto para metricas do dashboard.
 */
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../config/theme';

interface StatCardProps {
  eyebrow: string;
  value: string;
  helper: string;
  accentColor?: string;
}

export function StatCard({
  eyebrow,
  value,
  helper,
  accentColor = theme.colors.primary
}: StatCardProps) {
  return (
    <View style={[styles.card, { borderLeftColor: accentColor }]}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.helper}>{helper}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4
  },
  eyebrow: {
    fontFamily: theme.typography.heading,
    fontSize: 12,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
    letterSpacing: 0.5
  },
  value: {
    fontFamily: theme.typography.display,
    fontSize: 24,
    color: theme.colors.text
  },
  helper: {
    fontFamily: theme.typography.body,
    fontSize: 13,
    color: theme.colors.textMuted
  }
});
