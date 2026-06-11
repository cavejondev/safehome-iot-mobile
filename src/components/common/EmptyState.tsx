/**
 * Estado vazio reutilizavel.
 */
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../config/theme';

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radii.lg,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm
  },
  title: {
    fontFamily: theme.typography.heading,
    fontSize: 18,
    color: theme.colors.text
  },
  description: {
    fontFamily: theme.typography.body,
    color: theme.colors.textMuted,
    lineHeight: 20
  }
});
