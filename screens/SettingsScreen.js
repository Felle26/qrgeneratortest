import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import styles from '../styles';

const TSE_STORAGE_KEY = 'tse_value';

export default function SettingsScreen() {
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
  }, [loadTseValue]);

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
        <Text style={styles.settingsDescription}>Einstellungen für TSE & andere Optionen</Text>

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

        {status ? <Text style={styles.settingsStatus}>{status}</Text> : null}
      </View>
    </View>
  );
}
