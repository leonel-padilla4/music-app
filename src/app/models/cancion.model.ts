
export interface Cancion {
  id: number;
  titulo: string;
  artista: string;
  album: string;
  imagen: string;
  duracion: number;
  categoria: string;
  audioUrl?: string;
  letraUrl?: string;
}
