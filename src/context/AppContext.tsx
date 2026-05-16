import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EVENTOS_INICIALES } from '../data/eventos';
import type { Evento, EventoInput, Sesion } from '../types/evento';

interface AppContextValue {
  sesion: Sesion;
  loginError: string;
  setLoginError: (value: string) => void;
  login: (usuario: string, password: string) => boolean;
  logout: () => void;
  eventos: Evento[];
  crearEvento: (nuevoEvento: EventoInput) => Evento;
  eliminarEvento: (id: string) => void;
  editarEvento: (id: string, datos: Partial<EventoInput>) => void;
  esAdmin: boolean;
  favoritos: string[];
  toggleFavorito: (id: string) => void;
  esFavorito: (id: string) => boolean;
  favoritosBares: string[];
  toggleFavoritoBar: (id: string) => void;
  esFavoritoBar: (id: string) => boolean;
}

const ADMIN_CREDENTIALS = { usuario: 'admin', password: 'granada2025' } as const;

const EVENTOS_STORAGE_KEY = '@granada_eventos_todos';
const FAVORITOS_STORAGE_KEY = '@granada_favoritos';
const FAVORITOS_BARES_KEY = '@granada_favoritos_bares';

const INICIALES_IDS = new Set(EVENTOS_INICIALES.map((e) => e.id));

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [sesion, setSesion] = useState<Sesion>(null);
  const [loginError, setLoginError] = useState('');
  const [eventos, setEventos] = useState<Evento[]>(EVENTOS_INICIALES);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [favoritosBares, setFavoritosBares] = useState<string[]>([]);

  async function guardarEventosStorage(todosEventos: Evento[]) {
    try {
      await AsyncStorage.setItem(EVENTOS_STORAGE_KEY, JSON.stringify(todosEventos));
    } catch (error) {
      console.warn('Error guardando eventos', error);
    }
  }

  async function guardarFavoritosStorage(nuevos: string[]) {
    try {
      await AsyncStorage.setItem(FAVORITOS_STORAGE_KEY, JSON.stringify(nuevos));
    } catch (error) {
      console.warn('Error guardando favoritos', error);
    }
  }

  async function guardarFavoritosBaresStorage(nuevos: string[]) {
    try {
      await AsyncStorage.setItem(FAVORITOS_BARES_KEY, JSON.stringify(nuevos));
    } catch (error) {
      console.warn('Error guardando favoritos bares', error);
    }
  }

  useEffect(() => {
    async function cargarStorage() {
      try {
        const [almacenados, favAlmacenados, favBaresAlmacenados] = await Promise.all([
          AsyncStorage.getItem(EVENTOS_STORAGE_KEY),
          AsyncStorage.getItem(FAVORITOS_STORAGE_KEY),
          AsyncStorage.getItem(FAVORITOS_BARES_KEY),
        ]);

        if (almacenados) {
          const eventosGuardados: Evento[] = JSON.parse(almacenados);
          // Añade nuevos eventos iniciales que no estén aún en storage
          const storedIds = new Set(eventosGuardados.map((e) => e.id));
          const nuevosIniciales = EVENTOS_INICIALES.filter((e) => !storedIds.has(e.id));
          setEventos([...eventosGuardados, ...nuevosIniciales]);
        } else {
          setEventos(EVENTOS_INICIALES);
        }

        if (favAlmacenados) setFavoritos(JSON.parse(favAlmacenados));
        if (favBaresAlmacenados) setFavoritosBares(JSON.parse(favBaresAlmacenados));
      } catch (error) {
        console.warn('Error cargando datos del almacenamiento', error);
      }
    }
    cargarStorage();
  }, []);

  function login(usuario: string, password: string): boolean {
    if (usuario === ADMIN_CREDENTIALS.usuario && password === ADMIN_CREDENTIALS.password) {
      setSesion('admin');
      setLoginError('');
      return true;
    }
    setLoginError('Usuario o contrasena incorrectos.');
    return false;
  }

  function logout() {
    setSesion(null);
    setLoginError('');
  }

  function crearEvento(nuevoEvento: EventoInput): Evento {
    const evento: Evento = { ...nuevoEvento, id: Date.now().toString() };
    setEventos((prev) => {
      const actualizados = [evento, ...prev];
      guardarEventosStorage(actualizados);
      return actualizados;
    });
    return evento;
  }

  function eliminarEvento(id: string) {
    setEventos((prev) => {
      const actualizados = prev.filter((e) => e.id !== id);
      guardarEventosStorage(actualizados);
      return actualizados;
    });
  }

  function editarEvento(id: string, datos: Partial<EventoInput>) {
    setEventos((prev) => {
      const actualizados = prev.map((e) => (e.id === id ? { ...e, ...datos } : e));
      guardarEventosStorage(actualizados);
      return actualizados;
    });
  }

  const toggleFavorito = useCallback((id: string) => {
    setFavoritos((prev) => {
      const actualizados = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      guardarFavoritosStorage(actualizados);
      return actualizados;
    });
  }, []);

  const esFavorito = useCallback((id: string) => favoritos.includes(id), [favoritos]);

  const toggleFavoritoBar = useCallback((id: string) => {
    setFavoritosBares((prev) => {
      const actualizados = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      guardarFavoritosBaresStorage(actualizados);
      return actualizados;
    });
  }, []);

  const esFavoritoBar = useCallback((id: string) => favoritosBares.includes(id), [favoritosBares]);

  return (
    <AppContext.Provider
      value={{
        sesion,
        loginError,
        setLoginError,
        login,
        logout,
        eventos,
        crearEvento,
        eliminarEvento,
        editarEvento,
        esAdmin: sesion === 'admin',
        favoritos,
        toggleFavorito,
        esFavorito,
        favoritosBares,
        toggleFavoritoBar,
        esFavoritoBar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');
  return ctx;
}
