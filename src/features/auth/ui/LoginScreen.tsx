import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { authApi } from '../api/authApi';

const AZUL = '#1A3A5C';
const AZUL_CLARO = '#2E6DA4';

interface AnimatedInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
}

function AnimatedInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
}: AnimatedInputProps) {
  const borderColor = useSharedValue('#DDE2E8');
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.campoContenedor}>
      <Text style={styles.etiqueta}>{label}</Text>
      <Animated.View style={[styles.inputWrapper, animatedStyle]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => {
            borderColor.value = withTiming(AZUL_CLARO, { duration: 200 });
            scale.value = withSpring(1.01);
          }}
          onBlur={() => {
            borderColor.value = withTiming('#DDE2E8', { duration: 200 });
            scale.value = withSpring(1);
          }}
        />
      </Animated.View>
    </View>
  );
}

interface Props {
  onAuthSuccess: () => void;
}

export function LoginScreen({ onAuthSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [modo, setModo] = useState<'login' | 'registro'>('login');

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Completa todos los campos.');
      return;
    }

    try {
      setCargando(true);
      if (modo === 'login') {
        await authApi.signIn(email.trim(), password);
      } else {
        await authApi.signUp(email.trim(), password);
        Alert.alert(
          'Cuenta creada',
          'Revisa tu correo para confirmar tu cuenta, luego inicia sesión.',
        );
        setModo('login');
        return;
      }
      onAuthSuccess();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      Alert.alert('Error de autenticación', msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.logoContenedor}>
          <Image
            source={require('../../../../assets/images/sello.png')}
            style={styles.logo}
          />
          <Text style={styles.titulo}>ESFOT</Text>
          <Text style={styles.subtitulo}>Escuela de Formación de Tecnólogos — EPN</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(500)} style={styles.tarjeta}>
          <Text style={styles.tarjetaTitulo}>
            {modo === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </Text>

          <AnimatedInput
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
          />

          <AnimatedInput
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.boton, cargando && styles.botonDeshabilitado]}
            onPress={handleAuth}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.botonTexto}>
                {modo === 'login' ? 'Ingresar' : 'Registrarse'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cambioModo}
            onPress={() => setModo(modo === 'login' ? 'registro' : 'login')}
          >
            <Text style={styles.cambioModoTexto}>
              {modo === 'login'
                ? '¿No tienes cuenta? Regístrate aquí'
                : '¿Ya tienes cuenta? Inicia sesión'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F5F7FA' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoContenedor: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 80, height: 80, resizeMode: 'contain', marginBottom: 12 },
  titulo: { fontSize: 28, fontWeight: '800', color: AZUL },
  subtitulo: { fontSize: 12, color: '#666', marginTop: 4, textAlign: 'center' },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  tarjetaTitulo: { fontSize: 20, fontWeight: '700', color: AZUL, marginBottom: 20 },
  campoContenedor: { marginBottom: 16 },
  etiqueta: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
  inputWrapper: {
    borderWidth: 1.5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 15,
    color: '#1A1A1A',
  },
  boton: {
    backgroundColor: AZUL,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  botonDeshabilitado: { opacity: 0.6 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cambioModo: { marginTop: 16, alignItems: 'center' },
  cambioModoTexto: { color: AZUL_CLARO, fontSize: 13, fontWeight: '600' },
});
