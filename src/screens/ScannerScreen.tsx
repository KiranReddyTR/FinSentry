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

const EXAMPLES = [
  { label: 'KYC Scam',      icon: 'alert-circle', color: Colors.danger,  text: 'Dear Customer, Your SBI account will be blocked. Click here to update KYC immediately: http://sbi-update-kyc.xyz/login' },
  { label: 'Lottery Fraud', icon: 'gift',          color: Colors.warning, text: 'Congratulations! You have won ₹50,000 in our lucky draw. Share the OTP sent to your phone to claim your prize.' },
  { label: 'Loan Scam',     icon: 'cash',          color: Colors.warning, text: 'URGENT: Your loan has been approved for ₹5 Lakhs. Pay ₹2,500 processing fee now to disburse amount to your account.' },
  { label: 'Job Fraud',     icon: 'briefcase',     color: Colors.blue,    text: 'Earn ₹5000 daily working from home. No investment needed. WhatsApp: +91-XXXXXXXXXX to join our team.' },
];

export default function ScannerScreen() {
  const navigation = useNavigation<any>();
  const layout = useLayout();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const inputRef = useRef<TextInput>(null);
  const aiEnabled = isWatsonxConfigured();

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) { setMessage(text); setCharCount(text.length); }
    } catch { Alert.alert('Error', 'Could not access clipboard.'); }
  };

  const handleClear = () => { setMessage(''); setCharCount(0); inputRef.current?.focus(); };

  const handleScan = async () => {
    const trimmed = message.trim();
    if (!trimmed) { Alert.alert('Empty Input', 'Please paste or type a message.'); return; }
    if (trimmed.length < 10) { Alert.alert('Too Short', 'Please enter at least 10 characters.'); return; }
    setLoading(true);
    try {
      const result = await analyzeWithWatsonx('message', trimmed);
      await saveScan(result);
      navigation.navigate('Result', { result });
    } catch { Alert.alert('Analysis Failed', 'Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };

  const px = layout.contentPx;
  const isWide = layout.isTablet || layout.isDesktop;

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
              <LinearGradient colors={[Colors.teal + '35', Colors.tealLight]} style={styles.headerIconGrad}>
                <Ionicons name="chatbubble-ellipses" size={isWide ? 30 : 26} color={Colors.teal} />
              </LinearGradient>
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.screenTitle, isWide && styles.screenTitleWide]}>Message Scanner</Text>
              <Text style={styles.screenSub}>Paste any suspicious SMS, WhatsApp or email for AI analysis</Text>
            </View>
            <View style={[styles.engineChip, {
              borderColor: aiEnabled ? Colors.teal : Colors.textMuted + '40',
              backgroundColor: aiEnabled ? Colors.tealLight : Colors.surface,
            }]}>
              <Ionicons name={aiEnabled ? 'sparkles' : 'shield-half-outline'} size={10} color={aiEnabled ? Colors.teal : Colors.textMuted} />
              <Text style={[styles.engineChipText, { color: aiEnabled ? Colors.tealDark : Colors.textMuted }]}>
                {aiEnabled ? 'IBM AI' : 'Local'}
              </Text>
            </View>
          </View>

          {/* Two-column on desktop */}
          {isWide ? (
            <View style={styles.twoCol}>
              {/* Left: input + button */}
              <View style={styles.colLeft}>
                <View style={styles.inputCard}>
                  <TextInput
                    ref={inputRef}
                    style={[styles.input, isWide && styles.inputWide]}
                    placeholder="Paste your suspicious message here…"
                    placeholderTextColor={Colors.textMuted}
                    multiline value={message}
                    onChangeText={(t) => { setMessage(t); setCharCount(t.length); }}
                    maxLength={2000} textAlignVertical="top" selectionColor={Colors.teal}
                  />
                  <View style={styles.inputFooter}>
                    <Text style={[styles.charCount, charCount > 1800 && { color: Colors.warning }]}>{charCount}/2000</Text>
                    <View style={styles.inputActions}>
                      {message.length > 0 && (
                        <TouchableOpacity onPress={handleClear} style={styles.inputActionBtn}>
                          <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
                          <Text style={styles.inputActionText}>Clear</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity onPress={handlePaste} style={[styles.inputActionBtn, styles.pasteBtn]}>
                        <Ionicons name="clipboard-outline" size={15} color={Colors.teal} />
                        <Text style={[styles.inputActionText, { color: Colors.teal }]}>Paste</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <PrimaryButton
                  title={loading ? 'Analysing…' : 'Analyse Message'}
                  onPress={handleScan} loading={loading}
                  disabled={message.trim().length < 5}
                  icon={!loading ? <Ionicons name="search" size={17} color={Colors.textInverse} /> : undefined}
                />
                <PrivacyNote />
              </View>
              {/* Right: examples */}
              <View style={styles.colRight}>
                <ExamplesPanel onSelect={(t) => { setMessage(t); setCharCount(t.length); }} />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.inputCard}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder="Paste your suspicious message here…"
                  placeholderTextColor={Colors.textMuted}
                  multiline value={message}
                  onChangeText={(t) => { setMessage(t); setCharCount(t.length); }}
                  maxLength={2000} textAlignVertical="top" selectionColor={Colors.teal}
                />
                <View style={styles.inputFooter}>
                  <Text style={[styles.charCount, charCount > 1800 && { color: Colors.warning }]}>{charCount}/2000</Text>
                  <View style={styles.inputActions}>
                    {message.length > 0 && (
                      <TouchableOpacity onPress={handleClear} style={styles.inputActionBtn}>
                        <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
                        <Text style={styles.inputActionText}>Clear</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={handlePaste} style={[styles.inputActionBtn, styles.pasteBtn]}>
                      <Ionicons name="clipboard-outline" size={15} color={Colors.teal} />
                      <Text style={[styles.inputActionText, { color: Colors.teal }]}>Paste</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <PrimaryButton
                title={loading ? 'Analysing…' : 'Analyse Message'}
                onPress={handleScan} loading={loading}
                disabled={message.trim().length < 5}
                icon={!loading ? <Ionicons name="search" size={17} color={Colors.textInverse} /> : undefined}
              />
              <ExamplesPanel onSelect={(t) => { setMessage(t); setCharCount(t.length); }} />
              <PrivacyNote />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ExamplesPanel({ onSelect }: { onSelect: (t: string) => void }) {
  return (
    <View style={styles.examplesSection}>
      <View style={styles.examplesHeader}>
        <Ionicons name="flask-outline" size={13} color={Colors.textMuted} />
        <Text style={styles.examplesTitle}>TRY EXAMPLE MESSAGES</Text>
      </View>
      {EXAMPLES.map((ex, i) => (
        <TouchableOpacity key={i} style={styles.exampleRow} onPress={() => onSelect(ex.text)} activeOpacity={0.8}>
          <View style={[styles.exampleIconWrap, { backgroundColor: ex.color + '18' }]}>
            <Ionicons name={ex.icon as any} size={14} color={ex.color} />
          </View>
          <View style={styles.exampleContent}>
            <Text style={[styles.exampleLabel, { color: ex.color }]}>{ex.label}</Text>
            <Text style={styles.exampleText} numberOfLines={1}>{ex.text}</Text>
          </View>
          <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

function PrivacyNote() {
  return (
    <View style={styles.privacyNote}>
      <Ionicons name="lock-closed" size={14} color={Colors.success} />
      <Text style={styles.privacyText}>
        Messages are analysed locally or via IBM watsonx. We never store your personal messages on external servers.{' '}
        <Text style={styles.privacyStrong}>Do not enter real OTPs, PINs, or passwords.</Text>
      </Text>
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

  twoCol: { flexDirection: 'row', gap: 20, alignItems: 'flex-start' },
  colLeft: { flex: 1.2, gap: 14 },
  colRight: { flex: 1 },

  inputCard: {
    backgroundColor: Colors.card, borderRadius: 16,
    borderWidth: 1.5, borderColor: Colors.border, overflow: 'hidden',
  },
  input: { color: Colors.textPrimary, fontSize: 14, lineHeight: 22, padding: 14, minHeight: 150, maxHeight: 280 },
  inputWide: { minHeight: 200 },
  inputFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: Colors.divider, backgroundColor: Colors.surface,
  },
  charCount: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
  inputActions: { flexDirection: 'row', gap: 8 },
  inputActionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  pasteBtn: { backgroundColor: Colors.tealLight, borderWidth: 1, borderColor: Colors.teal + '50' },
  inputActionText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },

  examplesSection: { gap: 6 },
  examplesHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  examplesTitle: { fontSize: 10, color: Colors.textSecondary, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },
  exampleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surface, borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  exampleIconWrap: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  exampleContent: { flex: 1 },
  exampleLabel: { fontSize: 11, fontWeight: '700', marginBottom: 2 },
  exampleText: { fontSize: 11, color: Colors.textSecondary, lineHeight: 15 },

  privacyNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: Colors.successBg, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: Colors.success + '40',
  },
  privacyText: { flex: 1, fontSize: 11, color: Colors.textSecondary, lineHeight: 17 },
  privacyStrong: { fontWeight: '700', color: Colors.successDark },
});
