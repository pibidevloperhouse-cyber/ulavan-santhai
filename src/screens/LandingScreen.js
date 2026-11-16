import React, { useState, useRef } from 'react';
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

const { width } = Dimensions.get('window');

// 1. Audience Cards (Exactly from frontend:components/landing/AudienceSection.js)
const AUDIENCE_CARDS = [
  {
    number: '01',
    badge: 'Producers & FPOs',
    title: 'Farmers & Sellers',
    description: 'For farmers, growers and producer groups who want to introduce their harvest to interested buyers.',
    details: [
      'Create a seller profile and submit verification details',
      'Add product photos, quantities and listing information',
      'Approved listings can receive buyer enquiries',
    ],
    actionText: 'Connect as Seller ↗',
    image: require('../../assets/images/photographs/farmer-full-supplied.png'),
  },
  {
    number: '02',
    badge: 'Commercial Buyers',
    title: 'Buyers & Traders',
    description: 'For individual buyers, retailers and traders looking for produce and dependable supplier connections.',
    details: [
      'Browse agricultural categories after access approval',
      'Review supplier profiles and product information',
      'Ask sellers about quantity, quality and availability',
    ],
    actionText: 'Connect as Buyer ↗',
    image: require('../../assets/images/photographs/commercial-buyers-supplied.png'),
  },
  {
    number: '03',
    badge: 'Agro Industries',
    title: 'Manufacturers & Processors',
    description: 'For food processors and manufacturers sourcing produce or ingredients for their operations.',
    details: [
      'Discover raw materials and agricultural ingredients',
      'Discuss specifications and volumes with suppliers',
      'Add a seller role to showcase your own products',
    ],
    actionText: 'Explore Sourcing ↗',
    image: require('../../assets/images/photographs/agro-factory-supplied.png'),
  },
  {
    number: '04',
    badge: 'Bulk Distribution',
    title: 'Wholesalers & Businesses',
    description: 'For wholesalers, distributors and businesses connecting with agricultural suppliers and customers.',
    details: [
      'Explore produce for wholesale business needs',
      'Contact suppliers about bulk availability',
      'Buy, sell or do both using the same account',
    ],
    actionText: 'Build Relationships ↗',
    image: require('../../assets/images/photographs/bulk-people-supplied.jpg'),
  },
];

// 2. How It Works (Exactly from frontend:components/landing/HowItWorksSection.js)
const JOURNEYS = {
  buyer: [
    {
      step: '1',
      tabLabel: 'Register',
      title: 'Create your account',
      desc: 'Sign up with your name, mobile number and email.',
      caption: 'Start with one account',
      items: ['Name & contact details', 'Create your password'],
    },
    {
      step: '2',
      tabLabel: 'Profile',
      title: 'Set up your buyer profile',
      desc: 'Choose Individual or Business and fill in the details that apply to you.',
      caption: 'Tell us what you need',
      items: ['Individual or business buyer', 'Submit details for review'],
    },
    {
      step: '3',
      tabLabel: 'Discover',
      title: 'Find products & suppliers',
      desc: 'After access is approved, explore produce and compare seller details and quantities.',
      caption: 'Find the right match',
      items: ['Products • quantities • suppliers', 'Review listing information'],
    },
    {
      step: '4',
      tabLabel: 'Connect',
      title: 'Send an enquiry',
      desc: 'Contact a seller to discuss availability, quantities and your requirements.',
      caption: 'Start a conversation',
      items: ['Ask about availability & quantity', 'Discuss your requirements directly'],
    },
  ],
  seller: [
    {
      step: '1',
      tabLabel: 'Register',
      title: 'Create your account',
      desc: 'Sign up with your name, mobile number and email.',
      caption: 'Start with one account',
      items: ['Name & contact details', 'Create your password'],
    },
    {
      step: '2',
      tabLabel: 'Profile',
      title: 'Set up your seller profile',
      desc: 'Choose your business category and submit your details and verification documents.',
      caption: 'Submit for review',
      items: ['Business category & documents', 'Submit details for review'],
    },
    {
      step: '3',
      tabLabel: 'List products',
      title: 'Showcase your products',
      desc: 'Once your seller profile is approved, submit product details and photos for listing review.',
      caption: 'Help buyers discover you',
      items: ['Photos • quantities • product details', 'Submit your listing for approval'],
    },
    {
      step: '4',
      tabLabel: 'Connect',
      title: 'Receive buyer enquiries',
      desc: 'Interested buyers contact you. Discuss their needs and build business connections.',
      caption: 'Turn interest into connections',
      items: ['Respond to interested buyers', 'Discuss your requirements directly'],
    },
  ],
};

// 3. Categories (Exactly from frontend:components/landing/CategoriesSection.js)
const CATEGORIES = [
  {
    id: 'vegetables',
    name: 'Vegetables',
    description: 'Fresh vegetables and farm produce.',
    tag: 'Farm Fresh',
    image: require('../../assets/images/photographs/vegetables.jpg'),
  },
  {
    id: 'fruits',
    name: 'Fruits',
    description: 'Seasonal and tropical fruits.',
    tag: 'Orchard Harvest',
    icon: '🥭',
  },
  {
    id: 'grains',
    name: 'Grains',
    description: 'Rice, wheat, millets and more.',
    tag: 'Cereal Harvest',
    icon: '🌾',
  },
  {
    id: 'spices',
    name: 'Spices',
    description: 'A variety of aromatic spices.',
    tag: 'Aromatic Produce',
    icon: '🌶️',
  },
  {
    id: 'pulses',
    name: 'Pulses',
    description: 'Lentils, beans and legumes.',
    tag: 'Protein Crops',
    image: require('../../assets/images/photographs/lentils.jpg'),
  },
  {
    id: 'other',
    name: 'Other Produce',
    description: 'Explore more agricultural products.',
    tag: 'Plantation & Cash',
    image: require('../../assets/images/photographs/coconuts.jpg'),
  },
];

// 4. Why Choose Us Features (Exactly from frontend:components/landing/WhyChooseUsSection.js)
const WHY_FEATURES = [
  {
    num: '01',
    icon: '🌐',
    title: 'One Common Platform',
    desc: 'Bring agricultural producers, suppliers, buyers and businesses together.',
  },
  {
    num: '02',
    icon: '🔍',
    title: 'Discover Products & Suppliers',
    desc: 'Explore agricultural categories and find relevant suppliers.',
  },
  {
    num: '03',
    icon: '👥',
    title: 'Buyer & Seller Accounts',
    desc: 'Register as a buyer, seller or both based on your business needs.',
  },
  {
    num: '04',
    icon: '🛡️',
    title: 'Seller Profile Review',
    desc: 'A structured profile review process supports seller onboarding.',
  },
  {
    num: '05',
    icon: '🤝',
    title: 'Business Connections',
    desc: 'Find relevant agricultural businesses and build new connections.',
  },
];

// 5. Plans (Exactly from frontend:components/reference-home/ReferencePlans.js)
const PLANS = [
  {
    type: 'buyer',
    title: 'Buyer access',
    desc: 'Find produce and connect with agricultural suppliers.',
    price: '₹365',
    period: '',
    items: [
      'Access to 10 sellers',
      'Discover agricultural products',
      'Send enquiries directly to sellers',
    ],
    extraTitle: 'Need more connections?',
    extraDesc: '₹10 adds access to another 10 sellers.',
    action: 'Join as a buyer ↗',
  },
  {
    type: 'seller',
    title: 'Seller plan',
    desc: 'Showcase your products and reach interested buyers.',
    price: '₹365',
    period: '/ month',
    items: [
      'Create your seller profile',
      'Submit products for approval',
      'Be discovered by potential buyers',
    ],
    extraTitle: 'Ready to showcase your produce?',
    extraDesc: 'Seller profiles and product listings are reviewed before going live.',
    action: 'Join as a seller ↗',
  },
];

export default function LandingScreen({ onNavigateToLogin, onNavigateToRegister }) {
  const [role, setRole] = useState('buyer');
  const [activeStep, setActiveStep] = useState(0);
  const scrollViewRef = useRef(null);

  return (
    <View style={styles.container}>
      {/* 1. Header / Navbar (Mirrors ReferenceNavbar.js) */}
      <View style={styles.referenceHeader}>
        <View style={styles.referenceNav}>
          <Image
            source={require('../../assets/images/ulavan-mart-animated.gif')}
            style={styles.referenceBrandGif}
            resizeMode="contain"
          />

          <View style={styles.referenceAuth}>
            <TouchableOpacity
              style={styles.referenceLoginBtn}
              onPress={onNavigateToLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.referenceLoginText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.referenceSignUpBtn}
              onPress={onNavigateToRegister}
              activeOpacity={0.85}
            >
              <Text style={styles.referenceSignUpText}>Sign Up ↗</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. ReferenceContent HERO: Grass Visual & Intro (Mirrors ReferenceContent.js) */}
        <View style={styles.heroWrap}>
          {/* Top visual graphic */}
          <Image
            source={require('../../assets/images/reference-home/original-1.png')}
            style={styles.heroGrassVisual}
            resizeMode="cover"
          />

          <View style={styles.grassIntro}>
            <View style={styles.eyebrowRow}>
              <View style={styles.eyebrowDash} />
              <Text style={styles.eyebrowText}>
                Rooted in agriculture. Connected through opportunity.
              </Text>
            </View>

            <Text style={styles.heroH1}>
              Good things grow{'\n'}
              <Text style={styles.heroH1Em}>from the right connection.</Text>
            </Text>

            <Text style={styles.heroLead}>
              From the field to your business or home. Discover agricultural products,
              find suppliers, and reach your next buyer.
            </Text>

            <View style={styles.heroActions}>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={onNavigateToRegister}
                activeOpacity={0.85}
              >
                <Text style={styles.btnPrimaryText}>Find what you need ↗</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={onNavigateToRegister}
                activeOpacity={0.85}
              >
                <Text style={styles.btnSecondaryText}>Start selling ↗</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.grassScroll}>Follow the journey ↓</Text>
          </View>
        </View>

        {/* 3. Soil Story Section (Mirrors .soil-story in ReferenceContent.js) */}
        <View style={styles.soilStory}>
          <View style={styles.soilTitle}>
            <Text style={styles.soilEyebrow}>ABOVE THE SOIL. BEYOND THE FIELD.</Text>
            <Text style={styles.soilH2}>
              One harvest.{'\n'}Many possibilities.
            </Text>
            <Text style={styles.soilSubtitle}>
              Every connection carries the farmer’s effort further.
            </Text>
          </View>

          <View style={styles.soilStepsList}>
            {/* Step 1 */}
            <View style={styles.soilStepItem}>
              <Text style={styles.soilStepNumber}>01 / SEED & GROW</Text>
              <Text style={styles.soilStepH3}>It starts in the soil.</Text>
              <Text style={styles.soilStepP}>
                Farmers grow the produce that feeds homes and businesses.
              </Text>
            </View>

            {/* Step 2 */}
            <View style={styles.soilStepItem}>
              <Text style={styles.soilStepNumber}>02 / HARVEST & CREATE</Text>
              <Text style={styles.soilStepH3}>A harvest finds new value.</Text>
              <Text style={styles.soilStepP}>
                Sell fresh produce or source ingredients to process and make something more.
              </Text>
            </View>

            {/* Step 3 */}
            <View style={styles.soilStepItem}>
              <Text style={styles.soilStepNumber}>03 / CONNECT</Text>
              <Text style={styles.soilStepH3}>Find the right people.</Text>
              <Text style={styles.soilStepP}>
                Buyers discover products. Sellers receive enquiries. One account can do both.
              </Text>
            </View>
          </View>
        </View>

        {/* 4. About Section (Mirrors AboutSection.js) */}
        <View style={styles.aboutSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.greenEyebrow}>COMMUNITY PLATFORM</Text>
            <Text style={styles.sectionHeading}>
              Bringing the Agricultural{'\n'}
              <Text style={{ color: '#729B59' }}>Community Together</Text>
            </Text>
            <Text style={styles.sectionLead}>
              Ulavan Santhai is designed to connect agricultural producers and businesses
              through one common marketplace. Whether you grow, supply, process or purchase
              agricultural products, the platform helps you discover relevant business connections.
            </Text>
            <Text style={styles.sectionSubLead}>
              We bridge the gap between rural farming heartlands and commercial buyers,
              eliminating intermediaries and establishing direct, transparent trade partnerships.
            </Text>
          </View>

          {/* Pillars */}
          <View style={styles.aboutPillars}>
            <View style={[styles.toneCard, styles.toneWhite]}>
              <Text style={styles.pillarIcon}>🌍</Text>
              <Text style={styles.pillarTitle}>Direct Access</Text>
              <Text style={styles.pillarDesc}>
                Connect directly with primary producers, local aggregators and commercial buyers.
              </Text>
            </View>

            <View style={[styles.toneCard, styles.toneGreen]}>
              <Text style={styles.pillarIcon}>🤝</Text>
              <Text style={[styles.pillarTitle, { color: '#174B35' }]}>
                Community Driven
              </Text>
              <Text style={[styles.pillarDesc, { color: '#4D5C53' }]}>
                Designed to support producers and business buyers across Tamil Nadu.
              </Text>
            </View>
          </View>

          {/* Real Photographs */}
          <View style={styles.aboutPhotosWrap}>
            <Image
              source={require('../../assets/images/photographs/paddy-planting-supplied.png')}
              style={styles.aboutPhotoPrimary}
              resizeMode="cover"
            />
            <Image
              source={require('../../assets/images/photographs/paddy-threshing-supplied.png')}
              style={styles.aboutPhotoSecondary}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* 5. Audience Section (Mirrors AudienceSection.js) */}
        <View style={styles.audienceSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeading}>
              Connecting Every Part of Agriculture
            </Text>
            <Text style={styles.sectionLead}>
              Whether you grow, buy, process or distribute — find your place in the marketplace.
            </Text>
          </View>

          <View style={styles.audienceList}>
            {AUDIENCE_CARDS.map((card, idx) => (
              <View
                key={card.number}
                style={[
                  styles.audienceCard,
                  idx % 2 === 1 ? styles.audienceCardAlt : null,
                ]}
              >
                <Image
                  source={card.image}
                  style={styles.audiencePhoto}
                  resizeMode="cover"
                />

                <View style={styles.audienceContent}>
                  <Text style={styles.audienceBadge}>
                    {card.number} / {card.badge}
                  </Text>
                  <Text style={styles.audienceTitle}>{card.title}</Text>
                  <Text style={styles.audienceDesc}>{card.description}</Text>

                  <View style={styles.audienceDetails}>
                    {card.details.map((detail, dIdx) => (
                      <View key={dIdx} style={styles.detailRow}>
                        <Text style={styles.checkIcon}>✓</Text>
                        <Text style={styles.detailText}>{detail}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.audienceBtn}
                    onPress={onNavigateToRegister}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.audienceBtnText}>{card.actionText}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 6. How It Works Section (Mirrors HowItWorksSection.js) */}
        <View style={styles.worksSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeading}>How Ulavan Santhai Works</Text>
            <Text style={styles.sectionLead}>
              Looking to buy or ready to sell? See your next steps.
            </Text>

            {/* Toggle: I want to buy / I want to sell */}
            <View style={styles.worksSwitch}>
              <TouchableOpacity
                style={[
                  styles.worksSwitchBtn,
                  role === 'buyer' && styles.worksSwitchBtnActive,
                ]}
                onPress={() => {
                  setRole('buyer');
                  setActiveStep(0);
                }}
              >
                <Text
                  style={[
                    styles.worksSwitchText,
                    role === 'buyer' && styles.worksSwitchTextActive,
                  ]}
                >
                  I want to buy
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.worksSwitchBtn,
                  role === 'seller' && styles.worksSwitchBtnActive,
                ]}
                onPress={() => {
                  setRole('seller');
                  setActiveStep(0);
                }}
              >
                <Text
                  style={[
                    styles.worksSwitchText,
                    role === 'seller' && styles.worksSwitchTextActive,
                  ]}
                >
                  I want to sell
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.worksAccountNote}>
              One account. You can be a buyer, a seller, or both.
            </Text>
          </View>

          {/* Stepper Tabs */}
          <View style={styles.stepperTabs}>
            {JOURNEYS[role].map((step, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.stepperTab,
                  activeStep === idx && styles.stepperTabActive,
                ]}
                onPress={() => setActiveStep(idx)}
              >
                <View
                  style={[
                    styles.stepperNum,
                    activeStep === idx && styles.stepperNumActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepperNumText,
                      activeStep === idx && styles.stepperNumTextActive,
                    ]}
                  >
                    {idx + 1}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.stepperLabel,
                    activeStep === idx && styles.stepperLabelActive,
                  ]}
                >
                  {step.tabLabel}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Active Step Explainer Card */}
          <View style={styles.stepExplainerCard}>
            <Text style={styles.stepDemoLabel}>
              YOUR {role.toUpperCase()} JOURNEY · {activeStep + 1} OF 4
            </Text>
            <Text style={styles.stepExplainerTitle}>
              {JOURNEYS[role][activeStep].title}
            </Text>
            <Text style={styles.stepExplainerDesc}>
              {JOURNEYS[role][activeStep].desc}
            </Text>

            <View style={styles.stepItemsList}>
              {JOURNEYS[role][activeStep].items.map((item, itemIdx) => (
                <View key={itemIdx} style={styles.stepItemLine}>
                  <Text style={styles.stepCheckmark}>✓</Text>
                  <Text style={styles.stepItemText}>{item}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.stepNextBtn}
              onPress={() => setActiveStep((activeStep + 1) % 4)}
              activeOpacity={0.8}
            >
              <Text style={styles.stepNextBtnText}>
                {activeStep === 3 ? 'See the journey again ↺' : 'See the next step →'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 7. Categories Section (Mirrors CategoriesSection.js) */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeading}>
              Explore Agricultural Categories
            </Text>
            <Text style={styles.sectionLead}>
              Discover a wide variety of agricultural produce, all in one marketplace.
            </Text>
          </View>

          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.catCard}
                onPress={onNavigateToRegister}
                activeOpacity={0.88}
              >
                {cat.image ? (
                  <ImageBackground
                    source={cat.image}
                    style={styles.catImage}
                    resizeMode="cover"
                  >
                    <View style={styles.catTagBadge}>
                      <Text style={styles.catTagText}>{cat.tag}</Text>
                    </View>
                  </ImageBackground>
                ) : (
                  <View style={styles.catIconFallback}>
                    <Text style={styles.catEmoji}>{cat.icon}</Text>
                    <View style={styles.catTagBadge}>
                      <Text style={styles.catTagText}>{cat.tag}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.catBody}>
                  <View style={styles.catTitleRow}>
                    <Text style={styles.catName}>{cat.name}</Text>
                    <Text style={styles.catArrow}>→</Text>
                  </View>
                  <Text style={styles.catDesc}>{cat.description}</Text>

                  <View style={styles.catFooterRow}>
                    <Text style={styles.catBrowse}>Browse Listings</Text>
                    <Text style={styles.catExplore}>Explore →</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 8. Why Choose Us Section (Mirrors WhyChooseUsSection.js) */}
        <View style={styles.whySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeading}>
              Bringing Agriculture <br />
              <Text style={{ color: '#729B59' }}>Closer to Opportunity</Text>
            </Text>
            <Text style={styles.sectionLead}>
              A common marketplace designed to connect agricultural producers, suppliers and businesses.
            </Text>
          </View>

          <View style={styles.whyImageCard}>
            <Image
              source={require('../../assets/images/photographs/coconut-harvest-supplied.png')}
              style={styles.whyImage}
              resizeMode="cover"
            />
            <View style={styles.whyImageCaption}>
              <Text style={styles.whyCaptionTag}>AGRICULTURE • TRUST • GROWTH</Text>
              <Text style={styles.whyCaptionTitle}>
                Connecting Farmers & Bulk Buyers Nationwide
              </Text>
            </View>
          </View>

          <View style={styles.whyFeatures}>
            {WHY_FEATURES.map((feat) => (
              <View key={feat.num} style={styles.whyFeatureCard}>
                <View style={styles.whyIconCircle}>
                  <Text style={styles.whyEmoji}>{feat.icon}</Text>
                </View>
                <View style={styles.whyFeatureTextCol}>
                  <Text style={styles.whyFeatureTitle}>{feat.title}</Text>
                  <Text style={styles.whyFeatureDesc}>{feat.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.whyCtaBtn}
            onPress={onNavigateToRegister}
            activeOpacity={0.85}
          >
            <Text style={styles.whyCtaBtnText}>Create Your Account →</Text>
          </TouchableOpacity>
        </View>

        {/* 9. Plans & Access (Mirrors ReferencePlans.js) */}
        <View style={styles.plansSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeading}>Clear plans. A simple start.</Text>
            <Text style={styles.sectionLead}>
              Choose the access that fits your journey.
            </Text>
          </View>

          <View style={styles.plansGrid}>
            {PLANS.map((plan, pIdx) => (
              <View
                key={plan.title}
                style={[
                  styles.planArticle,
                  pIdx === 1 ? styles.planArticleSeller : null,
                ]}
              >
                <Text style={styles.planTitle}>{plan.title}</Text>
                <Text style={styles.planDesc}>{plan.desc}</Text>

                <View style={styles.planPriceRow}>
                  <Text style={styles.planPriceAmount}>{plan.price}</Text>
                  {plan.period ? (
                    <Text style={styles.planPricePeriod}> {plan.period}</Text>
                  ) : null}
                </View>

                <View style={styles.planBenefitsList}>
                  {plan.items.map((b, bIdx) => (
                    <View key={bIdx} style={styles.benefitRow}>
                      <Text style={styles.benefitCheck}>✓</Text>
                      <Text style={styles.benefitText}>{b}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.planExtraBox}>
                  <Text style={styles.planExtraTitle}>{plan.extraTitle}</Text>
                  <Text style={styles.planExtraDesc}>{plan.extraDesc}</Text>
                </View>

                <TouchableOpacity
                  style={styles.planActionBtn}
                  onPress={onNavigateToRegister}
                  activeOpacity={0.85}
                >
                  <Text style={styles.planActionBtnText}>{plan.action}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <Text style={styles.plansNote}>
            Payment is reviewed by an administrator before access is activated. Seller profiles
            and product listings require additional approval. The platform connects buyers and sellers
            through discovery and enquiries.
          </Text>
        </View>

        {/* 10. Final CTA Section (Mirrors FinalCTASection.js) */}
        <View style={styles.finalCtaWrap}>
          <ImageBackground
            source={require('../../assets/images/harvester-video-poster.jpg')}
            style={styles.finalCtaBg}
            resizeMode="cover"
          >
            <View style={styles.finalCtaOverlay}>
              <Text style={styles.finalCtaHeading}>
                Be Part of a Growing{'\n'}Agricultural Community.
              </Text>

              <Text style={styles.finalCtaSubtitle}>
                Join Ulavan Santhai and create new opportunities through agricultural connections.
              </Text>

              <View style={styles.finalCtaButtons}>
                <TouchableOpacity
                  style={styles.finalCtaJoinBtn}
                  onPress={onNavigateToRegister}
                  activeOpacity={0.85}
                >
                  <Text style={styles.finalCtaJoinText}>Join Now ↗</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.finalCtaLoginBtn}
                  onPress={onNavigateToLogin}
                  activeOpacity={0.85}
                >
                  <Text style={styles.finalCtaLoginText}>Login →</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.finalCtaNote}>
                One account for buying, selling, or both.
              </Text>
            </View>
          </ImageBackground>
        </View>

        {/* 11. Footer (Mirrors MarketplaceFooter.js) */}
        <View style={styles.marketplaceFooter}>
          <Text style={styles.footerBrand}>ULAVAN SANTHAI</Text>
          <Text style={styles.footerLead}>
            One marketplace for growers, suppliers and buyers. Find your next agricultural connection.
          </Text>

          <TouchableOpacity
            style={styles.footerJoinBtn}
            onPress={onNavigateToRegister}
            activeOpacity={0.8}
          >
            <Text style={styles.footerJoinText}>Join the community ↗</Text>
          </TouchableOpacity>

          <View style={styles.footerDivider} />

          <View style={styles.footerBottomRow}>
            <Text style={styles.footerCopyright}>
              © 2026 Ulavan Santhai. All rights reserved.
            </Text>
            <TouchableOpacity
              onPress={() => scrollViewRef.current?.scrollTo({ y: 0, animated: true })}
            >
              <Text style={styles.footerBackToTop}>Back to top ↑</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* NAVBAR */
  referenceHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DCE5DB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    zIndex: 20,
  },
  referenceNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  referenceBrandGif: {
    width: 140,
    height: 38,
  },
  referenceAuth: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  referenceLoginBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#1B5E20',
  },
  referenceLoginText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B5E20',
  },
  referenceSignUpBtn: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  referenceSignUpText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  scrollContent: {
    flexGrow: 1,
  },

  /* HERO (GRASS-HERO) */
  heroWrap: {
    backgroundColor: '#F5FAF4',
  },
  heroGrassVisual: {
    width: '100%',
    height: 260,
  },
  grassIntro: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  eyebrowDash: {
    width: 18,
    height: 2,
    backgroundColor: '#D6A437',
  },
  eyebrowText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#1B5E20',
    textTransform: 'uppercase',
  },
  heroH1: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1B5E20',
    lineHeight: 38,
    letterSpacing: -1,
  },
  heroH1Em: {
    fontWeight: '500',
    fontStyle: 'italic',
    color: '#795548',
  },
  heroLead: {
    fontSize: 14,
    color: '#4D5C53',
    marginTop: 12,
    lineHeight: 21,
  },
  heroActions: {
    flexDirection: 'column',
    gap: 10,
    marginTop: 22,
  },
  btnPrimary: {
    backgroundColor: '#1B5E20',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  btnSecondary: {
    borderWidth: 1.5,
    borderColor: '#1B5E20',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  btnSecondaryText: {
    color: '#1B5E20',
    fontSize: 14,
    fontWeight: '700',
  },
  grassScroll: {
    fontSize: 11.5,
    color: '#1B5E20',
    fontWeight: '700',
    marginTop: 18,
  },

  /* SOIL STORY */
  soilStory: {
    backgroundColor: '#24180F',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  soilTitle: {
    marginBottom: 20,
  },
  soilEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#D8C3A5',
    marginBottom: 6,
  },
  soilH2: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 30,
  },
  soilSubtitle: {
    fontSize: 13,
    color: '#D8C3A5',
    marginTop: 6,
    lineHeight: 18,
  },
  soilStepsList: {
    gap: 14,
    marginTop: 10,
  },
  soilStepItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(216, 195, 165, 0.25)',
  },
  soilStepNumber: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#D6A437',
    marginBottom: 4,
  },
  soilStepH3: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  soilStepP: {
    fontSize: 12.5,
    color: '#D8C3A5',
    lineHeight: 18,
  },

  /* ABOUT SECTION */
  aboutSection: {
    backgroundColor: '#F5F5EB',
    paddingHorizontal: 20,
    paddingVertical: 34,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8E0',
  },
  sectionHeader: {
    marginBottom: 20,
  },
  greenEyebrow: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#174B35',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  sectionHeading: {
    fontSize: 24,
    fontWeight: '900',
    color: '#174B35',
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  sectionLead: {
    fontSize: 14,
    color: '#263329',
    marginTop: 10,
    lineHeight: 21,
  },
  sectionSubLead: {
    fontSize: 12.5,
    color: '#68746A',
    marginTop: 6,
    lineHeight: 18,
  },
  aboutPillars: {
    gap: 12,
    marginTop: 8,
  },
  toneCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8F0E3',
  },
  toneWhite: {
    backgroundColor: '#FFFFFF',
  },
  toneGreen: {
    backgroundColor: '#E8F0E3',
  },
  pillarIcon: {
    fontSize: 22,
    marginBottom: 8,
  },
  pillarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#174B35',
    marginBottom: 4,
  },
  pillarDesc: {
    fontSize: 12.5,
    color: '#68746A',
    lineHeight: 18,
  },
  aboutPhotosWrap: {
    marginTop: 20,
    gap: 12,
  },
  aboutPhotoPrimary: {
    width: '100%',
    height: 190,
    borderRadius: 18,
  },
  aboutPhotoSecondary: {
    width: '85%',
    height: 160,
    borderRadius: 16,
    alignSelf: 'flex-end',
    marginTop: -40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  /* AUDIENCE SECTION */
  audienceSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 34,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8E0',
  },
  audienceList: {
    gap: 16,
  },
  audienceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8F0E3',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  audienceCardAlt: {
    backgroundColor: '#F8FAF6',
  },
  audiencePhoto: {
    width: '100%',
    height: 180,
  },
  audienceContent: {
    padding: 18,
  },
  audienceBadge: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#729B59',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  audienceTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#174B35',
    marginBottom: 6,
  },
  audienceDesc: {
    fontSize: 13,
    color: '#4D5C53',
    lineHeight: 18,
    marginBottom: 12,
  },
  audienceDetails: {
    gap: 6,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  checkIcon: {
    color: '#1B5E20',
    fontWeight: '800',
    fontSize: 12,
    marginTop: 1,
  },
  detailText: {
    fontSize: 12,
    color: '#56655B',
    flex: 1,
    lineHeight: 16,
  },
  audienceBtn: {
    backgroundColor: '#174B35',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  audienceBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  /* HOW IT WORKS */
  worksSection: {
    backgroundColor: '#F5FAF4',
    paddingHorizontal: 20,
    paddingVertical: 34,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8E0',
  },
  worksSwitch: {
    flexDirection: 'row',
    backgroundColor: '#E8F0E3',
    borderRadius: 12,
    padding: 4,
    marginTop: 14,
    gap: 6,
  },
  worksSwitchBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  worksSwitchBtnActive: {
    backgroundColor: '#174B35',
  },
  worksSwitchText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#174B35',
  },
  worksSwitchTextActive: {
    color: '#FFFFFF',
  },
  worksAccountNote: {
    fontSize: 11.5,
    color: '#68746A',
    marginTop: 8,
    textAlign: 'center',
  },
  stepperTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    marginBottom: 14,
  },
  stepperTab: {
    alignItems: 'center',
    flex: 1,
  },
  stepperTabActive: {},
  stepperNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F0E3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepperNumActive: {
    backgroundColor: '#174B35',
  },
  stepperNumText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#174B35',
  },
  stepperNumTextActive: {
    color: '#FFFFFF',
  },
  stepperLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#68746A',
  },
  stepperLabelActive: {
    color: '#174B35',
    fontWeight: '800',
  },
  stepExplainerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8F0E3',
  },
  stepDemoLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#729B59',
    marginBottom: 4,
  },
  stepExplainerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#174B35',
    marginBottom: 6,
  },
  stepExplainerDesc: {
    fontSize: 13,
    color: '#4D5C53',
    lineHeight: 18,
    marginBottom: 14,
  },
  stepItemsList: {
    gap: 8,
    marginBottom: 16,
  },
  stepItemLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepCheckmark: {
    color: '#1B5E20',
    fontWeight: '800',
    fontSize: 13,
  },
  stepItemText: {
    fontSize: 12.5,
    color: '#263329',
  },
  stepNextBtn: {
    backgroundColor: '#E8F0E3',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  stepNextBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#174B35',
  },

  /* CATEGORIES */
  categoriesSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 34,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8E0',
  },
  categoriesGrid: {
    gap: 14,
  },
  catCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8E0',
    overflow: 'hidden',
  },
  catImage: {
    width: '100%',
    height: 120,
    padding: 10,
    justifyContent: 'flex-start',
  },
  catIconFallback: {
    height: 100,
    backgroundColor: '#F5FAF4',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catEmoji: {
    fontSize: 34,
  },
  catTagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  catBody: {
    padding: 14,
  },
  catTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#174B35',
  },
  catArrow: {
    fontSize: 16,
    color: '#729B59',
    fontWeight: '800',
  },
  catDesc: {
    fontSize: 12,
    color: '#68746A',
    marginTop: 4,
    lineHeight: 17,
  },
  catFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  catBrowse: {
    fontSize: 11,
    fontWeight: '600',
    color: '#68746A',
  },
  catExplore: {
    fontSize: 11,
    fontWeight: '700',
    color: '#174B35',
  },

  /* WHY CHOOSE US */
  whySection: {
    backgroundColor: '#F5F5EB',
    paddingHorizontal: 20,
    paddingVertical: 34,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8E0',
  },
  whyImageCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  whyImage: {
    width: '100%',
    height: 200,
  },
  whyImageCaption: {
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  whyCaptionTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#729B59',
    letterSpacing: 0.8,
  },
  whyCaptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#174B35',
    marginTop: 2,
  },
  whyFeatures: {
    gap: 10,
    marginBottom: 20,
  },
  whyFeatureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E8F0E3',
  },
  whyIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E8F0E3',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  whyEmoji: {
    fontSize: 18,
  },
  whyFeatureTextCol: {
    flex: 1,
  },
  whyFeatureTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#174B35',
  },
  whyFeatureDesc: {
    fontSize: 11.5,
    color: '#68746A',
    marginTop: 2,
    lineHeight: 16,
  },
  whyCtaBtn: {
    backgroundColor: '#174B35',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  whyCtaBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  /* PLANS */
  plansSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 34,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8E0',
  },
  plansGrid: {
    gap: 16,
  },
  planArticle: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8E0',
  },
  planArticleSeller: {
    backgroundColor: '#F8FAF6',
    borderColor: '#174B35',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#174B35',
    marginBottom: 4,
  },
  planDesc: {
    fontSize: 12.5,
    color: '#68746A',
    lineHeight: 18,
    marginBottom: 10,
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  planPriceAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#174B35',
  },
  planPricePeriod: {
    fontSize: 13,
    color: '#68746A',
    fontWeight: '600',
  },
  planBenefitsList: {
    gap: 8,
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitCheck: {
    color: '#1B5E20',
    fontWeight: '800',
    fontSize: 13,
  },
  benefitText: {
    fontSize: 12.5,
    color: '#263329',
  },
  planExtraBox: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E8F0E3',
    marginBottom: 16,
  },
  planExtraTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#174B35',
  },
  planExtraDesc: {
    fontSize: 11,
    color: '#68746A',
    marginTop: 2,
  },
  planActionBtn: {
    backgroundColor: '#174B35',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  planActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  plansNote: {
    fontSize: 11,
    color: '#8A998E',
    marginTop: 16,
    lineHeight: 16,
    textAlign: 'center',
  },

  /* FINAL CTA */
  finalCtaWrap: {
    backgroundColor: '#001F2B',
  },
  finalCtaBg: {
    width: '100%',
    minHeight: 320,
  },
  finalCtaOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 31, 43, 0.72)',
    paddingHorizontal: 20,
    paddingVertical: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finalCtaHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
  },
  finalCtaSubtitle: {
    fontSize: 13,
    color: '#DCE9E6',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    maxWidth: 320,
  },
  finalCtaButtons: {
    width: '100%',
    gap: 10,
    marginTop: 22,
  },
  finalCtaJoinBtn: {
    backgroundColor: '#C5F340',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  finalCtaJoinText: {
    color: '#10251B',
    fontSize: 14,
    fontWeight: '800',
  },
  finalCtaLoginBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  finalCtaLoginText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  finalCtaNote: {
    fontSize: 11.5,
    color: '#A2BCB5',
    marginTop: 16,
  },

  /* FOOTER */
  marketplaceFooter: {
    backgroundColor: '#F5F5EB',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  footerBrand: {
    fontSize: 16,
    fontWeight: '900',
    color: '#174B35',
    letterSpacing: 0.5,
  },
  footerLead: {
    fontSize: 12.5,
    color: '#68746A',
    marginTop: 6,
    lineHeight: 18,
  },
  footerJoinBtn: {
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  footerJoinText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#174B35',
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#E2E8E0',
    marginVertical: 20,
  },
  footerBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerCopyright: {
    fontSize: 11,
    color: '#8A998E',
  },
  footerBackToTop: {
    fontSize: 11,
    fontWeight: '700',
    color: '#174B35',
  },
});
