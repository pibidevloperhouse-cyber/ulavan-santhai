import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function HeroSection({
  onScrollToJourney,
  onNavigateToRegister,
  onNavigateToPlans,
  onNavigateToGetStarted,
}) {
  return (
    <View style={styles.container}>
      {/* Grass Visual Background Area */}
      <View style={styles.heroTop}>
        <View style={styles.imageBackdrop}>
          <Image
            source={require('../../../assets/images/reference-home/original-1.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlayGradient} />
        </View>

        {/* Hero Intro Typography & CTAs */}
        <View style={styles.introContent}>
          <View style={styles.eyebrowRow}>
            <Text style={styles.eyebrowText}>
              Rooted in agriculture.{'\n'}Connected through opportunity.
            </Text>
            <View style={styles.eyebrowUnderline} />
          </View>

          <Text style={styles.headingTitle}>
            Good things grow{'\n'}
            <Text style={styles.headingHighlight}>from the right connection.</Text>
          </Text>

          <Text style={styles.leadText}>
            From the field to your business or home. Discover agricultural products,
            find suppliers, and reach your next buyer.
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => onNavigateToRegister('BUYER')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Find what you need ↗</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => onNavigateToRegister('SELLER')}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryBtnText}>Get Started ↗</Text>
            </TouchableOpacity>
          </View>

          {/* Follow the journey anchor */}
          <TouchableOpacity
            style={styles.journeyLink}
            onPress={onScrollToJourney}
            activeOpacity={0.7}
          >
            <Text style={styles.journeyLinkText}>Follow the journey </Text>
            <View style={styles.journeyArrowCircle}>
              <Text style={styles.journeyArrowText}>↓</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Soil Story (Underground / Roots) Section */}
      <View style={styles.soilSection}>
        <View style={styles.soilHeader}>
          <View style={styles.soilEyebrowRow}>
            <View style={styles.soilEyebrowDash} />
            <Text style={styles.soilEyebrowText}>
              Above the soil. Beyond the field.
            </Text>
          </View>

          <Text style={styles.soilHeading}>
            One harvest.{'\n'}Many possibilities.
          </Text>

          <Text style={styles.soilSubtext}>
            Every connection carries the farmer’s effort further.
          </Text>
        </View>

        {/* 3 Step Story Cards */}
        <View style={styles.soilStepsContainer}>
          <View style={styles.soilStepCard}>
            <Text style={styles.stepNumber}>01 / SEED & GROW</Text>
            <Text style={styles.stepTitle}>It starts in the soil.</Text>
            <Text style={styles.stepDescription}>
              Farmers grow the produce that feeds homes and businesses.
            </Text>
          </View>

          <View style={styles.soilStepCard}>
            <Text style={styles.stepNumber}>02 / HARVEST & CREATE</Text>
            <Text style={styles.stepTitle}>A harvest finds new value.</Text>
            <Text style={styles.stepDescription}>
              Sell fresh produce or source ingredients to process and make something more.
            </Text>
          </View>

          <View style={styles.soilStepCard}>
            <Text style={styles.stepNumber}>03 / CONNECT</Text>
            <Text style={styles.stepTitle}>Find the right people.</Text>
            <Text style={styles.stepDescription}>
              Buyers discover products. Sellers receive enquiries. One account can do both.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#24180F',
  },
  heroTop: {
    position: 'relative',
    backgroundColor: '#24180F',
    minHeight: screenHeight - 68,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  imageBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlayGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  introContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
    alignItems: 'center',
    textAlign: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  eyebrowRow: {
    transform: [{ translateY: -20 }],
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  eyebrowUnderline: {
    width: 22,
    height: 2,
    backgroundColor: '#D6A437',
  },
  eyebrowText: {
    textAlign: 'center',
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '800',
    color: '#1B5E20',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  headingTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#1B5E20',
    textAlign: 'center',
    letterSpacing: -1,
    lineHeight: 46,
    marginBottom: 16,
  },
  headingHighlight: {
    color: '#063D22',
    fontStyle: 'italic',
  },
  leadText: {
    fontSize: 17,
    lineHeight: 26,
    color: '#263329',
    textAlign: 'center',
    maxWidth: 390,
    marginBottom: 28,
  },
  actionsContainer: {
    flexDirection: 'column',
    width: '100%',
    maxWidth: 340,
    gap: 14,
  },
  primaryBtn: {
    backgroundColor: '#1B5E20',
    paddingVertical: 16,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1B5E20',
    paddingVertical: 16,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: '#1B5E20',
    fontSize: 17,
    fontWeight: '800',
  },
  journeyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 26,
    paddingVertical: 8,
  },
  journeyLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  journeyArrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  journeyArrowText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  soilSection: {
    backgroundColor: '#24180F',
    paddingHorizontal: 20,
    paddingTop: 42,
    paddingBottom: 46,
  },
  soilHeader: {
    marginBottom: 28,
  },
  soilEyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  soilEyebrowDash: {
    width: 20,
    height: 2,
    backgroundColor: '#B9965D',
  },
  soilEyebrowText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D4B681',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  soilHeading: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF4DF',
    lineHeight: 38,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  soilSubtext: {
    fontSize: 15,
    color: '#D6C8AF',
    lineHeight: 23,
  },
  soilStepsContainer: {
    gap: 20,
  },
  soilStepCard: {
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(188, 156, 108, 0.5)',
    paddingTop: 18,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DBC193',
    letterSpacing: 1,
    marginBottom: 6,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF3DF',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 15,
    lineHeight: 23,
    color: '#E2D7C3',
  },
});
