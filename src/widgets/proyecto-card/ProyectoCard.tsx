// src/widgets/proyecto-card/ProyectoCard.tsx
import type { ProyectoTesis } from '@entities/proyecto-tesis/model/types';
import React, { useEffect } from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeInLeft,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const BADGE_COLOR: Record<string, string> = {
  'En Progreso': '#3498DB',
  'Completado': '#27AE60',
  'Suspendido': '#E74C3C',
};

interface Props {
  proyecto: ProyectoTesis;
  index?: number;
  onPressDetalle?: (id: string) => void;
  onPressEditar?: (id: string) => void;
  onPressEliminar?: (id: string) => void;
}

export function ProyectoCard({
  proyecto,
  index = 0,
  onPressDetalle,
  onPressEditar,
  onPressEliminar,
}: Props) {
  // Animacion adicional: escala al montar (efecto "pop")
  const scale = useSharedValue(0.95);
  const translateX = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
    ],
  }));

  const abrirRepo = () => {
    if (proyecto.repositorio_github) Linking.openURL(proyecto.repositorio_github);
  };

  const abrirDocumento = () => {
    if (proyecto.documento_url) Linking.openURL(proyecto.documento_url);
  };

  const confirmarEliminacion = () => {
    if (!onPressEliminar) return;
    // Animacion adicional: shake antes de confirmar eliminar
    translateX.value = withSequence(
      withTiming(-8, { duration: 60 }),
      withRepeat(withSequence(withTiming(8, { duration: 60 }), withTiming(-8, { duration: 60 })), 3),
      withTiming(0, { duration: 60 }),
    );
    setTimeout(() => {
      Alert.alert(
        'Eliminar proyecto',
        `¿Seguro que deseas eliminar "${proyecto.titulo}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: () => onPressEliminar(proyecto.id) },
        ],
      );
    }, 400);
  };

  return (
    // Animacion de entrada en tarjetas (OBLIGATORIA del deber)
    <Animated.View
      entering={FadeInLeft.delay(index * 80).duration(400).springify()}
      style={[styles.tarjetaContenedor, cardStyle]}
    >
      <View style={styles.tarjeta}>
        {/* Encabezado */}
        <View style={styles.encabezado}>
          <Text style={styles.titulo} numberOfLines={2}>{proyecto.titulo}</Text>
          <View style={[styles.badge, { backgroundColor: BADGE_COLOR[proyecto.estado] ?? '#888' }]}>
            <Text style={styles.badgeTexto}>{proyecto.estado}</Text>
          </View>
        </View>

        <Text style={styles.etiqueta}>Autores</Text>
        <Text style={styles.valor}>{proyecto.autores}</Text>

        <Text style={styles.etiqueta}>Tutor Docente</Text>
        <Text style={styles.valor}>{proyecto.tutor_docente}</Text>

        <Text style={styles.etiqueta}>Tecnologías</Text>
        <Text style={styles.valor}>{proyecto.tecnologias_utilizadas}</Text>

        <View style={styles.filaFechas}>
          <View style={styles.fecha}>
            <Text style={styles.etiqueta}>Inicio</Text>
            <Text style={styles.valor}>{proyecto.fecha_inicio}</Text>
          </View>
          {proyecto.fecha_fin && (
            <View style={styles.fecha}>
              <Text style={styles.etiqueta}>Fin</Text>
              <Text style={styles.valor}>{proyecto.fecha_fin}</Text>
            </View>
          )}
        </View>

        {/* Acciones */}
        <View style={styles.accionesFila}>
          <TouchableOpacity style={styles.detalleBoton} onPress={() => onPressDetalle?.(proyecto.id)}>
            <Text style={styles.detalleTexto}>Ver detalle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editarBoton} onPress={() => onPressEditar?.(proyecto.id)}>
            <Text style={styles.editarTexto}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.eliminarBoton} onPress={confirmarEliminacion}>
            <Text style={styles.eliminarTexto}>Eliminar</Text>
          </TouchableOpacity>
        </View>

        {/* GitHub */}
        {proyecto.repositorio_github && (
          <TouchableOpacity style={styles.repoBoton} onPress={abrirRepo}>
            <Text style={styles.repoTexto}>Ver en GitHub →</Text>
          </TouchableOpacity>
        )}

        {/* Documento PDF */}
        {proyecto.documento_url && (
          <TouchableOpacity style={styles.docBoton} onPress={abrirDocumento}>
            <Text style={styles.docTexto}>📄 Ver documento PDF</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tarjetaContenedor: { marginBottom: 12 },
  tarjeta: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  encabezado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  titulo: { fontSize: 16, fontWeight: '700', color: '#1A3A5C', flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeTexto: { color: '#fff', fontSize: 11, fontWeight: '700' },
  etiqueta: { fontSize: 11, color: '#888', fontWeight: '600', marginTop: 8 },
  valor: { fontSize: 14, color: '#333', marginTop: 2 },
  filaFechas: { flexDirection: 'row', gap: 24 },
  fecha: { flex: 1 },
  accionesFila: { flexDirection: 'row', gap: 8, marginTop: 14 },
  detalleBoton: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#EEF5FF' },
  detalleTexto: { color: '#2E6DA4', fontSize: 12, fontWeight: '700' },
  editarBoton: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#E8F8F0' },
  editarTexto: { color: '#1E8449', fontSize: 12, fontWeight: '700' },
  eliminarBoton: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#FDEDEC' },
  eliminarTexto: { color: '#C0392B', fontSize: 12, fontWeight: '700' },
  repoBoton: { marginTop: 12, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#EBF5FB', borderRadius: 8, alignSelf: 'flex-start' },
  repoTexto: { color: '#2E6DA4', fontSize: 13, fontWeight: '600' },
  docBoton: { marginTop: 8, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#FEF9E7', borderRadius: 8, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#F39C12' },
  docTexto: { color: '#D68910', fontSize: 13, fontWeight: '600' },
});
