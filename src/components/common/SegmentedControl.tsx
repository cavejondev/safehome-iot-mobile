/**
 * Seletor segmentado simples para filtros e modos de exibicao.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../config/theme';

interface SegmentOption<T extends string> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  options: Array<SegmentOption<T>>;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.wrapper}>
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <Pressable
            key={option.value}
            style={[styles.item, isActive ? styles.itemActive : undefined]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.label, isActive ? styles.labelActive : undefined]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceStrong,
    borderRadius: theme.radii.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  item: {
    flex: 1,
    minHeight: 42,
    borderRadius: theme.radii.pill,
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemActive: {
    backgroundColor: theme.colors.white
  },
  label: {
    fontFamily: theme.typography.heading,
    color: theme.colors.textMuted,
    fontSize: 13
  },
  labelActive: {
    color: theme.colors.primaryDark
  }
});
