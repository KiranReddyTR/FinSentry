import { RiskLevel } from '../types';
import { Colors } from '../theme';

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: diffDay > 365 ? 'numeric' : undefined,
  });
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'high': return Colors.danger;
    case 'medium': return Colors.warning;
    case 'low': return Colors.success;
    default: return Colors.textSecondary;
  }
}

export function getRiskBgColor(level: RiskLevel): string {
  switch (level) {
    case 'high': return Colors.dangerBg;
    case 'medium': return Colors.warningBg;
    case 'low': return Colors.successBg;
    default: return Colors.surface;
  }
}

export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case 'high': return 'HIGH RISK';
    case 'medium': return 'MEDIUM RISK';
    case 'low': return 'LOW RISK';
    default: return 'UNKNOWN';
  }
}

export function getRiskEmoji(level: RiskLevel): string {
  switch (level) {
    case 'high': return '🚨';
    case 'medium': return '⚠️';
    case 'low': return '✅';
    default: return '❓';
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function isValidUrl(str: string): boolean {
  try {
    const normalized = str.startsWith('http') ? str : `http://${str}`;
    new URL(normalized);
    return true;
  } catch {
    return false;
  }
}
