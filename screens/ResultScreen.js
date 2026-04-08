import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import styles from '../styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64';
import * as Crypto from 'expo-crypto';

const TSE_STORAGE_KEY = 'tse_value'; // 20-digit base number for TSE; in real app, this should be securely generated and stored
const LAST_GENERATED_STORAGE_KEY = 'last_generated_value';
const TSE_BASE_NUMBER = "a845e9a0317f"; // 12-digit base number for TSE; in real app, this should be securely generated and stored


function GeneratedResultView({ value, enteredValue, globalValue, timestamp, endTimestamp, tseValue, receiptCounter }) {
  return (
    <View style={styles.generatedFieldView}>
      <Text style={styles.generatedFieldTitle}>Hier ist dein QR-Code, </Text>
      <Text style={styles.generatedFieldTitle}>bitte Scanne ihn jetzt</Text>
      {enteredValue ? <Text style={styles.generatedValue}>Eingegeben: {enteredValue} EUR</Text> : null}
    </View>
  );
} 

export default function ResultScreen({ route, navigation }) {
  const [tseValue, setTseValue] = useState('');
  const [persistentGeneratedValue, setPersistentGeneratedValue] = useState('0.00');
  const [hashkey, setHashkey] = useState('');
  const tseBaseNumber = TSE_BASE_NUMBER; // 12-digit base number for TSE; in real app, this should be securely generated and stored
  const generatedValue = route?.params?.generatedValue ?? persistentGeneratedValue;
  const enteredValue = route?.params?.enteredValue;
  const globalValue = route?.params?.globalValue ?? persistentGeneratedValue;
  const timestamp = route?.params?.timestamp;
  const endTimestamp = route?.params?.endTimestamp;
  const receiptCounter = route?.params?.receiptCounter ?? '1';

  useEffect(() => {
    const computeHashKey = async () => {
      // Hash sollte alle entscheidenden RKSV-Felder enthalten, inklusive Bonzähler
      const hash = `${generatedValue}|${timestamp}|${endTimestamp}|${receiptCounter}|${tseValue}`;
      try {
        const digest = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          hash,
          { encoding: Crypto.CryptoEncoding.BASE64 }
        );
        setHashkey(digest);
      } catch (error) {
        console.warn('Failed to compute hash key', error);
        setHashkey('');
      }
    };

    computeHashKey();
  }, [generatedValue, timestamp, receiptCounter, tseValue]);

  useEffect(() => {
    const loadValues = async () => {
      try {
        const [storedTse, storedGenerated] = await AsyncStorage.multiGet([
          TSE_STORAGE_KEY,
          LAST_GENERATED_STORAGE_KEY,
        ]);
        setTseValue(storedTse?.[1] ?? '');
        setPersistentGeneratedValue(storedGenerated?.[1] ?? '0.00');
      } catch (error) {
        console.warn('Failed to load persisted values', error);
      }
    };

    loadValues();
  }, []);

  const qrPayload = [
    "V0", // QR Code Version
    tseBaseNumber, // TSE Basisnummer (12-stellig)
    "Kassenbeleg-V1", // Belegtyp
    `Beleg^0.00_${enteredValue}_0.00_0.00_0.00^${enteredValue}:Bar`, // Beleginhalt mit Betrag und Zahlungsart
    globalValue, // Globaler Wert
    receiptCounter, // Bonzähler
    timestamp, // Startzeit
    endTimestamp, // Endzeit
    "ecdsa-plain-SHA256", // Signaturverfahren
    "unixTime", // Zeitformat
    tseValue, // TSE Wert
    hashkey, // Hash über alle relevanten Felder
  ].join(";");

  function encodeToBase64(str) {
    return base64.encode(str);
  }

  // debug log in case QR code disappears again
  console.warn('QR payload:', qrPayload);
  console.info('TSE value:', tseValue);
  console.info('Hash key:', hashkey);

  return (
    <View style={styles.resultContainer}>
      <GeneratedResultView
        value={generatedValue.toString()}
        enteredValue={enteredValue?.toString()}
        globalValue={globalValue?.toString()}
        timestamp={timestamp?.toString()}
        endTimestamp={endTimestamp?.toString()}
        tseValue={tseValue}
        receiptCounter={receiptCounter}
      />
      <QRCode value={qrPayload} size={400} />

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
