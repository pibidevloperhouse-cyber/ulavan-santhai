import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import Colors from '../theme/colors';
import { AuthHeader, ServerConfigModal } from '../components';
import { getBaseUrl } from '../config/api';
import { clearSessionCache } from '../services/authService';

export default function HomeScreen({ user, token, onLogout, onNavigateToGetStarted }) {
  const [selectedRole, setSelectedRole] = useState(
    user?.role === 'SELLER' ? 'seller' : 'buyer'
  );
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(getBaseUrl());

  const handleLogoutPress = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of Ulavan Santhai?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          clearSessionCache();
          onLogout();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AuthHeader
          badgeText="🌾 ULAVAN SANTHAI DASHBOARD"
          title={`வணக்கம், ${user?.name || 'Farmer'}!`}
          subtitle="Direct Agricultural Marketplace"
        />

        {/* User Status Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.avatarDetails}>
              <Text style={styles.userName}>{user?.name || 'Authorized Member'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
              {user?.mobile ? (
                <Text style={styles.userMobile}>📞 +91 {user.mobile}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.badgeRow}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>✓ Account Verified</Text>
            </View>
            <View style={[styles.statusBadge, styles.roleBadge]}>
              <Text style={styles.roleBadgeText}>
                {selectedRole === 'seller' ? '🌱 Farmer / Seller' : '🛒 Buyer'}
              </Text>
            </View>
          </View>
        </View>

        {/* Role Selection / Switcher */}
        <Text style={styles.sectionHeader}>Choose Your Operating Mode</Text>

        {onNavigateToGetStarted && (
          <TouchableOpacity
            style={styles.switchRoleBanner}
            onPress={onNavigateToGetStarted}
            activeOpacity={0.85}
          >
            <View style={styles.switchRoleLeft}>
              <Text style={styles.switchRoleIcon}>🌾</Text>
              <View>
                <Text style={styles.switchRoleTitle}>Marketplace Role Selection</Text>
                <Text style={styles.switchRoleSubtitle}>Switch role or re-fill form in /get-started</Text>
              </View>
            </View>
            <Text style={styles.switchRoleArrow}>→</Text>
          </TouchableOpacity>
        )}

        <View style={styles.roleOptions}>
          {/* Farmer / Seller Card */}
          <TouchableOpacity
            style={[
              styles.roleCard,
              selectedRole === 'seller' && styles.roleCardActive,
            ]}
            onPress={() => setSelectedRole('seller')}
            activeOpacity={0.85}
          >
            <View style={styles.roleIconWrapper}>
              <Text style={styles.roleIcon}>🚜</Text>
            </View>
            <Text style={styles.roleTitle}>Farmer / Seller</Text>
            <Text style={styles.roleTamil}>உழவர் / விற்பனையாளர்</Text>
            <Text style={styles.roleDesc}>
              List fresh farm produce, grains, and vegetables directly to buyers.
            </Text>
          </TouchableOpacity>

          {/* Buyer Card */}
          <TouchableOpacity
            style={[
              styles.roleCard,
              selectedRole === 'buyer' && styles.roleCardActive,
            ]}
            onPress={() => setSelectedRole('buyer')}
            activeOpacity={0.85}
          >
            <View style={styles.roleIconWrapper}>
              <Text style={styles.roleIcon}>🏪</Text>
            </View>
            <Text style={styles.roleTitle}>Buyer / Wholesaler</Text>
            <Text style={styles.roleTamil}>வாங்குபவர்</Text>
            <Text style={styles.roleDesc}>
              Browse produce, place inquiries, and purchase directly from verified farmers.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Connection Diagnostics Pill */}
        <TouchableOpacity
          style={styles.configPill}
          onPress={() => setShowConfigModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.configPillText}>
            ⚙ Backend Server: <Text style={styles.boldIp}>{currentUrl}</Text>
          </Text>
        </TouchableOpacity>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogoutPress}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Backend IP Config Modal */}
      <ServerConfigModal
        visible={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSaved={(newUrl) => setCurrentUrl(newUrl)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 36,
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.mintBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
  },
  avatarDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textBody,
  },
  userEmail: {
    fontSize: 12.5,
    color: Colors.textMuted,
    marginTop: 2,
  },
  userMobile: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBadge: {
    backgroundColor: Colors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  roleBadge: {
    backgroundColor: Colors.mintPill,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  roleOptions: {
    gap: 12,
    marginBottom: 24,
  },
  roleCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  roleCardActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F7FCF8',
  },
  roleIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.mintBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  roleIcon: {
    fontSize: 22,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textBody,
  },
  roleTamil: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
    marginBottom: 6,
  },
  roleDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
  },
  configPill: {
    backgroundColor: '#EAEFE9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  configPillText: {
    fontSize: 11.5,
    color: Colors.textMuted,
  },
  boldIp: {
    fontWeight: '700',
    color: Colors.primary,
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 20,
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textBody,
    marginBottom: 6,
  },
  modalDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 14,
    lineHeight: 18,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    fontSize: 13,
    backgroundColor: Colors.inputBg,
    color: Colors.textBody,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  modalCancelText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  modalSave: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  modalSaveText: {
    fontSize: 13,
    color: Colors.white,
    fontWeight: '700',
  },
  switchRoleBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  switchRoleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchRoleIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  switchRoleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  switchRoleSubtitle: {
    fontSize: 11.5,
    color: Colors.textMuted,
    marginTop: 2,
  },
  switchRoleArrow: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primary,
    marginLeft: 10,
  },
});
