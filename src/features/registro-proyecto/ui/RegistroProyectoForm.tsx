import type { CreateProyectoDto, EstadoProyecto } from '@entities/proyecto-tesis/model/types';
import { storageApi } from '@shared/api/storageApi';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, type Control } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { createProyecto, validateProyecto } from '../api/createProyecto';

const FORM_INICIAL: CreateProyectoDto = {
  titulo: '',
  descripcion: '',
  autores: '',
  tutor_docente: '',
  tecnologias_utilizadas: '',
  fecha_inicio: '',
  fecha_fin: '',
  repositorio_github: '',
  estado: 'En Progreso',
  documento_url: '',
};

const ESTADOS: EstadoProyecto[] = ['En Progreso', 'Completado', 'Suspendido'];

interface Props {
  onSuccess?: () => void;
  onSubmit?: (dto: CreateProyectoDto) => Promise<void>;
  initialValues?: Partial<CreateProyectoDto>;
  submitLabel?: string;
  successMessage?: string;
  title?: string;
  subtitle?: string;
}

interface CampoProps {
  control: Control<CreateProyectoDto>;
  label: string;
  campo: keyof CreateProyectoDto;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'url';
  required?: string;
  pattern?: { value: RegExp; message: string };
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const AZUL = '#1A3A5C';
const AZUL_CLARO = '#2E6DA4';

// Campo animado con transición de borde (obligatorio del deber)
function Campo({
  control,
  label,
  campo,
  placeholder,
  multiline = false,
  keyboardType = 'default',
  required,
  pattern,
}: CampoProps) {
  const borderColor = useSharedValue('#DDE2E8');
  const borderWidth = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
    borderWidth: borderWidth.value,
  }));

  return (
    <Controller
      control={control}
      name={campo}
      rules={{ required, pattern }}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <View style={styles.campoContenedor}>
          <Text style={styles.etiqueta}>{label}</Text>
          <Animated.View style={[styles.inputAnimado, animatedStyle, error ? styles.inputErrorBorder : null]}>
            <TextInput
              style={[styles.input, multiline && styles.inputMultiline]}
              placeholder={placeholder}
              placeholderTextColor="#999"
              value={String(value ?? '')}
              onChangeText={onChange}
              multiline={multiline}
              numberOfLines={multiline ? 3 : 1}
              keyboardType={keyboardType}
              autoCapitalize={campo === 'repositorio_github' ? 'none' : 'sentences'}
              onFocus={() => {
                borderColor.value = withTiming(AZUL_CLARO, { duration: 200 });
                borderWidth.value = withTiming(2, { duration: 200 });
              }}
              onBlur={() => {
                borderColor.value = withTiming(error ? '#E74C3C' : '#DDE2E8', { duration: 200 });
                borderWidth.value = withTiming(error ? 1.5 : 1, { duration: 200 });
              }}
            />
          </Animated.View>
          {error?.message ? <Text style={styles.textoError}>{error.message}</Text> : null}
        </View>
      )}
    />
  );
}

// Selector de PDF para Supabase Storage
function CampoDocumento({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [subiendo, setSubiendo] = useState(false);
  const [nombreArchivo, setNombreArchivo] = useState('');
  const scale = useSharedValue(1);

  const animatedBtn = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const seleccionarPdf = async () => {
    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (resultado.canceled || !resultado.assets?.[0]) return;

      const archivo = resultado.assets[0];
      setSubiendo(true);
      scale.value = withSpring(0.97);

      const url = await storageApi.uploadPdf(archivo.uri, archivo.name);
      setNombreArchivo(archivo.name);
      onChange(url);

      scale.value = withSpring(1);
      Alert.alert('¡Documento subido!', 'El PDF se guardó correctamente.');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al subir el archivo';
      Alert.alert('Error', msg);
      scale.value = withSpring(1);
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <View style={styles.campoContenedor}>
      <Text style={styles.etiqueta}>Documento (PDF)</Text>
      <Animated.View style={animatedBtn}>
        <TouchableOpacity
          style={[styles.botonDocumento, subiendo && styles.botonDeshabilitado]}
          onPress={seleccionarPdf}
          disabled={subiendo}
        >
          {subiendo ? (
            <ActivityIndicator color={AZUL_CLARO} size="small" />
          ) : (
            <Text style={styles.botonDocumentoTexto}>
              {value ? '📄 Cambiar PDF' : '📎 Seleccionar PDF'}
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>
      {(nombreArchivo || value) ? (
        <Text style={styles.nombreArchivo} numberOfLines={1}>
          {nombreArchivo || 'Documento cargado ✓'}
        </Text>
      ) : null}
    </View>
  );
}

export function RegistroProyectoForm({
  onSuccess,
  onSubmit,
  initialValues,
  submitLabel = 'Registrar Proyecto',
  successMessage = 'Proyecto de tesis registrado correctamente.',
  title = 'Nuevo Proyecto de Tesis',
  subtitle = 'ESFOT — Tecnología Superior en Desarrollo de Software',
}: Props) {
  const [cargando, setCargando] = useState(false);

  const defaults = useMemo(
    () => ({ ...FORM_INICIAL, ...initialValues }),
    [initialValues],
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CreateProyectoDto>({ defaultValues: defaults });

  useEffect(() => { reset(defaults); }, [defaults, reset]);

  const estadoActual = watch('estado');
  const documentoUrl = watch('documento_url');

  const submit = handleSubmit(async (values) => {
    const validaciones = validateProyecto(values);
    if (validaciones.length > 0) {
      validaciones.forEach((e) => setError(e.field, { type: 'manual', message: e.message }));
      Alert.alert('Formulario incompleto', 'Revisa los campos marcados en rojo.');
      return;
    }
    try {
      setCargando(true);
      if (onSubmit) {
        await onSubmit(values);
      } else {
        await createProyecto(values);
      }
      Alert.alert('¡Éxito!', successMessage, [{
        text: 'OK',
        onPress: () => {
          if (!initialValues) reset(FORM_INICIAL);
          onSuccess?.();
        },
      }]);
    } catch (error: any) {
  console.log("🔥 ERROR COMPLETO:", JSON.stringify(error, null, 2));
  console.log("🔥 ERROR DIRECTO:", error);

  Alert.alert(
    'Error DEBUG',
    JSON.stringify(error?.response?.data || error?.message || error, null, 2)
  );
} finally {
      setCargando(false);
    }
  });

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.titulo}>{title}</Text>
      <Text style={styles.subtitulo}>{subtitle}</Text>

      <Campo control={control} label="Título del Proyecto *" campo="titulo"
        placeholder="Ej: Sistema de gestión de inventarios" required="El título es obligatorio" />
      <Campo control={control} label="Descripción" campo="descripcion"
        placeholder="Describe brevemente el objetivo..." multiline />
      <Campo control={control} label="Autores * (separa con comas)" campo="autores"
        placeholder="Ej: Ana Torres, Luis Pérez" required="Ingresa al menos un autor" />
      <Campo control={control} label="Tutor Docente *" campo="tutor_docente"
        placeholder="Ej: Ing. Juan Carlos Gonzalez Msc." required="El tutor docente es obligatorio" />
      <Campo control={control} label="Tecnologías Utilizadas * (separa con comas)"
        campo="tecnologias_utilizadas" placeholder="Ej: React Native, Node.js, PostgreSQL"
        required="Especifica las tecnologías" />
      <Campo control={control} label="Fecha de Inicio * (AAAA-MM-DD)" campo="fecha_inicio"
        placeholder="Ej: 2025-03-01" required="La fecha de inicio es obligatoria"
        pattern={{ value: DATE_REGEX, message: 'Formato: AAAA-MM-DD' }} />
      <Campo control={control} label="Fecha de Fin (AAAA-MM-DD)" campo="fecha_fin"
        placeholder="Ej: 2025-12-31"
        pattern={{ value: /^$|^\d{4}-\d{2}-\d{2}$/, message: 'Formato: AAAA-MM-DD' }} />
      <Campo control={control} label="Repositorio GitHub" campo="repositorio_github"
        placeholder="https://github.com/usuario/repositorio" keyboardType="url"
        pattern={{ value: /^$|^https?:\/\/.+/, message: 'Debe ser una URL válida' }} />

      {/* Campo documento PDF - Supabase Storage */}
      <CampoDocumento
        value={documentoUrl ?? ''}
        onChange={(url) => setValue('documento_url', url)}
      />

      {/* Estado */}
      <View style={styles.campoContenedor}>
        <Text style={styles.etiqueta}>Estado del Proyecto</Text>
        <View style={styles.estadoContenedor}>
          {ESTADOS.map((est) => (
            <TouchableOpacity
              key={est}
              style={[styles.estadoBoton, estadoActual === est && styles.estadoBotonActivo]}
              onPress={() => setValue('estado', est, { shouldValidate: true })}
            >
              <Text style={[styles.estadoTexto, estadoActual === est && styles.estadoTextoActivo]}>
                {est}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.botonGuardar, cargando && styles.botonDeshabilitado]}
        onPress={submit}
        disabled={cargando}
      >
        {cargando ? <ActivityIndicator color="#fff" /> : (
          <Text style={styles.botonTexto}>{submitLabel}</Text>
        )}
      </TouchableOpacity>

      {!!Object.keys(errors).length && (
        <Text style={styles.ayudaError}>Hay campos por corregir antes de guardar.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#F5F7FA' },
  scroll: { padding: 20, paddingBottom: 40 },
  titulo: { fontSize: 22, fontWeight: '700', color: AZUL, marginBottom: 4 },
  subtitulo: { fontSize: 13, color: '#666', marginBottom: 24 },
  campoContenedor: { marginBottom: 16 },
  etiqueta: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
  inputAnimado: {
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 15,
    color: '#1A1A1A',
  },
  inputMultiline: { height: 80, textAlignVertical: 'top', paddingTop: 10 },
  inputErrorBorder: { borderColor: '#E74C3C', borderWidth: 1.5 },
  textoError: { color: '#E74C3C', fontSize: 12, marginTop: 4 },
  estadoContenedor: { flexDirection: 'row', gap: 10 },
  estadoBoton: {
    flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1,
    borderColor: '#DDE2E8', backgroundColor: '#fff', alignItems: 'center',
  },
  estadoBotonActivo: { backgroundColor: AZUL_CLARO, borderColor: AZUL_CLARO },
  estadoTexto: { fontSize: 13, color: '#555' },
  estadoTextoActivo: { color: '#fff', fontWeight: '700' },
  botonGuardar: {
    backgroundColor: AZUL, borderRadius: 10, paddingVertical: 16,
    alignItems: 'center', marginTop: 10,
  },
  botonDeshabilitado: { opacity: 0.6 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
  ayudaError: { marginTop: 12, textAlign: 'center', color: '#C0392B', fontSize: 12, fontWeight: '600' },
  botonDocumento: {
    borderWidth: 1.5, borderColor: AZUL_CLARO, borderRadius: 10, borderStyle: 'dashed',
    paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center', backgroundColor: '#EBF5FB',
  },
  botonDocumentoTexto: { color: AZUL_CLARO, fontSize: 14, fontWeight: '700' },
  nombreArchivo: { marginTop: 6, fontSize: 12, color: '#27AE60', fontWeight: '600' },
});
