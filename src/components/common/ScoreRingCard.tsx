import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '../../config/theme';

interface ScoreRingCardProps {
  score: number;
  label: string;
  helper: string;
}

export function ScoreRingCard({ score, label, helper }: ScoreRingCardProps) {
  return (
    <LinearGradient
      colors={[theme.colors.primaryDark, theme.colors.primary, '#1F7282']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.ring}>
        <View style={styles.innerRing}>
          <Text style={styles.score}>{score}</Text>
          <Text style={styles.scoreLabel}>/100</Text>
        </View>
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.helper}>{helper}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)'
  },
  ring: {
    width: 120,
    height: 120,
    borderRadius: theme.radii.pill,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 8,
    borderColor: 'rgba(255,255,255,0.18)'
  },
  innerRing: {
    width: 84,
    height: 84,
    borderRadius: theme.radii.pill,
    backgroundColor: 'rgba(255,255,255,0.96)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  score: {
    fontFamily: theme.typography.display,
    fontSize: 30,
    color: theme.colors.primaryDark
  },
  scoreLabel: {
    marginTop: -4,
    fontFamily: theme.typography.body,
    fontSize: 11,
    color: theme.colors.textMuted
  },
  textBlock: {
    gap: 6
  },
  label: {
    fontFamily: theme.typography.display,
    fontSize: 24,
    color: theme.colors.white,
    textAlign: 'center'
  },
  helper: {
    fontFamily: theme.typography.body,
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center'
  }
});
