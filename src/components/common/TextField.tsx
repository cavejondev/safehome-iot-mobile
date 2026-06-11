/**
 * Campo de texto padronizado com label e mensagem de erro.
 */
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { theme } from '../../config/theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function TextField({ label, error, style, ...rest }: TextFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.input, error ? styles.inputError : undefined, style]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing.xs
  },
  label: {
    fontFamily: theme.typography.heading,
    fontSize: 14,
    color: theme.colors.text
  },
  input: {
    minHeight: 52,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    fontFamily: theme.typography.body,
    color: theme.colors.text
  },
  inputError: {
    borderColor: theme.colors.danger
  },
  error: {
    color: theme.colors.danger,
    fontSize: 12,
    fontFamily: theme.typography.body
  }
});
