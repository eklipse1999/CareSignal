import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import apiClient from '../api/apiClient';
import { colors } from '../theme/colors';

function formatSymptomName(raw) {
  if (!raw) return '';
  return raw
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function SymptomCheckerScreen({ navigation, route }) {
  const [allSymptoms, setAllSymptoms] = useState([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Reset selection if redirected from Result screen with reset flag
  useEffect(() => {
    if (route.params?.reset) {
      setSelectedSymptoms([]);
      setSubmitError('');
    }
  }, [route.params?.reset]);

  useEffect(() => {
    fetchSymptoms();
  }, []);

  async function fetchSymptoms() {
    setLoading(true);
    setFetchError('');
    try {
      const { data } = await apiClient.get('/api/symptoms');
      const list = Array.isArray(data.symptoms) ? data.symptoms : [];
      setAllSymptoms(list);
    } catch (err) {
      console.error('Fetch symptoms error:', err);
      setFetchError(
        err.response?.data?.error ||
          'Unable to load symptom catalog. Please make sure the backend and ML service are running.'
      );
    } finally {
      setLoading(false);
    }
  }

  function toggleSymptom(symptom) {
    setSubmitError('');
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((item) => item !== symptom)
        : [...prev, symptom]
    );
  }

  function removeSymptom(symptom) {
    setSubmitError('');
    setSelectedSymptoms((prev) => prev.filter((item) => item !== symptom));
  }

  function clearAll() {
    setSelectedSymptoms([]);
    setSubmitError('');
  }

  const filteredSymptoms = useMemo(() => {
    if (!searchQuery.trim()) return allSymptoms;
    const q = searchQuery.trim().toLowerCase();
    return allSymptoms.filter(
      (s) =>
        s.toLowerCase().includes(q) ||
        formatSymptomName(s).toLowerCase().includes(q)
    );
  }, [allSymptoms, searchQuery]);

  async function handleSubmit() {
    if (selectedSymptoms.length === 0) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const { data } = await apiClient.post('/api/predictions/symptom-check', {
        symptoms: selectedSymptoms
      });

      if (!data.predictions || data.predictions.length === 0) {
        throw new Error('No prediction results returned.');
      }

      navigation.navigate('SymptomResult', {
        result: data,
        reportedSymptoms: selectedSymptoms
      });
    } catch (err) {
      console.error('Submit symptom check error:', err);
      setSubmitError(
        err.response?.data?.error ||
          'Unable to evaluate symptoms. Please ensure the backend and ML service (port 8002) are both running.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  const renderSymptomItem = ({ item }) => {
    const isSelected = selectedSymptoms.includes(item);
    return (
      <TouchableOpacity
        style={[styles.symptomRow, isSelected && styles.symptomRowSelected]}
        onPress={() => toggleSymptom(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected ? <Text style={styles.checkmark}>✓</Text> : null}
        </View>
        <Text style={[styles.symptomText, isSelected && styles.symptomTextSelected]}>
          {formatSymptomName(item)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.eyebrow}>CARESIGNAL / ASSESSMENT</Text>
        <Text style={styles.title}>Check your symptoms</Text>
        <Text style={styles.subtitle}>
          Select what you are currently experiencing to receive a preliminary risk evaluation.
        </Text>
      </View>

      {/* Selected symptoms chips */}
      <View style={styles.selectedSection}>
        <View style={styles.selectedHeader}>
          <Text style={styles.selectedTitle}>
            SELECTED SYMPTOMS ({selectedSymptoms.length})
          </Text>
          {selectedSymptoms.length > 0 ? (
            <TouchableOpacity onPress={clearAll}>
              <Text style={styles.clearAllText}>Clear all</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {selectedSymptoms.length === 0 ? (
          <View style={styles.emptySelected}>
            <Text style={styles.emptySelectedText}>
              No symptoms selected yet. Search and tap items below.
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
          >
            {selectedSymptoms.map((symptom) => (
              <TouchableOpacity
                key={symptom}
                style={styles.chip}
                onPress={() => removeSymptom(symptom)}
                activeOpacity={0.7}
              >
                <Text style={styles.chipText}>{formatSymptomName(symptom)}</Text>
                <View style={styles.chipRemove}>
                  <Text style={styles.chipRemoveText}>✕</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search symptoms (e.g. fever, fatigue)..."
          placeholderTextColor={colors.slate}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery ? (
          <TouchableOpacity
            style={styles.searchClear}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.searchClearText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Symptom List */}
      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.ocean} />
          <Text style={styles.loadingText}>Loading symptom catalog...</Text>
        </View>
      ) : fetchError ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{fetchError}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchSymptoms}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredSymptoms}
          keyExtractor={(item) => item}
          renderItem={renderSymptomItem}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptySearch}>
              <Text style={styles.emptySearchText}>
                No symptoms match &ldquo;{searchQuery}&rdquo;.
              </Text>
            </View>
          }
        />
      )}

      {/* Bottom Sticky Action Bar */}
      <View style={styles.footer}>
        {submitError ? (
          <View style={styles.submitErrorContainer}>
            <Text style={styles.submitErrorText}>{submitError}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[
            styles.submitButton,
            (selectedSymptoms.length === 0 || submitting) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={selectedSymptoms.length === 0 || submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <View style={styles.submittingRow}>
              <ActivityIndicator size="small" color={colors.white} />
              <Text style={styles.submitButtonText}>  Analyzing symptoms...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>
              {selectedSymptoms.length === 0
                ? 'Select at least 1 symptom'
                : `Check symptoms (${selectedSymptoms.length})`}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.mist
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 14
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4
  },
  backText: {
    color: colors.ocean,
    fontSize: 16,
    fontWeight: '800'
  },
  eyebrow: {
    color: colors.ocean,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 18
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    marginTop: 6
  },
  subtitle: {
    color: colors.slate,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6
  },
  selectedSection: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  selectedTitle: {
    color: colors.slate,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1
  },
  clearAllText: {
    color: colors.coral,
    fontSize: 12,
    fontWeight: '700'
  },
  chipsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 8
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tealLight,
    borderColor: '#B2E2D8',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 6
  },
  chipText: {
    color: colors.ocean,
    fontSize: 13,
    fontWeight: '700',
    marginRight: 6
  },
  chipRemove: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.ocean,
    alignItems: 'center',
    justifyContent: 'center'
  },
  chipRemoveText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12
  },
  emptySelected: {
    paddingVertical: 6
  },
  emptySelectedText: {
    color: colors.slate,
    fontSize: 13,
    fontStyle: 'italic'
  },
  searchSection: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.ink
  },
  searchClear: {
    position: 'absolute',
    right: 36,
    padding: 6
  },
  searchClearText: {
    color: colors.slate,
    fontSize: 14,
    fontWeight: '700'
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24
  },
  symptomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  symptomRowSelected: {
    borderColor: colors.ocean,
    backgroundColor: '#F0FAF8'
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: colors.white
  },
  checkboxSelected: {
    backgroundColor: colors.ocean,
    borderColor: colors.ocean
  },
  checkmark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900'
  },
  symptomText: {
    fontSize: 15,
    color: colors.ink,
    fontWeight: '500',
    flex: 1
  },
  symptomTextSelected: {
    color: colors.ink,
    fontWeight: '700'
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  loadingText: {
    marginTop: 12,
    color: colors.slate,
    fontSize: 15
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16
  },
  retryBtn: {
    backgroundColor: colors.ink,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10
  },
  retryBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14
  },
  emptySearch: {
    paddingVertical: 32,
    alignItems: 'center'
  },
  emptySearchText: {
    color: colors.slate,
    fontSize: 14
  },
  footer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20
  },
  submitErrorContainer: {
    backgroundColor: colors.dangerBg,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10
  },
  submitErrorText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center'
  },
  submitButton: {
    backgroundColor: colors.ink,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  submitButtonDisabled: {
    opacity: 0.45
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800'
  },
  submittingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

