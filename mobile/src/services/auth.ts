import * as SecureStore from 'expo-secure-store';
import { supabase } from './supabase';

export const authService = {
  async sendOTP(phone: string) {
    try {
      const response = await fetch('YOUR_API_URL/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[v0] Error sending OTP:', error);
      throw error;
    }
  },

  async verifyOTP(phone: string, otp: string) {
    try {
      const response = await fetch('YOUR_API_URL/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await response.json();

      if (data.success) {
        await SecureStore.setItemAsync('authToken', data.token);
        await SecureStore.setItemAsync('userPhone', phone);
      }

      return data;
    } catch (error) {
      console.error('[v0] Error verifying OTP:', error);
      throw error;
    }
  },

  async logout() {
    try {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userPhone');
      await SecureStore.deleteItemAsync('pinSet');
    } catch (error) {
      console.error('[v0] Error logging out:', error);
      throw error;
    }
  },

  async getAuthToken() {
    return await SecureStore.getItemAsync('authToken');
  },
};
