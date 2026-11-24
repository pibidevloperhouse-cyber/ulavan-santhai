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
import { FeedbackModal, OtpModal } from '../components';
import {
  registerUser,
  verifyEmailOtp,
  resendEmailOtp,
} from '../services/authService';

export default function RegisterScreen({
  onNavigateToLogin,
  onNavigateToLanding,
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
      source={require('../../assets/images/login-paddy-distant-farmer.webp')}
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
            {onNavigateToLanding && (
              <TouchableOpacity style={styles.backHomeBtn} onPress={onNavigateToLanding}>
                <Text style={styles.backHomeBtnText}>←  Back</Text>
              </TouchableOpacity>
            )}
            <View style={styles.card}>
              <View pointerEvents="none" style={styles.sprig}>
                <View style={styles.stem} />
                <View style={[styles.leaf, styles.upperLeaf]} />
                <View style={[styles.leaf, styles.lowerLeaf]} />
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>ACCOUNT REGISTRATION</Text>
              </View>
              <Text accessibilityRole="header" style={styles.title}>Create Your{'\n'}Account</Text>

              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Username <Text style={styles.required}>*</Text>
                </Text>
                <View style={[styles.inputWrapper, formData.fullName.length > 0 && styles.filledInput]}>
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
                <View style={[styles.inputWrapper, formData.email.length > 0 && styles.filledInput]}>
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
                  Mobile Number (10 Digits) <Text style={styles.required}>*</Text>
                </Text>
                <View style={[styles.inputWrapper, formData.mobile.length > 0 && styles.filledInput]}>
                  <View style={styles.countryCodeBadge}>
                    <Text style={styles.countryCodeText}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="9876543210"
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
                  Password <Text style={styles.required}>*</Text>
                </Text>
                <View style={[styles.inputWrapper, formData.password.length > 0 && styles.filledInput]}>
                  <TextInput
                    style={styles.input}
                    placeholder="At least 8 characters"
                    placeholderTextColor={Colors.textPlaceholder}
                    value={formData.password}
                    onChangeText={(val) => updateField('password', val)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.eyeIcon}>👁︎</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Confirm Password <Text style={styles.required}>*</Text>
                </Text>
                <View style={[styles.inputWrapper, formData.confirmPassword.length > 0 && styles.filledInput]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter password"
                    placeholderTextColor={Colors.textPlaceholder}
                    value={formData.confirmPassword}
                    onChangeText={(val) => updateField('confirmPassword', val)}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    accessibilityRole="button"
                    accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.eyeIcon}>👁︎</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Terms Checkbox */}
              <TouchableOpacity
                accessibilityRole="checkbox"
                accessibilityState={{ checked: formData.agreeTerms }}
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
                  <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text> of Ulavan Santhai.
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
                    <Text style={styles.submitButtonText}>Register Account</Text>
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
              <View style={styles.loginFooter}>
                <Text style={styles.loginPrompt}>
                  Already registered?
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Log in to your account"
                  onPress={onNavigateToLogin}
                  activeOpacity={0.7}
                  style={styles.loginLinkBtn}
                >
                  <Text style={styles.loginLink}>
                    Log in to your account →
                  </Text>
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
  overlayLayer: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 500,
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  card: {
    paddingHorizontal: 28,
    paddingTop: 39,
    paddingBottom: 28,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.88)',
    backgroundColor: 'rgba(249,252,255,0.50)',
    overflow: 'hidden',
  },
  backHomeBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginBottom: 22,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  backHomeBtnText: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
  sprig: { position: 'absolute', top: 1, right: 0, width: 86, height: 84 },
  stem: { position: 'absolute', right: 16, top: 8, width: 1, height: 82, backgroundColor: '#96B849', transform: [{ rotate: '-29deg' }] },
  leaf: { position: 'absolute', width: 34, height: 20, borderTopLeftRadius: 20, borderBottomRightRadius: 20 },
  upperLeaf: { right: -3, top: 12, backgroundColor: '#94BD48', transform: [{ rotate: '85deg' }] },
  lowerLeaf: { right: 25, top: 29, backgroundColor: '#ADD353', transform: [{ rotate: '24deg' }] },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: Colors.mintPill,
  },
  badgeText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  title: { fontSize: 38, fontWeight: '800', color: Colors.primary, marginTop: 12, marginBottom: 24 },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textBody,
    marginBottom: 8,
  },
  required: {
    color: Colors.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.90)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: 16,
  },
  filledInput: { backgroundColor: Colors.inputBg },
  countryCodeBadge: { marginRight: 12 },
  countryCodeText: { fontSize: 15, fontWeight: '700', color: Colors.textMuted },
  input: {
    flex: 1,
    height: 50,
    fontSize: 17,
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
    borderRadius: 3,
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
    fontSize: 15,
    color: Colors.textBody,
    flex: 1,
    lineHeight: 24,
  },
  termsLink: {
    textDecorationLine: 'underline',
    color: Colors.primary,
    fontWeight: '700',
  },
  submitButton: {
    backgroundImage: 'linear-gradient(165deg, #1BA54C 0%, #104B32 36%, #104B32 100%)',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    height: 60,
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
    fontSize: 18,
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
    marginVertical: 28,
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
    fontWeight: '700',
  },
  loginFooter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginPrompt: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textBody,
  },
  loginLinkBtn: {
    marginTop: 6,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '800',
    textDecorationLine: 'underline',
    color: Colors.primary,
    textAlign: 'center',
  },
});
