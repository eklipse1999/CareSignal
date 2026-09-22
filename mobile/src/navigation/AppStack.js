import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import SymptomCheckerScreen from '../screens/SymptomCheckerScreen';
import SymptomResultScreen from '../screens/SymptomResultScreen';
import DiabetesRiskScreen from '../screens/DiabetesRiskScreen';
import HeartRiskScreen from '../screens/HeartRiskScreen';
import RiskResultScreen from '../screens/RiskResultScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.mist }
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="SymptomChecker" component={SymptomCheckerScreen} />
      <Stack.Screen name="SymptomResult" component={SymptomResultScreen} />
      <Stack.Screen name="DiabetesRisk" component={DiabetesRiskScreen} />
      <Stack.Screen name="HeartRisk" component={HeartRiskScreen} />
      <Stack.Screen name="RiskResult" component={RiskResultScreen} />
    </Stack.Navigator>
  );
}
