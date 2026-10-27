
import { RouterLink } from '@angular/router';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular';

import { Cancion } from '../models/cancion.model';
import { CancionesService } from '../core/services/canciones.service';

@Component({
  selector: 'app-buscar',
  templateUrl: './buscar.page.html',
  styleUrls: ['./buscar.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, RouterLink]
})
export class BuscarPage {
  private cancionesService = inject(CancionesService);

  canciones: Cancion[] = this.cancionesService.obtenerCanciones();

  busqueda = '';
  categoriaSeleccionada = 'Todo';

  categorias: string[] = ['Todo', 'Pop', 'Urbano', 'Rock'];


favoritosIds: string[] = [];

constructor() {
  this.cargarFavoritos();
}

cargarFavoritos(): void {
  const guardados = localStorage.getItem('sonora-favoritos');

  this.favoritosIds = guardados
    ? JSON.parse(guardados).map((id: number | string) => String(id))
    : [];
}

esFavorita(id: number | string): boolean {
  return this.favoritosIds.includes(String(id));
}

alternarFavorito(id: number | string): void {
  const idCancion = String(id);

  if (this.esFavorita(idCancion)) {
    this.favoritosIds = this.favoritosIds.filter(
      favorito => favorito !== idCancion
    );
  } else {
    this.favoritosIds = [...this.favoritosIds, idCancion];
  }

  localStorage.setItem(
    'sonora-favoritos',
    JSON.stringify(this.favoritosIds)
  );

  window.dispatchEvent(new Event('favoritos-actualizados'));
}

  get cancionesFiltradas(): Cancion[] {
    let resultado = this.canciones;

    if (this.categoriaSeleccionada !== 'Todo') {
      resultado = resultado.filter(
        cancion => cancion.categoria === this.categoriaSeleccionada
      );
    }

    const texto = this.busqueda.toLowerCase().trim();

    if (texto !== '') {
      resultado = resultado.filter(cancion =>
        (
          cancion.titulo + ' ' +
          cancion.artista + ' ' +
          cancion.album
        ).toLowerCase().includes(texto)
      );
    }

    return resultado;
  }

  seleccionarCategoria(categoria: string): void {
    this.categoriaSeleccionada = categoria;
  }
}
