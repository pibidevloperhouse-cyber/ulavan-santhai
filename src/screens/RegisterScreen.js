import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import Colors from '../theme/colors';
import AuthHeader from '../components/AuthHeader';
import FeedbackModal from '../components/FeedbackModal';
import OtpModal from '../components/OtpModal';
import {
  registerUser,
  verifyEmailOtp,
  resendEmailOtp,
} from '../services/authService';

export default function RegisterScreen({
  onNavigateToLogin,
  onRegisterSuccess,
}) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    agreeTerms: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // OTP Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Feedback Popup Modal
  const [popup, setPopup] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegisterSubmit = async () => {
    if (!formData.fullName.trim()) {
      setPopup({
        visible: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter your full name / username.',
      });
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setPopup({
        visible: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter a valid email address.',
      });
      return;
    }

    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setPopup({
        visible: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Mobile number must contain exactly 10 digits.',
      });
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      setPopup({
        visible: true,
        type: 'error',
        title: 'Password Too Short',
        message: 'Password must be at least 8 characters long.',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPopup({
        visible: true,
        type: 'error',
        title: 'Password Mismatch',
        message: 'Password and Confirm Password do not match.',
      });
      return;
    }

    if (!formData.agreeTerms) {
      setPopup({
        visible: true,
        type: 'error',
        title: 'Terms Required',
        message: 'You must agree to the Terms of Service to register.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser({
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        mobile: cleanMobile,
        password: formData.password,
      });

      if (!result.success) {
        setPopup({
          visible: true,
          type: 'error',
          title: 'Registration Failed',
          message: result.message,
        });
        return;
      }

      // Backend registered user and dispatched OTP to email!
      setOtpError('');
      setIsOtpModalOpen(true);
    } catch {
      setPopup({
        visible: true,
        type: 'error',
        title: 'Registration Error',
        message: 'Could not connect to backend registration service.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (otpCode) => {
    setIsVerifyingOtp(true);
    setOtpError('');

    try {
      const result = await verifyEmailOtp({
        email: formData.email.trim(),
        otp: otpCode,
      });

      if (!result.success) {
        setOtpError(result.message);
        return;
      }

      setIsOtpModalOpen(false);

      setPopup({
        visible: true,
        type: 'success',
        title: 'Email Verified',
        message: 'Your account has been registered & verified successfully! Continuing to sign in...',
      });

      setTimeout(() => {
        setPopup((prev) => ({ ...prev, visible: false }));
        onRegisterSuccess(formData.email.trim());
      }, 1300);
    } catch {
      setOtpError('Verification request failed. Please check network.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    const result = await resendEmailOtp({
      email: formData.email.trim(),
    });

    if (!result.success) {
      setOtpError(result.message);
    } else {
      setOtpError('');
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/register-paddy-harvest.webp')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlayLayer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              {/* Branding Header */}
              <AuthHeader
                badgeText="🌾 Create Account"
                title="Join Ulavan Santhai"
                subtitle="Direct Marketplace for Farmers & Buyers"
              />

              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Full Name / Username <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.fieldIcon}>👤</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Ramesh Kumar"
                    placeholderTextColor={Colors.textPlaceholder}
                    value={formData.fullName}
                    onChangeText={(val) => updateField('fullName', val)}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Email Address */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Email Address <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.fieldIcon}>✉</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. ramesh@example.com"
                    placeholderTextColor={Colors.textPlaceholder}
                    value={formData.email}
                    onChangeText={(val) => updateField('email', val)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Mobile Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Mobile Number <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.countryCodeBadge}>
                    <Text style={styles.countryCodeText}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="10-digit mobile number"
                    placeholderTextColor={Colors.textPlaceholder}
                    value={formData.mobile}
                    onChangeText={(val) => updateField('mobile', val)}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Password (min 8 chars) <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.fieldIcon}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.textPlaceholder}
                    value={formData.password}
                    onChangeText={(val) => updateField('password', val)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.eyeIcon}>{showPassword ? '👁' : '👁‍🗨'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Confirm Password <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.fieldIcon}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.textPlaceholder}
                    value={formData.confirmPassword}
                    onChangeText={(val) => updateField('confirmPassword', val)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.eyeIcon}>
                      {showConfirmPassword ? '👁' : '👁‍🗨'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Terms Checkbox */}
              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => updateField('agreeTerms', !formData.agreeTerms)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.checkbox,
                    formData.agreeTerms && styles.checkboxChecked,
                  ]}
                >
                  {formData.agreeTerms ? (
                    <Text style={styles.checkmark}>✓</Text>
                  ) : null}
                </View>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text> &{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isLoading && styles.submitButtonDisabled,
                ]}
                onPress={handleRegisterSubmit}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color={Colors.white} size="small" />
                    <Text style={styles.submitButtonText}>
                      Creating Account...
                    </Text>
                  </View>
                ) : (
                  <View style={styles.loadingRow}>
                    <Text style={styles.submitButtonText}>Create Account</Text>
                    <Text style={styles.arrowIcon}>→</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Login Link */}
              <View style={styles.loginPrompt}>
                <Text style={styles.loginPromptText}>Already have an account? </Text>
                <TouchableOpacity onPress={onNavigateToLogin}>
                  <Text style={styles.loginLink}>Sign In →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* 6-Digit Email Verification Modal */}
      <OtpModal
        visible={isOtpModalOpen}
        email={formData.email}
        isLoading={isVerifyingOtp}
        errorMessage={otpError}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        onClose={() => setIsOtpModalOpen(false)}
      />

      {/* General Feedback Modal */}
      <FeedbackModal
        visible={popup.visible}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={() => setPopup((prev) => ({ ...prev, visible: false }))}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlayLayer: {
    flex: 1,
    backgroundColor: 'rgba(235, 245, 238, 0.72)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  card: {
    backgroundColor: Colors.surfaceTranslucent,
    borderRadius: 28,
    padding: 24,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.85)',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.textBody,
    marginBottom: 5,
  },
  required: {
    color: Colors.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: 12,
  },
  countryCodeBadge: {
    backgroundColor: Colors.mintPill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
  },
  countryCodeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  fieldIcon: {
    fontSize: 14,
    marginRight: 8,
    color: Colors.primary,
  },
  input: {
    flex: 1,
    height: 46,
    fontSize: 13.5,
    color: Colors.textBody,
  },
  eyeButton: {
    padding: 6,
  },
  eyeIcon: {
    fontSize: 16,
    color: Colors.primary,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: Colors.white,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 11.5,
    color: Colors.textBody,
    flex: 1,
    lineHeight: 16,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
    marginTop: 4,
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  arrowIcon: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  dividerText: {
    paddingHorizontal: 10,
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPromptText: {
    fontSize: 12.5,
    color: Colors.textMuted,
  },
  loginLink: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Colors.primary,
  },
});
