import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const AUDIENCE_CARDS = [
  {
    number: '01',
    categoryBadge: 'Producers & FPOs',
    title: 'Farmers & Sellers',
    description:
      'For farmers, growers and producer groups who want to introduce their harvest to interested buyers.',
    details: [
      'Create a seller profile and submit verification details',
      'Add product photos, quantities and listing information',
      'Approved listings can receive buyer enquiries',
    ],
    image: require('../../../assets/images/photographs/farmer-full-supplied.png'),
    actionText: 'Connect as Seller',
    role: 'SELLER',
    hasEmbeddedCaption: false,
    isLimeGreen: false,
  },
  {
    number: '02',
    categoryBadge: 'Commercial Buyers',
    title: 'Buyers & Traders',
    description:
      'For individual buyers, retailers and traders looking for produce and dependable supplier connections.',
    details: [
      'Browse agricultural categories after access approval',
      'Review supplier profiles and product information',
      'Ask sellers about quantity, quality and availability',
    ],
    image: require('../../../assets/images/photographs/commercial-buyers-supplied.png'),
    actionText: 'Connect as Buyer',
    role: 'BUYER',
    hasEmbeddedCaption: false,
    isLimeGreen: true,
  },
  {
    number: '03',
    categoryBadge: 'Agro Industries',
    title: 'Manufacturers & Processors',
    description:
      'For food processors and manufacturers sourcing produce or ingredients for their operations.',
    details: [
      'Discover raw materials and agricultural ingredients',
      'Discuss specifications and volumes with suppliers',
      'Add a seller role to showcase your own products',
    ],
    image: require('../../../assets/images/photographs/agro-factory-supplied.png'),
    actionText: 'Explore Sourcing',
    role: 'BUYER',
    hasEmbeddedCaption: true,
    isLimeGreen: false,
  },
  {
    number: '04',
    categoryBadge: 'Bulk Distribution',
    title: 'Wholesalers & Businesses',
    description:
      'For wholesalers, distributors and businesses connecting with agricultural suppliers and customers.',
    details: [
      'Explore produce for wholesale business needs',
      'Contact suppliers about bulk availability',
      'Buy, sell or do both using the same account',
    ],
    image: require('../../../assets/images/photographs/bulk-people-supplied.jpg'),
    actionText: 'Build Relationships',
    role: 'BOTH',
    hasEmbeddedCaption: true,
    isLimeGreen: true,
  },
];

export default function AudienceSection({ onNavigateToRegister }) {
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Connecting Every Part of Agriculture</Text>
        <Text style={styles.subheading}>
          Whether you grow, buy, process or distribute — find your place in the
          marketplace.
        </Text>
      </View>

      {/* Audience Cards Stack */}
      <View style={styles.cardsList}>
        {AUDIENCE_CARDS.map((card) => (
          <View key={card.number} style={styles.cardItem}>
            {/* Top Circular Artwork */}
            <View style={styles.artContainer}>
              <View style={styles.artImageWrapper}>
                <Image
                  source={card.image}
                  style={styles.artImage}
                  resizeMode="contain"
                />
              </View>

              {/* Category Badge Pill under circle (for non-embedded cards) */}
              {!card.hasEmbeddedCaption && (
                <View style={styles.artBadge}>
                  <Text style={styles.artBadgeText}>{card.categoryBadge}</Text>
                </View>
              )}
            </View>

            {/* Speech Bubble Card (img1 & img2 design) */}
            <View
              style={[
                styles.speechBubble,
                card.isLimeGreen ? styles.bubbleLimeGreen : styles.bubbleWhite,
              ]}
            >
              {/* Eyebrow */}
              <Text
                style={[
                  styles.bubbleEyebrow,
                  card.isLimeGreen && styles.bubbleEyebrowGreen,
                ]}
              >
                {card.number} / {card.categoryBadge.toUpperCase()}
              </Text>

              {/* Title */}
              <Text style={styles.bubbleTitle}>{card.title}</Text>

              {/* Description */}
              <Text
                style={[
                  styles.bubbleDesc,
                  card.isLimeGreen && styles.bubbleDescGreen,
                ]}
              >
                {card.description}
              </Text>

              {/* Checklist */}
              <View style={styles.checklist}>
                {card.details.map((detail, idx) => (
                  <View key={idx} style={styles.checkRow}>
                    <Text style={styles.checkIcon}>✓</Text>
                    <Text
                      style={[
                        styles.checkText,
                        card.isLimeGreen && styles.checkTextGreen,
                      ]}
                    >
                      {detail}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Bottom Action Row: Text Link on left + Dark Green Arrow Circle on right */}
              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => onNavigateToRegister(card.role)}
                activeOpacity={0.75}
              >
                <Text style={styles.actionText}>{card.actionText}</Text>
                <View style={styles.arrowCircle}>
                  <Text style={styles.arrowText}>↗</Text>
                </View>
              </TouchableOpacity>

              {/* Speech Bubble Down-Left Tail */}
              <View style={styles.tailOuter} />
              <View
                style={[
                  styles.tailInner,
                  card.isLimeGreen && styles.tailInnerLimeGreen,
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 44,
  },
  header: {
    marginBottom: 32,
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
    marginBottom: 12,
  },
  subheading: {
    fontSize: 16,
    lineHeight: 24,
    color: '#68746A',
    textAlign: 'center',
    maxWidth: 340,
  },
  cardsList: {
    gap: 36,
  },
  cardItem: {
    width: '100%',
    alignItems: 'center',
  },
  artContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  artImageWrapper: {
    width: 275,
    height: 270,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artImage: {
    width: '100%',
    height: '100%',
  },
  artBadge: {
    backgroundColor: '#174B35',
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: -20,
    shadowColor: '#174B35',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  artBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  speechBubble: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#174B35',
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 22,
    marginTop: 6,
    position: 'relative',
    overflow: 'visible',
  },
  bubbleWhite: {
    backgroundColor: '#F8FAF6',
  },
  bubbleLimeGreen: {
    backgroundColor: '#D0F447',
  },
  bubbleEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: '#567544',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  bubbleEyebrowGreen: {
    color: '#174B35',
  },
  bubbleTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#174B35',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  bubbleDesc: {
    fontSize: 15,
    lineHeight: 23,
    color: '#4E5F52',
    marginBottom: 18,
  },
  bubbleDescGreen: {
    color: '#213B29',
  },
  checklist: {
    gap: 12,
    marginBottom: 26,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkIcon: {
    fontSize: 16,
    fontWeight: '900',
    color: '#174B35',
    marginRight: 10,
    marginTop: 0,
  },
  checkText: {
    fontSize: 14.5,
    lineHeight: 21,
    color: '#2C3A30',
    flex: 1,
  },
  checkTextGreen: {
    color: '#183320',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#174B35',
  },
  arrowCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#174B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tailOuter: {
    position: 'absolute',
    bottom: -20,
    left: 28,
    width: 0,
    height: 0,
    borderTopWidth: 20,
    borderRightWidth: 16,
    borderTopColor: '#174B35',
    borderRightColor: 'transparent',
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  tailInner: {
    position: 'absolute',
    bottom: -16.5,
    left: 30,
    width: 0,
    height: 0,
    borderTopWidth: 17,
    borderRightWidth: 13,
    borderTopColor: '#F8FAF6',
    borderRightColor: 'transparent',
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  tailInnerLimeGreen: {
    borderTopColor: '#D0F447',
  },
});
