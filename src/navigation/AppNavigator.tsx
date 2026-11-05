/**
 * AppNavigator — responsive navigation for FinSentry AI
 *
 * Mobile  (< 600px)  : bottom tab bar
 * Tablet  (600-1024) : bottom tab bar + wider content
 * Desktop (>= 1024)  : persistent left sidebar, no bottom tabs
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius } from '../theme';
import { isDesktopWidth } from '../utils/responsive';

import HomeScreen from '../screens/HomeScreen';
import ScannerScreen from '../screens/ScannerScreen';
import LinkCheckerScreen from '../screens/LinkCheckerScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AwarenessScreen from '../screens/AwarenessScreen';
import ResultScreen from '../screens/ResultScreen';
import SidebarNav from '../components/SidebarNav';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─── Tab config ───────────────────────────────────────────────────────────────

const TAB_CONFIG: Record<string, { active: string; inactive: string }> = {
  Home:        { active: 'home',                inactive: 'home-outline'                },
  Scanner:     { active: 'chatbubble-ellipses', inactive: 'chatbubble-ellipses-outline' },
  LinkChecker: { active: 'link',                inactive: 'link-outline'               },
  History:     { active: 'time',                inactive: 'time-outline'               },
  Awareness:   { active: 'book',                inactive: 'book-outline'               },
};

// ─── Mobile / Tablet: bottom tabs ─────────────────────────────────────────────

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const cfg = TAB_CONFIG[route.name];
        return {
          headerShown: false,
          tabBarStyle: tabStyles.bar,
          tabBarActiveTintColor: Colors.blue,
          tabBarInactiveTintColor: Colors.textSecondary,
          tabBarLabelStyle: tabStyles.label,
          tabBarItemStyle: tabStyles.item,
          tabBarIcon: ({ focused, color }) => (
            <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
              <Ionicons
                name={((focused ? cfg?.active : cfg?.inactive) ?? 'ellipse-outline') as any}
                size={focused ? 20 : 19}
                color={color}
              />
            </View>
          ),
        };
      }}
    >
      <Tab.Screen name="Home"        component={HomeScreen}        options={{ title: 'Home'    }} />
      <Tab.Screen name="Scanner"     component={ScannerScreen}     options={{ title: 'Scan'    }} />
      <Tab.Screen name="LinkChecker" component={LinkCheckerScreen} options={{ title: 'Links'   }} />
      <Tab.Screen name="History"     component={HistoryScreen}     options={{ title: 'History' }} />
      <Tab.Screen name="Awareness"   component={AwarenessScreen}   options={{ title: 'Learn'   }} />
    </Tab.Navigator>
  );
}

// ─── Desktop: sidebar shell ───────────────────────────────────────────────────

const SCREEN_MAP: Record<string, React.ComponentType<any>> = {
  Home:        HomeScreen,
  Scanner:     ScannerScreen,
  LinkChecker: LinkCheckerScreen,
  History:     HistoryScreen,
  Awareness:   AwarenessScreen,
};

function DesktopShell({ navigation }: { navigation: any }) {
  const [activeTab, setActiveTab] = useState('Home');
  const ActiveScreen = SCREEN_MAP[activeTab] ?? HomeScreen;

  const handleNavigate = useCallback((name: string) => {
    setActiveTab(name);
  }, []);

  // Allow screens to push to Result via navigation.navigate('Result', ...)
  // We intercept via a wrapper that passes navigation through context
  return (
    <View style={sidebarStyles.shell}>
      <SidebarNav
        activeRoute={activeTab}
        onNavigate={handleNavigate}
      />
      <View style={sidebarStyles.content}>
        <ActiveScreen navigation={navigation} />
      </View>
    </View>
  );
}

// ─── Root stack ───────────────────────────────────────────────────────────────

function RootNavigator() {
  const { width } = useWindowDimensions();
  const desktop = isDesktopWidth(width);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {desktop ? (
        <Stack.Screen name="Main" component={DesktopShell} />
      ) : (
        <Stack.Screen name="Main" component={BottomTabNavigator} />
      )}
      <Stack.Screen
        name="Result"
        component={ResultScreen}
        options={{
          presentation: 'card',
          animation: Platform.OS === 'web' ? 'none' : 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}

// ─── Entry point ──────────────────────────────────────────────────────────────

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const TAB_HEIGHT = Platform.OS === 'ios' ? 82 : 62;

const tabStyles = StyleSheet.create({
  bar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    height: TAB_HEIGHT,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    shadowColor: '#1a202c',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  item: { paddingTop: 2 },
  iconWrap: {
    width: 36,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  iconWrapActive: { backgroundColor: Colors.blueLight },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 0.2, marginTop: 1 },
});

const sidebarStyles = StyleSheet.create({
  shell: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
});
