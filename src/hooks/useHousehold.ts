/**
 * Hook auxiliar para acessar a residencia selecionada.
 */
import { useContext } from 'react';

import { HouseholdContext } from '../contexts/HouseholdContext';

export function useHousehold() {
  const context = useContext(HouseholdContext);

  if (!context) {
    throw new Error('useHousehold deve ser usado dentro de HouseholdProvider.');
  }

  return context;
}