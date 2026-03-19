import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import styles from '../styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64';
import SHA256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64';


const TSE_STORAGE_KEY = 'tse_value'; // 20-digit base number for TSE; in real app, this should be securely generated and stored



function GeneratedResultView({ value, timestamp, endTimestamp, tseValue }) {
  return (
    <View style={styles.generatedFieldView}>
      <Text style={styles.generatedFieldTitle}>Hier ist dein QR-Code, </Text>
      <Text style={styles.generatedFieldTitle}>bitte Scanne ihn jetzt</Text>
      <Text style={styles.generatedValue}>Belegwert: {value} EUR</Text>
    </View>
  );
}

export default function ResultScreen({ route, navigation }) {
  const [tseValue, setTseValue] = useState('');
  const tseBaseNumber = "a845e9a0317f"; // 12-digit base number for TSE; in real app, this should be securely generated and stored
  const generatedValue = route?.params?.generatedValue ?? '0';
  const timestamp = route?.params?.timestamp;
  const endTimestamp = route?.params?.endTimestamp;
  const hash = `${generatedValue}${timestamp}${endTimestamp}${tseValue}`;
  const hashkey = SHA256(hash).toString(Base64);

  useEffect(() => {
    const loadTse = async () => {
      try {
        const stored = await AsyncStorage.getItem(TSE_STORAGE_KEY);
        setTseValue(stored ?? '');
      } catch (error) {
        console.warn('Failed to load TSE value', error);
      }
    };

    loadTse();
  }, []);

  // encode value, start and end timestamps in QR code; use simple pipe-delimited string
  const qrPayload = `V0;${tseBaseNumber};Kassenbeleg-V1;Beleg^0.00_${generatedValue}_0.00_0.00_0.00^${generatedValue}:Bar;${generatedValue};${timestamp};${endTimestamp}
  ;ecdsa-plain-SHA256;unixTime;${tseValue};${hashkey}`;

  function encodeToBase64(str) {
    return base64.encode(str);
  }

  // debug log in case QR code disappears again
  console.warn('QR payload:', qrPayload);
  console.info('TSE value:', tseValue);
  console.info('Hash key:', hashkey);

  return (
    <View style={styles.resultContainer}>
      <GeneratedResultView value={generatedValue.toString()} timestamp={timestamp?.toString()} endTimestamp={endTimestamp?.toString()} tseValue={tseValue} />
      <QRCode value={encodeToBase64(qrPayload)} size={400} />

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
