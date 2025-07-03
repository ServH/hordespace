---

¡Tienes toda la razón! Mi disculpa, tienes razón. Para un proyecto de esta complejidad, y especialmente trabajando con una IA, necesitamos una granularidad mucho mayor. Las fases iniciales eran demasiado amplias. Un desglose más fino es crucial para garantizar que cada paso sea manejable, que las optimizaciones se integren desde el principio, y que tengamos puntos de control claros para pruebas.

Vamos a re-estructurar las fases, segmentándolas significativamente para abarcar el detalle que necesitamos. Incorporaremos optimizaciones y pruebas como hitos dentro de cada etapa relevante.

---

## Fases de Desarrollo del Proyecto "Space Horde Survivor" (Re-estructurado)

Dividiremos el desarrollo en fases más pequeñas, cada una con objetivos muy específicos y entregables concretos.

---

### Fase 0: Estructura, Setup y Bucle de Juego Básico

Esta fase inicial es la cimentación del proyecto.

* **0.1. Inicialización del Proyecto:**
    * **Objetivo:** Crear la estructura de carpetas y archivos base.
    * **Entregables:** Carpetas: `/js` (vacía), `/css` (vacía), `/assets` (vacía). Archivos: `index.html` (con `<canvas>` y enlaces CSS/JS), `style.css` (estilos básicos de `body` y `canvas`), `main.js` (vacío).
* **0.2. Configuración Global del Juego:**
    * **Objetivo:** Establecer un archivo central para todas las constantes del juego.
    * **Entregables:** `config.js` con propiedades iniciales como `CANVAS_WIDTH`, `CANVAS_HEIGHT`, `PLAYER_START_HP`, etc.
* **0.3. Bucle Principal del Juego (`Game Loop`):**
    * **Objetivo:** Implementar la estructura del `requestAnimationFrame`, el cálculo de `deltaTime` y el esqueleto de los métodos `update()` y `render()`.
    * **Entregables:** `main.js` con el `game loop` funcional, `Game.js` con su clase esqueleto y métodos `init()`, `update()`, `render()`.

---

### Fase 1: Comandante: Movimiento y Dibujo

Nos enfocamos en tener la nave del jugador funcional en pantalla con su mecánica de movimiento central.

* **1.1. Clase Comandante (`PlayerShip`):**
    * **Objetivo:** Definir las propiedades y el constructor inicial de la nave del jugador.
    * **Entregables:** `PlayerShip.js` con clase `PlayerShip` (pos, vel, acc, hp). Instanciación de `PlayerShip` en `Game.js`.
* **1.2. Dibujo del Comandante:**
    * **Objetivo:** Renderizar la nave del Comandante con una forma básica (ej., triángulo) en el `canvas`.
    * **Entregables:** Método `render()` en `PlayerShip.js` para dibujar la forma. Integración del `render()` en el `Game.render()`.
* **1.3. Entrada del Teclado y Aceleración:**
    * **Objetivo:** Capturar las pulsaciones de teclado (WASD/flechas) para aplicar aceleración a la nave.
    * **Entregables:** Lógica de `event listeners` para teclado en `main.js` o una clase `InputHandler`. Aplicación de aceleración en `PlayerShip.update()`.
* **1.4. Movimiento Inercial (Space Drift):**
    * **Objetivo:** Implementar la lógica de inercia, fricción y rotación gradual.
    * **Entregables:** Lógica completa de `PlayerShip.update()` para movimiento inercial. Pruebas de sensación de control.
* **1.5. Efectos de Propulsión Básicos:**
    * **Objetivo:** Añadir un feedback visual simple a la propulsión de la nave.
    * **Entregables:** Dibujo de líneas o partículas simples detrás de la nave cuando acelera.

---

### Fase 2: Entidades Básicas: Enemigos y Proyectiles

Esta fase establece el combate fundamental del juego.

* **2.1. Clase Base `Ship`:**
    * **Objetivo:** Crear una clase base `Ship` de la que heredarán `PlayerShip`, `EnemyShip` y `AllyShip`, para compartir propiedades y métodos comunes.
    * **Entregables:** `Ship.js` con propiedades y métodos (`takeDamage`, `fire`). `PlayerShip` hereda de `Ship`.
* **2.2. Clase `EnemyShip` (Tipo Básico):**
    * **Objetivo:** Implementar el primer tipo de enemigo con un movimiento simple (ej: acercarse al jugador).
    * **Entregables:** `EnemyShip.js` con lógica de persecución básica. Instanciación en `Game.js` para pruebas.
* **2.3. Clase `Projectile` y `Object Pooling`:**
    * **Objetivo:** Crear la clase para los disparos y el sistema de `Object Pooling` para su reutilización eficiente.
    * **Entregables:** `Projectile.js`. `ObjectPool.js`. Instanciación de un pool de proyectiles en `Game.js`.
* **2.4. Disparos del Comandante:**
    * **Objetivo:** Habilitar al Comandante para disparar proyectiles automáticamente o con un botón.
    * **Entregables:** Lógica de disparo en `PlayerShip` (frecuencia, tipo de proyectil). Uso del `Projectile Pool`.
* **2.5. Actualización y Renderizado de Proyectiles y Enemigos:**
    * **Objetivo:** Asegurar que los proyectiles y enemigos se muevan y dibujen correctamente, y se eliminen al salir de pantalla (o se desactiven en el pool).
    * **Entregables:** `update()` y `render()` para `Projectile` y `EnemyShip`. Lógica de desactivación de proyectiles fuera de límites.

---

### Fase 3: Core Combat y HUD

Integración de colisiones, daño, destrucción de enemigos y visualización básica de información.

* **3.1. Detección de Colisiones (Disparos vs. Enemigos):**
    * **Objetivo:** Implementar la detección de colisiones circulares entre los proyectiles del jugador y los enemigos.
    * **Entregables:** Función de colisión en `Game.js` o un `CollisionManager.js`. Aplicación de daño al enemigo al colisionar.
* **3.2. Gestión de Daño y Destrucción de Enemigos:**
    * **Objetivo:** Permitir que los enemigos reciban daño y sean destruidos al llegar a 0 HP.
    * **Entregables:** Método `takeDamage()` en `EnemyShip`. Desactivación del enemigo al morir.
* **3.3. Efectos de Explosión (Pooled):**
    * **Objetivo:** Mostrar efectos visuales de explosión cuando un enemigo es destruido, usando el `Object Pooling`.
    * **Entregables:** Clase `Explosion.js` y su pool. Activación de explosiones al destruir enemigos.
* **3.4. HUD Básico (HP, Oleada):**
    * **Objetivo:** Mostrar información esencial al jugador.
    * **Entregables:** Dibujo de HP del Comandante y un contador de oleadas en el `canvas`.

---

### Fase 4: Sistema de Oleadas y Escalado Básico

El juego empieza a tener una progresión.

* **4.1. Clase `EnemyWaveManager`:**
    * **Objetivo:** Implementar la clase para gestionar la lógica de las oleadas de enemigos.
    * **Entregables:** `EnemyWaveManager.js` con métodos para iniciar/terminar oleadas, `spawn` de enemigos.
* **4.2. `Spawning` de Enemigos por Oleada:**
    * **Objetivo:** Los enemigos básicos aparecerán en patrones definidos por la oleada actual.
    * **Entregables:** Lógica de `spawn` con temporizadores y límites por oleada en `EnemyWaveManager`.
* **4.3. Escalado Inicial de Dificultad:**
    * **Objetivo:** Aumentar progresivamente HP y Daño de los enemigos con cada nueva oleada/ciclo.
    * **Entregables:** Propiedades de escalado en `config.js`. Lógica de aplicación de escalado en `EnemyWaveManager` al `spawnear` enemigos.
* **4.4. Fin de Juego (`Game Over`):**
    * **Objetivo:** Detectar la destrucción del Comandante y pasar al estado de `Game Over`.
    * **Entregables:** Lógica en `Game.js` para detectar 0 HP del Comandante. Transición a un estado `GAME_OVER` y mostrar un mensaje simple.

---

### Fase 5: Materiales y Recolección

Introduce el bucle de recursos.

* **5.1. Clase `Material` y `Object Pooling`:**
    * **Objetivo:** Crear la clase para los cristales de material y su pool.
    * **Entregables:** `Material.js`. Integración con `ObjectPool`.
* **5.2. `Drop` de Materiales por Enemigos:**
    * **Objetivo:** Los enemigos destruidos sueltan materiales.
    * **Entregables:** Lógica en `EnemyShip.takeDamage()` para activar `Material` objetos del pool al morir.
* **5.3. Recolección Automática:**
    * **Objetivo:** Implementar la lógica para que el Comandante recoja materiales al pasar cerca.
    * **Entregables:** Detección de proximidad/colisión (circular) del Comandante con `Material` objetos. Incremento del contador de materiales.
* **5.4. HUD de Materiales:**
    * **Objetivo:** Actualizar el HUD para mostrar el recuento de materiales.
    * **Entregables:** Actualización del método `render()` del HUD.

---

### Fase 6: Sistema de Nivelación y Power-ups

La primera capa de progresión roguelike.

* **6.1. Clase `PowerUpSystem`:**
    * **Objetivo:** Implementar la gestión de la experiencia del jugador y la subida de nivel.
    * **Entregables:** `PowerUpSystem.js` con métodos para `addXP()`, `checkLevelUp()`.
* **6.2. Ganancia de XP:**
    * **Objetivo:** Los enemigos al ser destruidos otorgan XP al jugador.
    * **Entregables:** Lógica en `EnemyShip.takeDamage()` o `Game.js` para llamar a `PowerUpSystem.addXP()`.
* **6.3. Selección de Power-ups (UI):**
    * **Objetivo:** Pausar el juego al subir de nivel y presentar 3 opciones de `power-ups` al jugador.
    * **Entregables:** Interfaz de usuario básica para la selección de `power-ups`. Transición del estado del juego a `PAUSED_FOR_LEVEL_UP`.
* **6.4. Aplicación de Power-ups:**
    * **Objetivo:** Aplicar los efectos de las mejoras elegidas por el jugador (ej., `playerSpeed +15%`).
    * **Entregables:** Lógica en `PowerUpSystem` para modificar las propiedades del `PlayerShip` o del `Game` según el `power-up` elegido.

---

### Fase 7: Habilidades del Comandante

Introduce las habilidades activas para el jugador.

* **7.1. Clase `CommanderAbilities`:**
    * **Objetivo:** Gestionar las habilidades del Comandante y sus `cooldowns`.
    * **Entregables:** `CommanderAbilities.js`. Integración con `PlayerShip` o `Game`.
* **7.2. Implementación de Habilidades (`Rally`, `Shield`):**
    * **Objetivo:** Desarrollar al menos dos de las habilidades del Comandante.
    * **Entregables:** Lógica para `Rally` (boost de velocidad/daño) y `Shield Protocol` (escudo temporal).
* **7.3. UI de Habilidades y `Cooldowns`:**
    * **Objetivo:** Mostrar los botones de las habilidades y sus `cooldowns` visualmente en el HUD.
    * **Entregables:** Actualización del HUD para incluir barras de `cooldown` o iconos de habilidad.

---

### Fase 8: Flota Aliada: Clases y Formaciones

La base de la flota controlada por la IA.

* **8.1. Clases de Naves Aliadas (Scout, Gunship):**
    * **Objetivo:** Implementar las clases para los primeros tipos de naves aliadas.
    * **Entregables:** `AllyShip.js` (clase base para aliados). `ScoutShip.js`, `GunshipShip.js` (heredan de `AllyShip`).
* **8.2. Clase `FleetManager`:**
    * **Objetivo:** Gestionar todas las naves aliadas, sus formaciones y comportamientos básicos.
    * **Entregables:** `FleetManager.js` con un `Array` de naves aliadas y métodos para añadir/eliminar.
* **8.3. Formación Circular Básica:**
    * **Objetivo:** Implementar la formación circular donde las naves aliadas orbitan alrededor del Comandante.
    * **Entregables:** Lógica de posicionamiento orbital en `FleetManager.update()` o en cada `AllyShip.update()`.
* **8.4. IA de Flota (Ataque Básico):**
    * **Objetivo:** Las naves aliadas disparan a los enemigos más cercanos.
    * **Entregables:** Lógica de búsqueda de objetivo y disparo en `AllyShip.update()`.

---

### Fase 9: Hangar y Construcción de Flota

El mecanismo para expandir la flota.

* **9.1. Clase `Hangar` (Funcionalidad Completa):**
    * **Objetivo:** Implementar la aparición periódica del Hangar y la interacción de proximidad.
    * **Entregables:** `Hangar.js` con lógica de `spawn` y detección de proximidad del Comandante.
* **9.2. UI de Construcción del Hangar:**
    * **Objetivo:** Mostrar un menú `overlay` al acceder al Hangar con opciones para construir naves.
    * **Entregables:** Elementos DOM/Canvas para la UI del Hangar (botones, costos).
* **9.3. Lógica de Construcción:**
    * **Objetivo:** Permitir al jugador gastar materiales para añadir naves a su flota.
    * **Entregables:** Métodos en `Hangar` para construir naves, deducir materiales, añadir naves a `FleetManager`.

---

### Fase 10: Diversificación de Enemigos y Jefes

Ampliamos la variedad de desafíos.

* **10.1. Implementación de Nuevos Tipos de Enemigos:**
    * **Objetivo:** Introducir enemigos con comportamientos más complejos (ej: Sniper, Kamikaze).
    * **Entregables:** Clases `SniperEnemy.js`, `KamikazeEnemy.js` con IA y propiedades únicas.
* **10.2. Lógica de `Spawn` para Nuevos Enemigos:**
    * **Objetivo:** Integrar la aparición de estos nuevos enemigos en las oleadas avanzadas (`EnemyWaveManager`).
    * **Entregables:** Ajustes en `EnemyWaveManager` para la progresión por ciclo (ej: ciclo 2 introduce Sniper).
* **10.3. Clase `Boss` y Primer Jefe Funcional:**
    * **Objetivo:** Implementar la clase base para jefes y el primer `Boss` con un patrón de ataque simple.
    * **Entregables:** `Boss.js`. Lógica de aparición del jefe al final de un ciclo.
* **10.4. Detección de Colisiones (Comandante vs. Enemigos):**
    * **Objetivo:** Asegurar que el Comandante recibe daño por contacto con enemigos.
    * **Entregables:** Colisiones entre `PlayerShip` y `EnemyShip`.

---

### Fase 11: Optimización y Pulido Básico

Una fase dedicada a mejorar el rendimiento y la experiencia del jugador.

* **11.1. Optimización del Renderizado (Zonas Visibles):**
    * **Objetivo:** Implementar la lógica para solo dibujar entidades que están dentro de la vista de la cámara.
    * **Entregables:** Filtros de visibilidad en el `render loop`.
* **11.2. Particionamiento Espacial para Colisiones:**
    * **Objetivo:** Implementar una cuadrícula simple para optimizar la búsqueda de posibles colisiones, si el rendimiento es un problema.
    * **Entregables:** Clase `SpatialGrid` o similar. Modificación del `CollisionManager` para usar la cuadrícula.
* **11.3. Ajustes de Balance Inicial:**
    * **Objetivo:** Realizar pruebas de juego y ajustar valores en `config.js` (HP, daño, costos) para una experiencia inicial equilibrada.
    * **Entregables:** `config.js` actualizado con valores de balance.
* **11.4. HUD Mejorado y Feedback Visual:**
    * **Objetivo:** Añadir indicadores de daño, barras de HP de enemigos importantes, y otros feedbacks visuales.
    * **Entregables:** Marcadores de daño flotantes, barras de HP sobre enemigos (si aplica), vibración de pantalla al recibir daño.

---

### Fase 12: Fondo Espacial Avanzado y Efectos Visuales

Mejora la inmersión visual.

* **12.1. Capas de Parallax Multiples:**
    * **Objetivo:** Implementar 3-5 capas de estrellas y nebulosas con diferentes velocidades de `parallax`.
    * **Entregables:** Lógica de `parallax` en `Background.js` o `Game.render()`.
* **12.2. Nebulosas Procedurales:**
    * **Objetivo:** Generar nebulosas con formas más orgánicas utilizando `noise functions`.
    * **Entregables:** Integración de `Perlin/Simplex noise` para la generación de nebulosas en los `chunks` de fondo.
* **12.3. Partículas Ambientales:**
    * **Objetivo:** Añadir partículas flotantes en el espacio para mayor dinamismo.
    * **Entregables:** Sistema de partículas pequeño para partículas ambientales.

---

### Fases Futuras (Ejemplos):

* **Fase 13:** Expansión de Habilidades del Comandante (más habilidades, árboles de habilidades).
* **Fase 14:** Más Tipos de Naves Aliadas (Heavy, Support) y Formaciones Avanzadas.
* **Fase 15:** Jefes Complejos (Múltiples Fases, Ataques Especiales).
* **Fase 16:** Audio (Música y SFX).
* **Fase 17:** Menús de UI Completos (Inicio, Pausa, Game Over).
* **Fase 18:** Gráficos Finales y Animaciones.

