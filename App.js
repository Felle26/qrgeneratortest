import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import ResultScreen from './screens/ResultScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator>
        <Stack.Screen name="Start" component={HomeScreen} options={{ title: 'QR Code Generator' }} />
        <Stack.Screen name="Ergebnis" component={ResultScreen} options={{ title: 'QR Code Ergebnis' }} />
        <Stack.Screen name="Einstellungen" component={SettingsScreen} options={{ title: 'Einstellungen' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
