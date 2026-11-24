import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Colors from '../../theme/colors';

export default function PlansSection({ onNavigateToRegister }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Clear plans. A simple start.</Text>
        <Text style={styles.subheading}>
          Choose the access that fits your journey.
        </Text>
      </View>

      {/* Plan Cards */}
      <View style={styles.plansStack}>
        {/* Plan 1: Buyer Access */}
        <View style={[styles.planCard, styles.buyerCard]}>
          <View style={styles.planTop}>
            <View style={[styles.planIconWrapper, styles.buyerIconBg]}>
              <Text style={styles.planIconText}>🛒</Text>
            </View>
            <Text style={styles.planTitle}>Buyer access</Text>
          </View>

          <Text style={styles.planDesc}>
            Find produce and connect with agricultural suppliers.
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceSymbol}>₹</Text>
            <Text style={styles.priceValue}>365</Text>
          </View>

          {/* Benefits */}
          <View style={styles.benefitsList}>
            <View style={styles.benefitRow}>
              <View style={[styles.checkCircle, styles.buyerCheck]}>
                <Text style={styles.checkText}>✓</Text>
              </View>
              <Text style={styles.benefitText}>Access to 10 sellers</Text>
            </View>

            <View style={styles.benefitRow}>
              <View style={[styles.checkCircle, styles.buyerCheck]}>
                <Text style={styles.checkText}>✓</Text>
              </View>
              <Text style={styles.benefitText}>
                Discover agricultural products
              </Text>
            </View>

            <View style={styles.benefitRow}>
              <View style={[styles.checkCircle, styles.buyerCheck]}>
                <Text style={styles.checkText}>✓</Text>
              </View>
              <Text style={styles.benefitText}>
                Send enquiries directly to sellers
              </Text>
            </View>
          </View>

          {/* Extra Box */}
          <View style={[styles.extraBox, styles.buyerExtra]}>
            <Text style={styles.extraTitle}>Need more connections?</Text>
            <Text style={styles.extraDesc}>
              ₹10 adds access to another 10 sellers.
            </Text>
          </View>

          {/* Action CTA */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onNavigateToRegister('BUYER')}
            activeOpacity={0.85}
          >
            <Text style={styles.actionBtnText}>Join as a buyer ↗</Text>
          </TouchableOpacity>
        </View>

        {/* Plan 2: Seller Plan */}
        <View style={[styles.planCard, styles.sellerCard]}>
          <View style={styles.planTop}>
            <View style={[styles.planIconWrapper, styles.sellerIconBg]}>
              <Text style={styles.planIconText}>🌱</Text>
            </View>
            <Text style={styles.planTitle}>Seller plan</Text>
          </View>

          <Text style={[styles.planDesc, styles.sellerDesc]}>
            Showcase your products and reach interested buyers.
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceSymbol}>₹</Text>
            <Text style={styles.priceValue}>365</Text>
            <Text style={styles.pricePeriod}>/ month</Text>
          </View>

          {/* Benefits */}
          <View style={styles.benefitsList}>
            <View style={styles.benefitRow}>
              <View style={[styles.checkCircle, styles.sellerCheck]}>
                <Text style={styles.sellerCheckText}>✓</Text>
              </View>
              <Text style={[styles.benefitText, styles.sellerBenefitText]}>
                Create your seller profile
              </Text>
            </View>

            <View style={styles.benefitRow}>
              <View style={[styles.checkCircle, styles.sellerCheck]}>
                <Text style={styles.sellerCheckText}>✓</Text>
              </View>
              <Text style={[styles.benefitText, styles.sellerBenefitText]}>
                Submit products for approval
              </Text>
            </View>

            <View style={styles.benefitRow}>
              <View style={[styles.checkCircle, styles.sellerCheck]}>
                <Text style={styles.sellerCheckText}>✓</Text>
              </View>
              <Text style={[styles.benefitText, styles.sellerBenefitText]}>
                Be discovered by potential buyers
              </Text>
            </View>
          </View>

          {/* Extra Box */}
          <View style={[styles.extraBox, styles.sellerExtra]}>
            <Text style={styles.extraTitle}>Ready to showcase your produce?</Text>
            <Text style={styles.extraDesc}>
              Seller profiles and product listings are reviewed before going live.
            </Text>
          </View>

          {/* Action CTA */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onNavigateToRegister('SELLER')}
            activeOpacity={0.85}
          >
            <Text style={styles.actionBtnText}>Join as a seller ↗</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Note below */}
      <Text style={styles.plansNote}>
        Payment is reviewed by an administrator before access is activated.
        Seller profiles and product listings require additional approval. The
        platform connects buyers and sellers through discovery and enquiries.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5EB',
    paddingHorizontal: 20,
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8DE',
  },
  header: {
    marginBottom: 28,
    alignItems: 'center',
    textAlign: 'center',
  },
  heading: {
    fontSize: 30,
    fontWeight: '900',
    color: '#174B35',
    lineHeight: 38,
    letterSpacing: -0.6,
    textAlign: 'center',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    lineHeight: 24,
    color: '#68746A',
    textAlign: 'center',
  },
  plansStack: {
    gap: 24,
    marginBottom: 24,
  },
  planCard: {
    padding: 26,
    borderRadius: 26,
    borderWidth: 1.5,
    shadowColor: '#174B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  buyerCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DAE1D2',
  },
  sellerCard: {
    backgroundColor: '#D0F447',
    borderColor: '#C4E83C',
  },
  planTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  planIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyerIconBg: {
    backgroundColor: '#EDF3E7',
  },
  sellerIconBg: {
    backgroundColor: '#174B35',
  },
  planIconText: {
    fontSize: 24,
  },
  planTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#174B35',
    letterSpacing: -0.5,
  },
  planDesc: {
    fontSize: 15,
    lineHeight: 22,
    color: '#526456',
    marginBottom: 18,
  },
  sellerDesc: {
    color: '#294A28',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 18,
  },
  priceSymbol: {
    fontSize: 32,
    fontWeight: '800',
    color: '#174B35',
    marginRight: 4,
  },
  priceValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#174B35',
    letterSpacing: -1.5,
  },
  pricePeriod: {
    fontSize: 16,
    fontWeight: '700',
    color: '#174B35',
    marginLeft: 8,
  },
  benefitsList: {
    gap: 14,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(23, 75, 53, 0.16)',
    paddingTop: 18,
    marginBottom: 18,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyerCheck: {
    backgroundColor: '#EAF1E2',
  },
  sellerCheck: {
    backgroundColor: '#174B35',
  },
  checkText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#174B35',
  },
  sellerCheckText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D0F447',
  },
  benefitText: {
    fontSize: 15,
    color: '#263329',
    flex: 1,
    lineHeight: 21,
  },
  sellerBenefitText: {
    color: '#15220D',
  },
  extraBox: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  buyerExtra: {
    backgroundColor: '#F3F6EF',
  },
  sellerExtra: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  extraTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#174B35',
    marginBottom: 4,
  },
  extraDesc: {
    fontSize: 13,
    color: '#526456',
    lineHeight: 18,
  },
  actionBtn: {
    backgroundColor: '#174B35',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  plansNote: {
    fontSize: 12.5,
    lineHeight: 20,
    color: '#68746A',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
});
