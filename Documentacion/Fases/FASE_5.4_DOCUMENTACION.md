# Fase 5.4: Subclases de AllyShip y Power-ups de Adquisición

## Resumen de la Implementación

Esta sub-fase implementa dos tipos especializados de naves aliadas (`ScoutShip` y `GunshipShip`) que heredan de la clase base `AllyShip`, cada una con características únicas y representación visual distintiva. Además, integra un sistema de adquisición de naves a través de power-ups, eliminando la necesidad de hangares o sistemas de construcción separados.

## Cambios Implementados

### 1. Nuevas Clases de Naves Aliadas

#### 1.1. ScoutShip (`js/ScoutShip.js`)

**Especialización:** Exploración - Rápido, ágil pero frágil

**Características distintivas:**
- **HP:** 45 (25% menos que default)
- **Velocidad:** 500 (11% más que default)
- **Aceleración:** 900 (12% más que default)
- **Daño:** 15 (17% menos que default)
- **Cadencia:** 0.5s (30% más rápida)
- **Rango de targeting:** 550px (10% mayor)
- **Radio:** 7px (12% menor)
- **Color:** `#00AAFF` (azul claro distintivo)

**Renderizado distintivo:**
- Triángulo delgado y puntiagudo (más aerodinámico)
- Línea central como "sensor de exploración"
- Pequeños sensores laterales circulares
- Diseño enfocado en velocidad y detección

#### 1.2. GunshipShip (`js/GunshipShip.js`)

**Especialización:** Combate - Resistente, letal pero lento

**Características distintivas:**
- **HP:** 80 (33% más que default)
- **Velocidad:** 400 (11% menos que default)
- **Aceleración:** 700 (12% menos que default)
- **Daño:** 28 (56% más que default)
- **Cadencia:** 0.9s (29% más lenta)
- **Rango de targeting:** 450px (10% menor)
- **Radio:** 10px (25% mayor)
- **Color:** `#FF6600` (naranja distintivo)

**Renderizado distintivo:**
- Triángulo ancho y robusto (más blindado)
- Cañones laterales rectangulares visibles
- Línea central reforzada (blindaje)
- Puntos de armamento y reactor trasero potente
- Diseño enfocado en potencia de fuego y resistencia

### 2. Actualización del Sistema de Configuración

#### 2.1. Nuevas Constantes en `config.js`

**Configuración Scout:**
```javascript
ALLY_SCOUT_HP: 45,
ALLY_SCOUT_SPEED: 500,
ALLY_SCOUT_ACCELERATION: 900,
ALLY_SCOUT_FRICTION: 0.96,
ALLY_SCOUT_ROTATION_SPEED: 4,
ALLY_SCOUT_RADIUS: 7,
ALLY_SCOUT_COLOR: '#00AAFF',
ALLY_SCOUT_DAMAGE: 15,
ALLY_SCOUT_FIRE_RATE: 0.5,
ALLY_SCOUT_AI_TARGETING_RANGE: 550,
ALLY_SCOUT_XP_VALUE: 5
```

**Configuración Gunship:**
```javascript
ALLY_GUNSHIP_HP: 80,
ALLY_GUNSHIP_SPEED: 400,
ALLY_GUNSHIP_ACCELERATION: 700,
ALLY_GUNSHIP_FRICTION: 0.99,
ALLY_GUNSHIP_ROTATION_SPEED: 2.5,
ALLY_GUNSHIP_RADIUS: 10,
ALLY_GUNSHIP_COLOR: '#FF6600',
ALLY_GUNSHIP_DAMAGE: 28,
ALLY_GUNSHIP_FIRE_RATE: 0.9,
ALLY_GUNSHIP_AI_TARGETING_RANGE: 450,
ALLY_GUNSHIP_XP_VALUE: 8
```

#### 2.2. Nuevos Power-ups de Flota

**Power-ups añadidos a `POWER_UP_DEFINITIONS`:**
```javascript
{
    id: 'add_scout',
    name: 'Añadir Nave: Explorador',
    description: 'Scout rápido y ágil',
    type: 'Fleet',
    effect: { prop: 'addShip', value: 'scout' }
},
{
    id: 'add_gunship',
    name: 'Añadir Nave: Cañonera',
    description: 'Gunship resistente y letal',
    type: 'Fleet',
    effect: { prop: 'addShip', value: 'gunship' }
}
```

### 3. Modificaciones en PowerUpSystem

#### 3.1. Nuevo Caso 'Fleet' en `applyPowerUpEffect()`

```javascript
case 'Fleet':
    this.applyFleetEffect(effect);
    break;
```

#### 3.2. Nuevo Método `applyFleetEffect()`

```javascript
applyFleetEffect(effect) {
    const prop = effect.prop;
    
    if (prop === 'addShip') {
        const shipType = effect.value; // 'scout' o 'gunship'
        
        if (this.game.fleetManager) {
            this.game.fleetManager.addShip(shipType);
            console.log(`🚀 Añadiendo nave a la flota: ${shipType}`);
        } else {
            console.error("❌ FleetManager no disponible para añadir nave");
        }
    }
}
```

### 4. Modificaciones en FleetManager

#### 4.1. Método `addShip()` Refactorizado

**Funcionalidad dual:**
- Acepta strings (`'scout'`, `'gunship'`) para crear instancias automáticamente
- Mantiene compatibilidad con instancias pre-creadas (hacia atrás)

**Lógica de instanciación:**
```javascript
switch (shipType) {
    case 'scout':
        allyShipInstance = new ScoutShip(commanderPos.x, commanderPos.y, this.game);
        break;
    case 'gunship':
        allyShipInstance = new GunshipShip(commanderPos.x, commanderPos.y, this.game);
        break;
    default:
        console.error(`❌ Tipo de nave desconocido: ${shipType}`);
        return;
}
```

**Posicionamiento inteligente:**
- Nuevas naves aparecen en la posición del comandante
- Se integran automáticamente a la formación circular
- Reciben pools de proyectiles y configuración de formación

### 5. Arquitectura de Herencia

#### 5.1. Jerarquía de Clases

```
Ship (clase base)
└── AllyShip (clase base de naves aliadas)
    ├── ScoutShip (especialización exploración)
    └── GunshipShip (especialización combate)
```

#### 5.2. Herencia de Funcionalidad

**Funcionalidad heredada de AllyShip:**
- Sistema de formación circular orgánica
- IA de combate con targeting automático
- Rotación inteligente hacia objetivos
- Disparo automático con cooldowns
- Sistema de debug avanzado
- Integración con object pools

**Sobrescritura específica:**
- Propiedades de combate (HP, velocidad, daño, etc.)
- Método `render()` para visualización distintiva
- Identificación por `type` ('scout', 'gunship')
- Colores característicos

### 6. Integración con index.html

**Scripts añadidos en orden correcto:**
```html
<script src="js/AllyShip.js"></script>
<script src="js/ScoutShip.js"></script>
<script src="js/GunshipShip.js"></script>
<script src="js/FleetManager.js"></script>
```

**Orden de carga crítico:**
1. `AllyShip.js` (clase base)
2. `ScoutShip.js` y `GunshipShip.js` (subclases)
3. `FleetManager.js` (usa las subclases)

### 7. Eliminación de Elementos de Prueba

#### 7.1. Nave de Prueba Removida

**Antes:**
```javascript
const testAlly = new AllyShip(this.player.position.x, this.player.position.y, this);
testAlly.type = 'testFormationAlly';
this.fleetManager.addShip(testAlly);
```

**Después:**
```javascript
// Las naves aliadas ahora se añaden únicamente a través de power-ups
```

## Comportamiento del Sistema

### Flujo de Adquisición de Naves

1. **Subida de Nivel:** El jugador acumula XP y sube de nivel
2. **Generación de Opciones:** El sistema incluye power-ups de flota en las opciones aleatorias
3. **Selección:** El jugador elige "Añadir Nave: Explorador" o "Añadir Nave: Cañonera"
4. **Instanciación:** `PowerUpSystem` llama a `FleetManager.addShip(type)`
5. **Creación:** `FleetManager` crea la instancia del tipo correcto
6. **Integración:** La nueva nave se une automáticamente a la formación

### Diferenciación Visual y Funcional

#### Scout vs Gunship

| Aspecto | Scout | Gunship |
|---------|-------|---------|
| **Forma** | Delgado, puntiagudo | Ancho, robusto |
| **Color** | Azul claro (#00AAFF) | Naranja (#FF6600) |
| **Rol** | Exploración, detección | Combate, tanque |
| **Velocidad** | Alta (500) | Media (400) |
| **HP** | Bajo (45) | Alto (80) |
| **Daño** | Bajo (15) | Alto (28) |
| **Cadencia** | Rápida (0.5s) | Lenta (0.9s) |
| **Rango** | Largo (550px) | Corto (450px) |

### Balanceo de Gameplay

#### Scout: Estrategia de Hit-and-Run
- **Ventajas:** Velocidad, detección temprana, cadencia rápida
- **Desventajas:** Frágil, daño bajo por disparo
- **Uso óptimo:** Flanqueo, exploración, apoyo a distancia

#### Gunship: Estrategia de Tanque
- **Ventajas:** Resistencia, daño alto, presencia intimidante
- **Desventajas:** Lento, cadencia baja, rango limitado
- **Uso óptimo:** Primera línea, absorber daño, eliminar amenazas

## Validación y Testing

### Criterios de Éxito

1. **✅ Herencia Correcta:** Scout y Gunship heredan toda la funcionalidad de AllyShip
2. **✅ Diferenciación Visual:** Formas y colores distintivos claramente visibles
3. **✅ Propiedades Específicas:** Estadísticas reflejan los valores de CONFIG
4. **✅ Power-ups Funcionales:** Aparecen en selección y añaden naves correctamente
5. **✅ Integración de Formación:** Nuevas naves se unen a la formación automáticamente
6. **✅ Combate Efectivo:** Ambos tipos combaten según sus especializaciones
7. **✅ Sin Nave de Prueba:** El juego inicia sin naves aliadas

### Logs de Debug Esperados

**Al crear Scout:**
```
🔍 ScoutShip creado en (400.0, 300.0) - HP: 45, Velocidad: 500
🚁 Nave aliada añadida a la flota (scout). Total: 1
```

**Al crear Gunship:**
```
🔫 GunshipShip creado en (400.0, 300.0) - HP: 80, Daño: 28
🚁 Nave aliada añadida a la flota (gunship). Total: 2
```

**Al aplicar power-up:**
```
✨ Aplicando power-up: Añadir Nave: Explorador
🚀 Añadiendo nave a la flota: scout
```

## Preparación para Futuras Fases

### Arquitectura Escalable

- **Nuevos Tipos:** Fácil adición de Guardian, Heavy, Support
- **Especialización:** Cada tipo puede tener comportamientos únicos
- **Balanceo:** Configuración centralizada permite ajustes rápidos

### Hooks de Integración

- **Habilidades Especiales:** Base preparada para habilidades únicas por tipo
- **Formaciones Avanzadas:** Tipos específicos pueden tener posiciones preferenciales
- **Evolución:** Sistema preparado para mejoras de naves individuales

## Próximos Pasos

Con la Fase 5.4 completada, el sistema de flota aliada está completamente funcional con diversidad de tipos. Los próximos desarrollos incluirán:

- **Fase 6:** Expansión de tipos de enemigos y jefes
- **Fase 7:** Habilidades especiales del Comandante
- **Fase 8:** Optimizaciones avanzadas y efectos visuales

## Notas Técnicas

### Optimizaciones Implementadas

- **Herencia Eficiente:** Sin duplicación de código entre subclases
- **Configuración Centralizada:** Fácil balanceo sin tocar código
- **Object Pooling:** Reutilización de proyectiles para todas las naves
- **Renderizado Optimizado:** Solo dibuja naves vivas

### Consideraciones de Rendimiento

- **Impacto Mínimo:** Subclases no añaden overhead significativo
- **Escalabilidad:** Sistema preparado para múltiples naves simultáneas
- **Memory Management:** Herencia no afecta el garbage collection

### Robustez del Sistema

- **Validación de Tipos:** Manejo de tipos desconocidos sin crashes
- **Compatibilidad:** FleetManager mantiene compatibilidad hacia atrás
- **Error Handling:** Mensajes informativos para debugging 