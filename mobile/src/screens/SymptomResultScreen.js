import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { colors } from '../theme/colors';

function formatPercentage(probability) {
  if (typeof probability !== 'number') return '0%';
  const pct = probability * 100;
  return pct >= 1 ? `${Math.round(pct)}%` : `${pct.toFixed(1)}%`;
}

export default function SymptomResultScreen({ navigation, route }) {
  const result = route.params?.result || {};
  const predictions = Array.isArray(result.predictions) ? result.predictions : [];
  const topPrediction = predictions[0];
  const secondaryPredictions = predictions.slice(1, 3);
  const suggestedFollowUp = result.suggestedFollowUp;

  function handleFollowUpPress() {
    const textToCheck = `${suggestedFollowUp || ''} ${topPrediction?.disease || ''}`.toLowerCase();
    if (textToCheck.includes('diabetes')) {
      navigation.navigate('DiabetesRisk');
      return;
    }
    if (textToCheck.includes('heart')) {
      navigation.navigate('HeartRisk');
      return;
    }
    Alert.alert(
      'Coming Soon',
      'Detailed risk-assessment screening modules are under development and will be available in an upcoming update.',
      [{ text: 'Got it' }]
    );
  }

  function handleCheckAgain() {
    navigation.navigate('SymptomChecker', { reset: true });
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Link */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>‹ Back to Checker</Text>
        </TouchableOpacity>

        {/* Eyebrow & Title */}
        <Text style={styles.eyebrow}>ASSESSMENT REPORT</Text>
        <Text style={styles.title}>Clinical Indication</Text>
        <Text style={styles.subtitle}>
          Based on your reported symptoms, our clinical machine learning model has produced the following preliminary indications.
        </Text>

        {/* Top / Primary Prediction Card */}
        {topPrediction ? (
          <View style={styles.primaryCard}>
            <View style={styles.primaryBadgeRow}>
              <Text style={styles.primaryBadgeText}>PRIMARY MATCH</Text>
              <View style={styles.scorePill}>
                <Text style={styles.scorePillText}>
                  {formatPercentage(topPrediction.probability)} Match
                </Text>
              </View>
            </View>

            <Text style={styles.primaryDisease}>{topPrediction.disease}</Text>
            <Text style={styles.primaryDescription}>
              This condition had the strongest statistical correlation with the symptom pattern you submitted.
            </Text>

            {/* Visual Probability Bar */}
            <View style={styles.meterContainer}>
              <View
                style={[
                  styles.meterFill,
                  { width: `${Math.min(100, Math.max(10, Math.round(topPrediction.probability * 100)))}%` }
                ]}
              />
            </View>
          </View>
        ) : (
          <View style={styles.noResultCard}>
            <Text style={styles.noResultText}>No predictions were found.</Text>
          </View>
        )}

        {/* Secondary Predictions */}
        {secondaryPredictions.length > 0 ? (
          <View style={styles.secondarySection}>
            <Text style={styles.secondarySectionTitle}>
              OTHER POTENTIAL CONDITIONS
            </Text>
            {secondaryPredictions.map((pred, idx) => (
              <View key={pred.disease || idx} style={styles.secondaryCard}>
                <View style={styles.secondaryHeader}>
                  <Text style={styles.secondaryDisease}>{pred.disease}</Text>
                  <Text style={styles.secondaryProbability}>
                    {formatPercentage(pred.probability)}
                  </Text>
                </View>
                <View style={styles.secondaryMeterTrack}>
                  <View
                    style={[
                      styles.secondaryMeterFill,
                      { width: `${Math.min(100, Math.max(5, Math.round(pred.probability * 100)))}%` }
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* Suggested Follow-up Callout Banner */}
        {suggestedFollowUp ? (
          <View style={styles.followUpCard}>
            <View style={styles.followUpHeader}>
              <Text style={styles.followUpIcon}>💡</Text>
              <Text style={styles.followUpEyebrow}>RECOMMENDED NEXT STEP</Text>
            </View>
            <Text style={styles.followUpText}>{suggestedFollowUp}</Text>
            <TouchableOpacity
              style={styles.followUpButton}
              onPress={handleFollowUpPress}
              activeOpacity={0.8}
            >
              <Text style={styles.followUpButtonText}>Explore Risk Assessment</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Medical Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerTitle}>IMPORTANT NOTICE</Text>
          <Text style={styles.disclaimerText}>
            This is a preliminary screening tool, not a medical diagnosis. Please consult a healthcare professional for proper evaluation.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={handleCheckAgain}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryActionText}>Check symptoms again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryActionText}>Return to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
    marginBottom: 10
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
    marginTop: 8
  },
  title: {
    color: colors.ink,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    marginTop: 6
  },
  subtitle: {
    color: colors.slate,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 24
  },
  primaryCard: {
    backgroundColor: colors.ink,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3
  },
  primaryBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  primaryBadgeText: {
    color: '#BCE7DF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5
  },
  scorePill: {
    backgroundColor: colors.ocean,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10
  },
  scorePillText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800'
  },
  primaryDisease: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
    marginBottom: 8
  },
  primaryDescription: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18
  },
  meterContainer: {
    height: 8,
    backgroundColor: '#1E3A56',
    borderRadius: 4,
    overflow: 'hidden'
  },
  meterFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 4
  },
  noResultCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20
  },
  noResultText: {
    color: colors.slate,
    fontSize: 15
  },
  secondarySection: {
    marginBottom: 20
  },
  secondarySectionTitle: {
    color: colors.slate,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 4
  },
  secondaryCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  secondaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  secondaryDisease: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
    flex: 1
  },
  secondaryProbability: {
    color: colors.ocean,
    fontSize: 14,
    fontWeight: '800'
  },
  secondaryMeterTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden'
  },
  secondaryMeterFill: {
    height: '100%',
    backgroundColor: colors.ocean,
    borderRadius: 3
  },
  followUpCard: {
    backgroundColor: '#EFF8F7',
    borderWidth: 1.5,
    borderColor: '#B2E2D8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20
  },
  followUpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  followUpIcon: {
    fontSize: 16,
    marginRight: 6
  },
  followUpEyebrow: {
    color: colors.ocean,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5
  },
  followUpText: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    marginBottom: 14
  },
  followUpButton: {
    backgroundColor: colors.ocean,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center'
  },
  followUpButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800'
  },
  disclaimerContainer: {
    backgroundColor: '#F8FAFC',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 26
  },
  disclaimerTitle: {
    color: colors.slate,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4
  },
  disclaimerText: {
    color: colors.slate,
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic'
  },
  actions: {
    gap: 12
  },
  primaryAction: {
    backgroundColor: colors.ink,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center'
  },
  primaryActionText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800'
  },
  secondaryAction: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center'
  },
  secondaryActionText: {
    color: colors.slate,
    fontSize: 15,
    fontWeight: '700'
  }
});

