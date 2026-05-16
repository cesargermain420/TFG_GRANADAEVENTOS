import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { CATEGORIAS, ZONAS } from '../data/eventos';
import { colors, radius } from '../theme';
import type { EventoInput } from '../types/evento';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'CrearEvento'>;

const ZONAS_SIN_TODAS = ZONAS.filter((z) => z !== 'Todas');

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

export default function CrearEventoScreen({ navigation, route }: Props) {
  const { crearEvento, editarEvento } = useApp();
  const eventoEditar = route.params?.evento;

  const [form, setForm] = useState<EventoInput>(
    eventoEditar
      ? {
          titulo: eventoEditar.titulo,
          zona: eventoEditar.zona,
          fecha: eventoEditar.fecha,
          hora: eventoEditar.hora,
          precio: eventoEditar.precio,
          ubicacion: eventoEditar.ubicacion,
          descripcion: eventoEditar.descripcion,
          categoria: eventoEditar.categoria,
          aforo: eventoEditar.aforo,
          organizador: eventoEditar.organizador,
          imagen: eventoEditar.imagen || '',
        }
      : {
          titulo: '',
          zona: 'Centro',
          fecha: '',
          hora: '10:00',
          precio: 'Gratuito',
          ubicacion: '',
          descripcion: '',
          categoria: 'Cultura',
          aforo: 'Libre',
          organizador: '',
          imagen: '',
        }
  );

  const setField = <K extends keyof EventoInput>(k: K, v: EventoInput[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const valido = Boolean(form.titulo.trim() && form.fecha.trim() && form.ubicacion.trim());

  async function handlePickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para seleccionar una foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setField('imagen', result.assets[0].uri);
    }
  }

  function handlePublicar() {
    if (!valido) {
      Alert.alert('Campos requeridos', 'Rellena al menos el titulo, la fecha y la ubicacion.');
      return;
    }
    if (eventoEditar) {
      editarEvento(eventoEditar.id, form);
      Alert.alert('Evento actualizado', `"${form.titulo}" ha sido actualizado.`, [
        { text: 'Aceptar', onPress: () => navigation.goBack() },
      ]);
    } else {
      crearEvento(form);
      Alert.alert('Evento publicado', `"${form.titulo}" ya esta disponible en el listado.`, [
        { text: 'Aceptar', onPress: () => navigation.goBack() },
      ]);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.navTitle}>{eventoEditar ? 'Editar evento' : 'Nuevo evento'}</Text>
          <Text style={styles.navSub}>Completa los datos del evento</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Campo label="TITULO DEL EVENTO *">
            <TextInput
              style={styles.input}
              value={form.titulo}
              onChangeText={(v) => setField('titulo', v)}
              placeholder="Nombre del evento"
              placeholderTextColor={colors.textMuted}
            />
          </Campo>

          <View style={styles.fila}>
            <View style={[styles.campo, { flex: 1 }]}>
              <Text style={styles.label}>ZONA</Text>
              <View style={styles.pickerWrapper}>
                {ZONAS_SIN_TODAS.map((z) => (
                  <TouchableOpacity
                    key={z}
                    style={[styles.pill, form.zona === z && styles.pillActivo]}
                    onPress={() => setField('zona', z)}
                  >
                    <Text style={[styles.pillText, form.zona === z && styles.pillTextActivo]}>{z}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <Campo label="CATEGORIA">
            <View style={styles.pickerWrapper}>
              {CATEGORIAS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.pill, form.categoria === c && styles.pillActivo]}
                  onPress={() => setField('categoria', c)}
                >
                  <Text style={[styles.pillText, form.categoria === c && styles.pillTextActivo]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Campo>

          <View style={styles.fila}>
            <View style={[styles.campo, { flex: 1 }]}>
              <Text style={styles.label}>FECHA * (AAAA-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={form.fecha}
                onChangeText={(v) => setField('fecha', v)}
                placeholder="2026-05-15"
                placeholderTextColor={colors.textMuted}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View style={[styles.campo, { flex: 1 }]}>
              <Text style={styles.label}>HORA</Text>
              <TextInput
                style={styles.input}
                value={form.hora}
                onChangeText={(v) => setField('hora', v)}
                placeholder="19:00"
                placeholderTextColor={colors.textMuted}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          <Campo label="PRECIO">
            <TextInput
              style={styles.input}
              value={form.precio}
              onChangeText={(v) => setField('precio', v)}
              placeholder="Gratuito / Materiales: 5EUR"
              placeholderTextColor={colors.textMuted}
            />
          </Campo>

          <Campo label="IMAGEN DEL EVENTO">
            {/* Previsualización si hay imagen */}
            {form.imagen ? (
              <View style={styles.imagenPreviewBox}>
                <Image source={{ uri: form.imagen }} style={styles.imagenPreview} resizeMode="cover" />
                <TouchableOpacity
                  style={styles.removeImgBtn}
                  onPress={() => setField('imagen', '')}
                >
                  <Ionicons name="close-circle" size={24} color={colors.error} />
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Botón galería */}
            <TouchableOpacity style={styles.galleryBtn} onPress={handlePickImage}>
              <Ionicons name="image-outline" size={18} color={colors.brand} />
              <Text style={styles.galleryBtnText}>
                {form.imagen ? 'Cambiar foto de galería' : 'Elegir foto de galería'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.oLabel}>o pega una URL:</Text>
            <TextInput
              style={styles.input}
              value={form.imagen}
              onChangeText={(v) => setField('imagen', v)}
              placeholder="https://.../imagen.jpg"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
            />
          </Campo>

          <Campo label="UBICACION *">
            <TextInput
              style={styles.input}
              value={form.ubicacion}
              onChangeText={(v) => setField('ubicacion', v)}
              placeholder="Direccion completa"
              placeholderTextColor={colors.textMuted}
            />
          </Campo>

          <View style={styles.fila}>
            <View style={[styles.campo, { flex: 1 }]}>
              <Text style={styles.label}>AFORO</Text>
              <TextInput
                style={styles.input}
                value={form.aforo}
                onChangeText={(v) => setField('aforo', v)}
                placeholder="Libre / 50 personas"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={[styles.campo, { flex: 1 }]}>
              <Text style={styles.label}>ORGANIZADOR</Text>
              <TextInput
                style={styles.input}
                value={form.organizador}
                onChangeText={(v) => setField('organizador', v)}
                placeholder="Nombre"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <Campo label="DESCRIPCION">
            <TextInput
              style={[styles.input, styles.textarea]}
              value={form.descripcion}
              onChangeText={(v) => setField('descripcion', v)}
              placeholder="Descripcion del evento..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </Campo>

          <TouchableOpacity
            style={[styles.btnPublicar, !valido && styles.btnPublicarDisabled]}
            onPress={handlePublicar}
            activeOpacity={valido ? 0.8 : 1}
          >
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={styles.btnPublicarText}>{eventoEditar ? 'Actualizar evento' : 'Publicar evento'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fffdf7' },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0e9dc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  navSub: { fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: 1 },
  content: { padding: 18, paddingBottom: 40 },
  fila: { flexDirection: 'row', gap: 12 },
  campo: { marginBottom: 16 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.bgPrimary,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderInput,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: colors.textPrimary,
  },
  textarea: { height: 90, paddingTop: 11 },
  pickerWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: '#f0e9dc',
    borderWidth: 1,
    borderColor: colors.borderInput,
  },
  pillActivo: { backgroundColor: colors.brand, borderColor: colors.brand },
  pillText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  pillTextActivo: { color: '#fff', fontWeight: '700' },
  galleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.azulSuave,
    borderWidth: 1.5,
    borderColor: colors.azulBorder,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 10,
  },
  galleryBtnText: { fontSize: 14, color: colors.brand, fontWeight: '600' },
  oLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 6 },
  imagenPreviewBox: { position: 'relative', marginBottom: 10 },
  imagenPreview: {
    width: '100%',
    height: 160,
    borderRadius: radius.md,
    backgroundColor: colors.bgPrimary,
  },
  removeImgBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  btnPublicar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    paddingVertical: 14,
    marginTop: 8,
  },
  btnPublicarDisabled: { backgroundColor: '#d6cfc4' },
  btnPublicarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
