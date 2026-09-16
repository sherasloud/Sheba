import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as ScreenOrientation from 'expo-screen-orientation';
import Ionicons from 'react-native-vector-icons/Ionicons';

import LoginScreen from './screens/Auth/LoginScreen';
import OTPVerificationScreen from './screens/Auth/OTPVerificationScreen';
import PINLockScreen from './screens/PINLock/PINLockScreen';
import HomeScreen from './screens/Home/HomeScreen';
import VerificationScreen from './screens/Verification/VerificationScreen';
import AddMoneyScreen from './screens/AddMoney/AddMoneyScreen';
import SendMoneyScreen from './screens/SendMoney/SendMoneyScreen';
import SettingsScreen from './screens/Settings/SettingsScreen';
import TransactionHistoryScreen from './screens/TransactionHistory/TransactionHistoryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animationEnabled: true,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
  </Stack.Navigator>
);

const PINStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="PINLock" component={PINLockScreen} />
  </Stack.Navigator>
);

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: true,
      headerStyle: {
        backgroundColor: '#1F2937',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      tabBarActiveTintColor: '#3B82F6',
      tabBarInactiveTintColor: '#9CA3AF',
      tabBarStyle: {
        backgroundColor: '#1F2937',
        borderTopColor: '#374151',
      },
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'AddMoney') {
          iconName = focused ? 'wallet' : 'wallet-outline';
        } else if (route.name === 'SendMoney') {
          iconName = focused ? 'send' : 'send-outline';
        } else if (route.name === 'Verification') {
          iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
        } else if (route.name === 'Settings') {
          iconName = focused ? 'settings' : 'settings-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{ title: 'হোম' }}
    />
    <Tab.Screen
      name="AddMoney"
      component={AddMoneyScreen}
      options={{ title: 'টাকা যোগ করুন' }}
    />
    <Tab.Screen
      name="SendMoney"
      component={SendMoneyScreen}
      options={{ title: 'টাকা পাঠান' }}
    />
    <Tab.Screen
      name="Verification"
      component={VerificationScreen}
      options={{ title: 'যাচাইকরণ' }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ title: 'সেটিংস' }}
    />
  </Tab.Navigator>
);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPINSet, setIsPINSet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    lockScreenOrientation();
    checkAuthStatus();
  }, []);

  const lockScreenOrientation = async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      console.log('[v0] Screen orientation locked to portrait');
    } catch (error) {
      console.error('[v0] Failed to lock screen orientation:', error);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const pinSet = await SecureStore.getItemAsync('pinSet');

      setIsLoggedIn(!!token);
      setIsPINSet(!!pinSet);
    } catch (error) {
      console.error('[v0] Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1F2937' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!isLoggedIn ? (
        <AuthStack />
      ) : isPINSet ? (
        <PINStack />
      ) : (
        <AppTabs />
      )}
    </NavigationContainer>
  );
}
