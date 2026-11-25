import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import Colors from '../theme/colors';
import { BrandLogo } from '../components/landing/LandingNavbar';
import { fetchLiveUser, getSessionCache } from '../services/authService';

/**
 * Ulavan Santhai / Ulavan Mart - Get Started / Marketplace Role Selection Screen
 * Mobile Adaptation of frontend `app/get-started/page.js`
 *
 * Visually & functionally matches the web experience:
 * - Brand header with Ulavan Mart leaf logo, Home & Logout buttons
 * - Two-line centered welcome heading & subtitle
 * - 'CHOOSE YOUR MARKETPLACE ROLE' pill below subtitle
 * - Clean Buyer & Seller cards with 4-step action buttons
 */
export default function GetStartedScreen({
  user: initialUser = null,
  token = null,
  onNavigateToLanding,
  onNavigateToLogin,
  onNavigateToRegister,
  onSelectRole,
  onNavigateToOnboarding,
  onLogout,
}) {
  const [liveUser, setLiveUser] = useState(null);

  // Query GET /api/v1/user/me live from Express backend on mount
  useEffect(() => {
    let isMounted = true;

    async function syncLiveStatus() {
      try {
        const session = getSessionCache();
        const activeToken = token || session?.token;
        if (!activeToken) return;

        const result = await fetchLiveUser(activeToken);
        if (isMounted && result.success && result.data) {
          setLiveUser(result.data);
        }
      } catch (err) {
        console.warn('[GetStarted] Live status check skipped, using session state:', err.message);
      }
    }

    syncLiveStatus();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Priority order: liveUser from backend > initialUser prop > session cache user
  const sessionUser = initialUser || getSessionCache().user;

  const userName =
    liveUser?.name ||
    (sessionUser?.name && sessionUser.name !== 'Farmer Ramesh Kumar'
      ? sessionUser.name
      : '');

  // Role Selection Redirection Handler (matches frontend handleSelectRole)
  const handleSelectRole = (role) => {
    try {
      const activeSessionUser = sessionUser || {};
      const roleCapitalized = role === 'buyer' ? 'Buyer' : 'Seller';
      activeSessionUser.activeRole = role;
      activeSessionUser.role = roleCapitalized;

      if (role === 'seller') {
        if (onNavigateToOnboarding) {
          onNavigateToOnboarding('seller', 1);
        } else if (onNavigateToRegister) {
          onNavigateToRegister('SELLER');
        } else if (onSelectRole) {
          onSelectRole('seller');
        }
        return;
      }

      if (role === 'buyer') {
        if (onNavigateToOnboarding) {
          onNavigateToOnboarding('buyer', 1);
        } else if (onNavigateToRegister) {
          onNavigateToRegister('BUYER');
        } else if (onSelectRole) {
          onSelectRole('buyer');
        }
        return;
      }
    } catch (err) {
      if (onNavigateToRegister) {
        onNavigateToRegister(role.toUpperCase());
      }
    }
  };

  const cards = [
    {
      role: 'buyer',
      title: 'Buyer',
      tagline:
        'For commercial traders, retailers, restaurants, food processors, and wholesale buyers.',
      badge: 'SOURCING & PROCUREMENT',
      image: require('../../assets/images/get-started/buyer-wholesale.jpg'),
      alt: 'Wholesale APMC agriculture mandi with buyers inspecting crates of fresh produce',
      benefits: [
        'You can select multiple classifications. A ₹365 fee applies to each selected classification.',
        'Find verified agricultural products.',
        'Discover direct farm producers.',
        'Connect directly with suppliers.',
      ],
      buttonText: 'Complete Buyer Form (4 Steps)',
      buttonBg: '#174B35',
    },
    {
      role: 'seller',
      title: 'Seller',
      tagline:
        'For farmers, FPOs, organic producers, plantation growers, and agri-processors.',
      badge: 'PRODUCERS & FARMERS',
      image: require('../../assets/images/get-started/seller-farmer.jpg'),
      alt: 'Smiling Indian farmer in paddy field holding freshly harvested crops',
      benefits: [
        'You can select multiple classifications. A ₹365 fee applies to each selected classification.',
        'Showcase your agricultural crops & harvest.',
        'Connect directly with bulk verified buyers.',
        'Receive direct farm-gate payments.',
      ],
      buttonText: 'Complete Seller Form (4 Steps)',
      buttonBg: '#174B35',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Brand Bar */}
      <View style={styles.header}>
        {/* Ulavan Mart Brand Logo */}
        <TouchableOpacity
          style={styles.brandRow}
          onPress={onNavigateToLanding}
          activeOpacity={0.8}
        >
          <BrandLogo style={styles.brandLogo} />
        </TouchableOpacity>

        {/* Quick Links: Home & Logout */}
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.navPillBtn}
            onPress={onNavigateToLanding}
            activeOpacity={0.75}
          >
            <Text style={styles.navPillIcon}>⌂</Text>
            <Text style={styles.navPillText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navPillBtn}
            onPress={onLogout || onNavigateToLogin}
            activeOpacity={0.75}
          >
            <Text style={styles.navPillIcon}>↪</Text>
            <Text style={styles.navPillText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Scrollable Area */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title & Subtitle Section */}
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>
            {userName ? (
              <>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                {'\n'}
                <Text style={styles.userNameText}>{userName}!</Text>
              </>
            ) : (
              <Text style={styles.welcomeText}>Welcome to Ulavan Santhai!</Text>
            )}
          </Text>

          <Text style={styles.pageSubtitle}>
            Switch between your Buyer and Seller workspaces anytime, or complete
            your tailored profile to start trading with zero middleman margin.
          </Text>

          {/* Role Pill placed BELOW the subtitle */}
          <View style={styles.stepBadge}>
            <View style={styles.stepBadgeDot} />
            <Text style={styles.stepBadgeText}>
              CHOOSE YOUR MARKETPLACE ROLE
            </Text>
          </View>
        </View>

        {/* 2 Large Image Cards Stack: Buyer and Seller */}
        <View style={styles.cardsContainer}>
          {cards.map((card) => (
            <View key={card.role} style={styles.cardWrapper}>
              <TouchableOpacity
                style={styles.card}
                onPress={() => handleSelectRole(card.role)}
                activeOpacity={0.92}
              >
                {/* Large Image Header with Gradient Overlay */}
                <View style={styles.imageHeader}>
                  <Image
                    source={card.image}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                  <View style={styles.imageOverlayGradient} />
                  <View style={styles.imageCaption}>
                    <Text style={styles.cardCategoryBadge}>{card.badge}</Text>
                    <Text style={styles.cardMainTitle}>{card.title}</Text>
                  </View>
                </View>

                {/* Content Body */}
                <View style={styles.cardBody}>
                  <Text style={styles.cardTagline}>{card.tagline}</Text>

                  {/* Benefits List */}
                  <View style={styles.benefitsContainer}>
                    {card.benefits.map((benefit, idx) => (
                      <View key={idx} style={styles.benefitRow}>
                        <View style={styles.benefitCheckCircle}>
                          <Text style={styles.benefitCheckIcon}>✓</Text>
                        </View>
                        <Text style={styles.benefitText}>{benefit}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Action Button */}
                  <View style={styles.actionSection}>
                    <TouchableOpacity
                      style={[styles.primaryActionBtn, { backgroundColor: card.buttonBg }]}
                      onPress={() => handleSelectRole(card.role)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.primaryActionBtnText}>
                        {card.buttonText}
                      </Text>
                      <Text style={styles.primaryActionArrow}>→</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5EB', // Warm organic parchment
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    width: 145,
    height: 44,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0E3',
    borderWidth: 1,
    borderColor: 'rgba(114, 155, 89, 0.45)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  navPillIcon: {
    fontSize: 14,
    color: '#174B35',
    fontWeight: '800',
  },
  navPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#174B35',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 48,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  pageTitle: {
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#174B35',
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  userNameText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#174B35',
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  pageSubtitle: {
    fontSize: 14.5,
    lineHeight: 22,
    color: '#4B5563',
    textAlign: 'center',
    maxWidth: 380,
    marginBottom: 18,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0E3',
    borderWidth: 1,
    borderColor: 'rgba(114, 155, 89, 0.35)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    gap: 8,
  },
  stepBadgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#729B59',
  },
  stepBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#174B35',
    letterSpacing: 0.8,
  },
  cardsContainer: {
    paddingHorizontal: 8,
    gap: 22,
  },
  cardWrapper: {
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#103e20',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  imageHeader: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E7EB',
    position: 'relative',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  imageCaption: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
  },
  cardCategoryBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A7F3D0', // emerald-200
    letterSpacing: 1.2,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  cardMainTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  cardBody: {
    padding: 20,
  },
  cardTagline: {
    fontSize: 13.5,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  benefitsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
    marginBottom: 18,
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E8F0E3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  benefitCheckIcon: {
    fontSize: 12,
    fontWeight: '900',
    color: '#174B35',
  },
  benefitText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    lineHeight: 19,
  },
  actionSection: {
    paddingTop: 4,
  },
  primaryActionBtn: {
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#174B35',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  primaryActionBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
    marginRight: 8,
  },
  primaryActionArrow: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
