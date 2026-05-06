export type EstadoProyecto = 'En Progreso' | 'Completado' | 'Suspendido';
 
export interface ProyectoTesis {
  id: string;
  titulo: string;
  descripcion: string;
  autores: string;
  tutor_docente: string;
  tecnologias_utilizadas: string;
  fecha_inicio: string;
  fecha_fin?: string;
  repositorio_github?: string;
  estado: EstadoProyecto;
  documento_url?: string;
  created_at: string;
}
 
export type CreateProyectoDto = Omit<ProyectoTesis, 'id' | 'created_at'>;
export type UpdateProyectoDto = Partial<CreateProyectoDto>;
