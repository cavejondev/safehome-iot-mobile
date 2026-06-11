/**
 * Bootstrap principal do app mobile SafeHome.
 */
import 'react-native-gesture-handler';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Manrope_500Medium, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LoadingState } from './src/components/common/LoadingState';
import { AuthProvider } from './src/contexts/AuthContext';
import { HouseholdProvider } from './src/contexts/HouseholdContext';
import { AppNavigator } from './src/navigation/AppNavigator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnReconnect: true
    }
  }
});

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_500Medium,
    Manrope_700Bold,
    SpaceGrotesk_700Bold
  });

  if (!fontsLoaded) {
    return <LoadingState label="Preparando experiencia SafeHome..." />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <AuthProvider>
            <HouseholdProvider>
              <AppNavigator />
            </HouseholdProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
