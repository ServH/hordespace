# Fase 4: Recolección de Recursos y Power-ups - Documentación Técnica

## Resumen de la Implementación

La Fase 4 introduce las mecánicas centrales de progresión del jugador: la recolección de materiales como recurso principal y el sistema de nivelación con selección estratégica de power-ups. Esta implementación añade la capa roguelike al juego, proporcionando decisiones tácticas y recompensas por la supervivencia.

## Arquitectura de Componentes

### 1. Clase Material (`js/Material.js`)

**Propósito**: Cristales de recursos que dropean los enemigos al ser destruidos.

**Características Técnicas**:
- **Object Pooling**: Optimizada para reutilización eficiente
- **Física Simple**: Impulso inicial con fricción gradual
- **Efectos Visuales**: Rotación, brillo pulsante y gradientes
- **Lifetime Management**: Auto-destrucción después de 30 segundos

**Propiedades Clave**:
```javascript
- active: boolean (estado del pool)
- position: {x, y} (posición actual)
- velocity: {x, y} (velocidad física)
- value: number (cantidad de materiales)
- spinAngle/spinSpeed: efectos de rotación
- glowIntensity: efecto pulsante
```

**Métodos Principales**:
- `activate(x, y, value, initialVelocity)`: Inicializa el material
- `update(deltaTime)`: Física y efectos visuales
- `render(ctx)`: Renderizado con forma de diamante y efectos
- `isInCollectionRange(playerPos, radius)`: Detección de recolección

### 2. Clase PowerUpSystem (`js/PowerUpSystem.js`)

**Propósito**: Sistema completo de experiencia, niveles y power-ups con interfaz de selección.

**Características Técnicas**:
- **Progresión Escalada**: XP requerido aumenta por nivel
- **Generación Aleatoria**: 3 opciones únicas por subida de nivel
- **Aplicación Dinámica**: Modificación en tiempo real de propiedades
- **UI Integrada**: Interfaz completa dibujada en canvas

**Subsistemas**:

#### Sistema de Experiencia
```javascript
- currentXP: XP actual del jugador
- currentLevel: Nivel actual (inicia en 1)
- xpToNextLevel: XP necesario para siguiente nivel
- xpMultiplier: Multiplicador de XP (power-ups especiales)
```

#### Sistema de Power-ups
```javascript
- powerUpOptions: Array de 3 opciones actuales
- isLevelUpPending: Flag de pausa para selección
- selectedOptionIndex: Navegación por teclado
```

**Tipos de Power-ups Implementados**:

1. **Mejoras del Comandante**:
   - Propulsores Mejorados (+15% velocidad)
   - Blindaje Reforzado (+25 HP máximo)
   - Sistema de Disparo Rápido (+25% cadencia)
   - Proyectiles Mejorados (+20% daño)
   - Motores Potenciados (+20% aceleración)
   - Reparación Automática (1 HP/seg regeneración)

2. **Mejoras Especiales**:
   - Imán de Materiales (+50% radio recolección)
   - Analizador Táctico (+25% XP)
   - Extractor Eficiente (+50% materiales)

### 3. Integración en Game.js

**Nuevos Sistemas Añadidos**:
- `materialPool`: Object Pool para materiales
- `powerUpSystem`: Sistema de progresión completo
- `materials`: Contador de recursos del jugador

**Nuevos Estados de Juego**:
- `PAUSED_FOR_LEVEL_UP`: Estado especial para selección de power-ups

**Nuevos Métodos de Actualización**:
- `updateMaterials(deltaTime)`: Actualiza físicas de materiales
- `collectMaterials()`: Recolección automática por proximidad
- `handlePowerUpSelection(index)`: Manejo de selección de power-ups

## Mecánicas de Juego

### 1. Drop de Materiales

**Configuración**:
- Probabilidad: 80% (`CONFIG.MATERIAL_DROP_CHANCE`)
- Valor base: 1 material (`CONFIG.MATERIAL_BASE_VALUE`)
- Valor escalado: `Math.max(1, Math.floor(enemy.xpValue / 10))`

**Proceso**:
1. Enemigo destruido → `onDestroy()` llamado
2. Verificación de probabilidad de drop
3. Obtención de material del pool
4. Activación con velocidad inicial aleatoria
5. Material visible en pantalla con efectos

### 2. Recolección Automática

**Configuración**:
- Radio base: 30 píxeles (`CONFIG.MATERIAL_COLLECTION_RADIUS`)
- Radio modificable por power-ups
- Detección por proximidad cada frame

**Proceso**:
1. Verificación de distancia jugador-material
2. Aplicación de multiplicadores de materiales
3. Incremento del contador global
4. Liberación del material al pool

### 3. Sistema de Experiencia

**Configuración**:
- XP base por enemigo: 10 (`CONFIG.ENEMY_BASE_XP_VALUE`)
- XP base para nivel 2: 100 (`CONFIG.BASE_XP_TO_LEVEL_UP`)
- Incremento por nivel: +50 XP (`CONFIG.XP_INCREASE_PER_LEVEL`)

**Fórmula de Escalado**:
```javascript
xpToNextLevel = BASE_XP_TO_LEVEL_UP + (currentLevel - 1) * XP_INCREASE_PER_LEVEL
```

**Escalado de XP por Enemigos**:
- Enemigos más fuertes (ciclos superiores) otorgan más XP
- XP escalado = `XP_base * cicleScaling`

### 4. Selección de Power-ups

**Interfaz de Usuario**:
- Fondo semi-transparente que pausa el juego
- 3 opciones presentadas verticalmente
- Navegación con W/S o flechas
- Selección con Enter/Espacio o teclas 1/2/3
- Información clara de efectos

**Proceso de Selección**:
1. Subida de nivel → Pausa del juego
2. Generación de 3 opciones aleatorias únicas
3. Presentación de interfaz
4. Espera de selección del jugador
5. Aplicación inmediata del efecto
6. Reanudación del juego

## Actualización del HUD

**Nuevos Elementos Añadidos**:
- **Nivel Actual**: Mostrado prominentemente
- **Progreso XP**: Barra visual con números
- **Contador de Materiales**: Total acumulado
- **Barra de Progreso XP**: Representación visual del progreso

**Posicionamiento**:
- Información de progresión en lado izquierdo
- Barra de XP debajo de los números
- Integración con información existente de oleadas

## Optimizaciones Técnicas

### 1. Object Pooling para Materiales
- Pool size: 50 materiales simultáneos máximo
- Reutilización eficiente sin allocations
- Limpieza automática por lifetime

### 2. Renderizado Eficiente
- Materiales solo se dibujan si están activos
- Efectos visuales calculados por frame
- Gradientes y efectos optimizados

### 3. Detección de Colisiones
- Verificación de proximidad simple (distancia euclidiana)
- Solo para materiales activos
- Integrada en el ciclo principal de colisiones

## Integración con Sistemas Existentes

### 1. EnemyShip.js
**Modificaciones**:
- Añadida propiedad `xpValue` escalada por dificultad
- Método `onDestroy()` para drop de materiales
- Referencia al `materialPool` asignada por EnemyWaveManager

### 2. PlayerShip.js
**Modificaciones**:
- Añadido soporte para `healthRegen` (regeneración de salud)
- Integración en el método `update()` existente

### 3. main.js
**Modificaciones**:
- Manejo prioritario de teclas para power-ups
- Prevención de comportamientos por defecto para Enter/Espacio

## Validación y Testing

### Criterios de Validación Implementados:

1. **✅ Drop de Materiales**:
   - Enemigos dropean cristales dorados al morir
   - Probabilidad del 80% funcional
   - Materiales con impulso inicial realista

2. **✅ Recolección Automática**:
   - Proximidad del jugador recolecta materiales
   - Contador en HUD se actualiza correctamente
   - Materiales desaparecen al ser recolectados

3. **✅ Sistema de XP**:
   - Enemigos destruidos otorgan XP
   - Barra de progreso funcional
   - Subida de nivel automática

4. **✅ Interfaz de Power-ups**:
   - Pausa del juego en subida de nivel
   - 3 opciones aleatorias presentadas
   - Navegación por teclado funcional
   - Selección aplica efectos inmediatamente

5. **✅ Aplicación de Efectos**:
   - Power-ups modifican propiedades del jugador
   - Efectos visibles inmediatamente
   - Regeneración de salud funcional

6. **✅ Integración con HUD**:
   - Información de nivel y XP visible
   - Contador de materiales actualizado
   - Barra de progreso XP funcional

## Configuración y Balanceo

### Valores de Configuración Añadidos:
```javascript
// Materiales
MATERIAL_DROP_CHANCE: 0.8        // 80% probabilidad
MATERIAL_COLLECTION_RADIUS: 30   // 30 píxeles
MATERIAL_BASE_VALUE: 1           // 1 material por cristal

// Sistema XP
ENEMY_BASE_XP_VALUE: 10          // 10 XP por enemigo
BASE_XP_TO_LEVEL_UP: 100         // 100 XP para nivel 2
XP_INCREASE_PER_LEVEL: 50        // +50 XP por nivel

// Pool de materiales
POOL_SIZE_MATERIALS: 50          // 50 materiales máximo
```

### Balanceo de Power-ups:
- Efectos multiplicativos moderados (15-25%)
- Efectos aditivos significativos pero no excesivos
- Progresión gradual que mantiene el desafío

## Próximos Pasos (Fase 5)

La implementación de la Fase 4 establece las bases para:
- **Sistema de Hangar**: Uso de materiales para construcción
- **Flota Aliada**: Naves que se pueden construir y gestionar
- **Mejoras de Flota**: Power-ups que afecten a toda la flota
- **Habilidades del Comandante**: Sistema de cooldowns y efectos especiales

La arquitectura modular implementada permite la expansión natural hacia estos sistemas más complejos manteniendo el rendimiento y la claridad del código. 