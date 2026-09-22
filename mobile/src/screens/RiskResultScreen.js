import {
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

export default function RiskResultScreen({ navigation, route }) {
  const {
    risk_label = 'Unknown',
    risk_probability = 0,
    condition = 'diabetes',
    returnScreen
  } = route.params || {};

  const isHighRisk = String(risk_label).toLowerCase().includes('high');
  const conditionTitle =
    condition === 'diabetes' ? 'Diabetes Risk' : 'Heart Disease Risk';
  const percentageStr = formatPercentage(risk_probability);
  const percentageNum = Math.min(100, Math.max(5, Math.round(risk_probability * 100)));

  const retryTarget = returnScreen || (condition === 'diabetes' ? 'DiabetesRisk' : 'HeartRisk');

  function handleCheckAgain() {
    navigation.navigate(retryTarget);
  }

  function handleReturnHome() {
    navigation.navigate('Home');
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
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>

        {/* Eyebrow & Title */}
        <Text style={styles.eyebrow}>ASSESSMENT REPORT</Text>
        <Text style={styles.title}>{conditionTitle}</Text>
        <Text style={styles.subtitle}>
          Based on the clinical parameters provided, our predictive model has determined the following assessment.
        </Text>

        {/* Primary Risk Card */}
        <View style={styles.primaryCard}>
          <View style={styles.primaryBadgeRow}>
            <Text style={styles.primaryBadgeText}>PREDICTIVE OUTCOME</Text>
            <View
              style={[
                styles.statusPill,
                isHighRisk ? styles.statusPillHigh : styles.statusPillLow
              ]}
            >
              <Text style={styles.statusPillText}>
                {risk_label.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.primaryLabel}>{risk_label}</Text>
          <Text style={styles.primaryDescription}>
            {isHighRisk
              ? `The biometric indicators suggest an elevated probability of developing or having ${condition === 'diabetes' ? 'diabetes' : 'cardiovascular disease'}. Consult your healthcare provider for clinical diagnostic tests.`
              : `Your submitted health markers reflect a favorable statistical profile with a low risk probability for ${condition === 'diabetes' ? 'diabetes' : 'cardiovascular disease'}. Keep maintaining healthy lifestyle habits.`}
          </Text>

          {/* Probability Row */}
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Calculated Risk Probability</Text>
            <Text
              style={[
                styles.scoreValue,
                { color: isHighRisk ? colors.coral : '#38BDF8' }
              ]}
            >
              {percentageStr}
            </Text>
          </View>

          {/* Visual Meter */}
          <View style={styles.meterContainer}>
            <View
              style={[
                styles.meterFill,
                {
                  width: `${percentageNum}%`,
                  backgroundColor: isHighRisk ? colors.coral : '#38BDF8'
                }
              ]}
            />
          </View>
        </View>

        {/* Recommended Action Card */}
        <View style={styles.recommendationCard}>
          <View style={styles.recommendationHeader}>
            <Text style={styles.recommendationIcon}>
              {isHighRisk ? '⚠️' : '✨'}
            </Text>
            <Text style={styles.recommendationEyebrow}>
              CLINICAL RECOMMENDATION
            </Text>
          </View>
          <Text style={styles.recommendationTitle}>
            {isHighRisk ? 'Schedule a Comprehensive Consultation' : 'Continue Preventive Wellness'}
          </Text>
          <Text style={styles.recommendationBody}>
            {isHighRisk
              ? 'We strongly encourage sharing these results with your physician. A formal laboratory workup (such as a fasting plasma glucose or lipid panel) can provide definitive clinical diagnosis and personalized preventive care.'
              : 'Routine physical activity, a nutrient-rich diet, and regular annual health screenings are effective measures to sustain your current low-risk status.'}
          </Text>
        </View>

        {/* Medical Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerTitle}>IMPORTANT NOTICE</Text>
          <Text style={styles.disclaimerText}>
            This assessment is an algorithmic risk evaluation tool intended solely for informational and screening purposes, not an official clinical diagnosis. Always consult with a qualified medical professional for health evaluations and treatment decisions.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={handleCheckAgain}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryActionText}>Check again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryAction}
            onPress={handleReturnHome}
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
  statusPill: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12
  },
  statusPillLow: {
    backgroundColor: colors.ocean
  },
  statusPillHigh: {
    backgroundColor: colors.coral
  },
  statusPillText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  primaryLabel: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: 8
  },
  primaryDescription: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8
  },
  scoreLabel: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700'
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '800'
  },
  meterContainer: {
    height: 8,
    backgroundColor: '#1E3A56',
    borderRadius: 4,
    overflow: 'hidden'
  },
  meterFill: {
    height: '100%',
    borderRadius: 4
  },
  recommendationCard: {
    backgroundColor: '#EFF8F7',
    borderWidth: 1.5,
    borderColor: '#B2E2D8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  recommendationIcon: {
    fontSize: 16,
    marginRight: 6
  },
  recommendationEyebrow: {
    color: colors.ocean,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5
  },
  recommendationTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6
  },
  recommendationBody: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500'
  },
  disclaimerContainer: {
    backgroundColor: '#F8FAFC',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24
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

