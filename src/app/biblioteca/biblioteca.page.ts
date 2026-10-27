
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { Cancion } from '../models/cancion.model';
import { CancionesService } from '../core/services/canciones.service';

@Component({
  selector: 'app-biblioteca',
  templateUrl: './biblioteca.page.html',
  styleUrls: ['./biblioteca.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, CommonModule, RouterLink],
})
export class BibliotecaPage {
  private cancionesService = inject(CancionesService);

  canciones: Cancion[] = this.cancionesService.obtenerCanciones();
  favoritos: Cancion[] = [];

  constructor() {
    this.cargarFavoritos();
  }


cargarFavoritos(): void {
  const favoritosGuardados = localStorage.getItem('sonora-favoritos');

  const ids: string[] = favoritosGuardados
    ? JSON.parse(favoritosGuardados).map((id: number | string) => String(id))
    : [];

  this.favoritos = this.canciones.filter(cancion =>
    ids.includes(String(cancion.id))
  );
}

ionViewWillEnter(): void {
  this.cargarFavoritos();
}

}
