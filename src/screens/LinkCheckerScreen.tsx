import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, BorderRadius } from '../theme';
import { useLayout } from '../utils/responsive';
import { analyzeWithWatsonx } from '../services/watsonxService';
import { saveScan } from '../services/historyService';
import { isWatsonxConfigured } from '../services/watsonxService';
import { PrimaryButton } from '../components/Button';

const EXAMPLE_URLS = [
  { label: 'KYC Phishing',   risk: 'high',   url: 'http://sbi-secure-login.xyz/kyc-update'          },
  { label: 'Shortened URL',  risk: 'medium', url: 'https://bit.ly/payreward2024'                    },
  { label: 'IP Address URL', risk: 'high',   url: 'http://192.168.1.1/bank/login'                   },
  { label: 'Typosquatting',  risk: 'high',   url: 'https://hdfc-bank-verify.top/account/confirm'    },
  { label: 'Legitimate Site',risk: 'low',    url: 'https://www.hdfcbank.com/personal/pay'           },
];

const CHECK_ITEMS = [
  { icon: 'globe-outline',        label: 'Domain typosquatting',      color: Colors.danger          },
  { icon: 'lock-open-outline',    label: 'Missing HTTPS encryption',  color: Colors.warning         },
  { icon: 'code-slash-outline',   label: 'IP address in URL',         color: Colors.danger          },
  { icon: 'alert-circle-outline', label: 'Suspicious TLD extensions', color: Colors.warning         },
  { icon: 'key-outline',          label: 'Phishing keywords in path', color: Colors.danger          },
  { icon: 'git-branch-outline',   label: 'Excessive subdomains',      color: Colors.warning         },
  { icon: 'link-outline',         label: 'URL shortener detection',   color: Colors.textSecondary   },
];

export default function LinkCheckerScreen() {
  const navigation = useNavigation<any>();
  const layout = useLayout();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const aiEnabled = isWatsonxConfigured();
  const isWide = layout.isTablet || layout.isDesktop;

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) setUrl(text.trim());
    } catch { Alert.alert('Error', 'Could not access clipboard.'); }
  };

  const handleCheck = async () => {
    const trimmed = url.trim();
    if (!trimmed) { Alert.alert('Empty Input', 'Please enter a URL to check.'); return; }
    setLoading(true);
    try {
      const result = await analyzeWithWatsonx('link', trimmed);
      await saveScan(result);
      navigation.navigate('Result', { result });
    } catch { Alert.alert('Check Failed', 'Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  const riskColor = (r: string) =>
    r === 'high' ? Colors.danger : r === 'medium' ? Colors.warning : Colors.success;

  const px = layout.contentPx;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {!layout.isDesktop && <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />}
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.content,
            { paddingHorizontal: px },
            layout.isDesktop && { maxWidth: 900, alignSelf: 'center' as const, width: '100%' },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={[styles.screenHeader, isWide && styles.screenHeaderWide]}>
            <View style={styles.headerIconWrap}>
              <LinearGradient colors={[Colors.cyan + '35', Colors.cyanLight]} style={styles.headerIconGrad}>
                <Ionicons name="link" size={isWide ? 30 : 26} color={Colors.cyan} />
              </LinearGradient>
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.screenTitle, isWide && styles.screenTitleWide]}>Link Checker</Text>
              <Text style={styles.screenSub}>Detect phishing URLs without opening them</Text>
            </View>
            <View style={[styles.engineChip, {
              borderColor: aiEnabled ? Colors.cyan : Colors.textMuted + '40',
              backgroundColor: aiEnabled ? Colors.cyanLight : Colors.surface,
            }]}>
              <Ionicons name={aiEnabled ? 'sparkles' : 'shield-half-outline'} size={10} color={aiEnabled ? Colors.cyan : Colors.textMuted} />
              <Text style={[styles.engineChipText, { color: aiEnabled ? Colors.cyan : Colors.textMuted }]}>
                {aiEnabled ? 'IBM AI' : 'Local'}
              </Text>
            </View>
          </View>

          {/* Safety notice */}
          <View style={styles.safetyBanner}>
            <View style={styles.safetyIconWrap}>
              <Ionicons name="eye-off" size={15} color={Colors.teal} />
            </View>
            <Text style={styles.safetyText}>
              <Text style={styles.safetyBold}>Links are never opened.</Text>
              {' '}We analyse URL structure, domain patterns, and indicators only.
            </Text>
          </View>

          {/* Wide: two-column layout */}
          {isWide ? (
            <View style={styles.twoCol}>
              <View style={styles.colLeft}>
                {/* URL input */}
                <View style={styles.inputCard}>
                  <View style={styles.inputRow}>
                    <Ionicons name="link-outline" size={17} color={Colors.textMuted} style={{ marginRight: 6 }} />
                    <TextInput
                      ref={inputRef}
                      style={styles.input}
                      placeholder="https://example.com/path"
                      placeholderTextColor={Colors.textMuted}
                      value={url} onChangeText={setUrl}
                      autoCapitalize="none" autoCorrect={false}
                      keyboardType="url" selectionColor={Colors.cyan}
                    />
                    {url.length > 0 ? (
                      <TouchableOpacity onPress={() => setUrl('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={styles.pasteInline} onPress={handlePaste}>
                        <Ionicons name="clipboard-outline" size={14} color={Colors.cyan} />
                        <Text style={styles.pasteText}>Paste</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <PrimaryButton
                  title={loading ? 'Checking…' : 'Check Link'} onPress={handleCheck}
                  loading={loading} disabled={url.trim().length < 4}
                  icon={!loading ? <Ionicons name="search" size={17} color={Colors.textInverse} /> : undefined}
                />
                {/* What we check */}
                <ChecksCard />
              </View>
              <View style={styles.colRight}>
                <ExamplesPanel urls={EXAMPLE_URLS} riskColor={riskColor} onSelect={setUrl} />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.inputCard}>
                <View style={styles.inputRow}>
                  <Ionicons name="link-outline" size={17} color={Colors.textMuted} style={{ marginRight: 6 }} />
                  <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder="https://example.com/path"
                    placeholderTextColor={Colors.textMuted}
                    value={url} onChangeText={setUrl}
                    autoCapitalize="none" autoCorrect={false}
                    keyboardType="url" selectionColor={Colors.cyan}
                  />
                  {url.length > 0 ? (
                    <TouchableOpacity onPress={() => setUrl('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.pasteInline} onPress={handlePaste}>
                      <Ionicons name="clipboard-outline" size={14} color={Colors.cyan} />
                      <Text style={styles.pasteText}>Paste</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <PrimaryButton
                title={loading ? 'Checking…' : 'Check Link'} onPress={handleCheck}
                loading={loading} disabled={url.trim().length < 4}
                icon={!loading ? <Ionicons name="search" size={17} color={Colors.textInverse} /> : undefined}
              />
              <ChecksCard />
              <ExamplesPanel urls={EXAMPLE_URLS} riskColor={riskColor} onSelect={setUrl} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ChecksCard() {
  return (
    <View style={styles.checksCard}>
      <Text style={styles.checksTitle}>WHAT WE ANALYSE</Text>
      <View style={styles.checksGrid}>
        {CHECK_ITEMS.map((item) => (
          <View key={item.label} style={styles.checkItem}>
            <View style={[styles.checkIcon, { backgroundColor: item.color + '18' }]}>
              <Ionicons name={item.icon as any} size={13} color={item.color} />
            </View>
            <Text style={styles.checkLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ExamplesPanel({ urls, riskColor, onSelect }: { urls: typeof EXAMPLE_URLS; riskColor: (r: string) => string; onSelect: (u: string) => void }) {
  return (
    <View style={styles.examplesSection}>
      <Text style={styles.examplesTitle}>TRY EXAMPLE URLS</Text>
      {urls.map((ex, i) => (
        <TouchableOpacity key={i} style={styles.exampleRow} onPress={() => onSelect(ex.url)} activeOpacity={0.8}>
          <View style={[styles.riskDot, { backgroundColor: riskColor(ex.risk) }]} />
          <View style={styles.exampleContent}>
            <Text style={[styles.exampleLabel, { color: riskColor(ex.risk) }]}>{ex.label}</Text>
            <Text style={styles.exampleUrl} numberOfLines={1}>{ex.url}</Text>
          </View>
          <Ionicons name="chevron-forward" size={13} color={Colors.textMuted} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingBottom: 40, paddingTop: 0, gap: 14 },

  screenHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 14, paddingBottom: 4 },
  screenHeaderWide: { paddingTop: 28, paddingBottom: 8 },
  headerIconWrap: { borderRadius: 14, overflow: 'hidden' },
  headerIconGrad: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  headerText: { flex: 1 },
  screenTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  screenTitleWide: { fontSize: 22 },
  screenSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  engineChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: BorderRadius.round, borderWidth: 1.5,
  },
  engineChipText: { fontSize: 10, fontWeight: '700' },

  safetyBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.tealLight, borderRadius: 10, padding: 12,
    borderWidth: 1.5, borderColor: Colors.teal + '45',
  },
  safetyIconWrap: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: Colors.teal + '25', justifyContent: 'center', alignItems: 'center',
  },
  safetyText: { flex: 1, fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },
  safetyBold: { fontWeight: '700', color: Colors.tealDark },

  twoCol: { flexDirection: 'row', gap: 20, alignItems: 'flex-start' },
  colLeft: { flex: 1.2, gap: 14 },
  colRight: { flex: 1 },

  inputCard: {
    backgroundColor: Colors.card, borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, color: Colors.textPrimary, fontSize: 14, paddingVertical: 4 },
  pasteInline: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    backgroundColor: Colors.cyanLight, borderRadius: 8,
    borderWidth: 1.5, borderColor: Colors.cyan + '50',
  },
  pasteText: { fontSize: 11, color: Colors.cyan, fontWeight: '700' },

  checksCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  checksTitle: { fontSize: 10, fontWeight: '800', color: Colors.textSecondary, marginBottom: 12, letterSpacing: 0.8 },
  checksGrid: { gap: 8 },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkIcon: { width: 30, height: 30, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  checkLabel: { fontSize: 12, color: Colors.textSecondary, flex: 1 },

  examplesSection: { gap: 6 },
  examplesTitle: { fontSize: 10, fontWeight: '800', color: Colors.textSecondary, letterSpacing: 1.2, marginBottom: 4 },
  exampleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surface, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: Colors.border,
  },
  riskDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  exampleContent: { flex: 1 },
  exampleLabel: { fontSize: 11, fontWeight: '700', marginBottom: 2 },
  exampleUrl: { fontSize: 11, color: Colors.textSecondary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
});
