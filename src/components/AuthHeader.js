import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Colors from '../theme/colors';

/**
 * Top Auth Branding Header with logo, badge, and title
 */
export default function AuthHeader({ badgeText, title, subtitle }) {
  return (
    <View style={styles.container}>
      {/* Brand Emblem Logo */}
      <View style={styles.logoWrapper}>
        <Image
          source={require('../../assets/images/ulavan-santhai-emblem.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* Pill Badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badgeText || 'உழவன் சந்தை'}</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Subtitle */}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  logoWrapper: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.white,
    padding: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 12,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: Colors.mintPill,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.mintText,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
});
