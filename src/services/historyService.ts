/**
 * AsyncStorage-backed scan history service
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScanResult } from '../types';

const STORAGE_KEY = 'scamshield_scan_history';
const MAX_HISTORY = 100;

export async function saveScan(result: ScanResult): Promise<void> {
  try {
    const existing = await getHistory();
    const updated = [result, ...existing].slice(0, MAX_HISTORY);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('[history] Failed to save scan:', err);
  }
}

export async function getHistory(): Promise<ScanResult[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ScanResult[];
  } catch {
    return [];
  }
}

export async function deleteScan(id: string): Promise<ScanResult[]> {
  const existing = await getHistory();
  const updated = existing.filter((s) => s.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function getStats(): Promise<{
  total: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  messagesScanned: number;
  linksScanned: number;
}> {
  const history = await getHistory();
  return {
    total: history.length,
    highRisk: history.filter((s) => s.riskLevel === 'high').length,
    mediumRisk: history.filter((s) => s.riskLevel === 'medium').length,
    lowRisk: history.filter((s) => s.riskLevel === 'low').length,
    messagesScanned: history.filter((s) => s.type === 'message').length,
    linksScanned: history.filter((s) => s.type === 'link').length,
  };
}
