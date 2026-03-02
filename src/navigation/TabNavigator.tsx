import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { type TabParamList } from './types';
import { Colors } from '../constants/colors';
import TodayStackNavigator from './TodayStackNavigator';
import HistoryStackNavigator from './HistoryStackNavigator';
import CalculatorsTabNavigator from './CalculatorsTabNavigator';
import MeetPrepStackNavigator from './MeetPrepStackNavigator';
import ProfileStackNavigator from './ProfileStackNavigator';

const Tab = createBottomTabNavigator<TabParamList>();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<keyof TabParamList, { active: IoniconName; inactive: IoniconName }> = {
  TodayStack: { active: 'barbell', inactive: 'barbell-outline' },
  HistoryStack: { active: 'calendar', inactive: 'calendar-outline' },
  CalculatorsTab: { active: 'calculator', inactive: 'calculator-outline' },
  MeetPrepStack: { active: 'trophy', inactive: 'trophy-outline' },
  ProfileStack: { active: 'person', inactive: 'person-outline' },
};

const TAB_LABELS: Record<keyof TabParamList, string> = {
  TodayStack: 'Today',
  HistoryStack: 'History',
  CalculatorsTab: 'Calc',
  MeetPrepStack: 'Meet',
  ProfileStack: 'Profile',
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name as keyof TabParamList];
          const iconName = focused ? icons.active : icons.inactive;
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabel: TAB_LABELS[route.name as keyof TabParamList],
      })}
    >
      <Tab.Screen name="TodayStack" component={TodayStackNavigator} />
      <Tab.Screen name="HistoryStack" component={HistoryStackNavigator} />
      <Tab.Screen name="CalculatorsTab" component={CalculatorsTabNavigator} />
      <Tab.Screen name="MeetPrepStack" component={MeetPrepStackNavigator} />
      <Tab.Screen name="ProfileStack" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}
