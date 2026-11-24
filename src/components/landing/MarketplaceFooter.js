import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function MarketplaceFooter({
  onScrollToSection,
  onBackToTop,
  onNavigateToLogin,
  onNavigateToRegister,
}) {
  return (
    <View style={styles.container}>
      {/* Brand & Intro */}
      <View style={styles.introBlock}>
        <Text style={styles.brandTitle}>ULAVAN SANTHAI</Text>

        <Text style={styles.introDesc}>
          One marketplace for growers, suppliers and buyers. Find your next
          agricultural connection.
        </Text>

        <TouchableOpacity
          style={styles.joinBtn}
          onPress={() => onNavigateToRegister()}
          activeOpacity={0.8}
        >
          <Text style={styles.joinBtnText}>Join the community ↗</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Nav Link Groups - In ONE single column of lines on the left */}
      <View style={styles.linksGrid}>
        {/* Explore Group */}
        <View style={styles.navGroup}>
          <Text style={styles.navHeading}>EXPLORE</Text>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => onScrollToSection('about')}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>About us</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => onScrollToSection('who-its-for')}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>Our community</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => onScrollToSection('categories')}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>Agricultural categories</Text>
          </TouchableOpacity>
        </View>

        {/* Get Started Group */}
        <View style={styles.navGroup}>
          <Text style={styles.navHeading}>GET STARTED</Text>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => onScrollToSection('how-it-works')}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>How it works</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => onScrollToSection('plans')}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>Plans & access</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => onNavigateToRegister()}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>Create an account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={onNavigateToLogin}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Footer bar */}
      <View style={styles.bottomBar}>
        <Text style={styles.copyrightText}>
          © 2026 Ulavan Santhai. All rights reserved.
        </Text>

        <TouchableOpacity
          style={styles.backToTopBtn}
          onPress={onBackToTop}
          activeOpacity={0.7}
        >
          <Text style={styles.backToTopText}>Back to top ↑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#103A29',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 22,
    paddingTop: 36,
    paddingBottom: 60,
  },
  introBlock: {
    marginBottom: 6,
  },
  brandTitle: {
    fontSize: 23,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  introDesc: {
    fontSize: 15,
    lineHeight: 23,
    color: '#C6D8CE',
    marginBottom: 20,
    maxWidth: 340,
  },
  joinBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#D0F447',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
  },
  joinBtnText: {
    color: '#103A29',
    fontSize: 15,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginVertical: 24,
  },
  linksGrid: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 22,
    marginBottom: 30,
  },
  navGroup: {
    width: '100%',
    alignItems: 'flex-start',
    gap: 8,
  },
  navHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D0F447',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  linkItem: {
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  linkText: {
    fontSize: 15,
    color: '#E8F0E3',
    fontWeight: '500',
    lineHeight: 21,
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    paddingTop: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  copyrightText: {
    fontSize: 12.5,
    color: '#9DB3A5',
  },
  backToTopBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backToTopText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#D0F447',
  },
});
