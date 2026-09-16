# Estación Abismo

Taller práctico — **Medios, Animación y Audio Espacial en Three.js**
Asignatura: Programación de Entornos Multimedia · Semana 3

## Concepto

Un módulo de transmisión oceánica reposa en el fondo del mar, a 4200 m de
profundidad. Su ojo de buey retransmite en video una señal recuperada de la
superficie, mientras un sonar posicional emite pulsos que se escuchan con
mayor o menor intensidad según la distancia del observador. Alrededor del
módulo, corales bioluminiscentes, algas y burbujas se mueven con la
corriente marina.

## Requisitos cubiertos

- **Entorno 3D completo**: módulo principal + corales, rocas, algas y
  burbujas (más de 3 elementos adicionales).
- **Animación a 60 FPS**: cabeceo y giro del módulo, parpadeo de la baliza,
  rotación/respiración de los corales, balanceo de las algas y ascenso
  continuo de burbujas, todo en el bucle `requestAnimationFrame`.
- **Interacción de usuario**: botón en pantalla y tecla `Espacio` para
  iniciar/pausar el video y el audio (evita la restricción de autoplay).
- **Audio espacial funcional**: `THREE.PositionalAudio` anclado al módulo;
  al orbitar/alejar la cámara con el mouse (OrbitControls) el volumen del
  sonar sube o baja según la distancia.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre la URL que indica Vite (por defecto `http://localhost:5173`).

## Estructura

```
estacion-abismo/
├── index.html          # UI overlay + punto de montaje
├── src/
│   ├── main.js          # escena, animación, video, audio espacial
│   └── style.css        # estilos del overlay
├── public/assets/
│   ├── video.mp4         # textura de video del ojo de buey (placeholder)
│   └── audio.mp3         # sonar posicional (placeholder)
└── vite.config.js
```

> Los archivos `video.mp4` y `audio.mp3` incluidos son *placeholders*
> generados proceduralmente para que el proyecto corra de inmediato.
> Puedes reemplazarlos por tus propios clips en `public/assets/` sin tocar
> el código (mismos nombres de archivo).

## Autor

Danilo Montezuma
