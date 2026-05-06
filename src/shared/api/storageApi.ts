import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './supabase';

const BUCKET = 'documentos-tesis';

export const storageApi = {
  async uploadPdf(uri: string, fileName: string): Promise<string> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);

      if (!fileInfo.exists) {
        throw new Error('Archivo no encontrado');
      }

      // leer como base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      // convertir a blob manualmente
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      const path = `proyectos/${Date.now()}_${fileName}`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, byteArray, {
          contentType: 'application/pdf',
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(path);

      return data.publicUrl;

    } catch (err) {
      console.log('UPLOAD ERROR:', err);
      throw err;
    }
  },
};