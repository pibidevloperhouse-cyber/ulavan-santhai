import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function AboutSection({ onNavigateToRegister }) {
  return (
    <View style={styles.container}>
      {/* Heading & Subtitles */}
      <View style={styles.header}>
        <Text style={styles.heading}>
          Bringing the Agricultural{'\n'}
          <Text style={styles.headingAccent}>Community Together</Text>
        </Text>

        <Text style={styles.lead}>
          Ulavan Santhai is designed to connect agricultural producers and
          businesses through one common marketplace. Whether you grow, supply,
          process or purchase agricultural products, the platform helps you
          discover relevant business connections.
        </Text>

        <Text style={styles.subLead}>
          We bridge the gap between rural farming heartlands and commercial buyers,
          eliminating intermediaries and establishing direct, transparent trade
          partnerships.
        </Text>
      </View>

      {/* 2 Feature Highlights: Direct Access & Documented Trust */}
      <View style={styles.pillarsGrid}>
        {/* Card 1: Direct Access */}
        <View style={[styles.pillarCard, styles.pillarWhite]}>
          <View style={styles.pillarIconWrapper}>
            <Text style={styles.pillarIconText}>🌐</Text>
          </View>
          <Text style={styles.pillarTitle}>Direct Access</Text>
          <Text style={styles.pillarDescription}>
            Connect directly with primary producers, local aggregators and commercial
            buyers.
          </Text>
        </View>

        {/* Card 2: Documented Trust */}
        <View style={[styles.pillarCard, styles.pillarGreen]}>
          <View style={styles.pillarIconWrapper}>
            <Text style={styles.pillarIconText}>🛡️</Text>
          </View>
          <Text style={styles.pillarTitle}>Documented Trust</Text>
          <Text style={styles.pillarDescription}>
            Structured onboarding review and business verification for secure
            partnerships.
          </Text>
        </View>
      </View>

      {/* Learn how to participate link */}
      <TouchableOpacity
        style={styles.learnMoreLink}
        onPress={() => onNavigateToRegister()}
        activeOpacity={0.75}
      >
        <Text style={styles.learnMoreText}>
          Learn how to participate in the marketplace →
        </Text>
      </TouchableOpacity>

      {/* Photography Composition */}
      <View style={styles.photoComposition}>
        {/* Main Image */}
        <View style={styles.mainImageWrapper}>
          <Image
            source={require('../../../assets/images/photographs/paddy-planting-supplied.png')}
            style={styles.mainImage}
            resizeMode="cover"
          />
        </View>

        {/* Overlapping Secondary Image */}
        <View style={styles.secondaryImageWrapper}>
          <Image
            source={require('../../../assets/images/photographs/paddy-threshing-supplied.png')}
            style={styles.secondaryImage}
            resizeMode="cover"
          />
        </View>

        {/* Floating Verified Network Badge */}
        <View style={styles.trustBadge}>
          <View style={styles.trustCheckCircle}>
            <Text style={styles.trustCheckText}>✓</Text>
          </View>
          <View>
            <Text style={styles.trustBadgeTitle}>Verified Network</Text>
            <Text style={styles.trustBadgeSub}>Connecting Producers & Buyers</Text>
          </View>
        </View>
      </View>
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
    marginBottom: 24,
  },
  heading: {
    fontSize: 30,
    fontWeight: '900',
    color: '#174B35',
    lineHeight: 38,
    letterSpacing: -0.6,
    marginBottom: 16,
  },
  headingAccent: {
    color: '#729B59',
  },
  lead: {
    fontSize: 17,
    lineHeight: 26,
    color: '#263329',
    marginBottom: 12,
  },
  subLead: {
    fontSize: 15,
    lineHeight: 23,
    color: '#5C6B5E',
  },
  pillarsGrid: {
    gap: 18,
    marginBottom: 28,
  },
  pillarCard: {
    padding: 26,
    borderRadius: 24,
    borderWidth: 2,
  },
  pillarWhite: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E8F0E3',
  },
  pillarGreen: {
    backgroundColor: '#D0F447',
    borderColor: '#C1E83C',
  },
  pillarIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#E8F0E3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pillarIconText: {
    fontSize: 28,
  },
  pillarTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#174B35',
    marginBottom: 8,
  },
  pillarDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
  },
  learnMoreLink: {
    marginBottom: 28,
  },
  learnMoreText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#174B35',
  },
  photoComposition: {
    position: 'relative',
    paddingBottom: 32,
  },
  mainImageWrapper: {
    width: '92%',
    height: 270,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#EAEFE6',
    alignSelf: 'flex-start',
    marginLeft: -8,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  secondaryImageWrapper: {
    width: '88%',
    height: 205,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    alignSelf: 'flex-end',
    marginRight: -8,
    marginTop: -55,
    backgroundColor: '#EAEFE6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 5,
  },
  secondaryImage: {
    width: '100%',
    height: '100%',
  },
  trustBadge: {
    position: 'absolute',
    bottom: 0,
    left: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#E8F0E3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  trustCheckCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F0E3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustCheckText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#174B35',
  },
  trustBadgeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#174B35',
  },
  trustBadgeSub: {
    fontSize: 11,
    color: '#68746A',
  },
});
