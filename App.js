import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import QRCode from 'react-native-qrcode-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  const generateQRCode = () => {
    const generatedValue = value || '0';
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  clockBadge: {
    position: 'absolute',
    top: 50,
    right: 50,
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  settingsButton: {
    position: 'absolute',
    top: 110,
    right: 50,
    zIndex: 2,
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  settingsButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#101828',
  },
  clockText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
    color: '#101828',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 18,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 360,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d0d5dd',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 18,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    textAlign: 'right',
  },
  currency: {
    fontSize: 18,
    fontWeight: '600',
    color: '#344054',
    paddingRight: 14,
  },
  grid: {
    width: '100%',
    maxWidth: 360,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  button: {
    width: '30%',
    minWidth: 90,
    backgroundColor: '#101828',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    overflow: 'hidden',
  },
  buttonText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
  },
  buttonDeleteLast: {
    backgroundColor: '#475467',
  },
  buttonDeleteLastText: {
    fontSize: 22,
  },
  generateButton: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#09b14a',
    borderRadius: 10,
    paddingVertical: 50,
    paddingHorizontal: 30,
    alignItems: 'center',
    overflow: 'hidden',
  },
  clearButton: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#c1121f',
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginTop: 20,
    overflow: 'hidden',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '600',
  },
  generatedFieldView: {
    width: '100%',
    maxWidth: 360,
    marginTop: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#09b14a',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  generatedFieldTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#067647',
    marginBottom: 8,
  },
  generatedLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#067647',
    marginBottom: 6,
  },
  generatedValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#101828',
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#101828',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 16,
    overflow: 'hidden',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  settingsCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#101828',
    marginBottom: 8,
  },
  settingsDescription: {
    fontSize: 15,
    color: '#475467',
    marginBottom: 14,
  },
  settingsLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#344054',
    marginBottom: 6,
  },
  settingsInput: {
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#101828',
    marginBottom: 12,
  },
  settingsSaveButton: {
    backgroundColor: '#101828',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    overflow: 'hidden',
  },
  settingsSaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  settingsStatus: {
    marginTop: 10,
    fontSize: 13,
    color: '#475467',
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 12,
    elevation: 8,
    ...Platform.select({
      web: {
        boxShadow:
          '0 0 16px rgba(255,255,255,0.55), inset 0 0 12px rgba(255,255,255,0.22)',
      },
      default: {},
    }),
  },
  buttonInnerGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
});
