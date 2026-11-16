import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Platform, View } from 'react-native';
import LandingScreen from './src/screens/LandingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import Colors from './src/theme/colors';

/**
 * Ulavan Santhai - Mobile Application Root
 * Cross-platform React Native / Expo implementation
 */
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('landing'); // 'landing' | 'login' | 'register' | 'home'
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [registeredParam, setRegisteredParam] = useState(false);
  const [prefilledEmail, setPrefilledEmail] = useState('');

  const handleNavigateToRegister = () => {
    setRegisteredParam(false);
    setCurrentScreen('register');
  };

  const handleNavigateToLogin = () => {
    setCurrentScreen('login');
  };

  const handleNavigateToLanding = () => {
    setCurrentScreen('landing');
  };

  const handleRegisterSuccess = (email) => {
    setPrefilledEmail(email);
    setRegisteredParam(true);
    setCurrentScreen('login');
  };

  const handleLoginSuccess = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setRegisteredParam(false);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setRegisteredParam(false);
    setCurrentScreen('landing');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.background}
      />
      <View style={styles.container}>
        {currentScreen === 'landing' && (
          <LandingScreen
            onNavigateToLogin={handleNavigateToLogin}
            onNavigateToRegister={handleNavigateToRegister}
          />
        )}

        {currentScreen === 'login' && (
          <LoginScreen
            onNavigateToRegister={handleNavigateToRegister}
            onNavigateToLanding={handleNavigateToLanding}
            onLoginSuccess={handleLoginSuccess}
            registeredParam={registeredParam}
            prefilledEmail={prefilledEmail}
          />
        )}

        {currentScreen === 'register' && (
          <RegisterScreen
            onNavigateToLogin={handleNavigateToLogin}
            onNavigateToLanding={handleNavigateToLanding}
            onRegisterSuccess={handleRegisterSuccess}
          />
        )}

        {currentScreen === 'home' && (
          <HomeScreen
            user={user}
            token={token}
            onLogout={handleLogout}
          />
        )}
      </View>
    </SafeAreaView>
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
