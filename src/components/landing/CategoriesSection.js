import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const CATEGORIES = [
  {
    id: 'vegetables',
    name: 'Vegetables',
    description: 'Fresh vegetables and farm produce.',
    image: require('../../../assets/images/photographs/vegetables.jpg'),
    categoryTag: 'Farm Fresh',
    isToneGreen: false,
  },
  {
    id: 'fruits',
    name: 'Fruits',
    description: 'Seasonal and tropical fruits.',
    image: {
      uri: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=1000&q=80',
    },
    categoryTag: 'Orchard Harvest',
    isToneGreen: true,
  },
  {
    id: 'grains',
    name: 'Grains',
    description: 'Rice, wheat, millets and more.',
    image: {
      uri: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=1000&q=80',
    },
    categoryTag: 'Cereal Harvest',
    isToneGreen: false,
  },
  {
    id: 'spices',
    name: 'Spices',
    description: 'A variety of aromatic spices.',
    image: {
      uri: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1000&q=80',
    },
    categoryTag: 'Aromatic Produce',
    isToneGreen: true,
  },
  {
    id: 'pulses',
    name: 'Pulses',
    description: 'Lentils, beans and legumes.',
    image: require('../../../assets/images/photographs/lentils.jpg'),
    categoryTag: 'Protein Crops',
    isToneGreen: false,
  },
  {
    id: 'other',
    name: 'Other Produce',
    description: 'Explore more agricultural products.',
    image: require('../../../assets/images/photographs/coconuts.jpg'),
    categoryTag: 'Plantation & Cash',
    isToneGreen: true,
  },
];

export default function CategoriesSection({ onNavigateToRegister }) {
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>Explore Agricultural Categories</Text>
        <Text style={styles.subheading}>
          Discover a wide variety of agricultural produce, all in one marketplace.
        </Text>
      </View>

      {/* Categories Grid (stacked cards on mobile) */}
      <View style={styles.cardsStack}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.card}
            onPress={() => onNavigateToRegister()}
            activeOpacity={0.88}
          >
            {/* Image Preview with Tag */}
            <View style={styles.imageWrapper}>
              <Image
                source={cat.image}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.tagBadge}>
                <Text style={styles.tagBadgeText}>{cat.categoryTag}</Text>
              </View>
            </View>

            {/* Content Body */}
            <View
              style={[
                styles.cardBody,
                cat.isToneGreen ? styles.toneGreen : styles.toneWhite,
              ]}
            >
              <View style={styles.titleRow}>
                <Text style={styles.catName}>{cat.name}</Text>
                <View style={styles.arrowIconWrapper}>
                  <Text style={styles.arrowIconText}>↗</Text>
                </View>
              </View>

              <Text style={styles.catDescription}>{cat.description}</Text>

              {/* Bottom explore footer */}
              <View style={styles.cardFooter}>
                <Text style={styles.footerLabel}>Browse Listings</Text>
                <Text style={styles.footerAction}>Explore →</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEFE8',
  },
  header: {
    marginBottom: 28,
  },
  heading: {
    fontSize: 30,
    fontWeight: '900',
    color: '#174B35',
    lineHeight: 38,
    letterSpacing: -0.6,
    marginBottom: 10,
  },
  subheading: {
    fontSize: 16,
    lineHeight: 24,
    color: '#68746A',
  },
  cardsStack: {
    gap: 22,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E8F0E3',
    backgroundColor: '#FFFFFF',
    shadowColor: '#174B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  imageWrapper: {
    width: '100%',
    height: 245,
    position: 'relative',
    backgroundColor: '#F3F6EF',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  tagBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.68)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tagBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  cardBody: {
    padding: 20,
  },
  toneWhite: {
    backgroundColor: '#FAFAF7',
  },
  toneGreen: {
    backgroundColor: '#D0F447',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  catName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#174B35',
  },
  arrowIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#174B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowIconText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  catDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(23, 75, 53, 0.14)',
    paddingTop: 12,
  },
  footerLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#174B35',
  },
  footerAction: {
    fontSize: 14,
    fontWeight: '800',
    color: '#174B35',
  },
});
