import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Colors from '../theme/colors';

const { width } = Dimensions.get('window');

/**
 * Feedback popup modal matching the web feedback popup in Login/Register
 */
export default function FeedbackModal({
  visible,
  type = 'info', // 'success' | 'error' | 'info'
  title,
  message,
  buttonText,
  onClose,
}) {
  const isSuccess = type === 'success';
  const isError = type === 'error';

  const iconBg = isSuccess
    ? Colors.mintBg
    : isError
    ? Colors.errorBg
    : Colors.infoBg;

  const iconColor = isSuccess
    ? Colors.primary
    : isError
    ? Colors.error
    : Colors.info;

  const renderIcon = () => {
    if (isSuccess) {
      return <Text style={[styles.iconText, { color: iconColor }]}>✓</Text>;
    }
    if (isError) {
      return <Text style={[styles.iconText, { color: iconColor }]}>✕</Text>;
    }
    return <Text style={[styles.iconText, { color: iconColor }]}>ℹ</Text>;
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Circular Icon */}
          <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
            {renderIcon()}
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              {buttonText || (isSuccess ? 'Continue' : 'Dismiss')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: Math.min(width - 48, 360),
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textBody,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  button: {
    width: '100%',
    paddingVertical: 13,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
