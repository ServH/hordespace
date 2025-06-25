# Fase 5.3: IA de Combate para AllyShip y Disparos

## Resumen de la Implementación

Esta sub-fase implementa la capacidad de combate completa para las naves aliadas (`AllyShip`), incluyendo detección de enemigos, rotación para apuntar y disparo automático de proyectiles. También incluye la **corrección crítica** del bug del `ObjectPool` que impedía el funcionamiento correcto del sistema de disparos.

## Cambios Implementados

### 1. Actualización de `config.js`

**Nuevas Constantes de Combate:**
```javascript
// === CONFIGURACIÓN DE COMBATE PARA NAVES ALIADAS ===
ALLY_DEFAULT_DAMAGE: 18,                 // Daño por proyectil
ALLY_DEFAULT_FIRE_RATE: 0.7,             // Segundos entre disparos
ALLY_DEFAULT_AI_TARGETING_RANGE: 500,    // Rango de detección de enemigos en píxeles
ALLY_DEFAULT_ROTATION_SPEED_COMBAT: 0.12, // Factor de suavizado para rotación de combate
```

**Propósito:** Centralizar la configuración de combate para facilitar el balanceo del juego.

### 2. Modificaciones en `AllyShip.js`

#### 2.1. Inicialización de Propiedades de Combate

**Constructor Actualizado:**
- `this.aiTargetingRange`: Inicializado desde `CONFIG.ALLY_DEFAULT_AI_TARGETING_RANGE`
- `this.fireRate`: Inicializado desde `CONFIG.ALLY_DEFAULT_FIRE_RATE`
- `this.damage`: Inicializado desde `CONFIG.ALLY_DEFAULT_DAMAGE`
- `this.targetEnemy`: Nueva propiedad para almacenar el enemigo objetivo actual
- `this.fireCooldown`: Controla la cadencia de disparo

#### 2.2. Lógica de IA de Combate en `update()`

**Secuencia de Combate:**
1. **Búsqueda de Objetivo:** Llama a `findTargetEnemy()` cada frame
2. **Rotación hacia Objetivo:** Interpola suavemente hacia el ángulo del enemigo
3. **Disparo Automático:** Dispara cuando el `fireCooldown` permite
4. **Gestión de Cooldown:** Reduce el `fireCooldown` cada frame

**Integración con Sistema de Formación:**
- Mantiene el comportamiento de formación cuando no hay enemigos
- Prioriza el combate sobre la sincronización de rotación cuando detecta enemigos
- Compatible con ambos modos: `FORMATION_ROTATION_SYNC` activado y desactivado

#### 2.3. Nuevo Método `findTargetEnemy()`

**Algoritmo de Targeting:**
```javascript
findTargetEnemy() {
    let closestEnemy = null;
    let minDistance = this.aiTargetingRange + 1;
    
    for (const enemy of this.game.enemies) {
        if (enemy && enemy.isAlive) {
            const distance = calculateDistance(this.position, enemy.position);
            if (distance < minDistance && distance <= this.aiTargetingRange) {
                closestEnemy = enemy;
                minDistance = distance;
            }
        }
    }
    
    return closestEnemy;
}
```

**Características:**
- Busca el enemigo **más cercano** dentro del rango de targeting
- Solo considera enemigos vivos (`isAlive`)
- Retorna `null` si no hay objetivos válidos
- Eficiente: O(n) donde n es el número de enemigos activos

#### 2.4. Nuevo Método `fire()`

**🔥 CORRECCIÓN CRÍTICA DEL BUG:**
```javascript
// ❌ INCORRECTO (causaba error):
// const projectile = this.projectilePool.getObject();

// ✅ CORRECTO:
const projectile = this.projectilePool.get();
```

**Funcionalidad del Disparo:**
- Verifica disponibilidad del `projectilePool`
- Obtiene proyectil del pool usando el método correcto `get()`
- Calcula posición de disparo desde la punta de la nave
- Activa el proyectil con parámetros correctos
- Marca proyectiles como tipo `'player'` para colisiones correctas

#### 2.5. Debug Mejorado

**Nueva Información de Debug:**
- `targetEnemy`: Muestra tipo, HP y distancia del enemigo objetivo
- `fireCooldown`: Tiempo restante hasta poder disparar
- `canFire`: Booleano indicando si puede disparar actualmente

## Comportamiento del Sistema

### Flujo de Combate

1. **Detección:** Cada frame, la nave busca enemigos en un radio de 500px
2. **Priorización:** Selecciona el enemigo más cercano como objetivo
3. **Apuntado:** Rota suavemente hacia el objetivo usando interpolación
4. **Disparo:** Dispara cada 0.7 segundos mientras el objetivo esté en rango
5. **Seguimiento:** Mantiene el objetivo hasta que muera o salga del rango

### Integración con Formación

- **Sin Enemigos:** Mantiene comportamiento de formación normal
- **Con Enemigos:** Prioriza combate, pero mantiene movimiento de formación
- **Rotación Híbrida:** Combina rotación de formación con rotación de combate

### Rendimiento

- **Búsqueda Eficiente:** Algoritmo O(n) para targeting
- **Object Pooling:** Reutiliza proyectiles para evitar allocations
- **Cooldowns Optimizados:** Evita cálculos innecesarios de disparo

## Validación y Testing

### Criterios de Éxito

1. **✅ Detección de Enemigos:** Las naves aliadas detectan enemigos en rango
2. **✅ Rotación Correcta:** Apuntan hacia enemigos detectados
3. **✅ Disparo Funcional:** Proyectiles se crean y vuelan correctamente
4. **✅ Sin Errores de Pool:** No hay errores `getObject is not a function`
5. **✅ Daño Efectivo:** Los proyectiles causan daño a enemigos
6. **✅ Formación Mantenida:** El comportamiento de formación se preserva

### Logs de Debug Esperados

```
🛸 defaultAlly Debug: {
  targetEnemy: "EnemyShip HP:40/40 Dist:245.3",
  fireCooldown: "0.45",
  canFire: false,
  rotationSync: "ON"
}
```

## Próximos Pasos

Con la Fase 5.3 completada, el sistema base de combate para naves aliadas está funcional. Los próximos desarrollos incluirán:

- **Fase 5.4:** Subclases especializadas de `AllyShip` (Scout, Gunship, etc.)
- **Fase 6:** Sistema de Power-ups para adquisición de naves
- **Fase 7:** Habilidades especiales del Comandante

## Notas Técnicas

### Bug Crítico Resuelto

El error `this.projectilePool.getObject is not a function` se debía a:
- **Causa:** Uso incorrecto del método del `ObjectPool`
- **Solución:** Cambiar `getObject()` por `get()`
- **Impacto:** Permite el funcionamiento completo del sistema de disparos

### Configuración Recomendada

Para testing óptimo:
```javascript
CONFIG.DEBUG_FLEET_INFO = true;  // Habilitar logs detallados
CONFIG.FORMATION_ROTATION_SYNC = true;  // Mejor visual para testing inicial
``` 