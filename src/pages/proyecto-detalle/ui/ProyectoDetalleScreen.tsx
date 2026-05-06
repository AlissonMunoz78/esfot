import { proyectoApi } from '@entities/proyecto-tesis/api/proyectoApi';
import type { ProyectoTesis } from '@entities/proyecto-tesis/model/types';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Linking, ScrollView, StyleSheet, Text,
  TouchableOpacity, View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export function ProyectoDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [proyecto, setProyecto] = useState<ProyectoTesis | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let activo = true;
    const cargar = async () => {
      try {
        setCargando(true);
        const data = await proyectoApi.getById(id);
        if (activo) setProyecto(data);
      } catch (e) {
        if (activo) setError(e instanceof Error ? e.message : 'Error desconocido');
      } finally {
        if (activo) setCargando(false);
      }
    };
    cargar();
    return () => { activo = false; };
  }, [id]);

  if (cargando) return <ActivityIndicator size="large" color="#1A3A5C" style={styles.centro} />;
  if (error || !proyecto) return (
    <View style={styles.centro}>
      <Text style={styles.error}>No se pudo cargar el proyecto: {error ?? 'No encontrado'}</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.scroll} style={styles.contenedor}>
      <Animated.Text entering={FadeInDown.duration(400)} style={styles.titulo}>
        {proyecto.titulo}
      </Animated.Text>
      <Text style={styles.badge}>{proyecto.estado}</Text>

      <Detalle label="Descripción" value={proyecto.descripcion || 'Sin descripción'} delay={100} />
      <Detalle label="Autores" value={proyecto.autores} delay={150} />
      <Detalle label="Tutor Docente" value={proyecto.tutor_docente} delay={200} />
      <Detalle label="Tecnologías" value={proyecto.tecnologias_utilizadas} delay={250} />
      <Detalle label="Fecha de inicio" value={proyecto.fecha_inicio} delay={300} />
      <Detalle label="Fecha de fin" value={proyecto.fecha_fin || 'En progreso'} delay={350} />

      {!!proyecto.repositorio_github && (
        <TouchableOpacity style={styles.accionSecundaria}
          onPress={() => Linking.openURL(proyecto.repositorio_github as string)}>
          <Text style={styles.accionSecundariaTexto}>🔗 Abrir repositorio GitHub</Text>
        </TouchableOpacity>
      )}

      {!!proyecto.documento_url && (
        <TouchableOpacity style={styles.accionDocumento}
          onPress={() => Linking.openURL(proyecto.documento_url as string)}>
          <Text style={styles.accionDocumentoTexto}>📄 Ver documento PDF</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.accionPrincipal}
        onPress={() => router.push(`/proyecto/${proyecto.id}/editar`)}>
        <Text style={styles.accionPrincipalTexto}>Editar proyecto</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Detalle({ label, value, delay = 0 }: { label: string; value: string; delay?: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.bloque}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.valor}>{value}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F7FA' },
  scroll: { padding: 20, paddingBottom: 36 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  titulo: { fontSize: 24, fontWeight: '700', color: '#1A3A5C' },
  badge: { alignSelf: 'flex-start', marginTop: 10, marginBottom: 16, backgroundColor: '#EBF5FB',
    color: '#2E6DA4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
    overflow: 'hidden', fontWeight: '700' },
  bloque: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#E4E9F0' },
  label: { fontSize: 12, color: '#73839B', marginBottom: 4, fontWeight: '600' },
  valor: { fontSize: 15, color: '#1A1A1A' },
  accionPrincipal: { marginTop: 12, backgroundColor: '#1A3A5C', borderRadius: 10,
    paddingVertical: 14, alignItems: 'center' },
  accionPrincipalTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
  accionSecundaria: { marginTop: 8, borderRadius: 10, borderWidth: 1, borderColor: '#2E6DA4',
    paddingVertical: 12, alignItems: 'center' },
  accionSecundariaTexto: { color: '#2E6DA4', fontWeight: '700', fontSize: 14 },
  accionDocumento: { marginTop: 8, borderRadius: 10, borderWidth: 1, borderColor: '#F39C12',
    paddingVertical: 12, alignItems: 'center', backgroundColor: '#FEF9E7' },
  accionDocumentoTexto: { color: '#D68910', fontWeight: '700', fontSize: 14 },
  error: { color: '#C0392B', textAlign: 'center' },
});
