import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Image, Linking, Platform, SafeAreaView, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Badge from '../components/Badge';
import PrecioTag from '../components/PrecioTag';
import { useApp } from '../context/AppContext';
import { CATEGORIA_COLORES } from '../data/eventos';
import { colors, radius } from '../theme';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'DetalleEvento'>;

function formatFecha(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

interface InfoRowProps {
  icono: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  valor: string;
}

function InfoRow({ icono, label, valor }: InfoRowProps) {
  return (
    <View style={styles.infoBox}>
      <View style={styles.infoLabelRow}>
        <Ionicons name={icono} size={12} color={colors.textMuted} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValor}>{valor}</Text>
    </View>
  );
}

export default function DetalleEventoScreen({ route, navigation }: Props) {
  const { esAdmin, eliminarEvento, toggleFavorito, esFavorito, eventos } = useApp();
  const evento = eventos.find((e) => e.id === route.params.evento.id) ?? route.params.evento;
  const favorito = esFavorito(evento.id);
  const acento = CATEGORIA_COLORES[evento.categoria]?.acento || colors.brand;

  function handleEliminar() {
    Alert.alert('Eliminar evento', `Seguro que quieres eliminar "${evento.titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          eliminarEvento(evento.id);
          navigation.goBack();
        },
      },
    ]);
  }

  function handleEditar() {
    navigation.navigate('CrearEvento', { evento });
  }

  async function handleCompartir() {
    try {
      await Share.share({
        title: evento.titulo,
        message: 
          `¡Echa un vistazo a este evento en Granada!` +
          ` ${evento.titulo}\n` +
          ` ${evento.ubicacion} (${evento.zona})\n` +
          ` ${formatFecha(evento.fecha)} — ${evento.hora}\n` +
          ` ${evento.precio}\n\n` +
          `${evento.descripcion}\n\n` +
          `Organiza: ${evento.organizador}` +
          `Descarga la app Granada Eventos para mas información!`,
      });
    } catch {
      // usuario canceló
    }
  }

  function handleAbrirMapa() {
    const query = encodeURIComponent(`${evento.ubicacion}, Granada, España`);
    const url = Platform.OS === 'ios'
      ? `maps://maps.apple.com/?q=${query}`
      : `https://maps.google.com/?q=${query}`;
    Linking.openURL(url);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.navActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleCompartir}>
            <Ionicons name="share-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleAbrirMapa}>
            <Ionicons name="navigate-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, favorito && { backgroundColor: '#fee2e2' }]}
            onPress={() => toggleFavorito(evento.id)}
          >
            <Ionicons
              name={favorito ? 'heart' : 'heart-outline'}
              size={18}
              color={favorito ? '#dc2626' : colors.textMuted}
            />
          </TouchableOpacity>
          {esAdmin && (
            <TouchableOpacity style={styles.editBtn} onPress={handleEditar}>
              <Ionicons name="pencil-outline" size={18} color={colors.brand} />
            </TouchableOpacity>
          )}
          {esAdmin && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleEliminar}>
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {evento.imagen ? (
          <Image source={{ uri: evento.imagen }} style={styles.eventImage} resizeMode="cover" />
        ) : null}
        <View style={styles.cabecera}>
          <Badge categoria={evento.categoria} />
          <View style={styles.precioRow}>
            <PrecioTag precio={evento.precio} />
          </View>
        </View>

        <Text style={styles.titulo}>{evento.titulo}</Text>

        <View style={styles.infoGrid}>
          <InfoRow icono="calendar-outline" label="Fecha" valor={formatFecha(evento.fecha)} />
          <InfoRow icono="time-outline" label="Hora" valor={evento.hora} />
          <InfoRow icono="location-outline" label="Lugar" valor={evento.ubicacion} />
          <InfoRow icono="map-outline" label="Zona" valor={evento.zona} />
          <InfoRow icono="cash-outline" label="Precio" valor={evento.precio} />
          <InfoRow icono="people-outline" label="Aforo" valor={evento.aforo} />
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionTitle}>Descripcion</Text>
          <Text style={styles.descripcion}>{evento.descripcion}</Text>
        </View>

        <View style={styles.organizadorBox}>
          <Ionicons name="business-outline" size={14} color={colors.textMuted} />
          <Text style={styles.organizadorLabel}>Organiza: </Text>
          <Text style={styles.organizadorNombre}>{evento.organizador}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fffdf7',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginTop: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0e9dc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.adminBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.errorBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  cabecera: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  precioRow: {
    alignItems: 'flex-end',
  },
  titulo: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 30,
    marginBottom: 20,
  },
  eventImage: {
    width: '100%',
    height: 220,
    borderRadius: radius.lg,
    marginBottom: 18,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  infoBox: {
    width: '47%',
    backgroundColor: '#f7f2ea',
    borderRadius: radius.md,
    padding: 12,
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValor: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2d1e0a',
  },
  seccion: {
    marginBottom: 20,
  },
  seccionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  descripcion: {
    fontSize: 15,
    color: '#4a3520',
    lineHeight: 24,
  },
  organizadorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  organizadorLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  organizadorNombre: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
});
