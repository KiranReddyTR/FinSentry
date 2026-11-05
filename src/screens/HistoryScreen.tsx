import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius } from '../theme';
import { getHistory, deleteScan, clearHistory } from '../services/historyService';
import ScanCard from '../components/ScanCard';
import { ScanResult } from '../types';
import { useLayout } from '../utils/responsive';

type FilterKey = 'all' | 'message' | 'link' | 'high';

const FILTERS: { key: FilterKey; label: string; icon: string }[] = [
  { key: 'all',     label: 'All',       icon: 'list-outline'       },
  { key: 'high',    label: 'High Risk', icon: 'warning-outline'    },
  { key: 'message', label: 'Messages',  icon: 'chatbubble-outline' },
  { key: 'link',    label: 'Links',     icon: 'link-outline'       },
];

export default function HistoryScreen() {
  const navigation = useNavigation<any>();
  const layout = useLayout();
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>('all');

  const px = layout.contentPx;
  const isWide = layout.isTablet || layout.isDesktop;
  // Number of card columns: 1 on mobile, 2 on tablet, 3 on desktop
  const cardCols = layout.isDesktop ? 3 : layout.isTablet ? 2 : 1;

  const loadHistory = async () => {
    setLoading(true);
    const data = await getHistory();
    setHistory(data);
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { loadHistory(); }, []));

  const handleDelete = (id: string) => {
    Alert.alert('Delete Scan', 'Remove this scan from history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => { const updated = await deleteScan(id); setHistory(updated); },
      },
    ]);
  };

  const handleClearAll = () => {
    Alert.alert('Clear All History', 'This will permanently delete all scan records.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All', style: 'destructive',
        onPress: async () => { await clearHistory(); setHistory([]); },
      },
    ]);
  };

  const filtered = history.filter((s) => {
    if (filter === 'all') return true;
    if (filter === 'high') return s.riskLevel === 'high';
    return s.type === filter;
  });

  // For grid layout on wide screens we render rows manually
  const renderGridItems = () => {
    const rows: ScanResult[][] = [];
    for (let i = 0; i < filtered.length; i += cardCols) {
      rows.push(filtered.slice(i, i + cardCols));
    }
    return rows.map((row, ri) => (
      <View key={ri} style={[styles.gridRow, { gap: 12 }]}>
        {row.map((item) => (
          <View key={item.id} style={{ flex: 1 }}>
            <ScanCard
              result={item}
              onPress={() => navigation.navigate('Result', { result: item })}
              onDelete={() => handleDelete(item.id)}
            />
          </View>
        ))}
        {/* Fill empty cells in the last row */}
        {row.length < cardCols &&
          Array.from({ length: cardCols - row.length }).map((_, i) => (
            <View key={`empty-${i}`} style={{ flex: 1 }} />
          ))}
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* ── HEADER ── */}
      <View style={[styles.header, { paddingHorizontal: px }]}>
        <View>
          <Text style={[styles.title, isWide && styles.titleWide]}>Scan History</Text>
          <Text style={styles.subtitle}>
            {history.length} scan{history.length !== 1 ? 's' : ''} recorded
          </Text>
        </View>
        <View style={styles.headerRight}>
          {isWide && (
            <View style={styles.statBadge}>
              <Ionicons name="shield-checkmark-outline" size={13} color={Colors.teal} />
              <Text style={styles.statBadgeText}>Protected</Text>
            </View>
          )}
          {history.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClearAll}>
              <Ionicons name="trash-outline" size={14} color={Colors.danger} />
              <Text style={styles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── FILTER TABS ── */}
      <View style={[styles.filterRow, { paddingHorizontal: px }]}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterTab,
                active && styles.filterTabActive,
                isWide && styles.filterTabWide,
              ]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={f.icon as any}
                size={12}
                color={active ? Colors.textInverse : Colors.textMuted}
              />
              <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── CONTENT ── */}
      {loading ? (
        <View style={styles.centered}>
          <View style={styles.loadingIcon}>
            <Ionicons name="hourglass-outline" size={24} color={Colors.teal} />
          </View>
          <Text style={styles.loadingText}>Loading history…</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="scan-outline" size={32} color={Colors.textMuted} />
          </View>
          <Text style={styles.emptyTitle}>
            {history.length === 0 ? 'No scans yet' : 'No matching scans'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {history.length === 0
              ? 'Analyse a message or link to see results here'
              : 'Try a different filter'}
          </Text>
          {history.length === 0 && (
            <TouchableOpacity
              style={styles.startBtn}
              onPress={() => navigation.navigate('Scanner')}
            >
              <Text style={styles.startBtnText}>Start Scanning</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : isWide ? (
        /* ── WIDE GRID (tablet / desktop) ── */
        <FlatList
          data={[{ key: 'grid' }]}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          renderItem={() => (
            <View style={[styles.gridContainer, { paddingHorizontal: px }]}>
              {renderGridItems()}
              <Text style={styles.listFooter}>
                {filtered.length} of {history.length} scans shown
              </Text>
            </View>
          )}
        />
      ) : (
        /* ── MOBILE LIST ── */
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingHorizontal: px }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ScanCard
              result={item}
              onPress={() => navigation.navigate('Result', { result: item })}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          ListFooterComponent={
            <Text style={styles.listFooter}>
              {filtered.length} of {history.length} scans shown
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 10,
  },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  titleWide: { fontSize: 26 },
  subtitle: { fontSize: 11, color: Colors.textMuted, marginTop: 2, fontWeight: '500' },

  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: Colors.teal + '15',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.teal + '35',
  },
  statBadgeText: { fontSize: 11, color: Colors.teal, fontWeight: '700' },

  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: Colors.dangerBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.danger + '30',
  },
  clearBtnText: { fontSize: 11, color: Colors.danger, fontWeight: '700' },

  filterRow: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 12,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  filterTabWide: { paddingVertical: 10, borderRadius: 10 },
  filterTabActive: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  filterLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '700' },
  filterLabelActive: { color: Colors.textInverse },

  gridContainer: { paddingTop: 4, paddingBottom: 40 },
  gridRow: { flexDirection: 'row', marginBottom: 0 },

  list: { paddingTop: 4, paddingBottom: 40 },
  listFooter: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: 16,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.teal + '18',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  loadingText: { fontSize: 13, color: Colors.textMuted },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
  startBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.teal + '18',
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.teal + '40',
  },
  startBtnText: { fontSize: 13, fontWeight: '700', color: Colors.teal },
});
