import { StyleSheet, Text, View } from 'react-native';

import { theme } from '../../config/theme';
import type { ActivityPoint } from '../../utils/insights';

interface MiniBarChartProps {
  title: string;
  subtitle: string;
  data: ActivityPoint[];
  color?: string;
}

export function MiniBarChart({
  title,
  subtitle,
  data,
  color = theme.colors.primary
}: MiniBarChartProps) {
  const maxValue = Math.max(...data.map((point) => point.value), 1);

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.chartRow}>
        {data.map((point) => {
          const height = Math.max(14, (point.value / maxValue) * 96);

          return (
            <View key={point.label} style={styles.column}>
              <Text style={styles.value}>{point.value}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    {
                      height,
                      backgroundColor: point.emphasis ? theme.colors.accent : color
                    }
                  ]}
                />
              </View>
              <Text style={styles.label}>{point.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing.md
  },
  header: {
    gap: 4
  },
  title: {
    fontFamily: theme.typography.heading,
    fontSize: 15,
    color: theme.colors.primaryDark
  },
  subtitle: {
    fontFamily: theme.typography.body,
    fontSize: 13,
    color: theme.colors.textMuted
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: theme.spacing.sm
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: 6
  },
  value: {
    fontFamily: theme.typography.body,
    fontSize: 11,
    color: theme.colors.textMuted
  },
  barTrack: {
    width: '100%',
    height: 104,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#F2EADF',
    borderRadius: theme.radii.md,
    paddingBottom: 6,
    paddingHorizontal: 5
  },
  bar: {
    width: '100%',
    borderRadius: theme.radii.sm
  },
  label: {
    fontFamily: theme.typography.body,
    fontSize: 11,
    color: theme.colors.text
  }
});
