
import { RouterLink } from '@angular/router';
import { Component, OnDestroy, ChangeDetectorRef , inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular';

import { Cancion } from '../models/cancion.model';
import { CancionesService } from '../core/services/canciones.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, RouterLink]
})
export class HomePage implements OnDestroy {


favoritosIds: string[] = [];

 constructor() {
    this.cargarFavoritos();
  }
cargarFavoritos(): void {
  const guardados = localStorage.getItem('sonora-favoritos');
  this.favoritosIds = guardados ? JSON.parse(guardados) : [];
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


  private cancionesService = inject(CancionesService);
  private detectorCambios = inject(ChangeDetectorRef);
  canciones: Cancion[] = this.cancionesService.obtenerCanciones();

  busqueda = '';
  categoriaSeleccionada = 'Todo';
  cancionSeleccionada: Cancion | null = null;

  reproduciendo = false;
  progreso = 0;
  duracionPrueba = 30;
  volumen = 0.3;

  private contextoAudio: AudioContext | null = null;
  private oscilador: OscillatorNode | null = null;
  private controlVolumen: GainNode | null = null;
  private temporizador: ReturnType<typeof setInterval> | null = null;
  private instanteInicio = 0;
  private progresoInicial = 0;

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

  seleccionarCancion(titulo: string): void {
    const cancion = this.canciones.find(
      elemento => elemento.titulo === titulo
    );

    if (!cancion) {
      return;
    }

    this.detenerTemporizador();
    this.detenerTono();

    this.cancionSeleccionada = cancion;
    this.progreso = 0;
    this.progresoInicial = 0;
    this.reproduciendo = false;

    void this.reproducir();
  }

  async reproducir(): Promise<void> {
    if (!this.cancionSeleccionada && this.canciones.length > 0) {
      this.cancionSeleccionada = this.canciones[0];
    }

    if (!this.cancionSeleccionada) {
      return;
    }

    if (this.progreso >= this.duracionPrueba) {
      this.progreso = 0;
    }

    try {
      if (!this.contextoAudio) {
        this.contextoAudio = new AudioContext();
      }

      if (this.contextoAudio.state === 'suspended') {
        await this.contextoAudio.resume();
      }

      this.iniciarTono();

      this.reproduciendo = true;
      this.progresoInicial = this.progreso;
      this.instanteInicio = Date.now();

      this.iniciarTemporizador();
    } catch (error) {
      console.error('No se pudo iniciar el audio:', error);
      this.reproduciendo = false;
    }
  }

  pausar(): void {
    if (this.reproduciendo) {
      this.actualizarProgreso();
    }

    this.reproduciendo = false;
    this.detenerTono();
    this.detenerTemporizador();
  }

  alternarReproduccion(): void {
    if (this.reproduciendo) {
      this.pausar();
    } else {
      void this.reproducir();
    }
  }

  siguienteCancion(): void {
    if (this.canciones.length === 0) {
      return;
    }

    const indiceActual = this.cancionSeleccionada
      ? this.canciones.findIndex(
          cancion => cancion.id === this.cancionSeleccionada?.id
        )
      : -1;

    const siguienteIndice = (indiceActual + 1) % this.canciones.length;

    this.seleccionarCancion(this.canciones[siguienteIndice].titulo);
  }

  cambiarVolumen(nuevoVolumen: number): void {
    this.volumen = nuevoVolumen;

    if (this.controlVolumen && this.contextoAudio) {
      this.controlVolumen.gain.setTargetAtTime(
        this.volumen,
        this.contextoAudio.currentTime,
        0.02
      );
    }
  }

  cambiarProgreso(nuevoProgreso: number): void {
    this.progreso = Math.max(
      0,
      Math.min(nuevoProgreso, this.duracionPrueba)
    );

    if (this.reproduciendo) {
      this.progresoInicial = this.progreso;
      this.instanteInicio = Date.now();
      this.iniciarTono();
    }
  }

  obtenerTiempo(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = Math.floor(segundos % 60);

    return `${minutos}:${segundosRestantes.toString().padStart(2, '0')}`;
  }


private actualizarProgreso(): void {
  if (!this.reproduciendo) {
    return;
  }

  const segundosTranscurridos =
    (Date.now() - this.instanteInicio) / 1000;

  this.progreso = Math.min(
    this.progresoInicial + segundosTranscurridos,
    this.duracionPrueba
  );
}





private iniciarTemporizador(): void {
  this.detenerTemporizador();

  this.temporizador = setInterval(() => {
    if (!this.reproduciendo) {
      return;
    }

    const segundosTranscurridos =
      (Date.now() - this.instanteInicio) / 1000;

    this.progreso = Math.min(
      this.progresoInicial + segundosTranscurridos,
      this.duracionPrueba
    );

    this.detectorCambios.detectChanges();

    if (this.progreso >= this.duracionPrueba) {
      this.progreso = this.duracionPrueba;
      this.pausar();
      this.detectorCambios.detectChanges();
    }
  }, 100);
}





  private detenerTemporizador(): void {
    if (this.temporizador !== null) {
      clearInterval(this.temporizador);
      this.temporizador = null;
    }
  }

  private iniciarTono(): void {
    this.detenerTono();

    if (!this.contextoAudio) {
      return;
    }

    const oscilador = this.contextoAudio.createOscillator();
    const controlVolumen = this.contextoAudio.createGain();

    const frecuencias: Record<number, number> = {
      1: 440,
      2: 523.25,
      3: 392,
      4: 659.25
    };

    const frecuencia =
      frecuencias[this.cancionSeleccionada?.id ?? 1] ?? 440;

    oscilador.type = 'sine';
    oscilador.frequency.value = frecuencia;
    controlVolumen.gain.value = this.volumen;

    oscilador.connect(controlVolumen);
    controlVolumen.connect(this.contextoAudio.destination);
    oscilador.start();

    this.oscilador = oscilador;
    this.controlVolumen = controlVolumen;
  }

  private detenerTono(): void {
    if (this.oscilador) {
      try {
        this.oscilador.stop();
      } catch {
        // El oscilador ya estaba detenido.
      }

      this.oscilador.disconnect();
      this.oscilador = null;
    }

    if (this.controlVolumen) {
      this.controlVolumen.disconnect();
      this.controlVolumen = null;
    }
  }

  ngOnDestroy(): void {
    this.pausar();

    if (this.contextoAudio) {
      void this.contextoAudio.close();
      this.contextoAudio = null;
    }
  }
}
