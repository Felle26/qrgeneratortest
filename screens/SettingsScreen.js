import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import styles from '../styles';

const TSE_STORAGE_KEY = 'tse_value';
const TSE_BASE_NUMBER_STORAGE_KEY = 'tse_base_number';
const BON_COUNT_STORAGE_KEY = 'bon_count';
const GLOBAL_TOTAL_STORAGE_KEY = 'global_total_value';
const LAST_GENERATED_STORAGE_KEY = 'last_generated_value';
const TSE_SIGNATURE_STORAGE_KEY = 'tse_signature';
const DEFAULT_TSE_BASE_NUMBER = 'a845e9a0317f';

export default function SettingsScreen() {
  const [tseValue, setTseValue] = useState('');
  const [tseBaseNumber, setTseBaseNumber] = useState(DEFAULT_TSE_BASE_NUMBER);
  const [globalTotal, setGlobalTotal] = useState('0.00');
  const [status, setStatus] = useState('');

  const loadSettingsValues = useCallback(async () => {
    try {
      const [storedTseValue, storedTseBaseNumber, storedGlobalTotal] = await AsyncStorage.multiGet([
        TSE_STORAGE_KEY,
        TSE_BASE_NUMBER_STORAGE_KEY,
        GLOBAL_TOTAL_STORAGE_KEY,
      ]);
      setTseValue(storedTseValue?.[1] ?? '');
      setTseBaseNumber(storedTseBaseNumber?.[1] ?? DEFAULT_TSE_BASE_NUMBER);
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
      await AsyncStorage.multiSet([
        [TSE_STORAGE_KEY, tseValue.trim()],
        [TSE_BASE_NUMBER_STORAGE_KEY, tseBaseNumber.trim() || DEFAULT_TSE_BASE_NUMBER],
      ]);
      setStatus('TSE und TSE Base Number gespeichert.');
    } catch (error) {
      setStatus('Fehler beim Speichern der Einstellungen.');
    }
  };

  const resetBonCount = async () => {
    try {
      await AsyncStorage.multiSet([
        [BON_COUNT_STORAGE_KEY, '0'],
        [GLOBAL_TOTAL_STORAGE_KEY, '0.00'],
        [LAST_GENERATED_STORAGE_KEY, '0.00'],
        [TSE_SIGNATURE_STORAGE_KEY, ''],
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

        <Text style={styles.settingsLabel}>TSE Base Number</Text>
        <TextInput
          style={styles.settingsInput}
          value={tseBaseNumber}
          onChangeText={setTseBaseNumber}
          placeholder={DEFAULT_TSE_BASE_NUMBER}
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
