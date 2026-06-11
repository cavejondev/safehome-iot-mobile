/**
 * Contexto que carrega e persiste a residencia atualmente selecionada.
 */
import { createContext, useEffect, useState, type PropsWithChildren } from 'react';
import { useQuery } from '@tanstack/react-query';

import { listHouseholds } from '../api/households.api';
import { appConfig } from '../config/env';
import { useAuth } from '../hooks/useAuth';
import { loadSelectedHouseholdId, saveSelectedHouseholdId } from '../services/auth.storage';
import type { HouseholdSummary } from '../types/api';

interface HouseholdContextValue {
  households: HouseholdSummary[];
  selectedHouseholdId: string | null;
  selectedHousehold: HouseholdSummary | null;
  isLoading: boolean;
  hasHouseholds: boolean;
  selectHousehold: (householdId: string) => Promise<void>;
  refetchHouseholds: () => Promise<void>;
}

export const HouseholdContext = createContext<HouseholdContextValue | null>(null);

export function HouseholdProvider({ children }: PropsWithChildren) {
  const { token, isAuthenticated } = useAuth();
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string | null>(null);
  const [selectionLoaded, setSelectionLoaded] = useState(false);

  const householdsQuery = useQuery({
    queryKey: ['households', token],
    queryFn: async () => listHouseholds(token!),
    enabled: Boolean(token),
    staleTime: appConfig.queryStaleTimeMs
  });

  useEffect(() => {
    async function hydrateSelection(): Promise<void> {
      if (!isAuthenticated) {
        setSelectedHouseholdId(null);
        setSelectionLoaded(true);
        return;
      }

      const storedHouseholdId = await loadSelectedHouseholdId();
      setSelectedHouseholdId(storedHouseholdId);
      setSelectionLoaded(true);
    }

    void hydrateSelection();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!selectionLoaded) {
      return;
    }

    const households = householdsQuery.data ?? [];

    if (households.length === 0) {
      setSelectedHouseholdId(null);
      return;
    }

    const hasSelectedHousehold = households.some((item) => item.id === selectedHouseholdId);

    if (hasSelectedHousehold) {
      return;
    }

    const fallbackHousehold = households[0];

    setSelectedHouseholdId(fallbackHousehold.id);
    void saveSelectedHouseholdId(fallbackHousehold.id);
  }, [householdsQuery.data, selectedHouseholdId, selectionLoaded]);

  async function selectHousehold(householdId: string): Promise<void> {
    setSelectedHouseholdId(householdId);
    await saveSelectedHouseholdId(householdId);
  }

  async function refetchHouseholds(): Promise<void> {
    await householdsQuery.refetch();
  }

  const households = householdsQuery.data ?? [];
  const selectedHousehold =
    households.find((household) => household.id === selectedHouseholdId) ?? null;

  return (
    <HouseholdContext.Provider
      value={{
        households,
        selectedHouseholdId,
        selectedHousehold,
        isLoading: householdsQuery.isLoading || !selectionLoaded,
        hasHouseholds: households.length > 0,
        selectHousehold,
        refetchHouseholds
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
}
