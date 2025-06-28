# Documentación Técnica - Fase 0: Estructura Base y Bucle Principal

## Resumen de la Fase

La **Fase 0** establece los cimientos arquitectónicos del proyecto Space Horde Survivor, implementando una estructura modular, un sistema de configuración centralizada y un bucle de juego optimizado siguiendo las mejores prácticas de desarrollo web con Canvas2D.

## Arquitectura Implementada

### 1. Estructura de Directorios

```
HordeSpacial/
├── css/
│   └── style.css          # Estilos base del juego
├── js/
│   ├── config.js          # Configuración centralizada
│   ├── Game.js            # Clase principal del juego
│   └── main.js            # Punto de entrada
├── assets/                # Recursos (preparado para futuras fases)
├── Resources/             # Documentación del proyecto
└── index.html             # Archivo HTML principal
```

### 2. Flujo de Carga y Dependencias

**Orden crítico de carga de scripts:**
1. `config.js` - **DEBE** cargarse primero (configuración global)
2. `Game.js` - Clase principal que depende de CONFIG
3. `main.js` - Punto de entrada que instancia Game

### 3. Componentes Implementados

#### 3.1. Sistema de Configuración (`config.js`)

**Propósito:** Centralizar todas las constantes del juego para facilitar el balanceo y mantenimiento.

**Características clave:**
- Objeto global `CONFIG` accesible desde cualquier script
- Organización por categorías (Comandante, Proyectiles, Enemigos, etc.)
- Nomenclatura `UPPER_SNAKE_CASE` para constantes
- Valores iniciales balanceados para todas las mecánicas futuras

**Categorías implementadas:**
- Dimensiones del Canvas
- Propiedades del Comandante
- Propiedades de Proyectiles y Enemigos
- Tamaños de Object Pools
- Escalado de Dificultad
- Costos de Construcción
- Cooldowns de Habilidades

#### 3.2. Bucle Principal del Juego (`Game.js`)

**Propósito:** Orquestar el bucle principal del juego con rendimiento optimizado y control de estados.

**Características implementadas:**

1. **Bucle con `requestAnimationFrame`:**
   - Sincronización con la velocidad de refresco del monitor
   - Gestión automática de pausa/reanudación
   - Manejo robusto de errores

2. **Sistema `deltaTime`:**
   - Cálculo preciso del tiempo transcurrido entre frames
   - Limitación de deltaTime máximo (30 FPS mínimo)
   - Consistencia de velocidad independiente del hardware

3. **Separación `update()` / `render()`:**
   - `update()`: Lógica del juego únicamente
   - `render()`: Dibujo y visualización únicamente
   - Limpieza obligatoria del canvas con `clearRect()`

4. **Sistema de Estados:**
   - Estados: `PLAYING`, `PAUSED`, `GAME_OVER`, `HANGAR`
   - Control granular de la ejecución del bucle

5. **Información de Debug:**
   - Contador de FPS en tiempo real
   - Visualización del estado actual
   - Mensajes informativos en consola

#### 3.3. Punto de Entrada (`main.js`)

**Propósito:** Inicializar el juego y manejar eventos globales del navegador.

**Funcionalidades implementadas:**

1. **Inicialización Robusta:**
   - Verificación de disponibilidad del canvas
   - Validación de dependencias (CONFIG, Game class)
   - Manejo de errores con mensajes informativos

2. **Gestión de Canvas:**
   - Configuración automática de dimensiones fullscreen
   - Redimensionamiento dinámico en `window.resize`
   - Configuración optimizada del contexto 2D

3. **Manejo de Eventos:**
   - **ESC**: Pausa/reanudación del juego
   - **Window Blur/Focus**: Pausa automática al perder foco
   - **Resize**: Ajuste dinámico de dimensiones
   - **Error Handling**: Captura de errores globales

4. **Prevención de Interferencias:**
   - Deshabilitación del menú contextual en canvas
   - Prevención de comportamientos por defecto de teclas de juego
   - Selección de texto deshabilitada

#### 3.4. Estilos Base (`style.css`)

**Propósito:** Establecer la presentación visual base optimizada para juegos.

**Características:**
- Canvas en pantalla completa sin márgenes
- Fondo negro espacial
- Cursor crosshair para inmersión
- Prevención de selección de texto
- Fuente monoespaciada para UI consistente

## Optimizaciones Implementadas

### 1. Rendimiento del Bucle
- **requestAnimationFrame** para sincronización con VSync
- **deltaTime limitado** para evitar saltos grandes
- **Separación clara** entre lógica y renderizado

### 2. Gestión de Memoria
- **Configuración de Object Pools** preparada para futuras fases
- **Limpieza automática** del canvas en cada frame

### 3. Experiencia de Usuario
- **Pausa automática** al perder foco de ventana
- **Redimensionamiento dinámico** sin pérdida de estado
- **Manejo robusto de errores** sin crashes

## Preparación para Futuras Fases

### Hooks Implementados
- `initGameSystems()` - Placeholder para inicialización de sistemas
- Estructura de `update()` con TODOs organizados
- Estructura de `render()` preparada para capas de renderizado

### Configuración Preparada
- Constantes para todas las mecánicas futuras
- Tamaños de pools pre-configurados
- Valores de balance iniciales

## Validación y Testing

### Criterios de Éxito ✅
1. **Pantalla negra** con canvas fullscreen
2. **Mensajes de consola** confirmando carga correcta
3. **FPS counter** visible y actualizándose
4. **ESC funcional** para pausa/reanudación
5. **Redimensionamiento** sin errores
6. **CONFIG accesible** desde consola del navegador

### Comandos de Validación
```javascript
// En consola del navegador:
console.log(CONFIG);           // Debe mostrar objeto de configuración
console.log(gameInstance);     // Debe mostrar instancia del juego
```

## Próximos Pasos

La **Fase 1** implementará:
- Clase `PlayerShip` (Comandante)
- Movimiento inercial con controles WASD
- Renderizado de la nave del jugador
- Efectos de propulsión básicos

La arquitectura modular establecida en esta fase permite una integración limpia de todas las futuras características del juego.

---

**Fecha de Completado:** Diciembre 2024  
**Rama Git:** `feature/phase-0-setup`  
**Estado:** ✅ Completado y Validado 