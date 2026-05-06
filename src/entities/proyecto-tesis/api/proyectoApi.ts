import { supabase } from "@shared/api/supabase";
import type {
  CreateProyectoDto,
  ProyectoTesis,
  UpdateProyectoDto,
} from "../model/types";

const TABLE = "proyectos_tesis";

export const proyectoApi = {
  async getAll(): Promise<ProyectoTesis[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getById(id: string): Promise<ProyectoTesis> {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async create(dto: CreateProyectoDto): Promise<ProyectoTesis> {
    const payload: CreateProyectoDto = { ...dto };
    if (!payload.fecha_fin?.trim()) delete payload.fecha_fin;
    if (!payload.repositorio_github?.trim()) delete payload.repositorio_github;
    if (!payload.documento_url?.trim()) delete payload.documento_url;

    const { data, error } = await supabase
      .from(TABLE)
      .insert([payload])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async search(query: string): Promise<ProyectoTesis[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .or(`titulo.ilike.%${query}%,autores.ilike.%${query}%`)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async update(id: string, dto: UpdateProyectoDto): Promise<ProyectoTesis> {
    const payload: UpdateProyectoDto = { ...dto };
    if (payload.fecha_fin !== undefined && !payload.fecha_fin?.trim()) delete payload.fecha_fin;
    if (payload.repositorio_github !== undefined && !payload.repositorio_github?.trim()) delete payload.repositorio_github;
    if (payload.documento_url !== undefined && !payload.documento_url?.trim()) delete payload.documento_url;

    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
};
