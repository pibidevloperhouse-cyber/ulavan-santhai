import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Colors from '../../theme/colors';

const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About Us' },
  { id: 'who-its-for', label: 'Who it’s for' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'categories', label: 'Categories' },
  { id: 'plans', label: 'Plans' },
  { id: 'contact', label: 'Contact Us' },
];

export default function LandingNavbar({
  activeSection = 'home',
  onScrollToSection,
  onNavigateToLogin,
  onNavigateToRegister,
  onNavigateToGetStarted,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLinkPress = (id) => {
    setMenuOpen(false);
    if (onScrollToSection) {
      onScrollToSection(id);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {/* Brand Logo: Ulavan Mart + Handshake Logo (img3) */}
        <TouchableOpacity
          style={styles.brandWrapper}
          onPress={() => handleLinkPress('home')}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../../assets/images/ulavan-mart-handshake-logo.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Right side controls: Menu Toggle */}
        <View style={styles.rightActions}>
          <TouchableOpacity
            style={styles.menuToggleBtn}
            onPress={() => setMenuOpen(!menuOpen)}
            activeOpacity={0.75}
          >
            <Text style={styles.menuToggleText}>{menuOpen ? '✕' : '☰'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Expanded Navigation Dropdown / Drawer */}
      {menuOpen && (
        <View style={styles.dropdown}>
          <View style={styles.pillContainer}>
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <TouchableOpacity
                  key={link.id}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                  onPress={() => handleLinkPress(link.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.navItemText,
                      isActive && styles.navItemTextActive,
                    ]}
                  >
                    {link.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Auth Actions in Menu */}
          <View style={styles.authRow}>
            <TouchableOpacity
              style={styles.authLoginBtn}
              onPress={() => {
                setMenuOpen(false);
                onNavigateToLogin();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.authLoginText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.authSignUpBtn}
              onPress={() => {
                setMenuOpen(false);
                if (onNavigateToGetStarted) {
                  onNavigateToGetStarted();
                } else if (onNavigateToRegister) {
                  onNavigateToRegister();
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.authSignUpText}>Get Started</Text>
              <View style={styles.arrowCircle}>
                <Text style={styles.arrowText}>↗</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EFE8',
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: '#103e20',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
      default: {
        shadowColor: '#103e20',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
    }),
  },
  bar: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  brandWrapper: {
    paddingVertical: 4,
  },
  brandLogo: {
    width: 132,
    height: 42,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickLoginBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F3F7F2',
  },
  quickLoginText: {
    color: '#063D22',
    fontWeight: '800',
    fontSize: 15,
  },
  menuToggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#063D22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuToggleText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: '#F0F4EF',
  },
  pillContainer: {
    backgroundColor: '#063D22',
    borderRadius: 18,
    padding: 8,
    gap: 6,
  },
  navItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  navItemActive: {
    backgroundColor: '#C5F340',
  },
  navItemText: {
    color: '#E8EDE5',
    fontSize: 16,
    fontWeight: '700',
  },
  navItemTextActive: {
    color: '#15220D',
    fontWeight: '800',
  },
  authRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    gap: 12,
  },
  authLoginBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#063D22',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  authLoginText: {
    color: '#063D22',
    fontSize: 16,
    fontWeight: '800',
  },
  authSignUpBtn: {
    flex: 1.3,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#C5F340',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  authSignUpText: {
    color: '#15220D',
    fontSize: 16,
    fontWeight: '900',
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#050805',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
