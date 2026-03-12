import { Pressable, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import styles from '../styles';

function GeneratedResultView({ value }) {
  return (
    <View style={styles.generatedFieldView}>
      <Text style={styles.generatedFieldTitle}>Generiertes Ergebnis</Text>
      <Text style={styles.generatedLabel}>Funktion gestartet</Text>
      <Text style={styles.generatedValue}>Wert: {value} EUR</Text>
    </View>
  );
}

export default function ResultScreen({ route, navigation }) {
  const generatedValue = route?.params?.generatedValue ?? '0';

  return (
    <View style={styles.resultContainer}>
      <GeneratedResultView value={generatedValue} />
      <QRCode value={generatedValue} size={400} />

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
