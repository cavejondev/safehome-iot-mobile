/**
 * Permite alternar rapidamente entre residencias no topo das telas.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../../config/theme';
import { planLabel } from '../../utils/format';
import { useHousehold } from '../../hooks/useHousehold';

export function HouseholdSelector() {
  const { households, selectedHouseholdId, selectHousehold } = useHousehold();

  if (households.length <= 1) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      {households.map((household) => {
        const active = household.id === selectedHouseholdId;

        return (
          <Pressable
            key={household.id}
            style={[styles.item, active ? styles.itemActive : undefined]}
            onPress={() => {
              void selectHousehold(household.id);
            }}
          >
            <Text style={[styles.name, active ? styles.nameActive : undefined]} numberOfLines={1}>
              {household.name}
            </Text>
            <Text
              style={[styles.helper, active ? styles.helperActive : undefined]}
              numberOfLines={1}
            >
              {planLabel(household.plan)}
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
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  item: {
    minWidth: 116,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  itemActive: {
    backgroundColor: theme.colors.white
  },
  name: {
    fontFamily: theme.typography.heading,
    fontSize: 13,
    color: theme.colors.white
  },
  nameActive: {
    color: theme.colors.primaryDark
  },
  helper: {
    fontFamily: theme.typography.body,
    fontSize: 11,
    color: 'rgba(255,255,255,0.74)'
  },
  helperActive: {
    color: theme.colors.textMuted
  }
});
