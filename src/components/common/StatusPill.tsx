/**
 * Exibe status de dispositivos e severidade de alertas.
 */
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../config/theme';

interface StatusPillProps {
  label: string;
  color: string;
}

export function StatusPill({ label, color }: StatusPillProps) {
  return (
    <View style={[styles.wrapper, { backgroundColor: `${color}1A` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: theme.radii.pill
  },
  label: {
    fontFamily: theme.typography.heading,
    fontSize: 12
  }
});
