/**
 * Modal simples em estilo bottom sheet para formularios curtos.
 */
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../config/theme';

interface ActionSheetModalProps {
  visible: boolean;
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function ActionSheetModal({
  visible,
  title,
  subtitle,
  onClose,
  children
}: ActionSheetModalProps) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.content}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radii.lg,
    borderTopRightRadius: theme.radii.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.sm
  },
  handle: {
    alignSelf: 'center',
    width: 52,
    height: 4,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.sm
  },
  title: {
    fontFamily: theme.typography.display,
    color: theme.colors.primaryDark,
    fontSize: 22
  },
  subtitle: {
    fontFamily: theme.typography.body,
    color: theme.colors.textMuted
  },
  content: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.md
  }
});
