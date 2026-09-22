import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.mark}
            resizeMode="contain"
          />
          <Text style={styles.eyebrow}>CARESIGNAL / YOUR CARE</Text>
          <Text style={styles.title}>Welcome, {user?.name || 'there'}.</Text>
          <Text style={styles.copy}>
            Your secure patient portal is active. Start with our AI symptom guidance or review your profile.
          </Text>

          {/* Interactive Symptom Checker Card */}
          <View style={styles.actionCard}>
            <View style={styles.actionHeader}>
              <Text style={styles.actionEyebrow}>AI-POWERED TOOL</Text>
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>READY</Text>
              </View>
            </View>
            <Text style={styles.actionTitle}>Check your symptoms</Text>
            <Text style={styles.actionCopy}>
              Search through ~130 clinical symptoms to get an instant preliminary condition evaluation powered by machine learning.
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('SymptomChecker')}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaButtonText}>Check my symptoms →</Text>
            </TouchableOpacity>
          </View>

          {/* Diabetes Risk Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEyebrow}>BIOMETRIC EVALUATION</Text>
              <View style={styles.readyBadge}>
                <Text style={styles.readyBadgeText}>READY</Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>Check diabetes risk</Text>
            <Text style={styles.cardCopy}>
              Assess your personalized risk of diabetes using blood glucose, HbA1c, BMI, and health factors.
            </Text>
            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => navigation.navigate('DiabetesRisk')}
              activeOpacity={0.85}
            >
              <Text style={styles.cardButtonText}>Check diabetes risk →</Text>
            </TouchableOpacity>
          </View>

          {/* Heart Disease Risk Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardEyebrow}>CARDIOVASCULAR HEALTH</Text>
              <View style={styles.readyBadge}>
                <Text style={styles.readyBadgeText}>READY</Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>Check heart disease risk</Text>
            <Text style={styles.cardCopy}>
              Evaluate your cardiovascular risk using blood pressure readings, cholesterol levels, and biometric data.
            </Text>
            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => navigation.navigate('HeartRisk')}
              activeOpacity={0.85}
            >
              <Text style={styles.cardButtonText}>Check heart disease risk →</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={logout} style={styles.logout} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>
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
    padding: 28,
    paddingTop: 66,
    paddingBottom: 40,
    minHeight: '100%',
    justifyContent: 'space-between'
  },
  mark: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignSelf: 'flex-start'
  },
  eyebrow: {
    color: colors.ocean,
    fontWeight: '800',
    letterSpacing: 2,
    fontSize: 12,
    marginTop: 36
  },
  title: {
    color: colors.ink,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '800',
    marginTop: 12
  },
  copy: {
    color: colors.slate,
    fontSize: 16,
    lineHeight: 25,
    marginTop: 12
  },
  actionCard: {
    backgroundColor: colors.ink,
    borderRadius: 20,
    padding: 24,
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  actionEyebrow: {
    color: '#BCE7DF',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1.5
  },
  liveBadge: {
    backgroundColor: colors.ocean,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  liveBadgeText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.5
  },
  actionTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4
  },
  actionCopy: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 20
  },
  ctaButton: {
    backgroundColor: colors.ocean,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center'
  },
  ctaButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800'
  },
  panel: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 22,
    marginTop: 20
  },
  panelEyebrow: {
    color: colors.slate,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1.5
  },
  panelTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8
  },
  panelCopy: {
    color: colors.slate,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8
  },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 22,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  cardEyebrow: {
    color: colors.ocean,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1.5
  },
  readyBadge: {
    backgroundColor: '#E6F4F1',
    borderColor: '#B2E2D8',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8
  },
  readyBadgeText: {
    color: colors.ocean,
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.5
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4
  },
  cardCopy: {
    color: colors.slate,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
    marginBottom: 16
  },
  cardButton: {
    backgroundColor: colors.ink,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center'
  },
  cardButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800'
  },
  logout: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: colors.white,
    marginTop: 36
  },
  logoutText: {
    color: colors.coral,
    fontWeight: '800',
    fontSize: 16
  }
});
