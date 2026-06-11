/**
 * Observa alertas criticos abertos e dispara notificacao local ao detectar novos itens.
 */
import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

import { listAlerts, listEvents } from '../../api/monitoring.api';
import { appConfig } from '../../config/env';
import { useAuth } from '../../hooks/useAuth';
import { useHousehold } from '../../hooks/useHousehold';
import {
  notifyCriticalAlert,
  notifyPresenceDetected,
  prepareNotifications
} from '../../services/notifications.service';

export function CriticalAlertsWatcher(): null {
  const { token } = useAuth();
  const { selectedHouseholdId } = useHousehold();
  const knownAlertIdsRef = useRef<Set<string>>(new Set());
  const knownPresenceEventIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);
  const presenceInitializedRef = useRef(false);

  useEffect(() => {
    void prepareNotifications();
  }, []);

  const alertsQuery = useQuery({
    queryKey: ['alerts-watcher', selectedHouseholdId, token],
    queryFn: async () => listAlerts(token!, selectedHouseholdId!),
    enabled: Boolean(token && selectedHouseholdId),
    refetchInterval: appConfig.alertsPollMs,
    staleTime: appConfig.queryStaleTimeMs
  });

  const eventsQuery = useQuery({
    queryKey: ['events-watcher', selectedHouseholdId, token],
    queryFn: async () => listEvents(token!, selectedHouseholdId!, 10),
    enabled: Boolean(token && selectedHouseholdId),
    refetchInterval: appConfig.dashboardPollMs,
    staleTime: appConfig.queryStaleTimeMs
  });

  useEffect(() => {
    const openCriticalAlerts =
      alertsQuery.data?.filter((alert) => alert.status === 'OPEN' && alert.severity === 'CRITICAL') ?? [];

    if (!initializedRef.current) {
      knownAlertIdsRef.current = new Set(openCriticalAlerts.map((alert) => alert.id));
      initializedRef.current = true;
      return;
    }

    for (const alert of openCriticalAlerts) {
      if (knownAlertIdsRef.current.has(alert.id)) {
        continue;
      }

      knownAlertIdsRef.current.add(alert.id);
      void notifyCriticalAlert(alert.title, alert.description);
    }
  }, [alertsQuery.data]);

  useEffect(() => {
    const presenceEvents = eventsQuery.data?.filter((event) => event.type === 'presence') ?? [];

    if (!presenceInitializedRef.current) {
      knownPresenceEventIdsRef.current = new Set(presenceEvents.map((event) => event.id));
      presenceInitializedRef.current = true;
      return;
    }

    for (const event of presenceEvents) {
      if (knownPresenceEventIdsRef.current.has(event.id)) {
        continue;
      }

      knownPresenceEventIdsRef.current.add(event.id);
      void notifyPresenceDetected(event.deviceName, event.locationLabel);
    }
  }, [eventsQuery.data]);

  return null;
}
