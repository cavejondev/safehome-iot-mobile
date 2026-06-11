/**
 * Layout padrao das telas autenticadas.
 */
import { ScrollView, StyleSheet, Text, View, type RefreshControlProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

import { theme } from '../../config/theme';

interface AppScreenProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  headerAccessory?: React.ReactNode;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export function AppScreen({
  title,
  subtitle,
  children,
  headerAccessory,
  refreshControl
}: AppScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      <LinearGradient colors={[theme.colors.primaryDark, theme.colors.primary]} style={styles.hero}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          {headerAccessory ? <View style={styles.headerAccessory}>{headerAccessory}</View> : null}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  hero: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.md
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.md
  },
  headerTextBlock: {
    flex: 1,
    gap: theme.spacing.xs
  },
  headerAccessory: {
    alignItems: 'flex-end'
  },
  title: {
    fontFamily: theme.typography.display,
    fontSize: 28,
    color: theme.colors.white
  },
  subtitle: {
    fontFamily: theme.typography.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.82)'
  },
  scroll: {
    flex: 1,
    marginTop: -theme.spacing.lg
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.md
  }
});
