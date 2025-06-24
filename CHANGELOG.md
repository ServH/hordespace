# Changelog - Space Horde Survivor

Todas las modificaciones notables de este proyecto serán documentadas en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere al [Versionado Semántico](https://semver.org/lang/es/).

## [Sin Publicar]

## [0.2.0] - 2024-12-24 - Fase 1: Comandante - Movimiento y Dibujo

### Añadido
- **Clase base Ship** con sistema de física completo y herencia modular
- **Clase PlayerShip (Comandante)** con movimiento inercial "space drift"
- **Sistema de controles WASD/Flechas** con entrada continua y responsiva
- **Renderizado avanzado** del comandante como triángulo verde con detalles
- **Efectos de propulsión dinámicos** con gradientes y partículas procedurales
- **Sistema de entrada robusto** con manejo separado de keydown/keyup
- **HUD informativo** con HP, velocidad y ayuda de controles
- **Debug info completa** con posición, velocidad, ángulo y propulsión
- **Barra de vida condicional** que aparece solo cuando está dañado
- **Manejo de límites de pantalla** con rebote suave

### Técnico
- **Herencia modular:** Ship → PlayerShip preparada para futuras clases
- **Física realista:** Integración de Euler con fricción exponencial
- **Renderizado por capas:** Propulsión → Nave → Detalles → HUD
- **Sistema de fuerzas:** Propulsión direccional y rotación independiente
- **Colisiones circulares:** Detección eficiente preparada para combate
- **Configuración centralizada:** Uso completo de CONFIG para balance

### Optimizaciones
- **Física optimizada** con cálculos eficientes y deltaTime
- **Renderizado condicional** de efectos basado en estado
- **Normalización automática** de ángulos y velocidades
- **Manejo de memoria** sin leaks en efectos visuales

### Controles
- **W/↑:** Propulsión hacia adelante (100% potencia)
- **S/↓:** Propulsión hacia atrás (50% potencia)  
- **A/←:** Rotación antihoraria
- **D/→:** Rotación horaria
- **ESC:** Pausar/Reanudar (sin afectar estado de movimiento)

### Validación
- ✅ Movimiento inercial suave y realista
- ✅ Efectos visuales dinámicos y atractivos
- ✅ Controles responsivos sin latencia
- ✅ HUD informativo y legible
- ✅ Debug info en tiempo real
- ✅ Rebote suave en límites de pantalla
- ✅ Rendimiento estable a 60 FPS

## [0.1.0] - 2024-12-24 - Fase 0: Fundamentos del Proyecto

### Añadido
- **Estructura de proyecto modular** con directorios organizados (`css/`, `js/`, `assets/`)
- **Sistema de configuración centralizada** (`config.js`) con todas las constantes del juego
- **Bucle principal del juego** con `requestAnimationFrame` y control de `deltaTime`
- **Clase Game principal** para orquestar la lógica y renderizado
- **Sistema de estados del juego** (PLAYING, PAUSED, GAME_OVER, HANGAR)
- **Manejo robusto de eventos** (teclado, redimensionamiento, foco de ventana)
- **Contador de FPS** en tiempo real para debugging
- **Sistema de pausa/reanudación** con tecla ESC
- **Canvas fullscreen** con redimensionamiento dinámico
- **Configuración optimizada** del contexto Canvas2D
- **Manejo de errores globales** con pausa automática de seguridad

### Técnico
- **Orden de carga de scripts** optimizado (config.js → Game.js → main.js)
- **Separación clara** entre lógica (`update()`) y renderizado (`render()`)
- **Arquitectura preparada** para Object Pooling en futuras fases
- **Configuración pre-definida** para todas las mecánicas del juego
- **Documentación técnica completa** de la arquitectura implementada

### Optimizaciones
- **deltaTime limitado** para consistencia de rendimiento (mínimo 30 FPS)
- **Limpieza automática** del canvas en cada frame
- **Pausa automática** al perder foco de ventana
- **Prevención de interferencias** del navegador (menú contextual, selección de texto)

### Preparación Futura
- **Hooks implementados** para inicialización de sistemas
- **Estructura de renderizado** preparada para capas múltiples
- **Configuración completa** para naves, proyectiles, enemigos y habilidades
- **Tamaños de Object Pools** pre-configurados

### Validación
- ✅ Canvas negro fullscreen funcional
- ✅ Bucle del juego ejecutándose correctamente
- ✅ FPS counter visible y actualizándose
- ✅ Pausa/reanudación con ESC funcional
- ✅ Redimensionamiento sin errores
- ✅ CONFIG accesible globalmente
- ✅ Mensajes de consola informativos

---

### Notas de Desarrollo

**Rama Git:** `feature/phase-1-commander`  
**Arquitectura:** Sistema de herencia Ship/PlayerShip implementado  
**Líneas de Código:** +677 líneas (5 archivos modificados, 2 nuevos)  
**Próxima Fase:** Enemigos básicos, proyectiles y sistema de combate

---

## Formato de Entradas

### [Versión] - Fecha - Descripción de la Fase

#### Añadido
- Nuevas características

#### Cambiado
- Cambios en funcionalidades existentes

#### Obsoleto
- Características que serán removidas próximamente

#### Removido
- Características removidas

#### Corregido
- Corrección de bugs

#### Seguridad
- Vulnerabilidades corregidas 