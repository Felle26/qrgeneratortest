import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import styles from '../styles';

const TSE_STORAGE_KEY = 'tse_value';
const BON_COUNT_STORAGE_KEY = 'bon_count';
const GLOBAL_TOTAL_STORAGE_KEY = 'global_total_value';
const LAST_GENERATED_STORAGE_KEY = 'last_generated_value';

export default function SettingsScreen() {
  const [tseValue, setTseValue] = useState('');
  const [globalTotal, setGlobalTotal] = useState('0.00');
  const [status, setStatus] = useState('');

  const loadSettingsValues = useCallback(async () => {
    try {
      const [storedTseValue, storedGlobalTotal] = await AsyncStorage.multiGet([
        TSE_STORAGE_KEY,
        GLOBAL_TOTAL_STORAGE_KEY,
      ]);
      setTseValue(storedTseValue?.[1] ?? '');
      setGlobalTotal(storedGlobalTotal?.[1] ?? '0.00');
    } catch (error) {
      setStatus('Fehler beim Laden der Einstellungen.');
    }
  }, []);

  useEffect(() => {
    loadSettingsValues();
  }, [loadSettingsValues]);

  useFocusEffect(
    useCallback(() => {
      loadSettingsValues();
    }, [loadSettingsValues])
  );

  const saveTseValue = async () => {
    try {
      await AsyncStorage.setItem(TSE_STORAGE_KEY, tseValue.trim());
      setStatus('TSE sicher gespeichert.');
    } catch (error) {
      setStatus('Fehler beim Speichern der TSE.');
    }
  };

  const resetBonCount = async () => {
    try {
      await AsyncStorage.multiSet([
        [BON_COUNT_STORAGE_KEY, '0'],
        [GLOBAL_TOTAL_STORAGE_KEY, '0.00'],
        [LAST_GENERATED_STORAGE_KEY, '0.00'],
      ]);
      setGlobalTotal('0.00');
      setStatus('Bon Count und globaler Wert wurden zurückgesetzt.');
    } catch (error) {
      setStatus('Fehler beim Zurücksetzen der Werte.');
    }
  };

  return (
    <View style={styles.resultContainer}>
      <View style={styles.settingsCard}>
        <Text style={styles.settingsTitle}>Einstellungen</Text>
        <Text style={styles.settingsDescription}>Einstellungen für TSE & andere Optionen</Text>
        <Text style={styles.settingsLabel}>Globaler Wert</Text>
        <Text style={styles.settingsDescription}>{globalTotal} EUR</Text>

        <Text style={styles.settingsLabel}>TSE</Text>
        <TextInput
          style={styles.settingsInput}
          value={tseValue}
          onChangeText={setTseValue}
          placeholder={tseValue || 'TSE eingeben'}
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

        <Pressable
          style={({ pressed }) => [styles.settingsResetButton, pressed && styles.buttonPressed]}
          onPress={resetBonCount}
        >
          {({ pressed }) => (
            <>
              <Text style={styles.settingsResetButtonText}>Bon Count + Globalwert zurücksetzen</Text>
              {pressed ? <View pointerEvents="none" style={styles.buttonInnerGlow} /> : null}
            </>
          )}
        </Pressable>

        {status ? <Text style={styles.settingsStatus}>{status}</Text> : null}
      </View>
    </View>
  );
}
