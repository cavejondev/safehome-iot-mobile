/**
 * Layout das telas publicas de login e cadastro.
 */
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

import { theme } from '../../config/theme';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <LinearGradient colors={[theme.colors.primaryDark, theme.colors.primary]} style={styles.top}>
        <Text style={styles.brand}>SafeHome</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>{children}</View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  flex: {
    flex: 1
  },
  top: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.sm
  },
  brand: {
    fontFamily: theme.typography.heading,
    fontSize: 15,
    color: theme.colors.accentSoft,
    textTransform: 'uppercase',
    letterSpacing: 1.5
  },
  title: {
    fontFamily: theme.typography.display,
    fontSize: 34,
    color: theme.colors.white
  },
  subtitle: {
    fontFamily: theme.typography.body,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.86)'
  },
  scroll: {
    flex: 1,
    marginTop: -theme.spacing.xl
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.md
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md
  },
  footer: {
    alignItems: 'center'
  }
});
