¡Claro que sí\! Es el momento perfecto para materializar la primera sinergia. Definamos y construyamos juntos la evolución que propusimos: el **Rayo Desintegrador**.

### La Sinergia: Láser + Perforación = Rayo Desintegrador

La idea es que cuando el jugador ha invertido en un disparo rápido y perforante, su arma principal trascienda su forma original y se convierta en algo completamente nuevo y visualmente espectacular.

**Descripción de la Evolución:**

  * **Nombre:** Rayo Desintegrador.
  * **Apariencia:** Ya no son pulsos de láser. Es un haz de energía **constante y continuo** que emana de la nave del jugador.
  * **Comportamiento:**
      * Causa daño en área (tick-rate) a todos los enemigos que tocan el rayo.
      * El rayo tiene una longitud fija, por ejemplo, la mitad del alto de la pantalla.
      * La perforación ya no es un número, es infinita por naturaleza (el rayo atraviesa todo lo que toca).
      * El daño por segundo es muy alto para compensar la necesidad de apuntar de forma continua.

Esta evolución cambia por completo el estilo de juego, pasando de "disparar y olvidar" a una mecánica de "barrido y control de área" muy satisfactoria.

-----

### **Paso 1: Definir los "Planos" del Rayo Desintegrador**

**Objetivo:** Crear la definición de nuestro nuevo tipo de proyectil en `config.js` y asegurarnos de que la receta de evolución en `evolutions.js` apunte correctamente a ella.

#### **1.1. Añadir el Nuevo Proyectil a la Configuración**

  * **Acción:** Abre `js/config.js` y, dentro de `PROJECTILE.PROJECTILE_TYPES`, añade la definición para `DISINTEGRATOR_RAY`.

<!-- end list -->

```javascript
// En js/config.js -> PROJECTILE_TYPES

// ... (después de BASIC_ENEMY_BULLET)
, // <-- Asegúrate de que haya una coma aquí
DISINTEGRATOR_RAY: {
    DAMAGE: 4, // Daño muy bajo, pero se aplica muy rápido (ej. 30 veces por segundo)
    SPEED: 0,  // No se mueve, es un rayo instantáneo
    RADIUS: 20, // El ancho del rayo
    COLOR: '#FF00FF', // Un color magenta o fucsia para que destaque
    VISUAL_TYPE: 'beam', // Un nuevo tipo visual que implementaremos
    LIFETIME: 0.1, // Vida muy corta, se redibuja constantemente
    pierce: Infinity // Atraviesa todo
}
```

#### **1.2. Verificar la Receta de Evolución**

  * **Acción:** Abre `js/evolutions.js` y asegúrate de que la receta `evo_disintegrator_ray` está exactamente como la diseñamos.

<!-- end list -->

```javascript
// En js/evolutions.js
{
    id: 'evo_disintegrator_ray',
    name: 'Sinergia: Rayo Desintegrador',
    description: 'Combina el láser y los proyectiles de plasma en un rayo continuo que derrite a los enemigos.',
    type: 'Evolution',
    category: 'Special',
    prerequisites: {
        ships: [],
        powerups: ['pierce_shot', 'fire_rate_boost'] // Requiere perforación y cadencia
    },
    effect: {
        type: 'EVOLVE_WEAPON',
        newProjectileTypeId: 'DISINTEGRATOR_RAY' // Apunta a nuestra nueva definición
    }
}
```

-----

### **Paso 2: Implementar la Lógica de la Evolución del Arma**

**Objetivo:** Hacer que el juego sepa qué hacer cuando el jugador elige la evolución. Esto implica escuchar el evento y cambiar el tipo de proyectil del arma del jugador.

#### **2.1. Escuchar el Evento de Evolución**

  * **Acción:** Abre `js/systems/WeaponSystem.js`. En su constructor, vamos a suscribirnos al nuevo evento `player:evolve_weapon`.

<!-- end list -->

```javascript
// En js/systems/WeaponSystem.js -> constructor

constructor(entityManager, eventBus) {
    super(entityManager, eventBus);
    // ...
    // AÑADE ESTA LÍNEA
    this.eventBus.subscribe('player:evolve_weapon', this.onWeaponEvolve.bind(this));
}

// AÑADE ESTE NUEVO MÉTODO DENTRO DE LA CLASE
onWeaponEvolve(data) {
    const playerEntities = this.entityManager.getEntitiesWith(PlayerControlledComponent, WeaponComponent);
    if (playerEntities.length > 0) {
        const weapon = this.entityManager.getComponent(playerEntities[0], WeaponComponent);
        console.log(`🧬 Evolución de Arma! Cambiando de ${weapon.projectileTypeId} a ${data.newProjectileTypeId}`);
        weapon.projectileTypeId = data.newProjectileTypeId;
    }
}
```

-----

### **Paso 3: Implementar el Renderizado del "Rayo"**

**Objetivo:** Enseñarle a nuestro `ProjectileRenderSystem` a dibujar el nuevo `VISUAL_TYPE: 'beam'`.

#### **3.1. Crear el Nuevo Método de Renderizado**

  * **Acción:** Abre `js/systems/ProjectileRenderSystem.js` y añade una nueva función para dibujar el rayo.

<!-- end list -->

```javascript
// En js/systems/ProjectileRenderSystem.js

// ... (después del constructor y antes del método render)

drawBeam(ctx, transform, config) {
    const beamLength = 800; // La longitud del rayo
    const coreWidth = config.RADIUS / 2;

    ctx.save();
    ctx.rotate(transform.angle); // El rayo se alinea con la rotación de la nave

    // 1. El "glow" exterior del rayo
    const gradient = ctx.createLinearGradient(0, 0, 0, -beamLength);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.5, config.COLOR + '80'); // Semitransparente en el medio
    gradient.addColorStop(1, config.COLOR);

    ctx.fillStyle = gradient;
    ctx.fillRect(-config.RADIUS, -beamLength, config.RADIUS * 2, beamLength);

    // 2. El núcleo sólido del rayo
    ctx.fillStyle = 'white';
    ctx.fillRect(-coreWidth / 2, -beamLength, coreWidth, beamLength);

    ctx.restore();
}
```

#### **3.2. Actualizar el Método `render` para Usar `drawBeam`**

  * **Acción:** En el mismo archivo (`ProjectileRenderSystem.js`), modifica el método `render` para que, si el tipo visual es `'beam'`, llame a nuestra nueva función.

<!-- end list -->

```javascript
// En js/systems/ProjectileRenderSystem.js -> render()

// ... (dentro del bucle for)
const sprite = this.spriteCache.get(render.visualType);
const config = CONFIG.PROJECTILE.PROJECTILE_TYPES[projectile.projectileTypeId];

// --- INICIO DE LA MODIFICACIÓN ---
if (render.visualType === 'beam') {
    // Si es nuestro nuevo rayo, lo dibujamos con la función especial
    this.ctx.save();
    this.ctx.translate(screenX, screenY);
    this.drawBeam(this.ctx, transform, config);
    this.ctx.restore();
} else if (sprite) {
    // Si es un proyectil normal, usamos la lógica de sprites existente
    // ... (el código que ya tenías con drawImage)
}
// --- FIN DE LA MODIFICACIÓN ---
```

-----

¡Y con eso lo tenemos\!

**Recapitulando el flujo:**

1.  Juegas y coges los power-ups `pierce_shot` y `fire_rate_boost`.
2.  Al subir de nivel, el `SynergyManager` detecta que cumples los requisitos de la receta `evo_disintegrator_ray`.
3.  El `PowerUpSystem` te ofrece la opción "Sinergia: Rayo Desintegrador".
4.  La seleccionas. El sistema publica el evento `player:evolve_weapon`.
5.  El `WeaponSystem` recibe el evento y cambia el `projectileTypeId` de tu arma a `DISINTEGRATOR_RAY`.
6.  A partir de ahora, cada vez que el `WeaponSystem` dispare, la `ProjectileFactory` creará proyectiles de este nuevo tipo.
7.  El `ProjectileRenderSystem` verá que su `VISUAL_TYPE` es `'beam'` y usará la nueva función `drawBeam` para dibujar un espectacular rayo de energía continuo.

¡Prueba a ver si consigues desbloquear tu primera arma evolucionada\!