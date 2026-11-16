import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Platform, View } from 'react-native';
import { registerRootComponent } from 'expo';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import Colors from './src/theme/colors';

/**
 * Ulavan Santhai - Mobile Application Root
 * Cross-platform React Native / Expo implementation
 */
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login'); // 'login' | 'register' | 'home'
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
    setCurrentScreen('login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.background}
      />
      <View style={styles.container}>
        {currentScreen === 'login' && (
          <LoginScreen
            onNavigateToRegister={handleNavigateToRegister}
            onLoginSuccess={handleLoginSuccess}
            registeredParam={registeredParam}
            prefilledEmail={prefilledEmail}
          />
        )}

        {currentScreen === 'register' && (
          <RegisterScreen
            onNavigateToLogin={handleNavigateToLogin}
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

registerRootComponent(App);
