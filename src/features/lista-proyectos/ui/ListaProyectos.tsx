// src/features/lista-proyectos/ui/ListaProyectos.tsx

import { proyectoApi } from "@entities/proyecto-tesis/api/proyectoApi";
import type { ProyectoTesis } from "@entities/proyecto-tesis/model/types";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
 
interface UseListaProyectosOptions {
  query?: string;
}

export function useListaProyectos(options: UseListaProyectosOptions = {}) {
  const { query = "" } = options;
  const [proyectos, setProyectos] = useState<ProyectoTesis[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const primeraEntrada = useRef(true);

  const cargarProyectos = useCallback(async (silent = false) => {
    if (!silent) setCargando(true);
    setError(null);

    try {
      const normalizedQuery = query.trim();
      const data = normalizedQuery
        ? await proyectoApi.search(normalizedQuery)
        : await proyectoApi.getAll();
      setProyectos(data);
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "Error desconocido";
      setError(mensaje);
    } finally {
      if (!silent) setCargando(false);
    }
  }, [query]);

  const eliminarProyecto = useCallback(async (id: string) => {
    await proyectoApi.remove(id);
    await cargarProyectos(true);
  }, [cargarProyectos]);

  useEffect(() => {
    cargarProyectos();
  }, [cargarProyectos]);

  useFocusEffect(
    useCallback(() => {
      if (primeraEntrada.current) {
        primeraEntrada.current = false;
        return;
      }

      cargarProyectos(true);
    }, [cargarProyectos]),
  );

  return {
    proyectos,
    cargando,
    error,
    recargar: cargarProyectos,
    eliminarProyecto,
  };
}
