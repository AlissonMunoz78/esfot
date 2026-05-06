import { proyectoApi } from '@entities/proyecto-tesis/api/proyectoApi';
import type { CreateProyectoDto, ProyectoTesis } from '@entities/proyecto-tesis/model/types';
import { RegistroProyectoForm } from '@features/registro-proyecto/ui/RegistroProyectoForm';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

function toCreateDto(proyecto: ProyectoTesis): CreateProyectoDto {
  return {
    titulo: proyecto.titulo,
    descripcion: proyecto.descripcion ?? '',
    autores: proyecto.autores,
    tutor_docente: proyecto.tutor_docente,
    tecnologias_utilizadas: proyecto.tecnologias_utilizadas,
    fecha_inicio: proyecto.fecha_inicio,
    fecha_fin: proyecto.fecha_fin ?? '',
    repositorio_github: proyecto.repositorio_github ?? '',
    estado: proyecto.estado,
    documento_url: proyecto.documento_url ?? '',
  };
}

export function ProyectoEdicionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [inicial, setInicial] = useState<CreateProyectoDto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let activo = true;
    const cargar = async () => {
      try {
        setCargando(true);
        const data = await proyectoApi.getById(id);
        if (activo) setInicial(toCreateDto(data));
      } catch (e) {
        if (activo) setError(e instanceof Error ? e.message : 'Error desconocido');
      } finally {
        if (activo) setCargando(false);
      }
    };
    cargar();
    return () => { activo = false; };
  }, [id]);

  const handleActualizar = async (dto: CreateProyectoDto) => {
    if (!id) return;
    await proyectoApi.update(id, dto);
  };

  if (cargando) return <ActivityIndicator size="large" color="#1A3A5C" style={styles.centro} />;
  if (error || !inicial) return (
    <View style={styles.centro}>
      <Text style={styles.error}>No se pudo cargar el proyecto: {error ?? 'No encontrado'}</Text>
    </View>
  );

  return (
    <View style={styles.contenedor}>
      <RegistroProyectoForm
        initialValues={inicial}
        submitLabel="Guardar cambios"
        successMessage="Proyecto actualizado correctamente."
        title="Editar Proyecto"
        subtitle="Actualiza la información y guarda los cambios"
        onSubmit={handleActualizar}
        onSuccess={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  centro: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  error: { color: '#C0392B', textAlign: 'center' },
});
