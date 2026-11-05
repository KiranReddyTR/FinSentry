import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, BorderRadius } from '../theme';
import { AWARENESS_CATEGORIES } from '../data/awarenessData';
import { AwarenessCategory } from '../types';
import { useLayout } from '../utils/responsive';

// ─── Category Card ─────────────────────────────────────────────────────────────

function CategoryCard({
  category,
  onPress,
  isExpanded,
}: {
  category: AwarenessCategory;
  onPress: () => void;
  isExpanded: boolean;
}) {
  return (
    <View style={[styles.card, isExpanded && { borderColor: category.color + '40' }]}>
      <TouchableOpacity style={styles.cardTrigger} onPress={onPress} activeOpacity={0.8}>
        <View style={[styles.catIconWrap, { backgroundColor: category.color + '18' }]}>
          <Ionicons name={category.icon as any} size={20} color={category.color} />
        </View>
        <View style={styles.catInfo}>
          <Text style={styles.catTitle}>{category.title}</Text>
          <Text style={styles.catDesc} numberOfLines={isExpanded ? undefined : 1}>
            {category.description}
          </Text>
        </View>
        <View style={[styles.chevronWrap, isExpanded && { backgroundColor: category.color + '18' }]}>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={isExpanded ? category.color : Colors.textMuted}
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedBody}>
          {/* Tips */}
          <View style={styles.subsection}>
            <View style={styles.subsectionHeader}>
              <Ionicons name="shield-checkmark-outline" size={13} color={Colors.teal} />
              <Text style={[styles.subsectionTitle, { color: Colors.teal }]}>Protection Tips</Text>
            </View>
            {category.tips.map((tip, i) => (
              <View key={i} style={styles.listRow}>
                <View style={[styles.bullet, { backgroundColor: Colors.teal }]} />
                <Text style={styles.listText}>{tip}</Text>
              </View>
            ))}
          </View>

          {/* Red Flags */}
          <View style={[styles.subsection, styles.redFlagBox]}>
            <View style={styles.subsectionHeader}>
              <Ionicons name="warning-outline" size={13} color={Colors.danger} />
              <Text style={[styles.subsectionTitle, { color: Colors.danger }]}>Red Flags</Text>
            </View>
            {category.redFlags.map((flag, i) => (
              <View key={i} style={styles.listRow}>
                <View style={[styles.bullet, { backgroundColor: Colors.danger }]} />
                <Text style={styles.listText}>{flag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function AwarenessScreen() {
  const layout = useLayout();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const px = layout.contentPx;
  const isWide = layout.isTablet || layout.isDesktop;
  // On desktop show 2 columns of category cards; tablet stays single column
  const useTwoCols = layout.isDesktop;

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Split categories into two columns for desktop
  const leftCats = useTwoCols
    ? AWARENESS_CATEGORIES.filter((_, i) => i % 2 === 0)
    : AWARENESS_CATEGORIES;
  const rightCats = useTwoCols
    ? AWARENESS_CATEGORIES.filter((_, i) => i % 2 !== 0)
    : [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HEADER ── */}
        <View style={[styles.header, { paddingHorizontal: px }]}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconWrap}>
              <Ionicons name="book" size={20} color={Colors.teal} />
            </View>
            <View>
              <Text style={[styles.title, isWide && styles.titleWide]}>Awareness Centre</Text>
              <Text style={styles.subtitle}>Learn to recognise financial scams</Text>
            </View>
          </View>
          {isWide && (
            <View style={styles.headerBadge}>
              <Ionicons name="information-circle-outline" size={13} color={Colors.cyan} />
              <Text style={styles.headerBadgeText}>{AWARENESS_CATEGORIES.length} Categories</Text>
            </View>
          )}
        </View>

        {/* ── STAT BANNER ── */}
        <View style={[styles.statBannerWrap, { marginHorizontal: px }]}>
          <LinearGradient colors={[Colors.danger + '10', Colors.surface]} style={styles.statBannerGrad}>
            <Ionicons name="alert-circle" size={18} color={Colors.danger} />
            <View style={styles.statBannerContent}>
              <Text style={styles.statBannerTitle}>India Cyber Fraud 2023</Text>
              <View style={styles.statBannerRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: Colors.danger }]}>₹10,319 Cr</Text>
                  <Text style={styles.statLbl}>Lost to fraud</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: Colors.warning }]}>15.6L+</Text>
                  <Text style={styles.statLbl}>Complaints filed</Text>
                </View>
                {isWide && (
                  <>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={[styles.statNum, { color: Colors.teal }]}>30%</Text>
                      <Text style={styles.statLbl}>UPI scams</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={[styles.statNum, { color: Colors.cyan }]}>1930</Text>
                      <Text style={styles.statLbl}>Helpline</Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ── CATEGORIES ── */}
        <View style={[styles.categoriesSection, { paddingHorizontal: px }]}>
          <Text style={styles.sectionLabel}>TAP ANY TOPIC TO LEARN MORE</Text>

          {useTwoCols ? (
            /* Desktop: 2-column grid */
            <View style={styles.twoColRow}>
              {/* Left column */}
              <View style={styles.twoColPane}>
                {leftCats.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    isExpanded={expandedId === cat.id}
                    onPress={() => handleToggle(cat.id)}
                  />
                ))}
              </View>
              {/* Right column */}
              <View style={styles.twoColPane}>
                {rightCats.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    category={cat}
                    isExpanded={expandedId === cat.id}
                    onPress={() => handleToggle(cat.id)}
                  />
                ))}
              </View>
            </View>
          ) : (
            /* Mobile / tablet: single column */
            AWARENESS_CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                isExpanded={expandedId === cat.id}
                onPress={() => handleToggle(cat.id)}
              />
            ))
          )}
        </View>

        {/* ── REPORT SECTION ── */}
        <View style={[styles.reportCard, { marginHorizontal: px }]}>
          <View style={[styles.reportIconWrap, { backgroundColor: Colors.warning + '20' }]}>
            <Ionicons name="megaphone-outline" size={18} color={Colors.warning} />
          </View>
          <View style={styles.reportContent}>
            <Text style={styles.reportTitle}>Report a Scam</Text>
            <Text style={styles.reportText}>
              Report cyber fraud to the National Cyber Crime Portal or call the helpline.
            </Text>
            <View style={[styles.reportLinks, isWide && styles.reportLinksRow]}>
              <View style={styles.reportLink}>
                <Ionicons name="globe-outline" size={12} color={Colors.teal} />
                <Text style={styles.reportLinkText}>cybercrime.gov.in</Text>
              </View>
              <View style={styles.reportLink}>
                <Ionicons name="call-outline" size={12} color={Colors.teal} />
                <Text style={styles.reportLinkText}>Helpline: 1930</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={[styles.disclaimer, { marginHorizontal: px }]}>
          Sources: RBI, CERT-In, Ministry of Home Affairs, SEBI. For educational awareness only.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    paddingBottom: 10,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.teal + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.teal + '35',
  },
  title: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  titleWide: { fontSize: 22 },
  subtitle: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },

  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: Colors.cyan + '15',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.cyan + '35',
  },
  headerBadgeText: { fontSize: 11, color: Colors.cyan, fontWeight: '700' },

  statBannerWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.danger + '30',
    marginBottom: 4,
  },
  statBannerGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  statBannerContent: { flex: 1 },
  statBannerTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.danger,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  statBannerRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 16, fontWeight: '800', letterSpacing: -0.5 },
  statLbl: { fontSize: 10, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },
  statDivider: { width: 1, height: 28, backgroundColor: Colors.danger + '30', marginHorizontal: 8 },

  categoriesSection: { paddingTop: 14, paddingBottom: 4 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  // Two-column desktop layout
  twoColRow: { flexDirection: 'row', gap: 12 },
  twoColPane: { flex: 1 },

  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  cardTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  catIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catInfo: { flex: 1 },
  catTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  catDesc: { fontSize: 11, color: Colors.textMuted, lineHeight: 15 },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  expandedBody: {
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    padding: 14,
    gap: 12,
  },
  subsection: {},
  redFlagBox: {
    backgroundColor: Colors.danger + '0a',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.danger + '20',
  },
  subsectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  subsectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 6,
    flexShrink: 0,
  },
  listText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },

  reportCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.warningBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.warning + '28',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  reportIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportContent: { flex: 1 },
  reportTitle: { fontSize: 13, fontWeight: '700', color: Colors.warning, marginBottom: 4 },
  reportText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17, marginBottom: 8 },
  reportLinks: { gap: 5 },
  reportLinksRow: { flexDirection: 'row', gap: 16 },
  reportLink: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  reportLinkText: { fontSize: 12, color: Colors.teal, fontWeight: '600' },

  disclaimer: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 15,
    marginTop: 16,
    paddingBottom: 40,
  },
});
