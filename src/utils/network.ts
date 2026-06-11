/**
 * Resolve o endereco da API de forma amigavel para Expo Go, emuladores e simuladores.
 * Se EXPO_PUBLIC_API_BASE_URL estiver definido, ele sempre vence.
 */
import Constants from 'expo-constants';
import { NativeModules, Platform } from 'react-native';

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}

function extractDevHost(): string | null {
  const expoHostUri =
    Constants.expoConfig?.hostUri ??
    (
      Constants as typeof Constants & {
        manifest2?: {
          extra?: {
            expoClient?: {
              hostUri?: string;
            };
          };
        };
      }
    ).manifest2?.extra?.expoClient?.hostUri;

  if (expoHostUri) {
    return expoHostUri.split(':')[0] ?? null;
  }

  const scriptUrl = NativeModules.SourceCode?.scriptURL as string | undefined;

  if (!scriptUrl) {
    return null;
  }

  const withoutProtocol = scriptUrl.split('://')[1];

  return withoutProtocol?.split(':')[0] ?? null;
}

export function resolveApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (envUrl) {
    return normalizeBaseUrl(envUrl);
  }

  const devHost = extractDevHost();

  if (devHost) {
    return `http://${devHost}:3333/api/v1`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3333/api/v1';
  }

  return 'http://localhost:3333/api/v1';
}
