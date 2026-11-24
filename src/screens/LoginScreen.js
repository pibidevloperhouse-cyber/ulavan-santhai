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
import {
  FeedbackModal,
  ServerConfigModal,
  OtpModal,
} from '../components';
import { loginUser, verifyEmailOtp, resendEmailOtp } from '../services/authService';

export default function LoginScreen({
  onNavigateToRegister,
  onNavigateToLanding,
  onLoginSuccess,
  registeredParam = false,
  prefilledEmail = '',
}) {
  const [identifier, setIdentifier] = useState(prefilledEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Popup Modal state
  const [popup, setPopup] = useState({
    visible: false,
    type: 'info', // 'success' | 'error' | 'info'
    title: '',
    message: '',
  });

  // OTP Modal State for pending email verification
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      setPopup({
        visible: true,
        type: 'error',
        title: 'Required Fields',
        message: 'Please enter your email address or mobile number and your password.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginUser({
        identifier: identifier.trim(),
        password,
      });

      if (!result.success) {
        // If user registration is pending OTP verification, open OTP verification modal immediately
        if (result.message && result.message.toLowerCase().includes('pending verification')) {
          setOtpError('');
          setShowOtpModal(true);
          return;
        }

        setPopup({
          visible: true,
          type: 'error',
          title: 'Login Failed',
          message: result.message,
        });
        return;
      }

      setPopup({
        visible: true,
        type: 'success',
        title: 'Welcome Back',
        message: 'Login successful! Continuing to marketplace dashboard...',
      });

      setTimeout(() => {
        setPopup((prev) => ({ ...prev, visible: false }));
        onLoginSuccess(result.user, result.token);
      }, 1200);
    } catch {
      setPopup({
        visible: true,
        type: 'error',
        title: 'Login Error',
        message: 'An unexpected connection error occurred. Please try again.',
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
        email: identifier.trim(),
        otp: otpCode,
      });

      if (!result.success) {
        setOtpError(result.message);
        return;
      }

      setShowOtpModal(false);

      setPopup({
        visible: true,
        type: 'success',
        title: 'Account Activated',
        message: 'Email verified successfully! Logging you into Ulavan Santhai...',
      });

      setTimeout(() => {
        setPopup((prev) => ({ ...prev, visible: false }));
        onLoginSuccess(result.user, result.token);
      }, 1200);
    } catch {
      setOtpError('Verification failed. Please check your connection.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    const result = await resendEmailOtp({
      email: identifier.trim(),
    });

    if (!result.success) {
      setOtpError(result.message);
    } else {
      setOtpError('');
    }
  };

  const handleForgotPassword = () => {
    setPopup({
      visible: true,
      type: 'info',
      title: 'Password Recovery',
      message: 'Please contact Ulavan Santhai support or use your registered mobile OTP to reset your password.',
    });
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
              {/* Back to Home Button */}
              {onNavigateToLanding && (
                <TouchableOpacity
                  style={styles.backHomeBtn}
                  onPress={onNavigateToLanding}
                  activeOpacity={0.7}
                >
                  <Text style={styles.backHomeBtnText}>←  Back</Text>
                </TouchableOpacity>
              )}

            <View style={styles.card}>
              <View pointerEvents="none" style={styles.sprig}>
                <View style={styles.stem} />
                <View style={[styles.leaf, styles.upperLeaf]} />
                <View style={[styles.leaf, styles.lowerLeaf]} />
              </View>
              {/* Registration Success Banner */}
              {registeredParam ? (
                <View style={styles.registeredBanner}>
                  <Text style={styles.bannerIcon}>✓</Text>
                  <View style={styles.bannerTextCol}>
                    <Text style={styles.bannerTitle}>Registration Complete!</Text>
                    <Text style={styles.bannerDesc}>
                      Please enter your password below to sign in and enter the marketplace.
                    </Text>
                  </View>
                </View>
              ) : null}

              <TouchableOpacity
                style={styles.badge}
                accessibilityRole="button"
                accessibilityLabel="Open server settings"
                onPress={() => setShowServerModal(true)}
              >
                <Text style={styles.badgeText}>✓   SIGN IN TO YOUR ACCOUNT</Text>
              </TouchableOpacity>
              <Text accessibilityRole="header" style={styles.title}>Welcome Back</Text>

              {/* Identifier Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Email Address <Text style={styles.required}>*</Text>
                </Text>
                <View style={[styles.inputWrapper, focusedField === 'email' && styles.inputFocused]}>
                  <Text style={styles.fieldIcon}>✉</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor={Colors.textPlaceholder}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    value={identifier}
                    onChangeText={setIdentifier}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password <Text style={styles.required}>*</Text></Text>
                <View style={[styles.inputWrapper, focusedField === 'password' && styles.inputFocused]}>
                  <Text style={styles.fieldIcon}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.textPlaceholder}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.eyeIcon}>{showPassword ? '👁' : '👁‍🗨'}</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.forgotLink} onPress={handleForgotPassword}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>

              {/* Remember Me Toggle */}
              <TouchableOpacity
                accessibilityRole="checkbox"
                accessibilityState={{ checked: rememberMe }}
                style={styles.rememberRow}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe ? <Text style={styles.checkmark}>✓</Text> : null}
                </View>
                <Text style={styles.rememberText}>Remember me on this browser</Text>
              </TouchableOpacity>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color={Colors.white} size="small" />
                    <Text style={styles.submitButtonText}>Signing In...</Text>
                  </View>
                ) : (
                  <View style={styles.loadingRow}>
                    <Text style={styles.submitButtonText}>Sign In</Text>
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

              {/* Register Link */}
              <View style={styles.registerFooter}>
                <Text style={styles.registerPrompt}>
                  Don&apos;t have an account yet?
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Create an Account"
                  onPress={onNavigateToRegister}
                  activeOpacity={0.7}
                  style={styles.registerLinkBtn}
                >
                  <Text style={styles.registerLink}>
                    Create an Account →
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* Modal Alert Popup */}
      <FeedbackModal
        visible={popup.visible}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={() => setPopup((prev) => ({ ...prev, visible: false }))}
      />

      {/* Server IP Config Modal */}
      <ServerConfigModal
        visible={showServerModal}
        onClose={() => setShowServerModal(false)}
      />

      {/* Pending Registration OTP Verification Modal */}
      <OtpModal
        visible={showOtpModal}
        email={identifier.trim()}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        onClose={() => setShowOtpModal(false)}
        isLoading={isVerifyingOtp}
        errorMessage={otpError}
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
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  card: {
    paddingHorizontal: 28,
    paddingTop: 36,
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
  registeredBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.successBg,
    borderColor: Colors.successBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  bannerIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.success,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 10,
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#064E3B',
  },
  bannerDesc: {
    fontSize: 11,
    color: '#065F46',
    marginTop: 2,
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textBody,
    marginBottom: 6,
  },
  required: {
    color: Colors.error,
  },
  forgotLink: { alignSelf: 'flex-end', paddingTop: 8 },
  forgotText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
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
  inputFocused: { borderColor: Colors.primary, borderWidth: 2 },
  fieldIcon: {
    fontSize: 15,
    marginRight: 8,
    color: Colors.primary,
  },
  input: {
    flex: 1,
    height: 54,
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
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
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
  rememberText: {
    fontSize: 15,
    color: Colors.textBody,
    fontWeight: '500',
  },
  submitButton: {
    marginHorizontal: 10,
    backgroundColor: Colors.primary,
    backgroundImage: 'linear-gradient(165deg, #1BA54C 0%, #104B32 36%, #104B32 100%)',
    borderRadius: 16,
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
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
    fontSize: 20,
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
    marginVertical: 26,
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
    fontWeight: '600',
  },
  registerFooter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerPrompt: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textBody,
    textAlign: 'center',
  },
  registerLinkBtn: {
    marginTop: 6,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  registerLink: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});
