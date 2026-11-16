import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Colors from '../theme/colors';

const { width } = Dimensions.get('window');

/**
 * 6-Digit Email Verification OTP Modal
 * Faithfully converted from BasicRegistrationPage (Next.js) to React Native
 */
export default function OtpModal({
  visible,
  email,
  onVerify,
  onResend,
  onClose,
  isLoading = false,
  errorMessage = '',
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  // Reset digits when modal becomes visible
  useEffect(() => {
    if (visible) {
      setDigits(['', '', '', '', '', '']);
      setCooldown(30);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 250);
    }
  }, [visible]);

  // Resend countdown timer
  useEffect(() => {
    if (!visible || cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [visible, cooldown]);

  const handleDigitChange = (val, index) => {
    const numbers = val.replace(/\D/g, '');
    if (numbers.length > 1) {
      // User pasted multiple digits (e.g. 6-digit OTP from email/SMS)
      const newDigits = [...digits];
      for (let i = 0; i < numbers.length && index + i < 6; i++) {
        newDigits[index + i] = numbers[i];
      }
      setDigits(newDigits);
      const nextIndex = Math.min(index + numbers.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const clean = numbers.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = clean;
    setDigits(newDigits);

    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyPress = () => {
    const otpCode = digits.join('');
    if (otpCode.length === 6) {
      onVerify(otpCode);
    }
  };

  const handleResendPress = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      await onResend();
      setCooldown(30);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsResending(false);
    }
  };

  const isComplete = digits.join('').length === 6;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          {/* Mail Badge Icon */}
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>✉</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Verify Your Email</Text>

          {/* Target Email Text */}
          <Text style={styles.subtitle}>
            We have sent a 6-digit verification code to:{'\n'}
            <Text style={styles.emailHighlight}>{email || 'your email'}</Text>
          </Text>

          {/* 6 Digit Input Boxes */}
          <View style={styles.otpRow}>
            {digits.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(ref) => (inputRefs.current[idx] = ref)}
                style={[
                  styles.otpBox,
                  digit ? styles.otpBoxFilled : null,
                  errorMessage ? styles.otpBoxError : null,
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(val) => handleDigitChange(val, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
                selectTextOnFocus
                textAlign="center"
              />
            ))}
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (!isComplete || isLoading) && styles.buttonDisabled,
            ]}
            onPress={handleVerifyPress}
            disabled={!isComplete || isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify Code</Text>
            )}
          </TouchableOpacity>

          {/* Resend OTP Section */}
          <View style={styles.resendRow}>
            {cooldown > 0 ? (
              <Text style={styles.resendTimerText}>
                Resend code in <Text style={styles.boldTimer}>{cooldown}s</Text>
              </Text>
            ) : (
              <TouchableOpacity
                onPress={handleResendPress}
                disabled={isResending}
              >
                <Text style={styles.resendActionText}>
                  {isResending ? 'Sending...' : 'Didn’t receive code? Resend OTP'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
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
    padding: 20,
  },
  card: {
    width: Math.min(width - 40, 360),
    backgroundColor: Colors.surface,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: Colors.mintBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  iconEmoji: {
    fontSize: 26,
    color: Colors.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textBody,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emailHighlight: {
    color: Colors.textBody,
    fontWeight: '700',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  otpBox: {
    width: 44,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    backgroundColor: Colors.surface,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textBody,
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: '#F8FAF5',
  },
  otpBoxError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  verifyButton: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  verifyButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  resendRow: {
    alignItems: 'center',
  },
  resendTimerText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  boldTimer: {
    fontWeight: '700',
    color: Colors.primary,
  },
  resendActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});
