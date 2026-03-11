import { StyleSheet } from 'react-native';
import homeStyles from './homeStyles';
import resultStyles from './resultStyles';
import settingsStyles from './settingsStyles';
import sharedStyles from './sharedStyles';
import interactionStyles from './interactionStyles';

const styles = StyleSheet.create({
  ...homeStyles,
  ...resultStyles,
  ...settingsStyles,
  ...sharedStyles,
  ...interactionStyles,
});

export default styles;
