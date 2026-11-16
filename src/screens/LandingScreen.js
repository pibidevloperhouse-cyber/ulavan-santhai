import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import Colors from '../theme/colors';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  {
    id: 'vegetables',
    name: 'Vegetables',
    tag: 'Farm Fresh',
    desc: 'Fresh vegetables and harvested farm produce direct from growers.',
    icon: '🥕',
    image: require('../../assets/images/photographs/vegetables.jpg'),
  },
  {
    id: 'fruits',
    name: 'Fruits',
    tag: 'Orchard Harvest',
    desc: 'Seasonal and tropical fruits harvested at peak freshness.',
    icon: '🥭',
    image: null,
  },
  {
    id: 'grains',
    name: 'Grains & Paddy',
    tag: 'Cereal Harvest',
    desc: 'Paddy, Ponni raw rice, wheat, millets, and grains.',
    icon: '🌾',
    image: null,
  },
  {
    id: 'spices',
    name: 'Spices',
    tag: 'Aromatic Produce',
    desc: 'Authentic South Indian aromatic spices, turmeric, and pepper.',
    icon: '🌶️',
    image: null,
  },
  {
    id: 'pulses',
    name: 'Pulses & Dal',
    tag: 'Protein Crops',
    desc: 'Toor dal, moong dal, lentils, and beans from farms.',
    icon: '🌱',
    image: require('../../assets/images/photographs/lentils.jpg'),
  },
  {
    id: 'other',
    name: 'Coconut & Cash Crops',
    tag: 'Plantation Crops',
    desc: 'Tender coconut, copra, oil seeds, and natural produce.',
    icon: '🥥',
    image: require('../../assets/images/photographs/coconuts.jpg'),
  },
];

const JOURNEYS = {
  buyer: [
    {
      step: '01',
      title: 'Create your account',
      subtitle: 'Sign up with your name, mobile number, and email. Quick 6-digit OTP verification.',
      caption: 'Start with one account',
    },
    {
      step: '02',
      title: 'Set up your buyer profile',
      subtitle: 'Choose Individual or Business buyer and specify your commodity needs.',
      caption: 'Tell us what you need',
    },
    {
      step: '03',
      title: 'Find products & suppliers',
      subtitle: 'Explore authentic produce, check seller location, and compare bulk quantities.',
      caption: 'Find the right match',
    },
    {
      step: '04',
      title: 'Send direct enquiry',
      subtitle: 'Contact the farmer or seller directly without any middleman cuts or fees.',
      caption: 'Direct connection',
    },
  ],
  seller: [
    {
      step: '01',
      title: 'Create your account',
      subtitle: 'Sign up with your details. One account can buy, sell, or do both.',
      caption: 'Start with one account',
    },
    {
      step: '02',
      title: 'Set up your seller profile',
      subtitle: 'Select your farming/business category and submit details for quick review.',
      caption: 'Submit for review',
    },
    {
      step: '03',
      title: 'Showcase your harvest',
      subtitle: 'Upload high-resolution photos of your crops, stock quantities, and pricing.',
      caption: 'Help buyers discover you',
    },
    {
      step: '04',
      title: 'Receive buyer enquiries',
      subtitle: 'Get phone calls and inquiries from genuine wholesale mandis and commercial buyers.',
      caption: 'Turn interest into deals',
    },
  ],
};

const FEATURES = [
  {
    num: '01',
    icon: '🌐',
    title: 'One Common Platform',
    desc: 'Brings agricultural producers, suppliers, bulk buyers, and mandis together.',
  },
  {
    num: '02',
    icon: '🔍',
    title: 'Discover Products & Suppliers',
    desc: 'Explore authentic agricultural categories with direct farmer contact details.',
  },
  {
    num: '03',
    icon: '👥',
    title: 'Dual Buyer & Seller Accounts',
    desc: 'One seamless account allows you to sell harvests and procure raw materials.',
  },
  {
    num: '04',
    icon: '🛡️',
    title: 'Verified Profile Process',
    desc: 'Structured onboarding reviews protect farmers and buyers from fraud.',
  },
  {
    num: '05',
    icon: '🤝',
    title: 'Direct Business Connections',
    desc: 'Zero commission, zero middlemen. Real trade partnerships across Tamil Nadu.',
  },
];

export default function LandingScreen({ onNavigateToLogin, onNavigateToRegister }) {
  const [activeRole, setActiveRole] = useState('buyer');

  return (
    <View style={styles.container}>
      {/* Top Fixed Brand Navbar */}
      <View style={styles.navbar}>
        <View style={styles.brandRow}>
          <Image
            source={require('../../assets/images/ulavan-santhai-emblem.png')}
            style={styles.navLogo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.navBrandText}>உழவன் சந்தை</Text>
            <Text style={styles.navBrandSub}>ULAVAN SANTHAI</Text>
          </View>
        </View>

        <View style={styles.navActions}>
          <TouchableOpacity
            style={styles.navLoginBtn}
            onPress={onNavigateToLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.navLoginText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navRegisterBtn}
            onPress={onNavigateToRegister}
            activeOpacity={0.85}
          >
            <Text style={styles.navRegisterText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO SECTION */}
        <ImageBackground
          source={require('../../assets/images/hero-aerial-fields.jpg')}
          style={styles.heroBackground}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay}>
            <View style={styles.eyebrowBadge}>
              <Text style={styles.eyebrowText}>
                🌱 Rooted in agriculture. Connected through opportunity.
              </Text>
            </View>

            <Text style={styles.heroTitle}>
              Good things grow{'\n'}
              <Text style={styles.heroTitleItalic}>from the right connection.</Text>
            </Text>

            <Text style={styles.heroTamilSubtitle}>
              விவசாயிகள் மற்றும் வணிகர்களுக்கான நேரடி வேளாண் சந்தை
            </Text>

            <Text style={styles.heroLead}>
              From the field to your business or home. Discover agricultural products,
              find suppliers, and reach your next buyer directly without middlemen.
            </Text>

            {/* CTAs */}
            <View style={styles.heroButtonRow}>
              <TouchableOpacity
                style={styles.heroPrimaryBtn}
                onPress={onNavigateToRegister}
                activeOpacity={0.85}
              >
                <Text style={styles.heroPrimaryBtnText}>Start Selling / Sign Up →</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.heroSecondaryBtn}
                onPress={onNavigateToLogin}
                activeOpacity={0.85}
              >
                <Text style={styles.heroSecondaryBtnText}>Sign In to Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>

        {/* SECTION: SOIL STORY (3-STEP JOURNEY) */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionEyebrow}>ABOVE THE SOIL. BEYOND THE FIELD.</Text>
            <Text style={styles.sectionTitle}>One harvest. Many possibilities.</Text>
            <Text style={styles.sectionSubtitle}>
              Every connection carries the farmer’s effort further.
            </Text>
          </View>

          <View style={styles.cardsColumn}>
            <View style={styles.storyCard}>
              <View style={styles.stepNumBadge}>
                <Text style={styles.stepNumText}>01 / SEED & GROW</Text>
              </View>
              <Text style={styles.cardTitle}>It starts in the soil.</Text>
              <Text style={styles.cardDesc}>
                Farmers grow the produce that feeds homes and businesses with care and dedication.
              </Text>
            </View>

            <View style={[styles.storyCard, styles.storyCardGreen]}>
              <View style={[styles.stepNumBadge, styles.stepNumBadgeLight]}>
                <Text style={styles.stepNumTextGreen}>02 / HARVEST & VALUE</Text>
              </View>
              <Text style={[styles.cardTitle, styles.cardTitleGreen]}>
                A harvest finds new value.
              </Text>
              <Text style={[styles.cardDesc, styles.cardDescGreen]}>
                Sell fresh produce or source raw ingredients wholesale to process and create value.
              </Text>
            </View>

            <View style={styles.storyCard}>
              <View style={styles.stepNumBadge}>
                <Text style={styles.stepNumText}>03 / DIRECT CONNECT</Text>
              </View>
              <Text style={styles.cardTitle}>Find the right people.</Text>
              <Text style={styles.cardDesc}>
                Buyers discover verified products. Sellers receive direct inquiries. One account does both.
              </Text>
            </View>
          </View>
        </View>

        {/* SECTION: ABOUT SECTION */}
        <View style={[styles.sectionContainer, styles.aboutBg]}>
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionEyebrow}>COMMUNITY PLATFORM</Text>
            <Text style={styles.sectionTitle}>
              Bringing the Agricultural{'\n'}
              <Text style={{ color: Colors.accentLeaf }}>Community Together</Text>
            </Text>
            <Text style={styles.sectionSubtitle}>
              We bridge the gap between rural farming heartlands and commercial buyers,
              eliminating intermediaries and establishing direct, transparent trade.
            </Text>
          </View>

          <View style={styles.aboutPillarsGrid}>
            <View style={styles.pillarCard}>
              <View style={styles.pillarIconBox}>
                <Text style={styles.pillarEmoji}>🌍</Text>
              </View>
              <Text style={styles.pillarTitle}>Direct Access</Text>
              <Text style={styles.pillarDesc}>
                Connect directly with primary producers, local aggregators, and commercial buyers.
              </Text>
            </View>

            <View style={[styles.pillarCard, styles.pillarCardGreen]}>
              <View style={[styles.pillarIconBox, styles.pillarIconBoxLight]}>
                <Text style={styles.pillarEmoji}>🤝</Text>
              </View>
              <Text style={[styles.pillarTitle, { color: Colors.white }]}>
                Community Driven
              </Text>
              <Text style={[styles.pillarDesc, { color: '#E2F3D9' }]}>
                Designed to support producers and business buyers across Tamil Nadu.
              </Text>
            </View>
          </View>
        </View>

        {/* SECTION: AGRICULTURAL CATEGORIES */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionEyebrow}>PRODUCE CATALOG</Text>
            <Text style={styles.sectionTitle}>Explore Agricultural Categories</Text>
            <Text style={styles.sectionSubtitle}>
              Discover a wide variety of agricultural produce, all in one marketplace.
            </Text>
          </View>

          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCard}
                onPress={onNavigateToRegister}
                activeOpacity={0.88}
              >
                {cat.image ? (
                  <ImageBackground
                    source={cat.image}
                    style={styles.categoryImageBg}
                    resizeMode="cover"
                  >
                    <View style={styles.categoryImageOverlay}>
                      <View style={styles.catBadge}>
                        <Text style={styles.catBadgeText}>{cat.tag}</Text>
                      </View>
                    </View>
                  </ImageBackground>
                ) : (
                  <View style={styles.categoryIconHeader}>
                    <Text style={styles.catHeaderEmoji}>{cat.icon}</Text>
                    <View style={styles.catBadge}>
                      <Text style={styles.catBadgeText}>{cat.tag}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.categoryBody}>
                  <View style={styles.catTitleRow}>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                    <Text style={styles.catArrow}>→</Text>
                  </View>
                  <Text style={styles.categoryDesc}>{cat.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* SECTION: WHO IT'S FOR (AUDIENCE) */}
        <View style={[styles.sectionContainer, styles.audienceBg]}>
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionEyebrow}>WHO IT&apos;S FOR</Text>
            <Text style={styles.sectionTitle}>Built for the Agriculture Community</Text>
            <Text style={styles.sectionSubtitle}>
              Empowering everyone in the agricultural supply chain across Tamil Nadu.
            </Text>
          </View>

          <View style={styles.audienceGrid}>
            <View style={styles.audienceCard}>
              <Text style={styles.audienceIcon}>🚜</Text>
              <Text style={styles.audienceCardTitle}>Farmers & Producers</Text>
              <Text style={styles.audienceTamil}>விவசாயிகள்</Text>
              <Text style={styles.audienceCardDesc}>
                List harvested paddy, coconuts, spices, and fresh vegetables directly to wholesale buyers.
              </Text>
            </View>

            <View style={styles.audienceCard}>
              <Text style={styles.audienceIcon}>🏪</Text>
              <Text style={styles.audienceCardTitle}>Buyers & Mandis</Text>
              <Text style={styles.audienceTamil}>மொத்த வணிகர்கள்</Text>
              <Text style={styles.audienceCardDesc}>
                Source authentic, farm-fresh produce in bulk quantities with transparent pricing.
              </Text>
            </View>

            <View style={styles.audienceCard}>
              <Text style={styles.audienceIcon}>🏭</Text>
              <Text style={styles.audienceCardTitle}>Mills & Processors</Text>
              <Text style={styles.audienceTamil}>உற்பத்தியாளர்கள்</Text>
              <Text style={styles.audienceCardDesc}>
                Direct procurement for oil mills, rice mills, and food manufacturing units.
              </Text>
            </View>
          </View>
        </View>

        {/* SECTION: HOW IT WORKS */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionEyebrow}>SIMPLE STEPS</Text>
            <Text style={styles.sectionTitle}>How Ulavan Santhai Works</Text>
            <Text style={styles.sectionSubtitle}>
              Looking to buy or ready to sell? See your next steps.
            </Text>
          </View>

          {/* Role Switcher Pill */}
          <View style={styles.roleTabContainer}>
            <TouchableOpacity
              style={[
                styles.roleTabBtn,
                activeRole === 'buyer' && styles.roleTabBtnActive,
              ]}
              onPress={() => setActiveRole('buyer')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.roleTabText,
                  activeRole === 'buyer' && styles.roleTabTextActive,
                ]}
              >
                🛒 I want to buy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleTabBtn,
                activeRole === 'seller' && styles.roleTabBtnActive,
              ]}
              onPress={() => setActiveRole('seller')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.roleTabText,
                  activeRole === 'seller' && styles.roleTabTextActive,
                ]}
              >
                🌾 I want to sell
              </Text>
            </TouchableOpacity>
          </View>

          {/* Steps Timeline Cards */}
          <View style={styles.stepsWrap}>
            {JOURNEYS[activeRole].map((j, idx) => (
              <View key={idx} style={styles.stepItemCard}>
                <View style={styles.stepItemHeader}>
                  <View style={styles.stepCircle}>
                    <Text style={styles.stepCircleText}>{j.step}</Text>
                  </View>
                  <Text style={styles.stepBadgeCaption}>{j.caption}</Text>
                </View>
                <Text style={styles.stepItemTitle}>{j.title}</Text>
                <Text style={styles.stepItemSubtitle}>{j.subtitle}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* SECTION: WHY CHOOSE US */}
        <View style={[styles.sectionContainer, styles.whyBg]}>
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionEyebrow}>WHY ULAVAN SANTHAI</Text>
            <Text style={styles.sectionTitle}>
              Bringing Agriculture{'\n'}
              <Text style={{ color: Colors.accentLeaf }}>Closer to Opportunity</Text>
            </Text>
            <Text style={styles.sectionSubtitle}>
              A dedicated marketplace engineered for Tamil Nadu agriculture.
            </Text>
          </View>

          <View style={styles.featuresList}>
            {FEATURES.map((f) => (
              <View key={f.num} style={styles.featureRow}>
                <View style={styles.featureIconBox}>
                  <Text style={styles.featureEmoji}>{f.icon}</Text>
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* SECTION: CLEAR TRANSPARENT PLANS */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionEyebrow}>TRANSPARENT PRICING</Text>
            <Text style={styles.sectionTitle}>Clear plans. A simple start.</Text>
            <Text style={styles.sectionSubtitle}>
              Choose the access that fits your business journey.
            </Text>
          </View>

          <View style={styles.plansColumn}>
            {/* Buyer Plan */}
            <View style={styles.planCard}>
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>BUYER ACCESS</Text>
              </View>
              <Text style={styles.planPrice}>
                ₹365 <Text style={styles.planPeriod}>/ year</Text>
              </Text>
              <Text style={styles.planDesc}>
                Find verified produce and connect directly with genuine agricultural suppliers.
              </Text>
              <View style={styles.planPerks}>
                <Text style={styles.perkLine}>✓ Access to 10 verified sellers</Text>
                <Text style={styles.perkLine}>✓ Discover wholesale farm produce</Text>
                <Text style={styles.perkLine}>✓ Send direct enquiries with phone details</Text>
                <Text style={styles.perkLine}>✓ ₹10 to unlock additional 10 sellers</Text>
              </View>
              <TouchableOpacity
                style={styles.planBtn}
                onPress={onNavigateToRegister}
                activeOpacity={0.85}
              >
                <Text style={styles.planBtnText}>Join as a Buyer →</Text>
              </TouchableOpacity>
            </View>

            {/* Seller Plan */}
            <View style={[styles.planCard, styles.planCardSeller]}>
              <View style={[styles.planBadge, styles.planBadgeSeller]}>
                <Text style={[styles.planBadgeText, { color: Colors.white }]}>
                  SELLER PLAN
                </Text>
              </View>
              <Text style={[styles.planPrice, { color: Colors.white }]}>
                ₹365 <Text style={[styles.planPeriod, { color: '#D4EFC3' }]}>/ month</Text>
              </Text>
              <Text style={[styles.planDesc, { color: '#E2F3D9' }]}>
                Showcase your crops and reach verified commercial buyers across Tamil Nadu.
              </Text>
              <View style={styles.planPerks}>
                <Text style={[styles.perkLine, { color: Colors.white }]}>
                  ✓ Create verified seller business profile
                </Text>
                <Text style={[styles.perkLine, { color: Colors.white }]}>
                  ✓ Submit agricultural products for listing
                </Text>
                <Text style={[styles.perkLine, { color: Colors.white }]}>
                  ✓ Receive incoming buyer inquiries & calls
                </Text>
                <Text style={[styles.perkLine, { color: Colors.white }]}>
                  ✓ Admin review ensures listing authenticity
                </Text>
              </View>
              <TouchableOpacity
                style={styles.planBtnSeller}
                onPress={onNavigateToRegister}
                activeOpacity={0.85}
              >
                <Text style={styles.planBtnSellerText}>Join as a Seller →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* SECTION: FINAL CALL TO ACTION */}
        <View style={styles.ctaContainer}>
          <View style={styles.ctaCard}>
            <Text style={styles.ctaEyebrow}>🌾 JOIN THE NETWORK</Text>
            <Text style={styles.ctaTitle}>
              Ready to grow your agricultural connections?
            </Text>
            <Text style={styles.ctaSubtitle}>
              Sign up today and be part of Tamil Nadu’s dedicated farmer-buyer marketplace.
            </Text>

            <View style={styles.ctaButtons}>
              <TouchableOpacity
                style={styles.ctaPrimaryBtn}
                onPress={onNavigateToRegister}
                activeOpacity={0.85}
              >
                <Text style={styles.ctaPrimaryText}>Create an Account →</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.ctaSecondaryBtn}
                onPress={onNavigateToLogin}
                activeOpacity={0.85}
              >
                <Text style={styles.ctaSecondaryText}>Sign In to Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 உழவன் சந்தை (Ulavan Santhai). All rights reserved.
          </Text>
          <Text style={styles.footerSubText}>
            Direct Agricultural Marketplace • Empowering Farmers & Buyers
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    zIndex: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navLogo: {
    width: 38,
    height: 38,
    marginRight: 10,
  },
  navBrandText: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  navBrandSub: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Colors.accentLeaf,
    letterSpacing: 0.8,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navLoginBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  navLoginText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  navRegisterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: Colors.primary,
  },
  navRegisterText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
  },

  /* HERO */
  heroBackground: {
    width: '100%',
    minHeight: 460,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 58, 41, 0.82)',
    paddingHorizontal: 20,
    paddingVertical: 36,
    justifyContent: 'center',
  },
  eyebrowBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(224, 248, 207, 0.25)',
    borderWidth: 1,
    borderColor: Colors.accentLeafBorder,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 16,
  },
  eyebrowText: {
    color: Colors.mintPill,
    fontSize: 11.5,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.white,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  heroTitleItalic: {
    fontStyle: 'italic',
    color: '#D4EFC3',
  },
  heroTamilSubtitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#AFD657',
    marginTop: 10,
    lineHeight: 22,
  },
  heroLead: {
    fontSize: 13.5,
    color: '#E2E8F0',
    marginTop: 12,
    lineHeight: 21,
    maxWidth: 380,
  },
  heroButtonRow: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 26,
  },
  heroPrimaryBtn: {
    backgroundColor: '#20BB56',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  heroPrimaryBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  heroSecondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: 'center',
  },
  heroSecondaryBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },

  /* SECTION WRAPPERS */
  sectionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  sectionHeaderWrap: {
    marginBottom: 20,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.accentLeaf,
    letterSpacing: 1,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },

  /* SOIL STORY */
  cardsColumn: {
    gap: 14,
  },
  storyCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  storyCardGreen: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  stepNumBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.mintBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  stepNumBadgeLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepNumText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: Colors.mintText,
    letterSpacing: 0.5,
  },
  stepNumTextGreen: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#E8F0E3',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textBody,
    marginBottom: 6,
  },
  cardTitleGreen: {
    color: Colors.white,
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 19,
  },
  cardDescGreen: {
    color: '#D4EFC3',
  },

  /* ABOUT SECTION */
  aboutBg: {
    backgroundColor: '#F5F7F3',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.cardBorder,
  },
  aboutPillarsGrid: {
    gap: 14,
  },
  pillarCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  pillarCardGreen: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  pillarIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.mintBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  pillarIconBoxLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  pillarEmoji: {
    fontSize: 22,
  },
  pillarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  pillarDesc: {
    fontSize: 12.5,
    color: Colors.textMuted,
    lineHeight: 18,
  },

  /* CATEGORIES */
  categoryGrid: {
    gap: 14,
  },
  categoryCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryImageBg: {
    width: '100%',
    height: 120,
  },
  categoryImageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 10,
    justifyContent: 'flex-start',
  },
  categoryIconHeader: {
    backgroundColor: '#F0F6EE',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catHeaderEmoji: {
    fontSize: 32,
  },
  catBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
  },
  categoryBody: {
    padding: 14,
  },
  catTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  catArrow: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.accentLeaf,
  },
  categoryDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
    lineHeight: 17,
  },

  /* AUDIENCE */
  audienceBg: {
    backgroundColor: '#EEF3EA',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.cardBorder,
  },
  audienceGrid: {
    gap: 14,
  },
  audienceCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  audienceIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  audienceCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  audienceTamil: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accentLeaf,
    marginBottom: 6,
  },
  audienceCardDesc: {
    fontSize: 12.5,
    color: Colors.textMuted,
    lineHeight: 18,
  },

  /* HOW IT WORKS */
  roleTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E7EFE3',
    borderRadius: 14,
    padding: 4,
    marginBottom: 18,
    gap: 6,
  },
  roleTabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  roleTabBtnActive: {
    backgroundColor: Colors.primary,
  },
  roleTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  roleTabTextActive: {
    color: Colors.white,
  },
  stepsWrap: {
    gap: 12,
  },
  stepItemCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  stepItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.mintBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleText: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.mintText,
  },
  stepBadgeCaption: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Colors.accentLeaf,
  },
  stepItemTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  stepItemSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
  },

  /* WHY CHOOSE US */
  whyBg: {
    backgroundColor: '#F5F5EB',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.cardBorder,
  },
  featuresList: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 16,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  featureIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.mintBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureEmoji: {
    fontSize: 18,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  featureDesc: {
    fontSize: 11.5,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },

  /* PLANS */
  plansColumn: {
    gap: 16,
  },
  planCard: {
    backgroundColor: Colors.white,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  planCardSeller: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
  },
  planBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.mintBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  planBadgeSeller: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.mintText,
    letterSpacing: 0.8,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  planPeriod: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  planDesc: {
    fontSize: 12.5,
    color: Colors.textMuted,
    marginTop: 6,
    marginBottom: 14,
    lineHeight: 18,
  },
  planPerks: {
    gap: 8,
    marginBottom: 18,
  },
  perkLine: {
    fontSize: 12,
    color: Colors.textBody,
    fontWeight: '600',
  },
  planBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  planBtnText: {
    color: Colors.white,
    fontSize: 13.5,
    fontWeight: '800',
  },
  planBtnSeller: {
    backgroundColor: '#20BB56',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  planBtnSellerText: {
    color: Colors.white,
    fontSize: 13.5,
    fontWeight: '800',
  },

  /* CTA */
  ctaContainer: {
    padding: 20,
  },
  ctaCard: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 6,
  },
  ctaEyebrow: {
    color: Colors.accentLeafMint,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 13,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    maxWidth: 320,
  },
  ctaButtons: {
    width: '100%',
    gap: 10,
  },
  ctaPrimaryBtn: {
    backgroundColor: '#20BB56',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  ctaPrimaryText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  ctaSecondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  ctaSecondaryText: {
    color: Colors.white,
    fontSize: 13.5,
    fontWeight: '700',
  },

  /* FOOTER */
  footer: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    backgroundColor: Colors.white,
  },
  footerText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: Colors.textMuted,
    textAlign: 'center',
  },
  footerSubText: {
    fontSize: 10.5,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
});
