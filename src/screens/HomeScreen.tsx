import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Shadow } from '../theme';
import { useLayout } from '../utils/responsive';
import { getHistory, getStats } from '../services/historyService';
import { isWatsonxConfigured } from '../services/watsonxService';
import ScanCard from '../components/ScanCard';
import { ScanResult } from '../types';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const layout = useLayout();
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const [stats, setStats] = useState({
    total: 0, highRisk: 0, mediumRisk: 0, lowRisk: 0,
    messagesScanned: 0, linksScanned: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [aiEnabled] = useState(isWatsonxConfigured());

  const maxScans = layout.isDesktop ? 6 : layout.isTablet ? 5 : 4;

  const loadData = async () => {
    const [history, s] = await Promise.all([getHistory(), getStats()]);
    setRecentScans(history.slice(0, maxScans));
    setStats(s);
  };

  useFocusEffect(useCallback(() => { loadData(); }, [maxScans]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const px = layout.contentPx;
  const isWide = layout.isTablet || layout.isDesktop;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {!layout.isDesktop && <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: px },
          layout.isDesktop && { maxWidth: 1200, alignSelf: 'center' as const, width: '100%' },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.blue} />
        }
      >
        {/* ── TOP NAV BAR (mobile / tablet only) ── */}
        {!layout.isDesktop && (
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              <LinearGradient colors={[Colors.blue, Colors.teal]} style={styles.logoMark}>
                <Ionicons name="shield-checkmark" size={18} color={Colors.textInverse} />
              </LinearGradient>
              <View>
                <Text style={styles.appName}>FinSentry AI</Text>
                <Text style={styles.appTagline}>Financial Fraud Detector</Text>
              </View>
            </View>
            <View style={[styles.aiChip, {
              borderColor: aiEnabled ? Colors.teal : Colors.textMuted + '44',
              backgroundColor: aiEnabled ? Colors.tealLight : Colors.surface,
            }]}>
              <View style={[styles.aiDot, { backgroundColor: aiEnabled ? Colors.teal : Colors.textMuted }]} />
              <Text style={[styles.aiChipText, { color: aiEnabled ? Colors.tealDark : Colors.textMuted }]}>
                {aiEnabled ? 'AI Active' : 'Rule Engine'}
              </Text>
            </View>
          </View>
        )}

        {/* ── DESKTOP PAGE HEADER ── */}
        {layout.isDesktop && (
          <View style={styles.desktopPageHeader}>
            <View>
              <Text style={styles.desktopPageTitle}>Dashboard</Text>
              <Text style={styles.desktopPageSub}>Financial scam protection overview</Text>
            </View>
            <View style={[styles.aiChip, {
              borderColor: aiEnabled ? Colors.teal : Colors.textMuted + '44',
              backgroundColor: aiEnabled ? Colors.tealLight : Colors.surface,
            }]}>
              <View style={[styles.aiDot, { backgroundColor: aiEnabled ? Colors.teal : Colors.textMuted }]} />
              <Text style={[styles.aiChipText, { color: aiEnabled ? Colors.tealDark : Colors.textMuted }]}>
                {aiEnabled ? 'IBM Granite Active' : 'Rule Engine Only'}
              </Text>
            </View>
          </View>
        )}

        {/* ── HERO BANNER (mobile/tablet only) ── */}
        {!layout.isDesktop && (
          <View style={styles.heroBanner}>
            <LinearGradient
              colors={[...Colors.gradientHero]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={[styles.heroBannerGrad, isWide && styles.heroBannerGradWide]}
            >
              {/* Decorative glows */}
              <View style={styles.glow1} />
              <View style={styles.glow2} />

              <View style={styles.heroLeft}>
                <View style={styles.heroBadge}>
                  <Ionicons name="sparkles" size={10} color={Colors.teal} />
                  <Text style={styles.heroBadgeText}>AI-Powered Protection</Text>
                </View>
                <Text style={[styles.heroH1, isWide && styles.heroH1Wide]}>
                  Stay Safe{'\n'}from Scams
                </Text>
                <Text style={styles.heroBody}>Analyse messages & links in seconds</Text>
                <TouchableOpacity
                  style={styles.heroCta}
                  onPress={() => navigation.navigate('Scanner')}
                  activeOpacity={0.88}
                >
                  <LinearGradient
                    colors={[Colors.teal, Colors.cyan]}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.heroCtaGrad}
                  >
                    <Text style={styles.heroCtaText}>Scan Now</Text>
                    <Ionicons name="arrow-forward" size={14} color={Colors.textInverse} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.heroRight}>
                <View style={styles.shieldRing}>
                  <View style={styles.shieldRingInner}>
                    <Ionicons name="shield-checkmark" size={layout.isTablet ? 44 : 36} color={Colors.teal} />
                  </View>
                </View>
                <View style={[styles.orbitDot, { top: 4, right: 10 }]} />
                <View style={[styles.orbitDot, styles.orbitDotSm, { bottom: 12, left: 8 }]} />
              </View>
            </LinearGradient>
          </View>
        )}

        {/* ── QUICK ACTIONS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>QUICK SCAN</Text>
          <View style={[styles.quickRow, isWide && styles.quickRowWide]}>
            {/* Message Scanner card — light blue */}
            <TouchableOpacity
              style={[styles.quickBtn, styles.quickBtnBlue, isWide && styles.quickBtnWide]}
              onPress={() => navigation.navigate('Scanner')}
              activeOpacity={0.82}
            >
              <View style={[styles.quickBtnIcon, { backgroundColor: Colors.blue + '22' }]}>
                <Ionicons name="chatbubble-ellipses" size={isWide ? 26 : 22} color={Colors.blue} />
              </View>
              <View style={styles.quickBtnText}>
                <Text style={styles.quickBtnTitle}>Message Scanner</Text>
                <Text style={styles.quickBtnSub}>Scan SMS & chats</Text>
              </View>
              <View style={[styles.quickBtnArrow, { backgroundColor: Colors.blue + '18' }]}>
                <Ionicons name="chevron-forward" size={14} color={Colors.blue} />
              </View>
            </TouchableOpacity>

            {/* Link Checker card — light cyan */}
            <TouchableOpacity
              style={[styles.quickBtn, styles.quickBtnCyan, isWide && styles.quickBtnWide]}
              onPress={() => navigation.navigate('LinkChecker')}
              activeOpacity={0.82}
            >
              <View style={[styles.quickBtnIcon, { backgroundColor: Colors.cyan + '22' }]}>
                <Ionicons name="link" size={isWide ? 26 : 22} color={Colors.cyan} />
              </View>
              <View style={styles.quickBtnText}>
                <Text style={styles.quickBtnTitle}>Link Checker</Text>
                <Text style={styles.quickBtnSub}>Detect phishing URLs</Text>
              </View>
              <View style={[styles.quickBtnArrow, { backgroundColor: Colors.cyan + '18' }]}>
                <Ionicons name="chevron-forward" size={14} color={Colors.cyan} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── PROTECTION STATS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PROTECTION STATS</Text>

          {layout.isDesktop ? (
            /* Desktop: 4-column stat cards with colourful tinted backgrounds */
            <View style={styles.statsRowDesktop}>
              {[
                { label: 'Total Scans', value: stats.total,      color: Colors.blue,    bg: Colors.cardBlue,     icon: 'scan'              },
                { label: 'High Risk',   value: stats.highRisk,   color: Colors.danger,  bg: Colors.dangerBg,     icon: 'warning'           },
                { label: 'Medium Risk', value: stats.mediumRisk, color: Colors.warning, bg: Colors.warningBg,    icon: 'alert-circle'      },
                { label: 'Safe Scans',  value: stats.lowRisk,    color: Colors.success, bg: Colors.successBg,    icon: 'shield-checkmark'  },
              ].map((s) => (
                <TouchableOpacity
                  key={s.label}
                  style={[styles.desktopStatCard, { backgroundColor: s.bg, borderTopColor: s.color }]}
                  onPress={() => navigation.navigate('History')}
                  activeOpacity={0.85}
                >
                  <View style={[styles.desktopStatIcon, { backgroundColor: s.color + '25' }]}>
                    <Ionicons name={s.icon as any} size={22} color={s.color} />
                  </View>
                  <Text style={[styles.desktopStatNum, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.desktopStatLabel}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            /* Mobile / tablet: primary + mini-col */
            <View style={styles.statsRow}>
              {/* Primary total scans card — blue tinted */}
              <TouchableOpacity
                style={styles.statPrimary}
                onPress={() => navigation.navigate('History')}
                activeOpacity={0.85}
              >
                <View style={styles.statPrimaryInner}>
                  <View style={styles.statPrimaryTop}>
                    <View style={[styles.statPrimaryIcon, { backgroundColor: Colors.blue + '22' }]}>
                      <Ionicons name="scan" size={20} color={Colors.blue} />
                    </View>
                    <Ionicons name="arrow-forward-circle-outline" size={18} color={Colors.blue + 'AA'} />
                  </View>
                  <Text style={[styles.statBigNumber, { color: Colors.blue }]}>{stats.total}</Text>
                  <Text style={styles.statPrimaryLabel}>Total Scans</Text>
                  <View style={styles.statPrimaryBar}>
                    <View style={styles.statPrimaryBarFill} />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Mini stat cards */}
              <View style={styles.statsMinicol}>
                {[
                  { label: 'High Risk', value: stats.highRisk,   color: Colors.danger,  bg: Colors.dangerBg  },
                  { label: 'Medium',    value: stats.mediumRisk, color: Colors.warning, bg: Colors.warningBg },
                  { label: 'Safe',      value: stats.lowRisk,    color: Colors.success, bg: Colors.successBg },
                ].map((s) => (
                  <View key={s.label} style={[styles.miniStat, { backgroundColor: s.bg, borderLeftColor: s.color }]}>
                    <View style={styles.miniStatLeft}>
                      <View style={[styles.miniDot, { backgroundColor: s.color }]} />
                      <Text style={[styles.miniLabel, { color: Colors.textSecondary }]}>{s.label}</Text>
                    </View>
                    <Text style={[styles.miniValue, { color: s.color }]}>{s.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Type breakdown */}
          <View style={styles.typeRow}>
            <View style={styles.typeChip}>
              <Ionicons name="chatbubble-outline" size={13} color={Colors.blue} />
              <Text style={[styles.typeChipText, { color: Colors.blue }]}>{stats.messagesScanned} messages</Text>
            </View>
            <View style={styles.typeDivider} />
            <View style={styles.typeChip}>
              <Ionicons name="link-outline" size={13} color={Colors.cyan} />
              <Text style={[styles.typeChipText, { color: Colors.cyan }]}>{stats.linksScanned} links</Text>
            </View>
            <View style={styles.typeDivider} />
            <View style={styles.typeChip}>
              <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
              <Text style={[styles.typeChipText, { color: Colors.textMuted }]}>All time</Text>
            </View>
          </View>
        </View>

        {/* ── DESKTOP TWO-COLUMN: Recent + Awareness ── */}
        {layout.isDesktop ? (
          <View style={styles.desktopTwoCols}>
            {/* Recent Activity */}
            <View style={styles.desktopCol}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionLabel}>RECENT ACTIVITY</Text>
                {recentScans.length > 0 && (
                  <TouchableOpacity onPress={() => navigation.navigate('History')}>
                    <Text style={styles.seeAll}>View all →</Text>
                  </TouchableOpacity>
                )}
              </View>
              {recentScans.length === 0 ? (
                <EmptyActivity onStart={() => navigation.navigate('Scanner')} />
              ) : (
                recentScans.map((scan) => (
                  <ScanCard key={scan.id} result={scan} compact onPress={() => navigation.navigate('Result', { result: scan })} />
                ))
              )}
            </View>

            {/* Right column: tip + awareness */}
            <View style={styles.desktopColRight}>
              <SafetyTip />
              <TouchableOpacity
                style={styles.awarenessCard}
                onPress={() => navigation.navigate('Awareness')}
                activeOpacity={0.82}
              >
                <View style={styles.awarenessInner}>
                  <View style={[styles.awarenessIconWrap, { backgroundColor: Colors.teal + '22' }]}>
                    <Ionicons name="book-outline" size={20} color={Colors.teal} />
                  </View>
                  <View style={styles.awarenessText}>
                    <Text style={styles.awarenessTitle}>Scam Awareness Centre</Text>
                    <Text style={styles.awarenessSub}>UPI · OTP · Loan · Investment · Phishing</Text>
                  </View>
                  <View style={[styles.awarenessArrow, { backgroundColor: Colors.teal + '20' }]}>
                    <Ionicons name="chevron-forward" size={16} color={Colors.teal} />
                  </View>
                </View>
              </TouchableOpacity>
              <DisclaimerBox />
            </View>
          </View>
        ) : (
          <>
            {/* Mobile / Tablet: stacked */}
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionLabel}>RECENT ACTIVITY</Text>
                {recentScans.length > 0 && (
                  <TouchableOpacity onPress={() => navigation.navigate('History')}>
                    <Text style={styles.seeAll}>View all →</Text>
                  </TouchableOpacity>
                )}
              </View>
              {recentScans.length === 0 ? (
                <EmptyActivity onStart={() => navigation.navigate('Scanner')} />
              ) : (
                recentScans.map((scan) => (
                  <ScanCard key={scan.id} result={scan} compact onPress={() => navigation.navigate('Result', { result: scan })} />
                ))
              )}
            </View>

            <View style={styles.section}>
              <SafetyTip />
            </View>

            <TouchableOpacity
              style={styles.awarenessCard}
              onPress={() => navigation.navigate('Awareness')}
              activeOpacity={0.82}
            >
              <View style={styles.awarenessInner}>
                <View style={[styles.awarenessIconWrap, { backgroundColor: Colors.teal + '22' }]}>
                  <Ionicons name="book-outline" size={20} color={Colors.teal} />
                </View>
                <View style={styles.awarenessText}>
                  <Text style={styles.awarenessTitle}>Scam Awareness Centre</Text>
                  <Text style={styles.awarenessSub}>UPI · OTP · Loan · Investment · Phishing</Text>
                </View>
                <View style={[styles.awarenessArrow, { backgroundColor: Colors.teal + '20' }]}>
                  <Ionicons name="chevron-forward" size={16} color={Colors.teal} />
                </View>
              </View>
            </TouchableOpacity>

            <DisclaimerBox style={{ paddingHorizontal: 0 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyActivity({ onStart }: { onStart: () => void }) {
  return (
    <View style={styles.emptyActivity}>
      <View style={styles.emptyIcon}>
        <Ionicons name="scan-outline" size={28} color={Colors.blue} />
      </View>
      <Text style={styles.emptyTitle}>No activity yet</Text>
      <Text style={styles.emptySub}>Your scan history will appear here</Text>
      <TouchableOpacity style={styles.emptyStartBtn} onPress={onStart}>
        <Text style={styles.emptyStartText}>Start your first scan</Text>
      </TouchableOpacity>
    </View>
  );
}

function SafetyTip() {
  return (
    <View style={styles.tipCard}>
      <View style={styles.tipIconWrap}>
        <Ionicons name="bulb" size={18} color={Colors.warning} />
      </View>
      <View style={styles.tipRight}>
        <Text style={styles.tipTitle}>Daily Safety Tip</Text>
        <Text style={styles.tipText}>
          No bank, government body, or company will ever ask for your OTP, PIN, or password — not even to "verify" your account.
        </Text>
      </View>
    </View>
  );
}

function DisclaimerBox({ style }: { style?: object }) {
  return (
    <Text style={[styles.disclaimer, style]}>
      FinSentry AI provides risk assessments for awareness only. Always verify with official sources. Never share OTPs, passwords, or banking PINs.
    </Text>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { paddingBottom: 32, paddingTop: 0 },

  /* Top bar (mobile) */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 8,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMark: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  appName: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  appTagline: { fontSize: 10, color: Colors.textMuted, marginTop: 1, fontWeight: '500' },
  aiChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: BorderRadius.round, borderWidth: 1.5,
  },
  aiDot: { width: 6, height: 6, borderRadius: 3 },
  aiChipText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.2 },

  /* Desktop page header */
  desktopPageHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 28, paddingBottom: 20,
  },
  desktopPageTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  desktopPageSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  /* Hero */
  heroBanner: {
    borderRadius: BorderRadius.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.blue + '30', marginBottom: 4,
  },
  heroBannerGrad: {
    flexDirection: 'row', alignItems: 'center',
    padding: 20, paddingRight: 12, minHeight: 160, position: 'relative',
  },
  heroBannerGradWide: { minHeight: 180, padding: 28 },
  glow1: {
    position: 'absolute', top: -30, right: 30,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: Colors.teal + '22',
  },
  glow2: {
    position: 'absolute', bottom: -20, left: -10,
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.blue + '18',
  },
  heroLeft: { flex: 1, zIndex: 1 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.teal + '28', borderRadius: BorderRadius.round,
    paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 10,
    borderWidth: 1, borderColor: Colors.teal + '55',
  },
  heroBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.teal, letterSpacing: 0.3 },
  heroH1: {
    fontSize: 24, fontWeight: '800', color: '#FFFFFF',
    lineHeight: 30, letterSpacing: -0.5, marginBottom: 6,
  },
  heroH1Wide: { fontSize: 28, lineHeight: 36 },
  heroBody: { fontSize: 12, color: 'rgba(255,255,255,0.72)', lineHeight: 18, marginBottom: 14 },
  heroCta: { alignSelf: 'flex-start', borderRadius: BorderRadius.md, overflow: 'hidden' },
  heroCtaGrad: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 9,
  },
  heroCtaText: { fontSize: 13, fontWeight: '700', color: Colors.textInverse },
  heroRight: {
    width: 90, alignItems: 'center', justifyContent: 'center',
    position: 'relative', height: 100,
  },
  shieldRing: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.teal + '22', borderWidth: 1.5, borderColor: Colors.teal + '55',
    justifyContent: 'center', alignItems: 'center',
  },
  shieldRingInner: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.teal + '35',
    justifyContent: 'center', alignItems: 'center',
  },
  orbitDot: {
    position: 'absolute', width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.teal,
  },
  orbitDotSm: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.cyan },

  /* Sections */
  section: { marginTop: 20 },
  sectionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 10, fontWeight: '800', color: Colors.textMuted,
    letterSpacing: 1.2, marginBottom: 10,
  },
  seeAll: { fontSize: 12, fontWeight: '700', color: Colors.blue },

  /* Quick actions */
  quickRow: { flexDirection: 'column', gap: 10 },
  quickRowWide: { flexDirection: 'row' },
  quickBtn: {
    borderRadius: BorderRadius.lg, borderWidth: 1.5,
    flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10,
  },
  quickBtnBlue: {
    backgroundColor: Colors.cardBlue,
    borderColor: Colors.blue + '35',
  },
  quickBtnCyan: {
    backgroundColor: Colors.cardCyan,
    borderColor: Colors.cyan + '35',
  },
  quickBtnWide: { flex: 1 },
  quickBtnIcon: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  quickBtnText: { flex: 1 },
  quickBtnTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  quickBtnSub: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  quickBtnArrow: { width: 26, height: 26, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },

  /* Stats — mobile/tablet */
  statsRow: { flexDirection: 'row', gap: 10 },
  statPrimary: {
    flex: 1.1, borderRadius: BorderRadius.lg, overflow: 'hidden',
    borderWidth: 1.5, borderColor: Colors.blue + '30',
    backgroundColor: Colors.cardBlue,
    ...Shadow.card,
  },
  statPrimaryInner: { padding: 14, minHeight: 130 },
  statPrimaryTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 6,
  },
  statPrimaryIcon: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  statBigNumber: {
    fontSize: 36, fontWeight: '900', letterSpacing: -1, lineHeight: 40, marginBottom: 2,
  },
  statPrimaryLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  statPrimaryBar: {
    height: 4, backgroundColor: Colors.blue + '20',
    borderRadius: 2, marginTop: 12, overflow: 'hidden',
  },
  statPrimaryBarFill: {
    width: '70%', height: '100%',
    backgroundColor: Colors.blue, borderRadius: 2,
  },
  statsMinicol: { flex: 1, justifyContent: 'space-between', gap: 8 },
  miniStat: {
    flex: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.cardBorder, borderLeftWidth: 3,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    minHeight: 38,
  },
  miniStatLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  miniDot: { width: 6, height: 6, borderRadius: 3 },
  miniLabel: { fontSize: 11, fontWeight: '600' },
  miniValue: { fontSize: 17, fontWeight: '800' },

  /* Stats — desktop */
  statsRowDesktop: { flexDirection: 'row', gap: 12, marginBottom: 0 },
  desktopStatCard: {
    flex: 1, borderRadius: 14, padding: 18,
    borderTopWidth: 3, borderWidth: 1, borderColor: Colors.cardBorder,
    alignItems: 'center', gap: 6,
    ...Shadow.card,
  },
  desktopStatIcon: {
    width: 48, height: 48, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginBottom: 4,
  },
  desktopStatNum: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  desktopStatLabel: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600', textAlign: 'center' },

  /* Type row */
  typeRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10, marginTop: 10, paddingVertical: 10, paddingHorizontal: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  typeChip: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5, justifyContent: 'center' },
  typeChipText: { fontSize: 11, fontWeight: '600' },
  typeDivider: { width: 1, height: 16, backgroundColor: Colors.divider },

  /* Desktop two-column layout */
  desktopTwoCols: { flexDirection: 'row', gap: 20, marginTop: 20, alignItems: 'flex-start' },
  desktopCol: { flex: 1.6 },
  desktopColRight: { flex: 1, gap: 12 },

  /* Recent Activity empty state */
  emptyActivity: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: 24,
    alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border, borderStyle: 'dashed',
  },
  emptyIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.cardBlue, justifyContent: 'center',
    alignItems: 'center', marginBottom: 12,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  emptyStartBtn: {
    marginTop: 14, paddingHorizontal: 20, paddingVertical: 9,
    backgroundColor: Colors.blueLight, borderRadius: BorderRadius.round,
    borderWidth: 1.5, borderColor: Colors.blue + '50',
  },
  emptyStartText: { fontSize: 12, fontWeight: '700', color: Colors.blue },

  /* Safety tip */
  tipCard: {
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.warningBg,
    borderWidth: 1.5, borderColor: Colors.warning + '40',
    flexDirection: 'row', gap: 12, padding: 14,
  },
  tipIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.warning + '25', justifyContent: 'center', alignItems: 'center',
  },
  tipRight: { flex: 1 },
  tipTitle: { fontSize: 12, fontWeight: '700', color: Colors.warningDark, marginBottom: 4 },
  tipText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  /* Awareness CTA */
  awarenessCard: {
    borderRadius: BorderRadius.lg, overflow: 'hidden',
    borderWidth: 1.5, borderColor: Colors.teal + '40',
    backgroundColor: Colors.tealLight,
  },
  awarenessInner: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  awarenessIconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  awarenessText: { flex: 1 },
  awarenessTitle: { fontSize: 14, fontWeight: '700', color: Colors.tealDark },
  awarenessSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  awarenessArrow: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },

  disclaimer: {
    fontSize: 10, color: Colors.textMuted, textAlign: 'center',
    lineHeight: 15, marginTop: 20, paddingBottom: 12,
  },
});
