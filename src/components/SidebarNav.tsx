/**
 * Desktop / tablet sidebar navigation for ScamShield AI.
 * Rendered alongside screen content when width >= 1024px (desktop).
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius } from '../theme';
import { isWatsonxConfigured } from '../services/watsonxService';

interface NavItem {
  name: string;
  label: string;
  icon: string;
  iconActive: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Home',        label: 'Dashboard',    icon: 'home-outline',                iconActive: 'home'                },
  { name: 'Scanner',     label: 'Msg Scanner',  icon: 'chatbubble-ellipses-outline', iconActive: 'chatbubble-ellipses' },
  { name: 'LinkChecker', label: 'Link Checker', icon: 'link-outline',                iconActive: 'link'                },
  { name: 'History',     label: 'History',      icon: 'time-outline',                iconActive: 'time'                },
  { name: 'Awareness',   label: 'Awareness',    icon: 'book-outline',                iconActive: 'book'                },
];

interface Props {
  activeRoute: string;
  onNavigate: (name: string) => void;
  compact?: boolean; // tablet: icons + labels, but narrower
}

export default function SidebarNav({ activeRoute, onNavigate, compact = false }: Props) {
  const aiEnabled = isWatsonxConfigured();

  return (
    <View style={[styles.sidebar, compact && styles.sidebarCompact]}>
      {/* Brand */}
      <View style={styles.brand}>
        <LinearGradient
          colors={[Colors.teal + '30', Colors.teal + '10']}
          style={styles.brandIcon}
        >
          <Ionicons name="shield-checkmark" size={compact ? 18 : 20} color={Colors.teal} />
        </LinearGradient>
        {!compact && (
          <View style={styles.brandText}>
            <Text style={styles.brandName}>FinSentry</Text>
            <Text style={styles.brandSub}>AI</Text>
          </View>
        )}
      </View>

      {/* AI status pill */}
      <View style={[styles.aiPill, { borderColor: aiEnabled ? Colors.teal + '40' : Colors.textMuted + '30' }]}>
        <View style={[styles.aiDot, { backgroundColor: aiEnabled ? Colors.teal : Colors.textMuted }]} />
        {!compact && (
          <Text style={[styles.aiPillText, { color: aiEnabled ? Colors.teal : Colors.textMuted }]}>
            {aiEnabled ? 'IBM Granite Active' : 'Rule Engine'}
          </Text>
        )}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Nav items */}
      <ScrollView style={styles.navList} showsVerticalScrollIndicator={false}>
        {NAV_ITEMS.map((item) => {
          const active = activeRoute === item.name;
          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => onNavigate(item.name)}
              activeOpacity={0.8}
            >
              {active && (
                <View style={styles.activeBar} />
              )}
              <View style={[styles.navIconWrap, active && styles.navIconWrapActive]}>
                <Ionicons
                  name={(active ? item.iconActive : item.icon) as any}
                  size={18}
                  color={active ? Colors.blue : Colors.textSecondary}
                />
              </View>
              {!compact && (
                <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                  {item.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom disclaimer */}
      {!compact && (
        <View style={styles.sidebarFooter}>
          <View style={styles.footerDivider} />
          <Text style={styles.footerText}>
            FinSentry AI v1.0{'\n'}For awareness only
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 220,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingTop: 24,
    paddingBottom: 16,
    flexDirection: 'column',
  },
  sidebarCompact: {
    width: 68,
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.teal + '50',
  },
  brandText: { flex: 1 },
  brandName: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  brandSub: { fontSize: 10, color: Colors.teal, fontWeight: '700', letterSpacing: 1, marginTop: -1 },

  aiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 12,
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.round,
    borderWidth: 1.5,
    backgroundColor: Colors.background,
  },
  aiDot: { width: 7, height: 7, borderRadius: 3.5 },
  aiPillText: { fontSize: 10, fontWeight: '700', flex: 1 },

  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 12, marginBottom: 8 },

  navList: { flex: 1 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginHorizontal: 8,
    borderRadius: 10,
    marginBottom: 2,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: Colors.blueLight,
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
    backgroundColor: Colors.blue,
  },
  navIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIconWrapActive: {
    backgroundColor: Colors.blue + '22',
  },
  navLabel: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600', flex: 1 },
  navLabelActive: { color: Colors.blue, fontWeight: '700' },

  sidebarFooter: { paddingHorizontal: 16, paddingTop: 8 },
  footerDivider: { height: 1, backgroundColor: Colors.border, marginBottom: 10 },
  footerText: { fontSize: 10, color: Colors.textMuted, lineHeight: 15 },
});
