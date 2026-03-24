import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import styles from '../styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64';
import * as Crypto from 'expo-crypto';

const TSE_STORAGE_KEY = 'tse_value'; // 20-digit base number for TSE; in real app, this should be securely generated and stored
const TSE_BASE_NUMBER = "a845e9a0317f"; // 12-digit base number for TSE; in real app, this should be securely generated and stored


function GeneratedResultView({ value, timestamp, endTimestamp, tseValue, receiptCounter }) {
  return (
    <View style={styles.generatedFieldView}>
      <Text style={styles.generatedFieldTitle}>Hier ist dein QR-Code, </Text>
      <Text style={styles.generatedFieldTitle}>bitte Scanne ihn jetzt</Text>
      <Text style={styles.generatedValue}>Belegwert: {value} EUR</Text>
      <Text style={styles.generatedValue}>Bonzähler: {receiptCounter}</Text>
      {timestamp ? <Text>Start: {timestamp}</Text> : null}
      {endTimestamp ? <Text>Ende: {endTimestamp}</Text> : null}
      {tseValue ? <Text>TSE: {tseValue}</Text> : null}
    </View>
  );
}

export default function ResultScreen({ route, navigation }) {
  const [tseValue, setTseValue] = useState('');
  const [hashkey, setHashkey] = useState('');
  const tseBaseNumber = TSE_BASE_NUMBER; // 12-digit base number for TSE; in real app, this should be securely generated and stored
  const generatedValue = route?.params?.generatedValue ?? '0';
  const timestamp = route?.params?.timestamp;
  const endTimestamp = route?.params?.endTimestamp;
  const receiptCounter = route?.params?.receiptCounter ?? '1'; // RKSV Bon-Counter verwalten

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
  }, [generatedValue, timestamp, endTimestamp, receiptCounter, tseValue]);

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

  // RKSV-Code String nach Sting-/Bonlogik, inklusive Bonzähler
  // Beispiel: V0;<TSE>;Kassenbeleg-V1;<Betrag>;<Startzeit>;<Endzeit>;<BonCounter>;ecdsa-plain-SHA256;unixTime;<TSE-Wert>;<Hash>
  // const qrPayload = `V0;${tseBaseNumber};Kassenbeleg-V1;Beleg^0.00_${generatedValue}_0.00_0.00_0.00^${generatedValue}:Bar;${generatedValue};${timestamp};${endTimestamp};${receiptCounter};ecdsa-plain-SHA256;unixTime;${tseValue};${hashkey}`;
  const qrPayload = [
    tseBaseNumber,
    receiptCounter,
    timestamp,
    `0.00:${generatedValue}_0.00_0.00_0.00`,
    ,
    tseValue,
    hashkey
  ].join("_");

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
