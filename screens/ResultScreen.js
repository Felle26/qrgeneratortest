import { Pressable, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import styles from '../styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

function GeneratedResultView({ value, timestamp, endTimestamp }) {
  return (
    <View style={styles.generatedFieldView}>
      <Text style={styles.generatedFieldTitle}>Generiertes Ergebnis</Text>
      <Text style={styles.generatedLabel}>Funktion gestartet</Text>
      <Text style={styles.generatedValue}>Wert: {value} EUR</Text>
      <Text style={styles.generatedLabel}>TSE: {AsyncStorage.getItem('tse_value')}</Text>
      {timestamp != null && (
        <Text style={styles.generatedValue}>Timestamp: {timestamp}</Text>
      )}
      {endTimestamp != null && (
        <Text style={styles.generatedValue}>End Timestamp: {endTimestamp}</Text>
      )}
    </View>
  );
}

export default function ResultScreen({ route, navigation }) {
  const generatedValue = route?.params?.generatedValue ?? '0';
  const timestamp = route?.params?.timestamp;
  const endTimestamp = route?.params?.endTimestamp;

  // encode value, start and end timestamps in QR code; use simple pipe-delimited string
  const qrPayload = `V0;${generatedValue};${timestamp};${endTimestamp}`;

  // debug log in case QR code disappears again
  console.log('QR payload:', qrPayload);

  return (
    <View style={styles.resultContainer}>
      <GeneratedResultView value={generatedValue.toString()} timestamp={timestamp?.toString()} endTimestamp={endTimestamp?.toString()} />
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
