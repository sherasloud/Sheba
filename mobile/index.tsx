import React from 'react';
import { StatusBar } from 'expo-status-bar';
import App from './App';

export default function Index() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      <App />
    </>
  );
}
