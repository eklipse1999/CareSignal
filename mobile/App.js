import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return <AuthProvider><StatusBar style="light" backgroundColor="#102A43" /><RootNavigator /></AuthProvider>;
}
