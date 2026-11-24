import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const JOURNEYS = {
  buyer: [
    {
      stepName: 'Register',
      title: 'Create your account',
      desc: 'Sign up with your name, mobile number and email.',
      caption: 'Start with one account',
      mainSceneTitle: 'Your account starts here',
      items: ['Name & contact details', 'Create your password'],
      icon: '',
    },
    {
      stepName: 'Profile',
      title: 'Set up your buyer profile',
      desc: 'Choose Individual or Business and fill in the details that apply to you.',
      caption: 'Tell us what you need',
      mainSceneTitle: 'Tell us about yourself',
      items: ['Individual or business buyer', 'Submit details for review'],
      icon: '📋',
    },
    {
      stepName: 'Discover',
      title: 'Find products & suppliers',
      desc: 'After access is approved, explore produce and compare seller details and quantities.',
      caption: 'Find the right match',
      mainSceneTitle: 'Find what you need',
      items: ['Products • quantities • suppliers', 'Review listing information'],
      icon: '🔍',
    },
    {
      stepName: 'Connect',
      title: 'Send an enquiry',
      desc: 'Contact a seller to discuss availability, quantities and your requirements.',
      caption: 'Start a conversation',
      mainSceneTitle: 'A conversation creates a connection',
      items: ['Ask about availability & quantity', 'Discuss your requirements directly'],
      icon: '💬',
    },
  ],
  seller: [
    {
      stepName: 'Register',
      title: 'Create your account',
      desc: 'Sign up with your name, mobile number and email.',
      caption: 'Start with one account',
      mainSceneTitle: 'Your account starts here',
      items: ['Name & contact details', 'Create your password'],
      icon: '📱',
    },
    {
      stepName: 'Profile',
      title: 'Set up your seller profile',
      desc: 'Choose your business category and submit your details and verification documents.',
      caption: 'Submit for review',
      mainSceneTitle: 'Tell us about yourself',
      items: ['Business category & documents', 'Submit details for review'],
      icon: '📋',
    },
    {
      stepName: 'List products',
      title: 'Showcase your products',
      desc: 'Once your seller profile is approved, submit product details and photos for listing review.',
      caption: 'Help buyers discover you',
      mainSceneTitle: 'Show buyers what you supply',
      items: ['Photos • quantities • product details', 'Submit your listing for approval'],
      icon: '🌾',
    },
    {
      stepName: 'Connect',
      title: 'Receive buyer enquiries',
      desc: 'Interested buyers contact you. Discuss their needs and build business connections.',
      caption: 'Turn interest into connections',
      mainSceneTitle: 'A conversation creates a connection',
      items: ['Respond to interested buyers', 'Discuss your requirements directly'],
      icon: '🤝',
    },
  ],
};

export default function HowItWorksSection({ onNavigateToRegister }) {
  const [role, setRole] = useState('buyer'); // 'buyer' | 'seller'
  const [activeStep, setActiveStep] = useState(0);

  const currentJourney = JOURNEYS[role];
  const stepData = currentJourney[activeStep];

  const handleNextStep = () => {
    setActiveStep((prev) => (prev + 1) % 4);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>How Ulavan Santhai Works</Text>
        <Text style={styles.subheading}>
          Looking to buy or ready to sell? See your next steps.
        </Text>

        {/* Role Toggle Switch */}
        <View style={styles.roleSwitchContainer}>
          <TouchableOpacity
            style={[
              styles.switchBtn,
              role === 'buyer' && styles.switchBtnActive,
            ]}
            onPress={() => {
              setRole('buyer');
              setActiveStep(0);
            }}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.switchBtnText,
                role === 'buyer' && styles.switchBtnTextActive,
              ]}
            >
              I want to buy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.switchBtn,
              role === 'seller' && styles.switchBtnActive,
            ]}
            onPress={() => {
              setRole('seller');
              setActiveStep(0);
            }}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.switchBtnText,
                role === 'seller' && styles.switchBtnTextActive,
              ]}
            >
              I want to sell
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.accountNote}>
          One account. You can be a buyer, a seller, or both.
        </Text>
      </View>

      {/* Step Tabs Row */}
      <View style={styles.stepTabs}>
        {currentJourney.map((step, idx) => {
          const isActive = activeStep === idx;
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.stepTab, isActive && styles.stepTabActive]}
              onPress={() => setActiveStep(idx)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.stepBadge,
                  isActive && styles.stepBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.stepBadgeText,
                    isActive && styles.stepBadgeTextActive,
                  ]}
                >
                  {idx + 1}
                </Text>
              </View>
              <Text
                style={[
                  styles.stepTabText,
                  isActive && styles.stepTabTextActive,
                ]}
                numberOfLines={1}
              >
                {step.stepName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Active Step Content Card */}
      <View style={styles.stepCard}>
        <Text style={styles.stepKicker}>
          YOUR {role.toUpperCase()} JOURNEY · {activeStep + 1} OF 4
        </Text>

        <Text style={styles.stepHeading}>{stepData.title}</Text>
        <Text style={styles.stepDescription}>{stepData.desc}</Text>

        {/* Step Preview Box (Simulating app screen) */}
        <View style={styles.sceneBox}>
          <View style={styles.sceneHeader}>
            <View style={styles.sceneDot} />
            <Text style={styles.sceneBrand}>Ulavan Santhai</Text>
            <Text style={styles.sceneBadge}>Illustration</Text>
          </View>

          <View style={styles.sceneBody}>
            <Text style={styles.sceneEmoji}>{stepData.icon}</Text>
            <Text style={styles.sceneMainTitle}>{stepData.mainSceneTitle}</Text>

            <View style={styles.sceneItems}>
              {stepData.items.map((item, idx) => (
                <View key={idx} style={styles.sceneItemRow}>
                  <View style={styles.itemCheckWrapper}>
                    <Text style={styles.itemCheckText}>
                      {idx === 0 ? '✓' : '↗'}
                    </Text>
                  </View>
                  <Text style={styles.itemText}>{item}</Text>
                </View>
              ))}
            </View>

            <View style={styles.sceneCaptionPill}>
              <Text style={styles.sceneCaptionText}>{stepData.caption}</Text>
            </View>
          </View>
        </View>

        {/* Next step button */}
        <TouchableOpacity
          style={styles.nextStepBtn}
          onPress={handleNextStep}
          activeOpacity={0.8}
        >
          <Text style={styles.nextStepText}>
            {activeStep === 3 ? 'See the journey again' : 'See the next step'} →
          </Text>
        </TouchableOpacity>
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
    marginBottom: 10,
  },
  subheading: {
    fontSize: 16,
    lineHeight: 24,
    color: '#68746A',
    marginBottom: 20,
  },
  roleSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: '#E4EBDF',
    borderRadius: 32,
    padding: 5,
    marginBottom: 12,
  },
  switchBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchBtnActive: {
    backgroundColor: '#174B35',
    shadowColor: '#174B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },
  switchBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  switchBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  accountNote: {
    fontSize: 13,
    color: '#556557',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  stepTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  stepTab: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8DE',
  },
  stepTabActive: {
    backgroundColor: '#C5F340',
    borderColor: '#AFD657',
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8F0E3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepBadgeActive: {
    backgroundColor: '#103A29',
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#174B35',
  },
  stepBadgeTextActive: {
    color: '#FFFFFF',
  },
  stepTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#526057',
  },
  stepTabTextActive: {
    color: '#10251B',
    fontWeight: '800',
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#E8F0E3',
    shadowColor: '#174B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  stepKicker: {
    fontSize: 11,
    fontWeight: '800',
    color: '#729B59',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  stepHeading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#174B35',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 15,
    lineHeight: 23,
    color: '#526456',
    marginBottom: 18,
  },
  sceneBox: {
    backgroundColor: '#F5F8F4',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#DAE6D8',
    overflow: 'hidden',
    marginBottom: 18,
  },
  sceneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF1E7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  sceneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#174B35',
  },
  sceneBrand: {
    fontSize: 12,
    fontWeight: '800',
    color: '#174B35',
    flex: 1,
  },
  sceneBadge: {
    fontSize: 11,
    color: '#68746A',
  },
  sceneBody: {
    padding: 18,
    alignItems: 'center',
  },
  sceneEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  sceneMainTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#174B35',
    textAlign: 'center',
    marginBottom: 16,
  },
  sceneItems: {
    width: '100%',
    gap: 10,
    marginBottom: 16,
  },
  sceneItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EFE5',
  },
  itemCheckWrapper: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#C5F340',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCheckText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#10251B',
  },
  itemText: {
    fontSize: 14,
    color: '#263329',
    fontWeight: '600',
    flex: 1,
  },
  sceneCaptionPill: {
    backgroundColor: '#174B35',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  sceneCaptionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  nextStepBtn: {
    backgroundColor: '#174B35',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStepText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
