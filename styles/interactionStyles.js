import { Platform } from 'react-native';

const interactionStyles = {
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 12,
    elevation: 8,
    ...Platform.select({
      web: {
        boxShadow:
          '0 0 16px rgba(255,255,255,0.55), inset 0 0 12px rgba(255,255,255,0.22)',
      },
      default: {},
    }),
  },
  buttonInnerGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
};

export default interactionStyles;
