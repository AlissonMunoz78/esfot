import type { ProyectoTesis } from '@entities/proyecto-tesis/model/types';
import { useListaProyectos } from '@features/lista-proyectos/ui/ListaProyectos';
import { ProyectoCard } from '@widgets/proyecto-card/ProyectoCard';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text } from 'react-native';

interface Props { query?: string; }

export function ProyectosListaWidget({ query }: Props) {
  const { proyectos, cargando, error, eliminarProyecto } = useListaProyectos({ query });

  const irADetalle = (id: string) => router.push(`/proyecto/${id}`);
  const irAEditar = (id: string) => router.push(`/proyecto/${id}/editar`);

  const renderProyecto = ({ item, index }: { item: ProyectoTesis; index: number }) => (
    <ProyectoCard
      proyecto={item}
      index={index}
      onPressDetalle={irADetalle}
      onPressEditar={irAEditar}
      onPressEliminar={eliminarProyecto}
    />
  );

  if (cargando) return <ActivityIndicator size="large" color="#1A3A5C" style={styles.centro} />;
  if (error) return <Text style={styles.error}>Error al cargar proyectos: {error}</Text>;
  if (proyectos.length === 0) return <Text style={styles.vacio}>No hay proyectos registrados aún.</Text>;

  return (
    <FlatList
      data={proyectos}
      keyExtractor={(p) => p.id}
      renderItem={renderProyecto}
      contentContainerStyle={styles.lista}
    />
  );
}

const styles = StyleSheet.create({
  lista: { padding: 16 },
  centro: { flex: 1, justifyContent: 'center' },
  error: { color: '#E74C3C', textAlign: 'center', padding: 20 },
  vacio: { color: '#888', textAlign: 'center', padding: 40 },
});
