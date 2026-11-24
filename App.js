import React, { useState } from 'react';
import { View, StatusBar, StyleSheet, Platform, LogBox } from 'react-native';
import LandingScreen from './src/screens/LandingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import Colors from './src/theme/colors';

LogBox.ignoreLogs([
  'SafeAreaView has been deprecated',
  'ImageBackground is deprecated',
]);

/**
 * Ulavan Santhai - Mobile Application Root
 * Cross-platform React Native / Expo implementation
 */
export default function App() {
  // Mobile app opens to landing page as default
  const [activeScreen, setActiveScreen] = useState('landing'); // 'landing' | 'login' | 'register' | 'home'
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [registeredParam, setRegisteredParam] = useState(false);
  const [prefilledEmail, setPrefilledEmail] = useState('');

  // Ensures non-authenticated users land on 'landing' screen
  const currentView = !user && !['landing', 'login', 'register'].includes(activeScreen)
    ? 'landing'
    : activeScreen;

  const handleNavigateToRegister = (role) => {
    setRegisteredParam(false);
    setActiveScreen('register');
  };

  const handleNavigateToLogin = () => {
    setActiveScreen('login');
  };

  const handleNavigateToLanding = () => {
    setActiveScreen('landing');
  };

  const handleRegisterSuccess = (email) => {
    setPrefilledEmail(email);
    setRegisteredParam(true);
    setActiveScreen('login');
  };

  const handleLoginSuccess = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setRegisteredParam(false);
    setActiveScreen('home');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setRegisteredParam(false);
    setActiveScreen('landing');
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={currentView === 'landing' ? '#FFFFFF' : Colors.background}
      />
      <View style={styles.container}>
        {currentView === 'landing' && (
          <LandingScreen
            onNavigateToLogin={handleNavigateToLogin}
            onNavigateToRegister={handleNavigateToRegister}
          />
        )}

        {currentView === 'login' && (
          <LoginScreen
            onNavigateToRegister={handleNavigateToRegister}
            onNavigateToLanding={handleNavigateToLanding}
            onLoginSuccess={handleLoginSuccess}
            registeredParam={registeredParam}
            prefilledEmail={prefilledEmail}
          />
        )}

        {currentView === 'register' && (
          <RegisterScreen
            onNavigateToLogin={handleNavigateToLogin}
            onNavigateToLanding={handleNavigateToLanding}
            onRegisterSuccess={handleRegisterSuccess}
          />
        )}

        {currentView === 'home' && (
          <HomeScreen
            user={user}
            token={token}
            onLogout={handleLogout}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  container: {
    flex: 1,
  },
});
