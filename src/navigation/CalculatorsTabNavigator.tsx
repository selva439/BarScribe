import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { type CalculatorsTabParamList } from './types';
import { Colors } from '../constants/colors';
import OneRMScreen from '../screens/Calculators/OneRMScreen';
import WilksDotsScreen from '../screens/Calculators/WilksDotsScreen';

const TopTab = createMaterialTopTabNavigator<CalculatorsTabParamList>();

export default function CalculatorsTabNavigator() {
  return (
    <TopTab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: Colors.surface },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarIndicatorStyle: { backgroundColor: Colors.accent },
        tabBarLabelStyle: { fontWeight: '700', fontSize: 13 },
      }}
    >
      <TopTab.Screen name="OneRM" component={OneRMScreen} options={{ title: '1RM Calc' }} />
      <TopTab.Screen name="WilksDots" component={WilksDotsScreen} options={{ title: 'Wilks/DOTS' }} />
    </TopTab.Navigator>
  );
}
