// src/pages/home/ui/HomeScreen.tsx
import { ProyectosListaWidget } from '@widgets/proyectos-lista/ProyectosListaWidget';
import React from 'react';
import { Image, StyleSheet, TextInput, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export function HomeScreen() {
  const [query, setQuery] = React.useState('');
  const searchBorder = useSharedValue('#DDE2E8');
  const searchScale = useSharedValue(1);

  const animatedSearch = useAnimatedStyle(() => ({
    borderColor: searchBorder.value,
    transform: [{ scale: searchScale.value }],
  }));

  return (
    <View style={styles.contenedor}>
      <Animated.View entering={FadeInDown.duration(500)} style={styles.headerContenedor}>
        <Image source={require('../../../../assets/images/sello.png')} style={styles.logo} />
        <View style={{ flex: 1 }}>
          <Animated.Text entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
            Proyectos de Tesis — ESFOT
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={styles.subheader}>
            Escuela de Formación de Tecnólogos - EPN
          </Animated.Text>
        </View>
      </Animated.View>

      {/* Buscador con animación adicional al enfocar */}
      <Animated.View style={[styles.buscadorWrapper, animatedSearch]}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por título o autor..."
          placeholderTextColor="#8A8A8A"
          style={styles.buscador}
          onFocus={() => {
            searchBorder.value = withTiming('#2E6DA4', { duration: 200 });
            searchScale.value = withSpring(1.01);
          }}
          onBlur={() => {
            searchBorder.value = withTiming('#DDE2E8', { duration: 200 });
            searchScale.value = withSpring(1);
          }}
        />
      </Animated.View>

      <ProyectosListaWidget query={query} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F7FA' },
  headerContenedor: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: '#E0E6EE',
  },
  logo: { width: 40, height: 40, resizeMode: 'contain' },
  header: { fontSize: 20, fontWeight: '700', color: '#1A3A5C' },
  subheader: { fontSize: 12, color: '#4F5D75', marginTop: 2 },
  buscadorWrapper: {
    margin: 16, marginBottom: 0, borderWidth: 1.5, borderRadius: 10,
    backgroundColor: '#fff', overflow: 'hidden',
  },
  buscador: {
    backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 10,
    color: '#1A1A1A',
  },
});
