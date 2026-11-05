import React from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../theme';
import { RiskLevel } from '../types';
import { getRiskColor, getRiskLabel } from '../utils/helpers';

interface Props {
  score: number;
  level: RiskLevel;
  size?: 'small' | 'medium' | 'large';
}

export default function RiskMeter({ score, level, size = 'medium' }: Props) {
  const color = getRiskColor(level);

  const dimensions = {
    small: { ring: 80, stroke: 6, fontSize: 18, labelSize: 9 },
    medium: { ring: 120, stroke: 8, fontSize: 26, labelSize: 10 },
    large: { ring: 160, stroke: 10, fontSize: 36, labelSize: 12 },
  }[size];

  const radius = (dimensions.ring - dimensions.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const icon =
    level === 'high' ? 'warning' : level === 'medium' ? 'alert-circle' : 'shield-checkmark';

  return (
    <View style={[styles.container, { width: dimensions.ring, height: dimensions.ring }]}>
      {/* Background SVG ring via border */}
      <View
        style={[
          styles.outerRing,
          {
            width: dimensions.ring,
            height: dimensions.ring,
            borderRadius: dimensions.ring / 2,
            borderWidth: dimensions.stroke,
            borderColor: Colors.divider,
          },
        ]}
      />
      {/* Score text */}
      <View style={styles.center}>
        <Text style={[styles.score, { fontSize: dimensions.fontSize, color }]}>
          {score}
        </Text>
        <Text style={[styles.outOf, { fontSize: dimensions.labelSize }]}>/100</Text>
      </View>
      {/* Color fill arc approximation using border */}
      <View
        style={[
          styles.progressRing,
          {
            width: dimensions.ring,
            height: dimensions.ring,
            borderRadius: dimensions.ring / 2,
            borderWidth: dimensions.stroke,
            borderColor: color,
            opacity: score > 0 ? 1 : 0,
          },
        ]}
      />
    </View>
  );
}

// Separate flat risk indicator for compact usage
export function RiskBadge({ level }: { level: RiskLevel }) {
  const color = getRiskColor(level);
  const icon = level === 'high' ? 'warning' : level === 'medium' ? 'alert-circle' : 'shield-checkmark';

  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color + '44' }]}>
      <Ionicons name={icon as any} size={12} color={color} />
      <Text style={[styles.badgeText, { color }]}>{getRiskLabel(level)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
  },
  progressRing: {
    position: 'absolute',
  },
  center: {
    alignItems: 'center',
    zIndex: 1,
  },
  score: {
    fontWeight: '800',
    letterSpacing: -1,
  },
  outOf: {
    color: Colors.textMuted,
    fontWeight: '500',
    marginTop: -2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
