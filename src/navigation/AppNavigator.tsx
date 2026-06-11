/**
 * Navegacao principal do app.
 */
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CriticalAlertsWatcher } from '../components/common/CriticalAlertsWatcher';
import { LoadingState } from '../components/common/LoadingState';
import { theme } from '../config/theme';
import { useAuth } from '../hooks/useAuth';
import { useHousehold } from '../hooks/useHousehold';
import { AlertsScreen } from '../screens/app/AlertsScreen';
import { AnalyticsShowcaseScreen } from '../screens/app/AnalyticsShowcaseScreen';
import { DashboardScreen } from '../screens/app/DashboardScreen';
import { DevicesScreen } from '../screens/app/DevicesScreen';
import { HouseholdSetupScreen } from '../screens/app/HouseholdSetupScreen';
import { SettingsScreen } from '../screens/app/SettingsScreen';
import { ActivityScreen } from '../screens/app/ActivityScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

const RootStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator();

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.background,
    card: theme.colors.surface,
    primary: theme.colors.primary,
    text: theme.colors.text,
    border: theme.colors.border
  }
};

function AuthStack() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Login" component={LoginScreen} />
      <RootStack.Screen name="Register" component={RegisterScreen} />
    </RootStack.Navigator>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <CriticalAlertsWatcher />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            left: 14,
            right: 14,
            bottom: Math.max(insets.bottom, 12),
            height: 74 + insets.bottom,
            paddingTop: 10,
            paddingBottom: Math.max(insets.bottom, 14),
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            borderTopWidth: 1,
            borderRadius: 26,
            elevation: 10,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 18
          },
          tabBarItemStyle: {
            paddingVertical: 2
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarLabel: ({ color, focused }) => (
            <Text
              style={{
                color,
                fontSize: 11,
                marginBottom: 2,
                fontFamily: focused ? theme.typography.heading : theme.typography.body
              }}
            >
              {route.name}
            </Text>
          ),
          tabBarIcon: ({ color, size, focused }) => {
            const iconByRoute = {
              Inicio: focused ? 'pulse' : 'pulse-outline',
              Analytics: focused ? 'analytics' : 'analytics-outline',
              Alertas: focused ? 'alert-circle' : 'alert-circle-outline',
              Atividade: focused ? 'time' : 'time-outline',
              Dispositivos: focused ? 'hardware-chip' : 'hardware-chip-outline',
              Ajustes: focused ? 'settings' : 'settings-outline'
            } as const;

            return (
              <Ionicons
                name={iconByRoute[route.name as keyof typeof iconByRoute]}
                size={size}
                color={color}
              />
            );
          }
        })}
      >
        <Tab.Screen name="Inicio" component={DashboardScreen} />
        <Tab.Screen name="Analytics" component={AnalyticsShowcaseScreen} />
        <Tab.Screen name="Alertas" component={AlertsScreen} />
        <Tab.Screen name="Atividade" component={ActivityScreen} />
        <Tab.Screen name="Dispositivos" component={DevicesScreen} />
        <Tab.Screen name="Ajustes" component={SettingsScreen} />
      </Tab.Navigator>
    </>
  );
}

export function AppNavigator() {
  const auth = useAuth();
  const household = useHousehold();

  if (auth.isLoading) {
    return <LoadingState label="Recuperando sua sessao..." />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {!auth.isAuthenticated ? (
        <AuthStack />
      ) : household.isLoading ? (
        <LoadingState label="Carregando residencias..." />
      ) : household.hasHouseholds ? (
        <MainTabs />
      ) : (
        <HouseholdSetupScreen />
      )}
    </NavigationContainer>
  );
}
