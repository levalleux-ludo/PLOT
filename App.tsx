import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import RootNavigator from './RootNavigator';
import LocationService from './LocationService';

export default function App() {
  LocationService.initialize();
  return RootNavigator();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
