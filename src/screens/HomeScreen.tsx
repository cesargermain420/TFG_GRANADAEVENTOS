import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  ImageBackground,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import EventoCard from '../components/EventoCard';
import { useApp } from '../context/AppContext';
import { ZONAS, CATEGORIAS } from '../data/eventos';
import { colors, radius } from '../theme';
import type { RootStackParamList } from '../types/navigation';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const BANNER_IMAGE = require('../../assets/fondo granada.jpg');

const TOP_PADDING =
  Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 24) + 14 : 54;

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { eventos, esAdmin, logout } = useApp();
  const [zonaSeleccionada, setZonaSeleccionada] = useState('Todas');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const hoy = new Date().toISOString().split('T')[0];
  const filtrosActivos = zonaSeleccionada !== 'Todas' || categoriaSeleccionada !== 'Todas';

  const eventosFiltrados = useMemo(
    () =>
      eventos.filter((ev) => {
        if (ev.fecha < hoy) return false;
        const matchZona = zonaSeleccionada === 'Todas' || ev.zona === zonaSeleccionada;
        const matchCategoria = categoriaSeleccionada === 'Todas' || ev.categoria === categoriaSeleccionada;
        const q = busqueda.toLowerCase();
        const matchBusqueda =
          !busqueda ||
          [ev.titulo, ev.zona, ev.categoria, ev.descripcion].some((c) =>
            c.toLowerCase().includes(q)
          );
        return matchZona && matchCategoria && matchBusqueda;
      }),
    [eventos, zonaSeleccionada, categoriaSeleccionada, busqueda, hoy]
  );

  function limpiarFiltros() {
    setZonaSeleccionada('Todas');
    setCategoriaSeleccionada('Todas');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <RNStatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ImageBackground
        source={BANNER_IMAGE}
        style={[styles.bannerBackground, { paddingTop: TOP_PADDING }]}
        imageStyle={styles.bannerImageBg}
      >
        <View style={styles.header}>
          {/* Titulo + Login */}
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Eventos Granainos</Text>
              <Text style={styles.headerSub}>
                {esAdmin ? 'Sesion de administrador' : 'Ceramica · Cultura · Tradicion'}
              </Text>
            </View>
            {esAdmin ? (
              <TouchableOpacity style={styles.headerBtn} onPress={logout}>
                <Ionicons name="log-out-outline" size={13} color="rgba(255,255,255,0.75)" />
                <Text style={styles.headerBtnText}>Salir</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
                <Ionicons name="log-in-outline" size={13} color="#1f2937" />
                <Text style={styles.loginBtnText}>Login</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Barra de búsqueda + botón de filtros */}
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              value={busqueda}
              onChangeText={setBusqueda}
              placeholder="Buscar eventos, zonas, categorias..."
              placeholderTextColor={colors.textMuted}
            />
            {busqueda.length > 0 && (
              <TouchableOpacity onPress={() => setBusqueda('')} style={{ marginRight: 6 }}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.filterToggle, mostrarFiltros && styles.filterToggleActivo]}
              onPress={() => setMostrarFiltros(!mostrarFiltros)}
            >
              <Ionicons
                name="options-outline"
                size={17}
                color={filtrosActivos ? '#fff' : mostrarFiltros ? '#fff' : colors.textMuted}
              />
              {filtrosActivos && !mostrarFiltros && <View style={styles.filterDot} />}
            </TouchableOpacity>
          </View>

          {/* Chips de filtros activos */}
          {filtrosActivos && !mostrarFiltros && (
            <View style={styles.activeChipsRow}>
              {zonaSeleccionada !== 'Todas' && (
                <TouchableOpacity style={styles.activeChip} onPress={() => setZonaSeleccionada('Todas')}>
                  <Text style={styles.activeChipText}>{zonaSeleccionada}</Text>
                  <Ionicons name="close" size={11} color="rgba(255,255,255,0.9)" />
                </TouchableOpacity>
              )}
              {categoriaSeleccionada !== 'Todas' && (
                <TouchableOpacity style={styles.activeChip} onPress={() => setCategoriaSeleccionada('Todas')}>
                  <Text style={styles.activeChipText}>{categoriaSeleccionada}</Text>
                  <Ionicons name="close" size={11} color="rgba(255,255,255,0.9)" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={limpiarFiltros}>
                <Text style={styles.clearAll}>Limpiar</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Panel de filtros expandible */}
          {mostrarFiltros && (
            <View style={styles.filterPanel}>
              <Text style={styles.filterLabel}>Zona</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScroll}
              >
                {ZONAS.map((zona) => (
                  <TouchableOpacity
                    key={zona}
                    style={[styles.filterChip, zonaSeleccionada === zona && styles.filterChipActivo]}
                    onPress={() => setZonaSeleccionada(zona)}
                  >
                    <Text style={[styles.filterChipText, zonaSeleccionada === zona && styles.filterChipTextActivo]}>
                      {zona}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.filterLabel}>Categoría</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScroll}
              >
                {['Todas', ...CATEGORIAS].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.filterChip, categoriaSeleccionada === cat && styles.filterChipActivo]}
                    onPress={() => setCategoriaSeleccionada(cat)}
                  >
                    <Text style={[styles.filterChipText, categoriaSeleccionada === cat && styles.filterChipTextActivo]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {filtrosActivos && (
                <TouchableOpacity onPress={limpiarFiltros} style={styles.limpiarBtn}>
                  <Text style={styles.limpiarBtnText}>Limpiar filtros</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ImageBackground>

      <FlatList
        style={styles.flatList}
        data={eventosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventoCard
            evento={item}
            onPress={(ev) => navigation.navigate('DetalleEvento', { evento: ev })}
          />
        )}
        ListHeaderComponent={() => (
          <View>
            {esAdmin && (
              <View style={styles.adminBanner}>
                <Ionicons name="shield-checkmark-outline" size={14} color={colors.brand} />
                <Text style={styles.adminText}>Modo administrador — Pulsa + para añadir eventos</Text>
              </View>
            )}
            <Text style={styles.counter}>
              <Text style={{ color: colors.brand, fontWeight: '700' }}>{eventosFiltrados.length}</Text>{' '}
              evento{eventosFiltrados.length !== 1 ? 's' : ''} próximo
              {eventosFiltrados.length !== 1 ? 's' : ''}
              {zonaSeleccionada !== 'Todas' ? `  ·  ${zonaSeleccionada}` : ''}
              {categoriaSeleccionada !== 'Todas' ? `  ·  ${categoriaSeleccionada}` : ''}
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="search-outline" size={28} color={colors.brand} />
            </View>
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptySubtitle}>Prueba a cambiar los filtros o la búsqueda</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {esAdmin && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CrearEvento', {})}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  bannerBackground: {
    width: '100%',
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  bannerImageBg: { opacity: 0.95 },
  header: { paddingHorizontal: 16 },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
 
    headerTitle: { fontSize: 24, fontWeight: '900', color: colors.textPrimary, marginBottom: 4, marginTop: -10 },

  headerSub: {
    fontSize: 11,
    color: colors.textPrimary,
    marginTop: 4,
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  headerBtnText: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.88)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
  },
  loginBtnText: { fontSize: 12, color: '#1f2937', fontWeight: '700' },

  /* ── Barra de búsqueda ── */
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.textPrimary, paddingVertical: 11 },
  filterToggle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterToggleActivo: { backgroundColor: colors.brand },
  filterDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#fff',
  },

  /* ── Chips activos ── */
  activeChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.brand,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeChipText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  clearAll: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600', textDecorationLine: 'underline' },

  /* ── Panel de filtros ── */
  filterPanel: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 6,
    marginBottom: 6,
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.8,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  filterScroll: { gap: 6, paddingBottom: 8 },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  filterChipActivo: { backgroundColor: 'rgba(255,255,255,0.98)' },
  filterChipText: { fontSize: 12, color: '#1f2937', fontWeight: '500' },
  filterChipTextActivo: { color: colors.bgDark, fontWeight: '800' },
  limpiarBtn: { alignSelf: 'flex-end', paddingVertical: 4, marginBottom: 2 },
  limpiarBtnText: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600', textDecorationLine: 'underline' },

  /* ── Lista ── */
  flatList: { backgroundColor: 'transparent' },
  listContent: { padding: 14, paddingBottom: 110, backgroundColor: 'transparent', flexGrow: 1 },
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.azulSuave,
    borderRadius: radius.md,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.azulBorder,
    borderLeftWidth: 4,
    borderLeftColor: colors.brand,
  },
  adminText: { fontSize: 13, color: colors.brandDark, fontWeight: '600', flex: 1 },
  counter: { fontSize: 13, color: colors.textMuted, fontWeight: '600', marginBottom: 14 },
  emptyContainer: { alignItems: 'center', paddingVertical: 70 },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: colors.azulPale,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brandDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
});
