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

const CHOLESTEROL_OPTIONS = [
  { label: 'Normal', value: 1 },
  { label: 'Above normal', value: 2 },
  { label: 'Well above', value: 3 }
];

const GLUCOSE_OPTIONS = [
  { label: 'Normal', value: 1 },
  { label: 'Above normal', value: 2 },
  { label: 'Well above', value: 3 }
];

export default function HeartRiskScreen({ navigation }) {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState(1); // 1 = Female, 2 = Male
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [apHi, setApHi] = useState('');
  const [apLo, setApLo] = useState('');
  const [cholesterol, setCholesterol] = useState(1);
  const [gluc, setGluc] = useState(1);
  const [smoke, setSmoke] = useState(0);
  const [alco, setAlco] = useState(0);
  const [active, setActive] = useState(1);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Validations
  const numAge = parseFloat(age);
  const numHeight = parseFloat(height);
  const numWeight = parseFloat(weight);
  const numApHi = parseFloat(apHi);
  const numApLo = parseFloat(apLo);

  const isAgeValid = !isNaN(numAge) && numAge >= 1 && numAge <= 120;
  const isHeightValid = !isNaN(numHeight) && numHeight >= 100 && numHeight <= 220;
  const isWeightValid = !isNaN(numWeight) && numWeight >= 30 && numWeight <= 200;
  const isApHiValid = !isNaN(numApHi) && numApHi >= 80 && numApHi <= 250;
  const isApLoValid = !isNaN(numApLo) && numApLo >= 40 && numApLo <= 200;
  const isBpConsistent = !isNaN(numApHi) && !isNaN(numApLo) ? numApHi > numApLo : true;

  const isFormComplete =
    age.trim() !== '' &&
    isAgeValid &&
    height.trim() !== '' &&
    isHeightValid &&
    weight.trim() !== '' &&
    isWeightValid &&
    apHi.trim() !== '' &&
    isApHiValid &&
    apLo.trim() !== '' &&
    isApLoValid &&
    isBpConsistent;

  async function handleSubmit() {
    if (!isFormComplete) return;
    setSubmitting(true);
    setErrorMessage('');

    const payload = {
      inputData: {
        age: numAge,
        gender,
        height: numHeight,
        weight: numWeight,
        ap_hi: numApHi,
        ap_lo: numApLo,
        cholesterol,
        gluc,
        smoke,
        alco,
        active
      }
    };

    try {
      const { data } = await apiClient.post('/api/predictions/heart', payload);
      navigation.navigate('RiskResult', {
        risk_label: data.risk_label,
        risk_probability: data.risk_probability,
        condition: 'heart',
        returnScreen: 'HeartRisk'
      });
    } catch (err) {
      console.error('Heart prediction error:', err);
      setErrorMessage(
        err.response?.data?.error ||
          'Unable to complete cardiovascular assessment. Please ensure backend and ML service are running.'
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
        <Text style={styles.title}>Heart Disease Risk</Text>
        <Text style={styles.subtitle}>
          Evaluate your cardiovascular health and disease predisposition using blood pressure, biometric measurements, and lifestyle factors.
        </Text>

        <View style={styles.card}>
          {/* Age */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Age (years)</Text>
              <Text style={styles.rangeHint}>1 - 120</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                age.trim() !== '' && !isAgeValid && styles.inputInvalid
              ]}
              placeholder="e.g. 52"
              placeholderTextColor={colors.slate}
              value={age}
              onChangeText={setAge}
              keyboardType="decimal-pad"
              maxLength={3}
            />
            {age.trim() !== '' && !isAgeValid ? (
              <Text style={styles.fieldErrorText}>Age must be between 1 and 120</Text>
            ) : null}
          </View>

          {/* Biological Sex (Gender) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Biological Sex</Text>
            <View style={styles.segmentedRow}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  gender === 1 && styles.segmentButtonActive
                ]}
                onPress={() => setGender(1)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    gender === 1 && styles.segmentButtonTextActive
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  gender === 2 && styles.segmentButtonActive
                ]}
                onPress={() => setGender(2)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    gender === 2 && styles.segmentButtonTextActive
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Height and Weight in row */}
          <View style={styles.twoColRow}>
            <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Height (cm)</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  height.trim() !== '' && !isHeightValid && styles.inputInvalid
                ]}
                placeholder="100 - 220"
                placeholderTextColor={colors.slate}
                value={height}
                onChangeText={setHeight}
                keyboardType="decimal-pad"
                maxLength={5}
              />
              {height.trim() !== '' && !isHeightValid ? (
                <Text style={styles.fieldErrorText}>100 - 220 cm</Text>
              ) : null}
            </View>

            <View style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Weight (kg)</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  weight.trim() !== '' && !isWeightValid && styles.inputInvalid
                ]}
                placeholder="30 - 200"
                placeholderTextColor={colors.slate}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                maxLength={5}
              />
              {weight.trim() !== '' && !isWeightValid ? (
                <Text style={styles.fieldErrorText}>30 - 200 kg</Text>
              ) : null}
            </View>
          </View>

          {/* Blood Pressure: Systolic and Diastolic */}
          <View style={styles.twoColRow}>
            <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Systolic BP (ap_hi)</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  apHi.trim() !== '' && (!isApHiValid || !isBpConsistent) && styles.inputInvalid
                ]}
                placeholder="80 - 250"
                placeholderTextColor={colors.slate}
                value={apHi}
                onChangeText={setApHi}
                keyboardType="decimal-pad"
                maxLength={3}
              />
              {apHi.trim() !== '' && !isApHiValid ? (
                <Text style={styles.fieldErrorText}>80 - 250 mmHg</Text>
              ) : null}
            </View>

            <View style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Diastolic BP (ap_lo)</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  apLo.trim() !== '' && (!isApLoValid || !isBpConsistent) && styles.inputInvalid
                ]}
                placeholder="40 - 200"
                placeholderTextColor={colors.slate}
                value={apLo}
                onChangeText={setApLo}
                keyboardType="decimal-pad"
                maxLength={3}
              />
              {apLo.trim() !== '' && !isApLoValid ? (
                <Text style={styles.fieldErrorText}>40 - 200 mmHg</Text>
              ) : null}
            </View>
          </View>
          {apHi.trim() !== '' && apLo.trim() !== '' && !isBpConsistent ? (
            <Text style={[styles.fieldErrorText, { marginBottom: 12, marginTop: -8 }]}>
              Systolic BP must be greater than diastolic BP.
            </Text>
          ) : null}

          {/* Cholesterol Level */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Cholesterol Level</Text>
            <View style={styles.segmentedRow}>
              {CHOLESTEROL_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.segmentButton,
                    cholesterol === opt.value && styles.segmentButtonActive
                  ]}
                  onPress={() => setCholesterol(opt.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.segmentButtonText,
                      cholesterol === opt.value && styles.segmentButtonTextActive
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Blood Glucose Level category */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Blood Glucose Level</Text>
            <View style={styles.segmentedRow}>
              {GLUCOSE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.segmentButton,
                    gluc === opt.value && styles.segmentButtonActive
                  ]}
                  onPress={() => setGluc(opt.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.segmentButtonText,
                      gluc === opt.value && styles.segmentButtonTextActive
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Smoking Status */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Do you smoke?</Text>
            <View style={styles.segmentedRow}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  smoke === 0 && styles.segmentButtonActive
                ]}
                onPress={() => setSmoke(0)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    smoke === 0 && styles.segmentButtonTextActive
                  ]}
                >
                  No
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  smoke === 1 && styles.segmentButtonActive
                ]}
                onPress={() => setSmoke(1)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    smoke === 1 && styles.segmentButtonTextActive
                  ]}
                >
                  Yes
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Alcohol Consumption */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Alcohol Intake</Text>
            <View style={styles.segmentedRow}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  alco === 0 && styles.segmentButtonActive
                ]}
                onPress={() => setAlco(0)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    alco === 0 && styles.segmentButtonTextActive
                  ]}
                >
                  No
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  alco === 1 && styles.segmentButtonActive
                ]}
                onPress={() => setAlco(1)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    alco === 1 && styles.segmentButtonTextActive
                  ]}
                >
                  Yes
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Physical Activity */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Physically Active?</Text>
            <View style={styles.segmentedRow}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  active === 0 && styles.segmentButtonActive
                ]}
                onPress={() => setActive(0)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    active === 0 && styles.segmentButtonTextActive
                  ]}
                >
                  Inactive
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  active === 1 && styles.segmentButtonActive
                ]}
                onPress={() => setActive(1)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    active === 1 && styles.segmentButtonTextActive
                  ]}
                >
                  Active
                </Text>
              </TouchableOpacity>
            </View>
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
              <Text style={styles.submitButtonText}>  Evaluating heart risk...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>
              {isFormComplete ? 'Evaluate Heart Disease Risk →' : 'Fill all fields to evaluate'}
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
  twoColRow: {
    flexDirection: 'row',
    alignItems: 'flex-start'
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
    fontSize: 13,
    fontWeight: '700'
  },
  segmentButtonTextActive: {
    color: colors.white
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

