
### **Manual de Expansión de Armas y Sinergias**

Este documento te servirá como una "receta de cocina" para implementar nuevas ideas de armamento en tu juego.

-----

### **Parte 1: Cómo Añadir una Nueva Arma Base (como Power-Up)**

Este proceso es para cuando quieres introducir un tipo de arma completamente nuevo que el jugador puede obtener durante la partida, como hicimos con el "Cañón de Iones".

**Concepto Clave:** Un "arma nueva" no es más que un nuevo tipo de proyectil (`projectileTypeId`) que se asigna al `WeaponComponent` del jugador. El power-up actúa como el "interruptor" que cambia de un tipo a otro.

**Ficheros que SIEMPRE tocarás:**

1.  `js/config.js` (Para definir el proyectil y el power-up)
2.  `js/systems/ProjectileRenderSystem.js` (Para darle un aspecto único, si es necesario)
3.  `js/PowerUpSystem.js` (Para enseñarle al juego cómo aplicar el cambio)

**GUÍA PASO A PASO:**

#### **Paso 1: Definir la "Munición" en `config.js`**

Todo empieza con el plano de tu nuevo proyectil.

  * **Acción:** Abre `js/config.js` y añade un nuevo objeto dentro de `CONFIG.PROJECTILE.PROJECTILE_TYPES`.

  * **Plantilla:**

    ```javascript
    // En CONFIG.PROJECTILE.PROJECTILE_TYPES

    NOMBRE_DE_TU_NUEVO_PROYECTIL: {
        DAMAGE: 20,                       // Daño por impacto.
        SPEED: 600,                       // Velocidad en píxeles por segundo.
        RADIUS: 5,                        // El hitbox de colisión.
        COLOR: '#FFD700',                 // Color principal.
        VISUAL_TYPE: 'nombre_visual_unico',// Un nombre para su aspecto. Si es nuevo, necesitará un dibujado especial.
        LIFETIME: 3.0,                    // Segundos que vive antes de desaparecer.
        bounces: 0,                       // Cuántas veces rebota (0 por defecto).
        pierce: 0                         // Cuántos enemigos atraviesa (0 por defecto).
    },
    ```

#### **Paso 2: Crear la "Apariencia" en `ProjectileRenderSystem.js`**

Si tu `VISUAL_TYPE` es nuevo (y no quieres usar un sprite pre-renderizado), tienes que enseñarle al juego a dibujarlo.

  * **Acción:** Abre `js/systems/ProjectileRenderSystem.js`.

  * **Instrucción:**

    1.  Crea una nueva función de dibujo, como `drawMiNuevoProyectil()`.
    2.  En el método `render()`, añade una condición `if/else if` para llamar a tu nueva función cuando el `visualType` coincida.

  * **Ejemplo:**

    ```javascript
    // En ProjectileRenderSystem.js

    // 1. Añade tu nueva función de dibujo
    drawMiNuevoProyectil(ctx, config) {
        ctx.fillStyle = config.COLOR;
        ctx.beginPath();
        ctx.arc(0, 0, config.RADIUS, 0, Math.PI * 2); // Dibuja un círculo simple
        ctx.fill();
    }

    // 2. Modifica el método render()
    render() {
        // ... (dentro del bucle for)
        
        // ... (después de girar el contexto con rotate)
        
        if (projectileConfig.VISUAL_TYPE === 'chain_lightning') {
            this.drawChainLightning(this.ctx, transform, projectileConfig);
        } else if (projectileConfig.VISUAL_TYPE === 'nombre_visual_unico') { // <-- TU NUEVA CONDICIÓN
            this.drawMiNuevoProyectil(this.ctx, projectileConfig);
        } else {
            // Lógica para dibujar el resto de proyectiles
        }
    }
    ```

#### **Paso 3: Definir el "Power-Up" en `config.js`**

Ahora creamos la "carta" que el jugador verá para obtener esta nueva arma.

  * **Acción:** Vuelve a `js/config.js` y añade un nuevo objeto a la lista `POWER_UP_DEFINITIONS`.

  * **Plantilla:**

    ```javascript
    // En POWER_UP_DEFINITIONS
    {
        id: 'equip_mi_nueva_arma',
        name: 'Nombre Para El Jugador',
        description: 'Descripción de lo que hace.',
        type: 'Commander',      // El tipo de efecto que vamos a programar
        category: 'Offensive',  // La categoría a la que pertenece
        maxLevel: 1,            // Es un cambio de arma, no se acumula
        effect: { 
            type: 'CHANGE_WEAPON', // Usamos el tipo de efecto que ya creamos
            newProjectileTypeId: 'NOMBRE_DE_TU_NUEVO_PROYECTIL' // Debe coincidir con el nombre del Paso 1
        }
    },
    ```

#### **Paso 4: Implementar el Efecto en `PowerUpSystem.js`**

El `PowerUpSystem` ya sabe qué hacer con `effect.type: 'CHANGE_WEAPON'`, gracias a la lógica que implementamos para el "Cañón de Iones". Por lo tanto, ¡**no necesitas hacer nada en este archivo**\! El sistema leerá la definición del Paso 3 y funcionará automáticamente.

#### **Paso 5 (Opcional pero recomendado): Añadir al Menú de Debug**

Para probar tu nueva arma al instante:

1.  **En `index.html`:** Añade un nuevo botón al panel de debug.
    ```html
    <button id="debug-grant-mi-nueva-arma">Equipar Mi Nueva Arma</button>
    ```
2.  **En `main.js`:** Conecta el botón en `setupDebugPanelListeners()`.
    ```javascript
    document.getElementById('debug-grant-mi-nueva-arma').addEventListener('click', () => {
        const miNuevoPowerUp = CONFIG.POWER_UP_DEFINITIONS.find(p => p.id === 'equip_mi_nueva_arma');
        if (miNuevoPowerUp) {
            gameInstance.eventBus.publish('debug:grant_powerup', { powerUp: miNuevoPowerUp });
        }
    });
    ```

-----

¡Mis disculpas\! Tienes toda la razón. Nos desviamos para arreglar el problema del renderizado y dejamos pendiente la segunda parte del manual. Continuemos donde lo dejamos.

Aquí tienes la segunda y más avanzada parte del manual, centrada en cómo crear **Evoluciones y Sinergias**, que es donde reside la verdadera magia de la rejugabilidad.

-----

### **Manual de Expansión de Armas y Sinergias (Parte 2)**

### **Parte 2: Cómo Añadir una Nueva Evolución o Sinergia**

Este proceso es para cuando quieres que una o varias mejoras que ya tiene el jugador se combinen para crear un efecto completamente nuevo y superior, como transformar un arma o una nave aliada. Usaremos como ejemplo nuestro **Rayo Desintegrador**.

**Concepto Clave:** Una Evolución es un tipo especial de power-up que solo se ofrece al jugador si cumple una serie de **prerrequisitos**. En lugar de simplemente mejorar una estadística, una evolución *transforma* un aspecto del juego.

**Ficheros que SIEMPRE tocarás:**

1.  `js/config.js` (Para asegurarte de que los "ingredientes" y el "resultado" están definidos).
2.  `js/evolutions.js` (Para escribir la "receta" de la evolución).
3.  `js/PowerUpSystem.js` (Para manejar el efecto de la evolución).
4.  Un **Sistema Receptor** (como `WeaponSystem` o `AllyFactory`) que escuchará la orden de evolucionar.

**GUÍA PASO A PASO:**

#### **Paso 1: Asegurar los "Ingredientes" y el "Resultado" en `config.js`**

Antes de crear la receta, asegúrate de que todo lo que necesitas ya está definido.

  * **Acción:** Abre `js/config.js`.
  * **Verifica:**
    1.  **Ingredientes (Prerrequisitos):** ¿Existen en `POWER_UP_DEFINITIONS` los power-ups que quieres usar como condición? Para nuestro Rayo Desintegrador, necesitábamos `pierce_shot` y `fire_rate_boost`. ¡Ya los tenemos\!
    2.  **Resultado (la Evolución):** Si la evolución crea un nuevo tipo de proyectil, ¿está definido en `CONFIG.PROJECTILE.PROJECTILE_TYPES`? En nuestro caso, sí, ya hemos definido `DISINTEGRATOR_RAY`.

#### **Paso 2: Escribir la "Receta" en `evolutions.js`**

Este es el corazón del sistema. Aquí le decimos al juego cómo se combinan las cosas.

  * **Acción:** Abre `js/evolutions.js` y añade un nuevo objeto al array `EVOLUTION_RECIPES`.

  * **Plantilla:**

    ```javascript
    // En js/evolutions.js
    {
        id: 'id_unico_de_la_evolucion',
        name: 'Nombre que ve el jugador',
        description: 'Descripción de la increíble transformación.',
        type: 'Evolution',      // El tipo siempre es 'Evolution'.
        category: 'Special',    // Las evoluciones siempre aparecen en la categoría "Especial".

        // --- LOS INGREDIENTES ---
        prerequisites: {
            // (Opcional) Naves que el jugador debe tener en su flota.
            // Ejemplo: ships: ['gunship'],
            ships: [], 

            // Power-ups que el jugador debe haber adquirido previamente.
            // Usa los 'id' de POWER_UP_DEFINITIONS.
            powerups: ['id_powerup_1', 'id_powerup_2'] 
        },

        // --- EL RESULTADO ---
        effect: {
            // Un tipo de efecto único que programaremos.
            type: 'TIPO_DE_EVOLUCION', 
            
            // Datos adicionales que necesita el efecto.
            // Ejemplo para un arma: newProjectileTypeId: 'NUEVO_PROYECTIL'
            // Ejemplo para una nave: from: 'scout', to: 'interceptor'
        }
    }
    ```

  * **Nuestro Ejemplo Real (Rayo Desintegrador):**

    ```javascript
    {
        id: 'evo_disintegrator_ray',
        name: 'Sinergia: Rayo Desintegrador',
        description: 'Combina el láser y los proyectiles de plasma en un rayo continuo que derrite a los enemigos.',
        type: 'Evolution',
        category: 'Special',
        prerequisites: {
            ships: [],
            powerups: ['pierce_shot', 'fire_rate_boost']
        },
        effect: {
            type: 'EVOLVE_WEAPON',
            newProjectileTypeId: 'DISINTEGRATOR_RAY'
        }
    }
    ```

#### **Paso 3: Implementar el Efecto de la Evolución en `PowerUpSystem.js`**

Necesitamos que el `PowerUpSystem` sepa qué hacer cuando el jugador elige una carta de `type: 'Evolution'`. Lo que hará será publicar un evento específico para que otro sistema lo escuche.

  * **Acción:** Abre `js/PowerUpSystem.js` y modifica el método `applyPowerUpEffect`.

  * **Instrucción:** Asegúrate de que tienes un `case 'Evolution'` que llama a una función `applyEvolutionEffect`. Dentro de esa función, añade un `case` para tu nuevo tipo de efecto.

  * **Ejemplo:**

    ```javascript
    // En js/PowerUpSystem.js

    // Ya tenemos este método, solo asegúrate de que el 'case' existe.
    applyEvolutionEffect(effect) {
        console.log("🧬 Aplicando efecto de EVOLUCIÓN:", effect);
        
        switch (effect.type) {
            case 'EVOLVE_ALLY':
                this.eventBus.publish('fleet:evolve_ship', { from: effect.from, to: effect.to });
                break;
            
            // Este es el que nos interesa para el Rayo Desintegrador
            case 'EVOLVE_WEAPON':
                this.eventBus.publish('player:evolve_weapon', { newProjectileTypeId: effect.newProjectileTypeId });
                break;
                
            default:
                console.warn(`Tipo de efecto de evolución desconocido: ${effect.type}`);
        }
    }
    ```

#### **Paso 4: Crear el "Receptor" del Efecto (El Sistema que Ejecuta la Transformación)**

El `PowerUpSystem` ha gritado "¡Evolucionad arma\!", pero necesitamos que alguien escuche. En este caso, el `WeaponSystem` es el responsable.

  * **Acción:** Abre `js/systems/WeaponSystem.js`.

  * **Instrucción:** Asegúrate de que en el `constructor` está suscrito al evento `player:evolve_weapon` y que tiene un método para manejarlo.

  * **Ejemplo (ya lo implementamos, esto es para verificar):**

    ```javascript
    // En js/systems/WeaponSystem.js

    constructor(entityManager, eventBus) {
        super(entityManager, eventBus);
        // ...
        // ¡Esta línea es la clave! Suscribe el sistema al evento de evolución.
        this.eventBus.subscribe('player:evolve_weapon', this.onWeaponEvolve.bind(this));
    }

    // Este método se ejecuta cuando se recibe el evento.
    onWeaponEvolve(data) {
        const playerEntities = this.entityManager.getEntitiesWith(PlayerControlledComponent, WeaponComponent);
        if (playerEntities.length > 0) {
            const weapon = this.entityManager.getComponent(playerEntities[0], WeaponComponent);
            const newProjectileDef = CONFIG.PROJECTILE.PROJECTILE_TYPES[data.newProjectileTypeId];

            if (weapon && newProjectileDef) {
                console.log(`🧬 Evolución de Arma! Cambiando de ${weapon.projectileTypeId} a ${data.newProjectileTypeId}`);
                weapon.projectileTypeId = data.newProjectileTypeId;
                
                // También actualiza la cadencia si la nueva arma tiene una definida
                if (newProjectileDef.fireRate) {
                    weapon.fireRate = newProjectileDef.fireRate;
                }
            }
        }
    }
    ```

-----
