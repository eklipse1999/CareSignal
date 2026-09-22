import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.screen}>
      <View style={styles.top}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.mark}
          resizeMode="contain"
        />
        <Text style={styles.eyebrow}>CARESIGNAL / PATIENT CARE</Text>
        <Text style={styles.title}>A clearer way to understand your health.</Text>
        <Text style={styles.copy}>Your secure starting point for connected care and future risk insights.</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.primary} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.primaryText}>Sign in</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondary} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.secondaryText}>Create patient account</Text>
        </TouchableOpacity>
        <Text style={styles.note}>Private access for your care journey</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ink,
    padding: 28,
    justifyContent: 'space-between'
  },
  top: {
    paddingTop: 48
  },
  mark: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignSelf: 'flex-start'
  },
  eyebrow: {
    color: '#BCE7DF',
    fontWeight: '800',
    letterSpacing: 2,
    fontSize: 12,
    marginTop: 42
  },
  title: {
    color: colors.white,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '800',
    marginTop: 18
  },
  copy: {
    color: '#CBD5E1',
    fontSize: 17,
    lineHeight: 27,
    marginTop: 18,
    maxWidth: 330
  },
  actions: {
    paddingBottom: 12
  },
  primary: {
    backgroundColor: colors.ocean,
    borderRadius: 14,
    padding: 17,
    alignItems: 'center'
  },
  primaryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800'
  },
  secondary: {
    borderColor: '#5D7B91',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 12
  },
  secondaryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800'
  },
  note: {
    color: '#9FB4C4',
    textAlign: 'center',
    marginTop: 22,
    fontSize: 12,
    fontWeight: '600'
  }
});
