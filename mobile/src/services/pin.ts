import * as SecureStore from 'expo-secure-store';

export const pinService = {
  async setPIN(pin: string) {
    try {
      await SecureStore.setItemAsync('userPIN', pin);
      await SecureStore.setItemAsync('pinSet', 'true');
      return { success: true };
    } catch (error) {
      console.error('[v0] Error setting PIN:', error);
      throw error;
    }
  },

  async verifyPIN(pin: string) {
    try {
      const storedPIN = await SecureStore.getItemAsync('userPIN');
      return storedPIN === pin;
    } catch (error) {
      console.error('[v0] Error verifying PIN:', error);
      throw error;
    }
  },

  async isPINSet() {
    try {
      const pinSet = await SecureStore.getItemAsync('pinSet');
      return pinSet === 'true';
    } catch (error) {
      console.error('[v0] Error checking PIN status:', error);
      return false;
    }
  },

  async changePIN(oldPIN: string, newPIN: string) {
    try {
      const isCorrect = await this.verifyPIN(oldPIN);
      if (!isCorrect) {
        throw new Error('Current PIN is incorrect');
      }
      await SecureStore.setItemAsync('userPIN', newPIN);
      return { success: true };
    } catch (error) {
      console.error('[v0] Error changing PIN:', error);
      throw error;
    }
  },
};
