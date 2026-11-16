import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import Colors from '../theme/colors';

const { width } = Dimensions.get('window');

export default function LandingScreen({ onNavigateToLogin, onNavigateToRegister }) {
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Mobile Navbar matching ReferenceNavbar */}
      <View style={styles.navbar}>
        <View style={styles.navBrand}>
          <Image
            source={require('../../assets/images/ulavan-santhai-emblem.png')}
            style={styles.navLogo}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.brandTitle}>ULAVAN SANTHAI</Text>
            <Text style={styles.brandSubtitle}>உழவன் சந்தை</Text>
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
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO SECTION matching frontend ReferenceContent Hero */}
        <View style={styles.heroSection}>
          <View style={styles.heroImageContainer}>
            <Image
              source={require('../../assets/images/hero-aerial-fields.jpg')}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.heroOverlay} />
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>
                🌱 Rooted in Agriculture • Connected through Opportunity
              </Text>
            </View>
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              Good things grow{'\n'}
              <Text style={styles.heroHighlight}>from the right connection.</Text>
            </Text>

            <Text style={styles.heroLead}>
              From the field to your business or home. Discover agricultural products,
              find trusted suppliers, and reach your next buyer directly across Tamil Nadu.
            </Text>

            <View style={styles.heroCtaRow}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={onNavigateToRegister}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Get Started / பதிவு செய்க</Text>
                <Text style={styles.primaryBtnIcon}>→</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={onNavigateToLogin}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryBtnText}>Sign In / உள்நுழைக</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* VALUE PILLARS STRIP */}
        <View style={styles.pillarsContainer}>
          <View style={styles.pillarCard}>
            <Text style={styles.pillarIcon}>🚜</Text>
            <Text style={styles.pillarTitle}>Direct Access</Text>
            <Text style={styles.pillarDesc}>Direct trade between farmers and bulk buyers with zero brokers.</Text>
          </View>

          <View style={styles.pillarCard}>
            <Text style={styles.pillarIcon}>⚖️</Text>
            <Text style={styles.pillarTitle}>Fair Pricing</Text>
            <Text style={styles.pillarDesc}>Transparent mandi prices and maximum value for agricultural produce.</Text>
          </View>

          <View style={styles.pillarCard}>
            <Text style={styles.pillarIcon}>✓</Text>
            <Text style={styles.pillarTitle}>Verified Community</Text>
            <Text style={styles.pillarDesc}>Verified farmer profiles, crop documentation, and authentic buyers.</Text>
          </View>
        </View>

        {/* WHO IT'S FOR SECTION (AudienceSection) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagBadgeText}>WHO IT&apos;S FOR</Text>
            </View>
            <Text style={styles.sectionTitle}>Built for the Whole Agricultural Ecosystem</Text>
            <Text style={styles.sectionSubtitle}>
              Whether you harvest crops, run a wholesale business, or process agricultural goods.
            </Text>
          </View>

          {/* Farmer Card */}
          <View style={styles.audienceCard}>
            <Image
              source={require('../../assets/images/about-farmer-harvest.jpg')}
              style={styles.audienceImg}
              resizeMode="cover"
            />
            <View style={styles.audienceContent}>
              <View style={styles.audienceBadge}>
                <Text style={styles.audienceBadgeText}>FOR PRODUCERS</Text>
              </View>
              <Text style={styles.audienceTitle}>Farmers & Cultivators (விவசாயிகள்)</Text>
              <Text style={styles.audienceDesc}>
                List harvested paddy, fresh coconuts, vegetables, and pulses. Receive inquiries directly from retail and wholesale merchants.
              </Text>
            </View>
          </View>

          {/* Buyer Card */}
          <View style={styles.audienceCard}>
            <View style={styles.audienceContent}>
              <View style={[styles.audienceBadge, { backgroundColor: '#E0F2FE' }]}>
                <Text style={[styles.audienceBadgeText, { color: '#0369A1' }]}>FOR MERCHANTS</Text>
              </View>
              <Text style={styles.audienceTitle}>Buyers & Wholesalers (வணிகர்கள்)</Text>
              <Text style={styles.audienceDesc}>
                Source authentic farm-fresh produce directly from the source. Post bulk procurement requirements and negotiate transparently.
              </Text>
            </View>
          </View>

          {/* Millers / Processors Card */}
          <View style={styles.audienceCard}>
            <View style={styles.audienceContent}>
              <View style={[styles.audienceBadge, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.audienceBadgeText, { color: '#92400E' }]}>FOR AGRO-INDUSTRY</Text>
              </View>
              <Text style={styles.audienceTitle}>Processors & Millers (ஆலைகள்)</Text>
              <Text style={styles.audienceDesc}>
                Steady supply pipelines for modern rice mills, cold-pressed oil extractors, and food packaging manufacturers.
              </Text>
            </View>
          </View>
        </View>

        {/* PRODUCE CATEGORIES SECTION */}
        <View style={styles.categoriesSection}>
          <Text style={styles.categoriesHeader}>Key Produce Categories</Text>
          <Text style={styles.categoriesSub}>Trade fresh agricultural commodities directly</Text>

          <View style={styles.categoriesGrid}>
            <View style={styles.categoryItem}>
              <Text style={styles.categoryIcon}>🌾</Text>
              <Text style={styles.categoryName}>Paddy & Rice</Text>
              <Text style={styles.categoryTamil}>நெல் & அரிசி</Text>
            </View>

            <View style={styles.categoryItem}>
              <Text style={styles.categoryIcon}>🥥</Text>
              <Text style={styles.categoryName}>Coconuts & Oil</Text>
              <Text style={styles.categoryTamil}>தேங்காய் & எண்ணெய்</Text>
            </View>

            <View style={styles.categoryItem}>
              <Text style={styles.categoryIcon}>🫘</Text>
              <Text style={styles.categoryName}>Lentils & Pulses</Text>
              <Text style={styles.categoryTamil}>பருப்பு வகைகள்</Text>
            </View>

            <View style={styles.categoryItem}>
              <Text style={styles.categoryIcon}>🥕</Text>
              <Text style={styles.categoryName}>Fresh Vegetables</Text>
              <Text style={styles.categoryTamil}>இயற்கை காய்கறிகள்</Text>
            </View>
          </View>
        </View>

        {/* HOW IT WORKS SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.tagBadge}>
              <Text style={styles.tagBadgeText}>HOW IT WORKS</Text>
            </View>
            <Text style={styles.sectionTitle}>Simple 3-Step Trade</Text>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>01</Text></View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Create Your Free Profile</Text>
              <Text style={styles.stepDesc}>Register in 2 minutes and verify your email to unlock all features.</Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>02</Text></View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Choose Your Role & List</Text>
              <Text style={styles.stepDesc}>Switch between Farmer (Seller) and Buyer mode anytime with one account.</Text>
            </View>
          </View>

          <View style={styles.stepCard}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>03</Text></View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Connect Directly & Trade</Text>
              <Text style={styles.stepDesc}>Place inquiries, agree on prices, and complete shipments transparently.</Text>
            </View>
          </View>
        </View>

        {/* FINAL CTA SECTION (FinalCTASection) */}
        <View style={styles.ctaBanner}>
          <Text style={styles.ctaTitle}>Start Your Agricultural Journey</Text>
          <Text style={styles.ctaTamil}>இன்றே உழவன் சந்தையில் இணையுங்கள்!</Text>
          <Text style={styles.ctaDesc}>
            Join thousands of Tamil Nadu farmers and verified merchants on the direct digital marketplace.
          </Text>

          <TouchableOpacity
            style={styles.ctaPrimaryBtn}
            onPress={onNavigateToRegister}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaPrimaryBtnText}>Create Free Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ctaSecondaryBtn}
            onPress={onNavigateToLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaSecondaryBtnText}>Already have an account? Sign In →</Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Image
            source={require('../../assets/images/ulavan-santhai-emblem.png')}
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <Text style={styles.footerTitle}>உழவன் சந்தை • ULAVAN SANTHAI</Text>
          <Text style={styles.footerText}>
            Direct digital marketplace connecting agricultural producers and buyers.
          </Text>
          <Text style={styles.footerCopy}>© 2026 Ulavan Santhai. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  navBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navLogo: {
    width: 38,
    height: 38,
  },
  brandTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accentLeaf,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navLoginBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  navLoginText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.textBody,
  },
  navRegisterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  navRegisterText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F5F5EB',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 24,
  },
  heroImageContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16, 75, 50, 0.45)',
  },
  heroBadge: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  heroContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 33,
    letterSpacing: -0.5,
  },
  heroHighlight: {
    color: '#729B59',
    fontStyle: 'italic',
  },
  heroLead: {
    fontSize: 13.5,
    color: Colors.textBody,
    lineHeight: 20,
    marginTop: 10,
    opacity: 0.9,
  },
  heroCtaRow: {
    marginTop: 18,
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  primaryBtnIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  secondaryBtn: {
    backgroundColor: Colors.mintBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C6E59A',
  },
  secondaryBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.primary,
  },
  pillarsContainer: {
    padding: 16,
    gap: 10,
  },
  pillarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8F0E3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  pillarIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  pillarTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  pillarDesc: {
    fontSize: 12.5,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  tagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.mintPill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 8,
  },
  tagBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: Colors.mintText,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  sectionSubtitle: {
    fontSize: 12.5,
    color: Colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  audienceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  audienceImg: {
    width: '100%',
    height: 140,
  },
  audienceContent: {
    padding: 16,
  },
  audienceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
    marginBottom: 8,
  },
  audienceBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
    letterSpacing: 0.5,
  },
  audienceTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: Colors.textBody,
    marginBottom: 6,
  },
  audienceDesc: {
    fontSize: 12.5,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  categoriesSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoriesHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  categoriesSub: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: (width - 50) / 2,
    backgroundColor: Colors.inputBg,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textBody,
    textAlign: 'center',
  },
  categoryTamil: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 2,
    textAlign: 'center',
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#E8F0E3',
  },
  stepNum: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.mintPill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.primary,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textBody,
  },
  stepDesc: {
    fontSize: 11.5,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  ctaBanner: {
    margin: 16,
    backgroundColor: Colors.primary,
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    shadowColor: Colors.primaryDarker,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  ctaTamil: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C6E59A',
    marginTop: 4,
    textAlign: 'center',
  },
  ctaDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 18,
  },
  ctaPrimaryBtn: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 10,
  },
  ctaPrimaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  ctaSecondaryBtn: {
    paddingVertical: 6,
  },
  ctaSecondaryBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  footerLogo: {
    width: 44,
    height: 44,
    marginBottom: 8,
  },
  footerTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  footerCopy: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 12,
  },
});
