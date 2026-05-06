import { supabase } from './supabase';

const BUCKET = 'documentos-tesis';

export const storageApi = {
  /**
   * Sube un archivo PDF a Supabase Storage y devuelve la URL pública.
   * @param uri  URI local del archivo (file://)
   * @param fileName Nombre con el que se guardará
   */
  async uploadPdf(uri: string, fileName: string): Promise<string> {
    // Leer el archivo como blob
    const response = await fetch(uri);
    const blob = await response.blob();

    const path = `proyectos/${Date.now()}_${fileName}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, { contentType: 'application/pdf', upsert: false });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },

  /** Elimina un archivo por su URL pública */
  async deletePdf(publicUrl: string): Promise<void> {
    const url = new URL(publicUrl);
    // La ruta en el bucket empieza después de /object/public/<bucket>/
    const parts = url.pathname.split(`/${BUCKET}/`);
    if (parts.length < 2) return;
    const path = parts[1];
    await supabase.storage.from(BUCKET).remove([path]);
  },
};
