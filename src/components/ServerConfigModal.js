import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Colors from '../theme/colors';
import { getBaseUrl, setCustomBaseUrl } from '../config/api';

export default function ServerConfigModal({ visible, onClose, onSaved }) {
  const [apiUrl, setApiUrl] = useState(getBaseUrl());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, message: string }

  const handleTestConnection = async () => {
    const target = apiUrl.trim().replace(/\/+$/, '');
    if (!target) return;

    setIsTesting(true);
    setTestResult(null);

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 4000);

      // Check health endpoint or auth endpoint
      const res = await fetch(`${target}/api/health`, {
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(id);

      if (res && res.status < 500) {
        setTestResult({
          success: true,
          message: `Connected successfully to backend (${res.status})!`,
        });
      } else {
        // Fallback: ping root or auth route
        const authPing = await fetch(`${target}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }).catch(() => null);

        if (authPing) {
          setTestResult({
            success: true,
            message: 'Connected to backend auth service!',
          });
        } else {
          setTestResult({
            success: false,
            message: 'Could not reach server. Verify IP, port 5000, and Wi-Fi.',
          });
        }
      }
    } catch {
      setTestResult({
        success: false,
        message: 'Connection timed out. Ensure backend is running.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const target = apiUrl.trim().replace(/\/+$/, '');
    if (!target) {
      Alert.alert('Invalid URL', 'Please enter a valid backend URL.');
      return;
    }
    setCustomBaseUrl(target);
    if (onSaved) onSaved(target);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>⚙️ Backend Server Settings</Text>
          <Text style={styles.desc}>
            Enter the IP and port of your machine running the backend (e.g. branch `backend`):
          </Text>

          <TextInput
            style={styles.input}
            value={apiUrl}
            onChangeText={setApiUrl}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="http://192.168.1.74:5000"
            placeholderTextColor={Colors.textPlaceholder}
          />

          {testResult ? (
            <View
              style={[
                styles.testBanner,
                testResult.success ? styles.testSuccess : styles.testError,
              ]}
            >
              <Text
                style={[
                  styles.testText,
                  testResult.success ? styles.textSuccess : styles.textError,
                ]}
              >
                {testResult.success ? '✓ ' : '✕ '}
                {testResult.message}
              </Text>
            </View>
          ) : null}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.testBtn}
              onPress={handleTestConnection}
              disabled={isTesting}
            >
              <Text style={styles.testBtnText}>
                {isTesting ? 'Testing...' : 'Test Connection'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save URL</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 22,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textBody,
    marginBottom: 6,
    textAlign: 'center',
  },
  desc: {
    fontSize: 12.5,
    color: Colors.textMuted,
    lineHeight: 18,
    marginBottom: 14,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 14,
    backgroundColor: Colors.inputBg,
    color: Colors.textBody,
    marginBottom: 12,
  },
  testBanner: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  testSuccess: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  testError: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  testText: {
    fontSize: 12,
    fontWeight: '600',
  },
  textSuccess: {
    color: '#166534',
  },
  textError: {
    color: '#991B1B',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  testBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
  },
  testBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  closeBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  closeBtnText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});
