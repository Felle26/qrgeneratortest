import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import styles from '../styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const TSE_STORAGE_KEY = 'tse_value'; // 20-digit base number for TSE; in real app, this should be securely generated and stored
const TSE_BASE_NUMBER_STORAGE_KEY = 'tse_base_number';
const LAST_GENERATED_STORAGE_KEY = 'last_generated_value';
const TSE_SIGNATURE_STORAGE_KEY = 'tse_signature';
const DEFAULT_TSE_BASE_NUMBER = 'a845e9a0317f';

function GeneratedResultView({
  value,
  globalValue,
  timestamp,
  endTimestamp,
  tseValue,
  receiptCounter,
  previousSignature,
  currentSignature,
}) {
  return (
    <View style={styles.generatedFieldView}>
      <Text style={styles.generatedFieldTitle}>Hier ist dein QR-Code,</Text>
      <Text style={styles.generatedFieldTitle}>bitte Scanne ihn jetzt</Text>
      {value ? <Text style={styles.generatedValue}>Betrag: {value} EUR</Text> : null}
      <Text style={previousSignature ? styles.signaturePresentText : styles.signatureMissingText}>
        Vorherige Signatur: {previousSignature ? '✓ vorhanden' : '✗ keine (erster Bon)'}
      </Text>
      {previousSignature ? (
        <Text style={styles.signatureValueText} numberOfLines={2} ellipsizeMode="middle">
          {previousSignature}
        </Text>
      ) : null}
      <Text style={currentSignature ? styles.signaturePresentText : styles.signatureMissingText}>
        Aktuelle Signatur: {currentSignature ? '✓ vorhanden' : '✗ keine (wird berechnet...)'}
      </Text>
      {currentSignature ? (
        <Text style={styles.signatureValueText} numberOfLines={2} ellipsizeMode="middle">
          {currentSignature}
        </Text>
      ) : null}
    </View>
  );
}

export default function ResultScreen({ route, navigation }) {
  const [tseValue, setTseValue] = useState('');
  const [tseBaseNumber, setTseBaseNumber] = useState(DEFAULT_TSE_BASE_NUMBER);
  const [persistentGeneratedValue, setPersistentGeneratedValue] = useState('0.00');
  const [previousSignature, setPreviousSignature] = useState('');
  const [currentSignature, setCurrentSignature] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const generatedValue = route?.params?.generatedValue ?? persistentGeneratedValue;
  const enteredValue = route?.params?.enteredValue;
  const globalValue = route?.params?.globalValue ?? persistentGeneratedValue;
  const timestamp = route?.params?.timestamp;
  const endTimestamp = route?.params?.endTimestamp;
  const receiptCounter = route?.params?.receiptCounter ?? '1';
  const amountForReceipt = enteredValue ?? generatedValue;

  useEffect(() => {
    const loadValues = async () => {
      try {
        const [storedTse, storedTseBaseNumber, storedGenerated, storedSignature] = await AsyncStorage.multiGet([
          TSE_STORAGE_KEY,
          TSE_BASE_NUMBER_STORAGE_KEY,
          LAST_GENERATED_STORAGE_KEY,
          TSE_SIGNATURE_STORAGE_KEY,
        ]);
        setTseValue(storedTse?.[1] ?? '');
        setTseBaseNumber(storedTseBaseNumber?.[1] ?? DEFAULT_TSE_BASE_NUMBER);
        setPersistentGeneratedValue(storedGenerated?.[1] ?? '0.00');
        setPreviousSignature(storedSignature?.[1] ?? '');
        setIsDataLoaded(true);
      } catch (error) {
        console.warn('Failed to load persisted values', error);
        setIsDataLoaded(true);
      }
    };

    loadValues();
  }, []);

  useEffect(() => {
    if (!isDataLoaded) {
      return;
    }

    const computeAndPersistSignature = async () => {
      const signatureInput = [
        'KASSE01-WTC',
        tseBaseNumber,
        'Beleg',
        timestamp,
        endTimestamp,
        `Beleg^0.00_${amountForReceipt}_0.00_0.00_0.00^${amountForReceipt}:Bar`,
        tseValue,
        receiptCounter ?? '',
        previousSignature ?? '',
      ].join('');

      try {
        const nextSignature = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          signatureInput,
          { encoding: Crypto.CryptoEncoding.BASE64 }
        );

        setCurrentSignature(nextSignature);
        await AsyncStorage.setItem(TSE_SIGNATURE_STORAGE_KEY, nextSignature);
      } catch (error) {
        console.warn('Failed to compute TSE signature', error);
        setCurrentSignature('');
      }
    };

    computeAndPersistSignature();
  }, [
    isDataLoaded,
    tseBaseNumber,
    timestamp,
    endTimestamp,
    amountForReceipt,
    receiptCounter,
    tseValue,
    previousSignature,
  ]);

  const qrPayload = [
    'V0',
    tseBaseNumber,
    'Kassenbeleg-V1',
    `Beleg^0.00_${amountForReceipt}_0.00_0.00_0.00^${amountForReceipt}:Bar`,
    globalValue,
    receiptCounter,
    timestamp,
    endTimestamp,
    'ecdsa-plain-SHA256',
    'unixTime',
    tseValue,
    currentSignature,
  ].join(";");

  return (
    <View style={styles.resultContainer}>
      <GeneratedResultView
        value={amountForReceipt.toString()}
        globalValue={globalValue?.toString()}
        timestamp={timestamp?.toString()}
        endTimestamp={endTimestamp?.toString()}
        tseValue={tseValue}
        receiptCounter={receiptCounter}
        previousSignature={previousSignature}
        currentSignature={currentSignature}
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
