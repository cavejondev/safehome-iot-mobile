/**
 * Botao principal reutilizavel do app.
 */
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle
} from 'react-native';

import { theme } from '../../config/theme';

interface PrimaryButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({
  label,
  loading = false,
  variant = 'primary',
  style,
  disabled,
  ...rest
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style
      ]}
      disabled={isDisabled}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? theme.colors.primary : theme.colors.white} />
      ) : (
        <Text style={[styles.label, labelStyles[variant]]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
  },
  label: {
    fontFamily: theme.typography.heading,
    fontSize: 15
  },
  disabled: {
    opacity: 0.65
  },
  pressed: {
    transform: [{ scale: 0.98 }]
  }
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.border
  },
  danger: {
    backgroundColor: theme.colors.danger,
    borderColor: theme.colors.danger
  }
});

const labelStyles = StyleSheet.create({
  primary: {
    color: theme.colors.white
  },
  secondary: {
    color: theme.colors.primaryDark
  },
  ghost: {
    color: theme.colors.primary
  },
  danger: {
    color: theme.colors.white
  }
});
