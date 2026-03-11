import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import QRCode from 'react-native-qrcode-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './styles/index';

const Stack = createNativeStackNavigator();
const TSE_STORAGE_KEY = 'tse_value';

function GeneratedResultView({ value }) {
  return (
    <View style={styles.generatedFieldView}>
      <Text style={styles.generatedFieldTitle}>Generiertes Ergebnis</Text>
      <Text style={styles.generatedLabel}>Funktion gestartet</Text>
      <Text style={styles.generatedValue}>Wert: {value} EUR</Text>
    </View>
  );
}

function HomeScreen({ navigation }) {
  const [value, setValue] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', 'DEL'];

  const sanitizeValue = (text) => {
    const onlyAllowed = text.replace(/[^0-9.]/g, '');
    const firstDotIndex = onlyAllowed.indexOf('.');

    if (firstDotIndex === -1) {
      return onlyAllowed;
    }

    const beforeDot = onlyAllowed.slice(0, firstDotIndex + 1);
    const afterDot = onlyAllowed
      .slice(firstDotIndex + 1)
      .replace(/\./g, '')
      .slice(0, 2);

    return beforeDot + afterDot;
  };

  const removeLeadingZero = (text) => {
    if (!text) {
      return '';
    }

    if (text.startsWith('0')) {
      return text.replace(/^0+/, '');
    }

    return text;
  };

  const addNumber = (num) => {
    setValue((prev) => {
      if (prev.length === 0 && num === '0') {
        return prev;
      }

      if (num === '.' && prev.includes('.')) {
        return prev;
      }

      if (prev.includes('.')) {
        const decimals = prev.split('.')[1] || '';
        if (decimals.length >= 2 && /\d/.test(num)) {
          return prev;
        }
      }

      return removeLeadingZero(sanitizeValue(prev + num));
    });
  };

  const handleChangeText = (text) => {
    setValue(removeLeadingZero(sanitizeValue(text)));
  };

  const clearInput = () => {
    setValue('');
  };

  const removeLastInput = () => {
    setValue((prev) => prev.slice(0, -1));
  };

  const normalizeGeneratedValue = (rawValue) => {
    if (!rawValue || rawValue === '.') {
      return '0';
    }

    if (!rawValue.includes('.')) {
      return `${rawValue}.00`;
    }

    if (rawValue.endsWith('.')) {
      return `${rawValue}00`;
    }

    const [wholePart, decimalPart] = rawValue.split('.');
    if (wholePart && decimalPart?.length === 1) {
      return `${wholePart}.${decimalPart}0`;
    }

    return rawValue;
  };

  const generateQRCode = () => {
    const generatedValue = normalizeGeneratedValue(value);
    setValue(''); // Nach dem Generieren den Eingabewert zurücksetzen
    navigation.navigate('Ergebnis', { generatedValue });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.settingsButton, pressed && styles.buttonPressed]}
        onPress={() => navigation.navigate('Einstellungen')}
      >
        {({ pressed }) => (
          <>
            <Text style={styles.settingsButtonText}>Einstellungen</Text>
            {pressed ? <View pointerEvents="none" style={styles.buttonInnerGlow} /> : null}
          </>
        )}
      </Pressable>
      <View style={styles.clockBadge}>
        <Text style={styles.clockText}>{formattedTime}</Text>
      </View>
      <Text style={styles.title}>QR Code Generator für Bonus App</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChangeText}
          showSoftInputOnFocus={false}
          caretHidden={true}
          placeholder="Betrag eingeben"
          placeholderTextColor="#888"
        />
        <Text style={styles.currency}>€</Text>
      </View>

      <View style={styles.grid}>
        {numbers.map((num) => (
          <Pressable
            key={num}
            style={({ pressed }) => [
              styles.button,
              num === 'DEL' && styles.buttonDeleteLast,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => (num === 'DEL' ? removeLastInput() : addNumber(num))}
          >
            {({ pressed }) => (
              <>
                <Text style={[styles.buttonText, num === 'DEL' && styles.buttonDeleteLastText]}>{num}</Text>
                {pressed ? <View pointerEvents="none" style={styles.buttonInnerGlow} /> : null}
              </>
            )}
          </Pressable>
        ))}
      </View>
      <Pressable
        style={({ pressed }) => [styles.generateButton, pressed && styles.buttonPressed]}
        onPress={generateQRCode}
      >
        {({ pressed }) => (
          <>
            <Text style={styles.clearButtonText}>QR Code Generieren</Text>
            {pressed ? <View pointerEvents="none" style={styles.buttonInnerGlow} /> : null}
          </>
        )}
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.clearButton, pressed && styles.buttonPressed]}
        onPress={clearInput}
      >
        {({ pressed }) => (
          <>
            <Text style={styles.clearButtonText}>Feld Leeren</Text>
            {pressed ? <View pointerEvents="none" style={styles.buttonInnerGlow} /> : null}
          </>
        )}
      </Pressable>
    </View>
  );
}

function SettingsScreen() {
  const [tseValue, setTseValue] = useState('');
  const [status, setStatus] = useState('');

  const loadTseValue = useCallback(async () => {
    try {
      const storedValue = await AsyncStorage.getItem(TSE_STORAGE_KEY);
      setTseValue(storedValue ?? '');
    } catch (error) {
      setStatus('Fehler beim Laden der TSE.');
    }
  }, []);

  useEffect(() => {
    loadTseValue();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTseValue();
    }, [loadTseValue])
  );

  const saveTseValue = async () => {
    try {
      await AsyncStorage.setItem(TSE_STORAGE_KEY, tseValue.trim());
      setStatus('TSE sicher gespeichert.');
    } catch (error) {
      setStatus('Fehler beim Speichern der TSE.');
    }
  };

  return (
    <View style={styles.resultContainer}>
      <View style={styles.settingsCard}>
        <Text style={styles.settingsTitle}>Einstellungen</Text>
        <Text style={styles.settingsDescription}>Hier kannst du die TSE hinterlegen.</Text>

        <Text style={styles.settingsLabel}>TSE</Text>
        <TextInput
          style={styles.settingsInput}
          value={tseValue}
          onChangeText={setTseValue}
          placeholder="TSE eingeben"
          placeholderTextColor="#98a2b3"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Pressable
          style={({ pressed }) => [styles.settingsSaveButton, pressed && styles.buttonPressed]}
          onPress={saveTseValue}
        >
          {({ pressed }) => (
            <>
              <Text style={styles.settingsSaveButtonText}>Speichern</Text>
              {pressed ? <View pointerEvents="none" style={styles.buttonInnerGlow} /> : null}
            </>
          )}
        </Pressable>

        {status ? <Text style={styles.settingsStatus}>{status}</Text> : null}
      </View>
    </View>
  );
}

function ResultScreen({ route, navigation }) {
  const generatedValue = route?.params?.generatedValue ?? '0';

  return (
    <View style={styles.resultContainer}>
      <GeneratedResultView value={generatedValue} />

      <Pressable
        style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
        onPress={() => navigation.goBack()}
      >
        {({ pressed }) => (
          <>
            <Text style={styles.backButtonText}>Fertig / Neuen Code Generieren</Text>
            {pressed ? <View pointerEvents="none" style={styles.buttonInnerGlow} /> : null}
          </>
        )}
      </Pressable>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator>
        <Stack.Screen name="Start" component={HomeScreen} options={{ title: 'QR Code Generator' }} />
        <Stack.Screen name="Ergebnis" component={ResultScreen} options={{ title: 'Ergebnis' }} />
        <Stack.Screen name="Einstellungen" component={SettingsScreen} options={{ title: 'Einstellungen' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
