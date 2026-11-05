import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, StatusBar, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors, BorderRadius } from '../theme';
import { useLayout } from '../utils/responsive';
import { ScanResult, ScamIndicator } from '../types';
import { getRiskColor, getRiskBgColor, getRiskLabel, formatDate } from '../utils/helpers';

type RouteParams = { result: ScanResult };

function IndicatorCard({ indicator }: { indicator: ScamIndicator }) {
  const color = indicator.severity === 'high' ? Colors.danger : indicator.severity === 'medium' ? Colors.warning : Colors.success;
  return (
    <View style={[styles.indicatorCard, { borderLeftColor: color }]}>
      <View style={styles.indicatorTop}>
        <View style={[styles.indicatorDot, { backgroundColor: color + '30' }]}>
          <Ionicons name={indicator.severity === 'high' ? 'warning' : indicator.severity === 'medium' ? 'alert-circle' : 'information-circle'} size={13} color={color} />
        </View>
        <Text style={[styles.indicatorType, { color }]}>{indicator.type}</Text>
        <View style={[styles.severityChip, { backgroundColor: color + '18', borderColor: color + '35' }]}>
          <Text style={[styles.severityChipText, { color }]}>{indicator.severity.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.indicatorDesc}>{indicator.description}</Text>
      {indicator.matchedText && (
        <View style={styles.matchedBox}>
          <Ionicons name="code-outline" size={10} color={Colors.textMuted} />
          <Text style={styles.matchedText}>"{indicator.matchedText}"</Text>
        </View>
      )}
    </View>
  );
}

export default function ResultScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const layout = useLayout();
  const { result } = route.params as RouteParams;

  const riskColor = getRiskColor(result.riskLevel);
  const isHigh = result.riskLevel === 'high';
  const isMed = result.riskLevel === 'medium';
  const isWide = layout.isTablet || layout.isDesktop;
  const px = layout.contentPx;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `FinSentry AI Analysis\n\nRisk: ${getRiskLabel(result.riskLevel)} (${result.riskScore}/100)\n\n${result.explanation}\n\nAnalysed by: ${result.analyzedBy === 'watsonx' ? 'IBM Granite AI' : 'Rule Engine'}`,
        title: 'FinSentry AI Report',
      });
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {!layout.isDesktop && <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: px },
          layout.isDesktop && { maxWidth: 1100, alignSelf: 'center' as const, width: '100%' },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Nav bar */}
        <View style={[styles.navBar, isWide && styles.navBarWide]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <View style={styles.backIcon}>
              <Ionicons name="chevron-back" size={18} color={Colors.textPrimary} />
            </View>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>Scan Result</Text>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={18} color={Colors.teal} />
          </TouchableOpacity>
        </View>

        {/* Wide: score + input in a row, rest below */}
        {isWide ? (
          <View style={styles.wideTop}>
            {/* Left: Score card */}
            <View style={[styles.scoreCard, { borderColor: riskColor + '30' }, styles.scoreCardWide]}>
              <LinearGradient colors={[riskColor + '18', riskColor + '05']} style={styles.scoreGrad}>
                <View style={styles.gaugeWrap}>
                  <View style={[styles.gaugeRing, { borderColor: Colors.divider }]}>
                    <View style={[styles.gaugeRingFill, { borderColor: riskColor }]} />
                    <View style={styles.gaugeCenter}>
                      <Text style={[styles.gaugeNumber, { color: riskColor }]}>{result.riskScore}</Text>
                      <Text style={styles.gaugeMax}>/100</Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.riskLabel, { backgroundColor: riskColor + '20', borderColor: riskColor + '40' }]}>
                  <Ionicons name={isHigh ? 'warning' : isMed ? 'alert-circle' : 'shield-checkmark'} size={13} color={riskColor} />
                  <Text style={[styles.riskLabelText, { color: riskColor }]}>{getRiskLabel(result.riskLevel)}</Text>
                </View>
                <View style={styles.metaRow}>
                  <View style={styles.metaChip}>
                    <Ionicons name={result.type === 'message' ? 'chatbubble-outline' : 'link-outline'} size={11} color={Colors.textMuted} />
                    <Text style={styles.metaText}>{result.type === 'message' ? 'Message' : 'Link'} Scan</Text>
                  </View>
                  <View style={styles.metaDot} />
                  <Text style={styles.metaText}>{formatDate(result.timestamp)}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Ionicons name={result.analyzedBy === 'watsonx' ? 'sparkles' : 'shield-half-outline'} size={11} color={result.analyzedBy === 'watsonx' ? Colors.cyan : Colors.textMuted} />
                  <Text style={[styles.metaText, { color: result.analyzedBy === 'watsonx' ? Colors.cyan : Colors.textMuted }]}>
                    {result.analyzedBy === 'watsonx' ? 'IBM Granite AI' : 'Rule Engine'}
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Right: input preview + explanation */}
            <View style={styles.wideRight}>
              <View style={styles.inputPreviewCard}>
                <View style={styles.inputPreviewHeader}>
                  <Ionicons name={result.type === 'message' ? 'chatbubble-ellipses-outline' : 'link-outline'} size={13} color={Colors.textMuted} />
                  <Text style={styles.inputPreviewLabel}>SCANNED {result.type === 'message' ? 'MESSAGE' : 'URL'}</Text>
                </View>
                <Text style={styles.inputPreviewText} numberOfLines={6}>{result.input}</Text>
              </View>
              <View style={styles.explanationCard}>
                <View style={styles.explanationIconWrap}>
                  <Ionicons name="sparkles" size={15} color={Colors.teal} />
                </View>
                <Text style={styles.explanationText}>{result.explanation}</Text>
              </View>
            </View>
          </View>
        ) : (
          <>
            <View style={[styles.scoreCard, { borderColor: riskColor + '30' }]}>
              <LinearGradient colors={[riskColor + '18', riskColor + '05']} style={styles.scoreGrad}>
                <View style={styles.gaugeWrap}>
                  <View style={[styles.gaugeRing, { borderColor: Colors.divider }]}>
                    <View style={[styles.gaugeRingFill, { borderColor: riskColor }]} />
                    <View style={styles.gaugeCenter}>
                      <Text style={[styles.gaugeNumber, { color: riskColor }]}>{result.riskScore}</Text>
                      <Text style={styles.gaugeMax}>/100</Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.riskLabel, { backgroundColor: riskColor + '20', borderColor: riskColor + '40' }]}>
                  <Ionicons name={isHigh ? 'warning' : isMed ? 'alert-circle' : 'shield-checkmark'} size={13} color={riskColor} />
                  <Text style={[styles.riskLabelText, { color: riskColor }]}>{getRiskLabel(result.riskLevel)}</Text>
                </View>
                <View style={styles.metaRow}>
                  <View style={styles.metaChip}>
                    <Ionicons name={result.type === 'message' ? 'chatbubble-outline' : 'link-outline'} size={11} color={Colors.textMuted} />
                    <Text style={styles.metaText}>{result.type === 'message' ? 'Message' : 'Link'} Scan</Text>
                  </View>
                  <View style={styles.metaDot} />
                  <Text style={styles.metaText}>{formatDate(result.timestamp)}</Text>
                  <View style={styles.metaDot} />
                  <View style={styles.metaChip}>
                    <Ionicons name={result.analyzedBy === 'watsonx' ? 'sparkles' : 'shield-half-outline'} size={11} color={result.analyzedBy === 'watsonx' ? Colors.cyan : Colors.textMuted} />
                    <Text style={[styles.metaText, { color: result.analyzedBy === 'watsonx' ? Colors.cyan : Colors.textMuted }]}>
                      {result.analyzedBy === 'watsonx' ? 'IBM Granite' : 'Rule Engine'}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.inputPreviewCard}>
              <View style={styles.inputPreviewHeader}>
                <Ionicons name={result.type === 'message' ? 'chatbubble-ellipses-outline' : 'link-outline'} size={13} color={Colors.textMuted} />
                <Text style={styles.inputPreviewLabel}>SCANNED {result.type === 'message' ? 'MESSAGE' : 'URL'}</Text>
              </View>
              <Text style={styles.inputPreviewText} numberOfLines={4}>{result.input}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AI Analysis</Text>
              <View style={styles.explanationCard}>
                <View style={styles.explanationIconWrap}>
                  <Ionicons name="sparkles" size={15} color={Colors.teal} />
                </View>
                <Text style={styles.explanationText}>{result.explanation}</Text>
              </View>
            </View>
          </>
        )}

        {/* Indicators */}
        {result.indicators.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Warning Signs</Text>
              <View style={[styles.countBadge, { backgroundColor: riskColor + '20', borderColor: riskColor + '35' }]}>
                <Text style={[styles.countBadgeText, { color: riskColor }]}>{result.indicators.length}</Text>
              </View>
            </View>
            {/* Wide: two-column indicators */}
            {isWide ? (
              <View style={styles.indicatorGrid}>
                {result.indicators.map((ind, i) => (
                  <View key={i} style={styles.indicatorGridItem}>
                    <IndicatorCard indicator={ind} />
                  </View>
                ))}
              </View>
            ) : (
              result.indicators.map((ind, i) => <IndicatorCard key={i} indicator={ind} />)
            )}
          </View>
        ) : (
          <View style={styles.safeCard}>
            <View style={styles.safeIconWrap}>
              <Ionicons name="shield-checkmark" size={28} color={Colors.success} />
            </View>
            <Text style={styles.safeTitle}>No Threats Detected</Text>
            <Text style={styles.safeSub}>No known scam patterns were identified. Still exercise caution.</Text>
          </View>
        )}

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Actions</Text>
          {isWide ? (
            <View style={styles.recsGrid}>
              {result.recommendations.map((rec, i) => (
                <View key={i} style={[styles.recRow, styles.recRowGrid]}>
                  <View style={styles.recBullet}><Text style={styles.recBulletText}>{i + 1}</Text></View>
                  <Text style={styles.recText}>{rec}</Text>
                </View>
              ))}
            </View>
          ) : (
            result.recommendations.map((rec, i) => (
              <View key={i} style={styles.recRow}>
                <View style={styles.recBullet}><Text style={styles.recBulletText}>{i + 1}</Text></View>
                <Text style={styles.recText}>{rec}</Text>
              </View>
            ))
          )}
        </View>

        {/* CTA */}
        <TouchableOpacity style={[styles.ctaBtn, isWide && styles.ctaBtnWide]} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <LinearGradient colors={[...Colors.gradientPrimary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaGrad}>
            <Ionicons name="search" size={17} color={Colors.textInverse} />
            <Text style={styles.ctaText}>Scan Another</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>For awareness purposes only. Always verify with official sources before acting.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { paddingBottom: 40, paddingTop: 0, gap: 12 },

  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, paddingBottom: 4 },
  navBarWide: { paddingTop: 24, paddingBottom: 8 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backIcon: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  backText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  navTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  shareBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: Colors.tealLight, borderWidth: 1, borderColor: Colors.teal + '40',
    justifyContent: 'center', alignItems: 'center',
  },

  wideTop: { flexDirection: 'row', gap: 20, alignItems: 'flex-start' },
  scoreCardWide: { width: 240, flexShrink: 0 },
  wideRight: { flex: 1, gap: 12 },

  scoreCard: { borderRadius: BorderRadius.xl, overflow: 'hidden', borderWidth: 1.5 },
  scoreGrad: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16, gap: 12 },
  gaugeWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  gaugeRing: {
    width: 120, height: 120, borderRadius: 60, borderWidth: 8,
    justifyContent: 'center', alignItems: 'center', position: 'relative',
  },
  gaugeRingFill: { position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 8 },
  gaugeCenter: { alignItems: 'center' },
  gaugeNumber: { fontSize: 40, fontWeight: '900', letterSpacing: -1 },
  gaugeMax: { fontSize: 13, color: Colors.textMuted, marginTop: -4 },
  riskLabel: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: BorderRadius.round, borderWidth: 1.5,
  },
  riskLabelText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '500' },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.textMuted },

  inputPreviewCard: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  inputPreviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  inputPreviewLabel: { fontSize: 10, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 0.8 },
  inputPreviewText: { fontSize: 12, color: Colors.textPrimary, lineHeight: 19, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  section: {},
  sectionTitle: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8, letterSpacing: -0.2 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.round, borderWidth: 1.5 },
  countBadgeText: { fontSize: 11, fontWeight: '800' },

  explanationCard: {
    backgroundColor: Colors.tealLight, borderRadius: 12, padding: 12,
    borderWidth: 1.5, borderColor: Colors.teal + '40',
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
  },
  explanationIconWrap: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: Colors.teal + '30', justifyContent: 'center', alignItems: 'center', marginTop: 1,
  },
  explanationText: { flex: 1, fontSize: 13, color: Colors.textPrimary, lineHeight: 19 },

  indicatorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  indicatorGridItem: { flex: 1, minWidth: '48%' },
  indicatorCard: {
    backgroundColor: Colors.surface, borderRadius: 10, padding: 12,
    marginBottom: 8, borderWidth: 1, borderColor: Colors.border,
    borderLeftWidth: 3, gap: 6,
  },
  indicatorTop: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  indicatorDot: { width: 26, height: 26, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  indicatorType: { flex: 1, fontSize: 12, fontWeight: '700' },
  severityChip: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: BorderRadius.round, borderWidth: 1.5 },
  severityChipText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  indicatorDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },
  matchedBox: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceElevated, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: Colors.border,
  },
  matchedText: { fontSize: 11, color: Colors.tealDark, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  safeCard: {
    backgroundColor: Colors.successBg, borderRadius: 14, padding: 20,
    alignItems: 'center', borderWidth: 1.5, borderColor: Colors.success + '45', gap: 6,
  },
  safeIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.success + '22', justifyContent: 'center', alignItems: 'center', marginBottom: 4,
  },
  safeTitle: { fontSize: 16, fontWeight: '700', color: Colors.successDark },
  safeSub: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', lineHeight: 18 },

  recsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  recRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: Colors.surface, borderRadius: 10, padding: 12,
    marginBottom: 6, borderWidth: 1, borderColor: Colors.border,
  },
  recRowGrid: { flex: 1, minWidth: '45%', marginBottom: 0 },
  recBullet: {
    width: 24, height: 24, borderRadius: 8,
    backgroundColor: Colors.blueLight, borderWidth: 1, borderColor: Colors.blue + '40',
    justifyContent: 'center', alignItems: 'center', marginTop: 1,
  },
  recBulletText: { fontSize: 10, fontWeight: '800', color: Colors.blue },
  recText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },

  ctaBtn: { borderRadius: 14, overflow: 'hidden' },
  ctaBtnWide: { alignSelf: 'center' as const, minWidth: 220 },
  ctaGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 15, paddingHorizontal: 32, gap: 8,
  },
  ctaText: { fontSize: 15, fontWeight: '700', color: Colors.textInverse },

  disclaimer: { fontSize: 10, color: Colors.textMuted, textAlign: 'center', lineHeight: 15 },
});
