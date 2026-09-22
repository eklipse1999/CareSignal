import { useState } from 'react';
import {
  ActivityIndicator,
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

const GENDER_OPTIONS = ['Female', 'Male', 'Other'];
const SMOKING_OPTIONS = [
  { label: 'Never', value: 'never' },
  { label: 'Former', value: 'former' },
  { label: 'Current', value: 'current' },
  { label: 'Ever', value: 'ever' },
  { label: 'Not Current', value: 'not current' },
  { label: 'No Info', value: 'No Info' }
];

export default function DiabetesRiskScreen({ navigation }) {
  const [gender, setGender] = useState('Female');
  const [age, setAge] = useState('');
  const [hypertension, setHypertension] = useState(0);
  const [heartDisease, setHeartDisease] = useState(0);
  const [smokingHistory, setSmokingHistory] = useState('never');
  const [bmi, setBmi] = useState('');
  const [hba1c, setHba1c] = useState('');
  const [glucose, setGlucose] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Validate fields
  const numAge = parseFloat(age);
  const numBmi = parseFloat(bmi);
  const numHba1c = parseFloat(hba1c);
  const numGlucose = parseInt(glucose, 10);

  const isAgeValid = !isNaN(numAge) && numAge >= 1 && numAge <= 80;
  const isBmiValid = !isNaN(numBmi) && numBmi >= 10 && numBmi <= 95;
  const isHba1cValid = !isNaN(numHba1c) && numHba1c >= 3.5 && numHba1c <= 9.0;
  const isGlucoseValid = !isNaN(numGlucose) && numGlucose >= 80 && numGlucose <= 300;

  const isFormComplete =
    Boolean(gender) &&
    age.trim() !== '' &&
    isAgeValid &&
    bmi.trim() !== '' &&
    isBmiValid &&
    hba1c.trim() !== '' &&
    isHba1cValid &&
    glucose.trim() !== '' &&
    isGlucoseValid;

  async function handleSubmit() {
    if (!isFormComplete) return;
    setSubmitting(true);
    setErrorMessage('');

    const payload = {
      inputData: {
        gender,
        age: numAge,
        hypertension,
        heart_disease: heartDisease,
        smoking_history: smokingHistory,
        bmi: numBmi,
        HbA1c_level: numHba1c,
        blood_glucose_level: numGlucose
      }
    };

    try {
      const { data } = await apiClient.post('/api/predictions/diabetes', payload);
      navigation.navigate('RiskResult', {
        risk_label: data.risk_label,
        risk_probability: data.risk_probability,
        condition: 'diabetes',
        returnScreen: 'DiabetesRisk'
      });
    } catch (err) {
      console.error('Diabetes prediction error:', err);
      setErrorMessage(
        err.response?.data?.error ||
          'Unable to complete diabetes assessment. Please ensure backend and ML service are running.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Link */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        {/* Eyebrow & Title */}
        <Text style={styles.eyebrow}>CARESIGNAL / BIOMETRIC EVALUATION</Text>
        <Text style={styles.title}>Diabetes Risk Assessment</Text>
        <Text style={styles.subtitle}>
          Analyze your metabolic and physical health indicators to assess your personalized diabetes risk using our clinical machine learning model.
        </Text>

        <View style={styles.card}>
          {/* Gender */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Biological Sex / Gender</Text>
            <View style={styles.segmentedRow}>
              {GENDER_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.segmentButton,
                    gender === opt && styles.segmentButtonActive
                  ]}
                  onPress={() => setGender(opt)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.segmentButtonText,
                      gender === opt && styles.segmentButtonTextActive
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Age */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Age (years)</Text>
              <Text style={styles.rangeHint}>1 - 80</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                age.trim() !== '' && !isAgeValid && styles.inputInvalid
              ]}
              placeholder="e.g. 45"
              placeholderTextColor={colors.slate}
              value={age}
              onChangeText={setAge}
              keyboardType="decimal-pad"
              maxLength={4}
            />
            {age.trim() !== '' && !isAgeValid ? (
              <Text style={styles.fieldErrorText}>Age must be between 1 and 80</Text>
            ) : null}
          </View>

          {/* Hypertension */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>History of Hypertension (High Blood Pressure)</Text>
            <View style={styles.segmentedRow}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  hypertension === 0 && styles.segmentButtonActive
                ]}
                onPress={() => setHypertension(0)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    hypertension === 0 && styles.segmentButtonTextActive
                  ]}
                >
                  No
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  hypertension === 1 && styles.segmentButtonActive
                ]}
                onPress={() => setHypertension(1)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    hypertension === 1 && styles.segmentButtonTextActive
                  ]}
                >
                  Yes
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Heart Disease */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>History of Heart Disease</Text>
            <View style={styles.segmentedRow}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  heartDisease === 0 && styles.segmentButtonActive
                ]}
                onPress={() => setHeartDisease(0)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    heartDisease === 0 && styles.segmentButtonTextActive
                  ]}
                >
                  No
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  heartDisease === 1 && styles.segmentButtonActive
                ]}
                onPress={() => setHeartDisease(1)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    heartDisease === 1 && styles.segmentButtonTextActive
                  ]}
                >
                  Yes
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Smoking History */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Smoking History</Text>
            <View style={styles.chipGrid}>
              {SMOKING_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.chip,
                    smokingHistory === opt.value && styles.chipActive
                  ]}
                  onPress={() => setSmokingHistory(opt.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      smokingHistory === opt.value && styles.chipTextActive
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* BMI */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Body Mass Index (BMI)</Text>
              <Text style={styles.rangeHint}>10.0 - 95.0 kg/m²</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                bmi.trim() !== '' && !isBmiValid && styles.inputInvalid
              ]}
              placeholder="e.g. 27.5"
              placeholderTextColor={colors.slate}
              value={bmi}
              onChangeText={setBmi}
              keyboardType="decimal-pad"
              maxLength={5}
            />
            {bmi.trim() !== '' && !isBmiValid ? (
              <Text style={styles.fieldErrorText}>BMI must be between 10.0 and 95.0</Text>
            ) : null}
          </View>

          {/* HbA1c Level */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>HbA1c Level (%)</Text>
              <Text style={styles.rangeHint}>3.5 - 9.0 %</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                hba1c.trim() !== '' && !isHba1cValid && styles.inputInvalid
              ]}
              placeholder="e.g. 5.7"
              placeholderTextColor={colors.slate}
              value={hba1c}
              onChangeText={setHba1c}
              keyboardType="decimal-pad"
              maxLength={4}
            />
            {hba1c.trim() !== '' && !isHba1cValid ? (
              <Text style={styles.fieldErrorText}>HbA1c must be between 3.5 and 9.0%</Text>
            ) : null}
          </View>

          {/* Blood Glucose Level */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Blood Glucose Level (mg/dL)</Text>
              <Text style={styles.rangeHint}>80 - 300 mg/dL</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                glucose.trim() !== '' && !isGlucoseValid && styles.inputInvalid
              ]}
              placeholder="e.g. 110"
              placeholderTextColor={colors.slate}
              value={glucose}
              onChangeText={setGlucose}
              keyboardType="number-pad"
              maxLength={3}
            />
            {glucose.trim() !== '' && !isGlucoseValid ? (
              <Text style={styles.fieldErrorText}>Blood glucose must be between 80 and 300 mg/dL</Text>
            ) : null}
          </View>
        </View>

        {/* Error message container */}
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={handleSubmit}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!isFormComplete || submitting) && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={!isFormComplete || submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <View style={styles.submittingRow}>
              <ActivityIndicator size="small" color={colors.white} />
              <Text style={styles.submitButtonText}>  Calculating risk...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>
              {isFormComplete ? 'Evaluate Diabetes Risk →' : 'Fill all fields to evaluate'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.mist
  },
  content: {
    padding: 24,
    paddingTop: 54,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    marginBottom: 6
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
    marginTop: 10
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
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 20
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  fieldGroup: {
    marginBottom: 18
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6
  },
  label: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6
  },
  rangeHint: {
    color: colors.slate,
    fontSize: 12,
    fontWeight: '600'
  },
  input: {
    backgroundColor: colors.mist,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.ink
  },
  inputInvalid: {
    borderColor: colors.coral,
    backgroundColor: '#FFF8F7'
  },
  fieldErrorText: {
    color: colors.coral,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600'
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 8
  },
  segmentButton: {
    flex: 1,
    backgroundColor: colors.mist,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  segmentButtonActive: {
    backgroundColor: colors.ocean,
    borderColor: colors.ocean
  },
  segmentButtonText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700'
  },
  segmentButtonTextActive: {
    color: colors.white
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    backgroundColor: colors.mist,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 14
  },
  chipActive: {
    backgroundColor: colors.ocean,
    borderColor: colors.ocean
  },
  chipText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '600'
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: '700'
  },
  errorContainer: {
    backgroundColor: '#FFF1F0',
    borderColor: '#FED7D2',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16
  },
  errorText: {
    color: colors.coral,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    marginBottom: 8
  },
  retryBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.coral,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12
  },
  retryBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700'
  },
  submitButton: {
    backgroundColor: colors.ink,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3
  },
  submitButtonDisabled: {
    opacity: 0.5
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

