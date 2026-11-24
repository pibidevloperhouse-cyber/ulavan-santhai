import React, { useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import {
  LandingNavbar,
  HeroSection,
  AboutSection,
  AudienceSection,
  HowItWorksSection,
  CategoriesSection,
  WhyChooseUsSection,
  PlansSection,
  MarketplaceFooter,
} from '../components/landing';

export default function LandingScreen({
  onNavigateToLogin,
  onNavigateToRegister,
  onNavigateToGetStarted,
}) {
  const scrollRef = useRef(null);
  const sectionPositions = useRef({});
  const [activeSection, setActiveSection] = useState('home');

  const recordLayout = (id, event) => {
    const layout = event.nativeEvent.layout;
    sectionPositions.current[id] = layout.y;
  };

  const scrollToSection = (id) => {
    setActiveSection(id);
    const targetY = sectionPositions.current[id];
    if (targetY !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y: Math.max(0, targetY - 10), animated: true });
    }
  };

  const scrollToTop = () => {
    setActiveSection('home');
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Persistent / Sticky Landing Navbar */}
      <LandingNavbar
        activeSection={activeSection}
        onScrollToSection={scrollToSection}
        onNavigateToLogin={onNavigateToLogin}
        onNavigateToRegister={onNavigateToRegister}
        onNavigateToGetStarted={onNavigateToGetStarted}
      />

      {/* Main Landing Scrollable Body */}
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          const scrollY = e.nativeEvent.contentOffset.y;
          // Determine active section based on scroll offset
          const positions = sectionPositions.current;
          let currentId = 'home';
          for (const [id, y] of Object.entries(positions)) {
            if (scrollY >= y - 100) {
              currentId = id;
            }
          }
          if (currentId !== activeSection) {
            setActiveSection(currentId);
          }
        }}
      >
        {/* 1. Hero & Underground Soil Story */}
        <View onLayout={(e) => recordLayout('home', e)}>
          <HeroSection
            onScrollToJourney={() => scrollToSection('journey')}
            onNavigateToRegister={onNavigateToRegister}
            onNavigateToPlans={() => scrollToSection('plans')}
            onNavigateToGetStarted={onNavigateToGetStarted}
          />
        </View>

        {/* Anchor point for underground story */}
        <View onLayout={(e) => recordLayout('journey', e)} />

        {/* 2. About Section */}
        <View onLayout={(e) => recordLayout('about', e)}>
          <AboutSection onNavigateToRegister={onNavigateToRegister} />
        </View>

        {/* 3. Audience Section (Who it's for) */}
        <View onLayout={(e) => recordLayout('who-its-for', e)}>
          <AudienceSection onNavigateToRegister={onNavigateToRegister} />
        </View>

        {/* 4. How It Works Section */}
        <View onLayout={(e) => recordLayout('how-it-works', e)}>
          <HowItWorksSection onNavigateToRegister={onNavigateToRegister} />
        </View>

        {/* 5. Categories Section */}
        <View onLayout={(e) => recordLayout('categories', e)}>
          <CategoriesSection onNavigateToRegister={onNavigateToRegister} />
        </View>

        {/* 6. Why Choose Us Section */}
        <View onLayout={(e) => recordLayout('why-us', e)}>
          <WhyChooseUsSection />
        </View>

        {/* 7. Plans Section */}
        <View onLayout={(e) => recordLayout('plans', e)}>
          <PlansSection onNavigateToRegister={onNavigateToRegister} />
        </View>

        {/* 8. Marketplace Footer (Contact Us) */}
        <View onLayout={(e) => recordLayout('contact', e)}>
          <MarketplaceFooter
            onScrollToSection={scrollToSection}
            onBackToTop={scrollToTop}
            onNavigateToLogin={onNavigateToLogin}
            onNavigateToRegister={onNavigateToRegister}
          />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
