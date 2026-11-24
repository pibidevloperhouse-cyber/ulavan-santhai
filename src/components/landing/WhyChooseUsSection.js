import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';

const FEATURES = [
  {
    number: '01',
    title: 'One Common Platform',
    description:
      'Bring agricultural producers, suppliers, buyers and businesses together.',
    icon: '🌐',
    isToneGreen: false,
  },
  {
    number: '02',
    title: 'Discover Products & Suppliers',
    description:
      'Explore agricultural categories and find relevant suppliers.',
    icon: '🔍',
    isToneGreen: true,
  },
  {
    number: '03',
    title: 'Buyer & Seller Accounts',
    description:
      'Register as a buyer, seller or both based on your business needs.',
    icon: '👥',
    isToneGreen: false,
  },
  {
    number: '04',
    title: 'Seller Profile Review',
    description:
      'A structured profile review process supports seller onboarding.',
    icon: '🛡️',
    isToneGreen: true,
  },
  {
    number: '05',
    title: 'Business Connections',
    description:
      'Find relevant agricultural businesses and build new connections.',
    icon: '🤝',
    isToneGreen: false,
  },
];

export default function WhyChooseUsSection() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>
          Bringing Agriculture{'\n'}
          <Text style={styles.headingAccent}>Closer to Opportunity</Text>
        </Text>

        <Text style={styles.subheading}>
          A common marketplace designed to connect agricultural producers,
          suppliers and businesses.
        </Text>
      </View>

      {/* Featured Photograph */}
      <View style={styles.photoContainer}>
        <View style={styles.photoBackdropGlow} />
        <View style={styles.imageCard}>
          <Image
            source={require('../../../assets/images/photographs/coconut-harvest-supplied.png')}
            style={styles.featureImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
          <View style={styles.photoCaptionBox}>
            <Text style={styles.photoCaptionKicker}>
              AGRICULTURE • TRUST • GROWTH
            </Text>
            <Text style={styles.photoCaptionTitle}>
              Connecting Farmers &amp; Bulk Buyers Nationwide
            </Text>
          </View>
        </View>
      </View>

      {/* 5 Feature Cards Styled Like AboutSection (img3) */}
      <View style={styles.featuresList}>
        {FEATURES.map((item) => (
          <View
            key={item.number}
            style={[
              styles.featureCard,
              item.isToneGreen ? styles.toneGreen : styles.toneWhite,
            ]}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>{item.icon}</Text>
            </View>

            <Text style={styles.featureTitle}>
              <Text style={styles.featureNum}>{item.number}  </Text>
              {item.title}
            </Text>
            <Text style={styles.featureDesc}>{item.description}</Text>
          </View>
        ))}
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
    marginBottom: 12,
  },
  headingAccent: {
    color: '#729B59',
  },
  subheading: {
    fontSize: 16,
    lineHeight: 24,
    color: '#3C4D41',
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 28,
  },
  photoBackdropGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 28,
    backgroundColor: 'rgba(114, 155, 89, 0.25)',
  },
  imageCard: {
    borderRadius: 24,
    overflow: 'hidden',
    height: 330,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  featureImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16, 58, 41, 0.35)',
  },
  photoCaptionBox: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  photoCaptionKicker: {
    fontSize: 11,
    fontWeight: '800',
    color: '#729B59',
    letterSpacing: 1,
    marginBottom: 3,
  },
  photoCaptionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#174B35',
  },
  featuresList: {
    gap: 14,
  },
  featureCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  toneWhite: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E8F0E3',
  },
  toneGreen: {
    backgroundColor: '#D0F447',
    borderColor: '#C1E83C',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#E8F0E3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconEmoji: {
    fontSize: 22,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#174B35',
    marginBottom: 6,
  },
  featureNum: {
    fontSize: 16,
    fontWeight: '800',
    color: '#729B59',
  },
  featureDesc: {
    fontSize: 14,
    lineHeight: 21,
    color: '#4B5563',
  },
});
