# Changelog - Space Horde Survivor

Todas las modificaciones notables de este proyecto serán documentadas en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere al [Versionado Semántico](https://semver.org/lang/es/).

## [Sin Publicar]

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

**Rama Git:** `feature/phase-0-setup`  
**Arquitectura:** Modular, escalable, optimizada para Canvas2D  
**Próxima Fase:** Implementación del Comandante y sistema de movimiento inercial

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