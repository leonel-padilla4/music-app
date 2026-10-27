
import { Injectable } from '@angular/core';
import { Cancion } from '../../models/cancion.model';

@Injectable({
  providedIn: 'root'
})
export class CancionesService {

  private canciones: Cancion[] = [
    {
      id: 1,
      titulo: 'Noches de neón',
      artista: 'Artista de ejemplo',
      album: 'Luces de la ciudad',
      imagen: '',
      duracion: 210,
      categoria: 'Pop'
    },
    {
      id: 2,
      titulo: 'Ritmo urbano',
      artista: 'Artista de ejemplo',
      album: 'Sonidos de la calle',
      imagen: '',
      duracion: 185,
      categoria: 'Urbano'
    },
    {
      id: 3,
      titulo: 'Otro horizonte',
      artista: 'Artista de ejemplo',
      album: 'Nuevos caminos',
      imagen: '',
      duracion: 240,
      categoria: 'Rock'
    },
    {
      id: 4,
      titulo: 'Sube el volumen',
      artista: 'Artista de ejemplo',
      album: 'Energía total',
      imagen: '',
      duracion: 195,
      categoria: 'Pop'
    }
  ];

  obtenerCanciones(): Cancion[] {
    return this.canciones;
  }

  buscarCanciones(texto: string): Cancion[] {
    const busqueda = texto.toLowerCase().trim();

    return this.canciones.filter(cancion =>
      (cancion.titulo + ' ' + cancion.artista + ' ' + cancion.album)
        .toLowerCase()
        .includes(busqueda)
    );
  }

  obtenerPorCategoria(categoria: string): Cancion[] {
    if (categoria === 'Todo') {
      return this.obtenerCanciones();
    }

    return this.canciones.filter(
      cancion => cancion.categoria === categoria
    );
  }

  obtenerPorId(id: number): Cancion | undefined {
    return this.canciones.find(cancion => cancion.id === id);
  }
}
