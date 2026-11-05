import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme';
import { ScanResult } from '../types';
import { getRiskColor, getRiskLabel, formatDate, truncateText } from '../utils/helpers';

interface Props {
  result: ScanResult;
  onPress?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

export default function ScanCard({ result, onPress, onDelete, compact = false }: Props) {
  const riskColor = getRiskColor(result.riskLevel);
  const isMessage = result.type === 'message';
  const typeIcon = isMessage ? 'chatbubble-ellipses' : 'link';
  const typeLabel = isMessage ? 'Message' : 'Link';
  const isHigh = result.riskLevel === 'high';
  const isMed = result.riskLevel === 'medium';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.82}
    >
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: riskColor }]} />

      <View style={styles.inner}>
        {/* Row 1: icon + title + badge + delete */}
        <View style={styles.topRow}>
          <View style={[styles.typeIcon, { backgroundColor: riskColor + '20' }]}>
            <Ionicons name={typeIcon as any} size={15} color={riskColor} />
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.typeLabel}>{typeLabel} Scan</Text>
            <Text style={styles.timeText}>{formatDate(result.timestamp)}</Text>
          </View>
          <View style={[styles.riskPill, { backgroundColor: riskColor + '20', borderColor: riskColor + '40' }]}>
            {isHigh && <Ionicons name="warning" size={9} color={riskColor} />}
            {isMed && <Ionicons name="alert-circle" size={9} color={riskColor} />}
            <Text style={[styles.riskPillText, { color: riskColor }]}>
              {getRiskLabel(result.riskLevel)}
            </Text>
          </View>
          {onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              style={styles.deleteBtn}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons name="trash-outline" size={13} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Row 2: text preview (non-compact) */}
        {!compact && (
          <Text style={styles.preview} numberOfLines={2}>
            {truncateText(result.input, 110)}
          </Text>
        )}

        {/* Row 3: score bar + engine badge */}
        <View style={styles.bottomRow}>
          <View style={styles.scoreTrack}>
            <View
              style={[styles.scoreFill, { width: `${result.riskScore}%` as any, backgroundColor: riskColor }]}
            />
          </View>
          <Text style={[styles.scoreNum, { color: riskColor }]}>{result.riskScore}</Text>
          <View style={styles.dividerDot} />
          <View style={styles.engineBadge}>
            <Ionicons
              name={result.analyzedBy === 'watsonx' ? 'sparkles' : 'shield-half-outline'}
              size={9}
              color={result.analyzedBy === 'watsonx' ? Colors.cyan : Colors.textMuted}
            />
            <Text style={[styles.engineText, { color: result.analyzedBy === 'watsonx' ? Colors.cyan : Colors.textMuted }]}>
              {result.analyzedBy === 'watsonx' ? 'IBM Granite' : 'Rule Engine'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    // Subtle card shadow
    shadowColor: '#1769E8',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  accentBar: {
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  inner: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleBlock: { flex: 1 },
  typeLabel: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  timeText: { fontSize: 10, color: Colors.textMuted, marginTop: 1 },
  riskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
    borderWidth: 1.5,
  },
  riskPillText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
  deleteBtn: { padding: 2 },
  preview: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
    marginLeft: 38,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 38,
  },
  scoreTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.divider,
    borderRadius: 2,
    overflow: 'hidden',
  },
  scoreFill: { height: '100%', borderRadius: 2 },
  scoreNum: { fontSize: 11, fontWeight: '800', minWidth: 22, textAlign: 'right' },
  dividerDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.border },
  engineBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  engineText: { fontSize: 9, fontWeight: '600' },
});
