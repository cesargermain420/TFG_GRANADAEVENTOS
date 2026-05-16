export type Sesion = 'admin' | null;

export interface Evento {
  id: string;
  titulo: string;
  zona: string;
  fecha: string;
  hora: string;
  precio: string;
  ubicacion: string;
  descripcion: string;
  categoria: string;
  aforo: string;
  organizador: string;
  imagen?: string;
}
//INFO DE CADA EVENTO PARA HOMESCREEN Y BLOGSCREEN

export type EventoInput = Omit<Evento, 'id'>;
