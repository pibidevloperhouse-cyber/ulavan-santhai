import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import Colors from '../theme/colors';
import { fetchLiveUser, getSessionCache } from '../services/authService';

/**
 * Ulavan Santhai - Get Started / Marketplace Role Selection Screen
 * Mobile Adaptation of frontend `app/get-started/page.js`
 *
 * Preserves 100% of the content, role options, badges, benefit lists,
 * and live onboarding validation from the frontend web application.
 */
export default function GetStartedScreen({
  user: initialUser = null,
  token = null,
  onNavigateToLanding,
  onNavigateToLogin,
  onNavigateToRegister,
  onSelectRole,
  onNavigateToOnboarding,
}) {
  const [liveUser, setLiveUser] = useState(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for verified badge active indicator
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.35,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

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

  // Flags derived with live database priority (matches frontend logic)
  const isSellerOnboarded = liveUser
    ? Boolean(liveUser.sellerOnboarded)
    : Boolean(sessionUser?.sellerOnboarded || sessionUser?.sellerPaid);

  const isBuyerOnboarded = liveUser
    ? Boolean(liveUser.buyerOnboarded)
    : Boolean(sessionUser?.buyerOnboarded || sessionUser?.buyerPaid);

  // Role Selection Redirection Handler (matches frontend handleSelectRole)
  const handleSelectRole = (role, isEdit = false) => {
    try {
      const activeSessionUser = sessionUser || {};
      const roleCapitalized = role === 'buyer' ? 'Buyer' : 'Seller';
      activeSessionUser.activeRole = role;
      activeSessionUser.role = roleCapitalized;

      if (role === 'seller') {
        if (isSellerOnboarded && !isEdit) {
          if (onSelectRole) {
            onSelectRole('seller');
          }
        } else {
          if (onNavigateToOnboarding) {
            onNavigateToOnboarding('seller', 1);
          } else if (onNavigateToRegister) {
            onNavigateToRegister('SELLER');
          } else if (onSelectRole) {
            onSelectRole('seller');
          }
        }
        return;
      }

      if (role === 'buyer') {
        if (isBuyerOnboarded && !isEdit) {
          if (onSelectRole) {
            onSelectRole('buyer');
          }
        } else {
          if (onNavigateToOnboarding) {
            onNavigateToOnboarding('buyer', 1);
          } else if (onNavigateToRegister) {
            onNavigateToRegister('BUYER');
          } else if (onSelectRole) {
            onSelectRole('buyer');
          }
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
        'Find verified agricultural products.',
        'Discover direct farm producers.',
        'Connect directly with suppliers.',
      ],
      isOnboarded: isBuyerOnboarded,
      popularBadge: isBuyerOnboarded ? 'Active Plan' : 'Step 1 to 4 Required',
      buttonText: isBuyerOnboarded ? 'Open Buyer Workspace' : 'Complete Buyer Form (4 Steps)',
      buttonBg: Colors.primary,
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
        'Showcase your agricultural crops & harvest.',
        'Connect directly with bulk verified buyers.',
        'Receive direct farm-gate payments.',
      ],
      isOnboarded: isSellerOnboarded,
      popularBadge: isSellerOnboarded ? 'Active Plan' : 'Step 1 to 4 Required',
      buttonText: isSellerOnboarded ? 'Open Seller Workspace' : 'Complete Seller Form (4 Steps)',
      buttonBg: Colors.primary,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Brand Bar */}
      <View style={styles.header}>
        {/* Logo with 2x sharp emblem */}
        <TouchableOpacity
          style={styles.brandRow}
          onPress={onNavigateToLanding}
          activeOpacity={0.8}
        >
          <View style={styles.emblemContainer}>
            <Image
              source={require('../../assets/images/ulavan-santhai-emblem.png')}
              style={styles.emblemImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.brandInfo}>
            <Text style={styles.brandTitle}>Ulavan Santhai</Text>
            <Text style={styles.brandSubtitle}>AGRICULTURAL MARKETPLACE</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Links / Auth Status */}
        <View style={styles.headerRight}>
          {userName ? (
            <View style={styles.userSignedPill}>
              <Animated.View
                style={[styles.pulseDot, { opacity: pulseAnim }]}
              />
              <Text style={styles.userSignedText} numberOfLines={1}>
                Signed in: <Text style={styles.userSignedBold}>{userName}</Text>
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={onNavigateToLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.signInBtnText}>Sign In</Text>
            </TouchableOpacity>
          )}
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
          <View style={styles.stepBadge}>
            <View style={styles.stepBadgeDot} />
            <Text style={styles.stepBadgeText}>
              STEP 2: CHOOSE YOUR MARKETPLACE ROLE
            </Text>
          </View>

          <Text style={styles.pageTitle}>
            {userName ? `Welcome back, ${userName}!` : 'Choose Your Marketplace Role'}
          </Text>

          <Text style={styles.pageSubtitle}>
            Switch between your Buyer and Seller workspaces anytime, or complete
            your tailored profile to start trading with zero middleman margin.
          </Text>
        </View>

        {/* Cards Grid / Stack: Buyer and Seller */}
        <View style={styles.cardsContainer}>
          {cards.map((card) => (
            <View key={card.role} style={styles.cardWrapper}>
              <TouchableOpacity
                style={styles.card}
                onPress={() => handleSelectRole(card.role)}
                activeOpacity={0.92}
              >
                {/* Active Plan / Status Badge */}
                {card.isOnboarded ? (
                  <View style={styles.badgeTopRight}>
                    <View style={styles.verifiedActiveBadge}>
                      <Animated.View
                        style={[styles.verifiedPulseDot, { opacity: pulseAnim }]}
                      />
                      <Text style={styles.verifiedBadgeText}>
                        Verified Plan Active
                      </Text>
                    </View>
                  </View>
                ) : card.popularBadge ? (
                  <View style={styles.badgeTopRight}>
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularBadgeText}>
                        {card.popularBadge}
                      </Text>
                    </View>
                  </View>
                ) : null}

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

                  {/* Action Buttons */}
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

                    {card.isOnboarded && (
                      <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => handleSelectRole(card.role, true)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.editBtnText}>
                          Edit {card.title} Details / Re-fill Form
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Bottom Navigation Helper */}
        <View style={styles.bottomHelperRow}>
          <TouchableOpacity
            style={styles.backHomeBtn}
            onPress={onNavigateToLanding}
            activeOpacity={0.75}
          >
            <Text style={styles.backHomeBtnText}>← Back to Home / Landing</Text>
          </TouchableOpacity>
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
    flex: 1,
  },
  emblemContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F5F5EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 10,
    overflow: 'hidden',
  },
  emblemImage: {
    width: 38,
    height: 38,
  },
  brandInfo: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#174B35',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#729B59',
    letterSpacing: 0.8,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userSignedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    maxWidth: 160,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  userSignedText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '600',
  },
  userSignedBold: {
    color: '#174B35',
    fontWeight: '800',
  },
  signInBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(23, 75, 53, 0.35)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#FFFFFF',
  },
  signInBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
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
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0E3',
    borderWidth: 1,
    borderColor: 'rgba(114, 155, 89, 0.35)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
  },
  stepBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#729B59',
    marginRight: 6,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#174B35',
    letterSpacing: 0.6,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#174B35',
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: 32,
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#4B5563',
    textAlign: 'center',
    maxWidth: 380,
  },
  cardsContainer: {
    gap: 20,
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
  badgeTopRight: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 20,
  },
  verifiedActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  verifiedPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  verifiedBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  popularBadge: {
    backgroundColor: '#174B35',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
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
    fontSize: 10.5,
    fontWeight: '800',
    color: '#A7F3D0', // emerald-200
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  cardMainTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  cardBody: {
    padding: 18,
  },
  cardTagline: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
    marginBottom: 14,
  },
  benefitsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 14,
    marginBottom: 16,
    gap: 10,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E8F0E3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  benefitCheckIcon: {
    fontSize: 11,
    fontWeight: '900',
    color: '#174B35',
  },
  benefitText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    lineHeight: 18,
  },
  actionSection: {
    paddingTop: 4,
    gap: 8,
  },
  primaryActionBtn: {
    height: 50,
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
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginRight: 8,
  },
  primaryActionArrow: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  editBtn: {
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  bottomHelperRow: {
    marginTop: 28,
    alignItems: 'center',
  },
  backHomeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  backHomeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#174B35',
  },
});
