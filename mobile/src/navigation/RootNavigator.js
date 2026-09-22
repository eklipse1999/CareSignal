import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../theme/colors';

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.mist }}><ActivityIndicator size="large" color={colors.ocean} /></View>;
  return <NavigationContainer>{isAuthenticated ? <AppStack /> : <AuthStack />}</NavigationContainer>;
}
