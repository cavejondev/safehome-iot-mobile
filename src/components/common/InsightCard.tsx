import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../config/theme';

type InsightTone = 'good' | 'warning' | 'critical' | 'neutral';

interface InsightCardProps {
  title: string;
  description: string;
  tone?: InsightTone;
}

const toneStyles: Record<InsightTone, { backgroundColor: string; borderColor: string; accent: string }> = {
  good: {
    backgroundColor: '#EEF7F4',
    borderColor: '#C5E3D6',
    accent: theme.colors.success
  },
  warning: {
    backgroundColor: '#FFF5E8',
    borderColor: '#F4D6AA',
    accent: theme.colors.warning
  },
  critical: {
    backgroundColor: '#FFF0EC',
    borderColor: '#F2C0B8',
    accent: theme.colors.danger
  },
  neutral: {
    backgroundColor: '#F4F6F7',
    borderColor: '#D7E0E3',
    accent: theme.colors.primary
  }
};

export function InsightCard({ title, description, tone = 'neutral' }: InsightCardProps) {
  const palette = toneStyles[tone];

  return (
    <View style={[styles.card, { backgroundColor: palette.backgroundColor, borderColor: palette.borderColor }]}>
      <View style={[styles.accent, { backgroundColor: palette.accent }]} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    padding: theme.spacing.md
  },
  accent: {
    width: 10,
    borderRadius: theme.radii.pill
  },
  content: {
    flex: 1,
    gap: 6
  },
  title: {
    fontFamily: theme.typography.heading,
    fontSize: 15,
    color: theme.colors.primaryDark
  },
  description: {
    fontFamily: theme.typography.body,
    fontSize: 13,
    lineHeight: 20,
    color: theme.colors.textMuted
  }
});
