¡Entendido! Me parece la decisión más acertada y profesional. Dedicar tiempo a la planificación estratégica antes de escribir una sola línea de código es lo que distingue a los proyectos exitosos. Vamos a crear ese documento base, nuestra "biblia" de diseño para la nueva visión del juego: **"El Comandante de la Horda"**.

El documento que prepararé será nuestra hoja de ruta. Lo estructuraremos para debatir, refinar y detallar cada aspecto de la nueva mecánica de flotas, reutilizando y adaptando las ideas del sistema de combos de armas.

---

### **Documento de Diseño y Arquitectura: "HordeSpacial - El Comandante de la Horda"**

**Versión:** 1.0
**Fecha:** 1 de julio de 2025
**Autor:** Gemini (Arquitecto de Software)

#### **1. Visión General y Filosofía de Diseño**

El núcleo de *HordeSpacial* se centrará en la **creación y personalización de una flota de combate**. Se abandona la idea de un sistema complejo de combinación de armas para el Comandante en favor de un sistema profundo y estratégico de gestión de la flota.

* **Fantasía del Jugador:** El jugador no es solo un piloto, es un **Almirante**. Su poder no reside únicamente en su nave, sino en su capacidad para componer, mejorar y comandar una armada sinérgica.
* **Decisiones Estratégicas:** La variedad de cada partida provendrá de las decisiones que tome el jugador sobre la composición y especialización de su flota.
* **Progresión Visual y Funcional:** El crecimiento del poder del jugador será tangible. Añadir una nueva nave o mejorarla tendrá un impacto visual y de comportamiento inmediato en la pantalla.

---

#### **2. El Ecosistema de la Flota: Naves y Roles**

Para que la composición de la flota sea estratégica, necesitamos una variedad de naves con roles bien definidos.

| Nave | Rol | Habilidad Pasiva / Característica Clave |
| :--- | :--- | :--- |
| **Scout** | Hostigador / Explorador | Rápida, alta cadencia, bajo daño. Ideal para eliminar enemigos débiles y numerosos. |
| **Gunship** | DPS / Tanque Ligero | Lenta, resistente, alto daño. La columna vertebral del poder de fuego de la flota. |
| **Guardian** | Tanque / Defensor | **(NUEVA)** Velocidad muy baja, HP muy alto. No hace mucho daño, pero tiene una probabilidad de interceptar proyectiles que se dirigen al Comandante. |
| **Support** | Sanador / Buffer | **(NUEVA)** No ataca. Emite un aura de reparación pasiva a las naves aliadas cercanas. Puede ser mejorado para proporcionar otros buffs (escudos, aumento de daño). |
| **Corvette**| DPS de Ráfaga | **(NUEVA)** Dispara una salva de misiles de corto alcance con un largo cooldown. Ideal para picos de daño contra élites. |

---

#### **3. Refactorización del Sistema de Progresión: Las Mejoras de Flota**

Aquí es donde reutilizamos nuestra arquitectura de "recetas" y "power-ups" para enfocarla en la flota. Las mejoras que se ofrezcan al subir de nivel se dividirán en tres categorías principales:

**Categoría 1: Reclutamiento y Mejoras Generales (Comunes)**
Son las mejoras más frecuentes. Permiten al jugador construir su flota o aplicar mejoras globales.

* `Añadir Nave: Scout` (Se puede coger hasta 4-5 veces)
* `Añadir Nave: Gunship` (Se puede coger hasta 3-4 veces)
* `Protocolo de Combate I`: +10% al daño de **toda** la flota.
* `Condensadores Mejorados I`: +10% a la cadencia de disparo de **toda** la flota.

**Categoría 2: Especializaciones de Nave (Poco Comunes)**
Estas mejoras solo aparecen si el jugador ya posee al menos una nave del tipo correspondiente. Fomentan la especialización.

* `Cañones de Plasma (Gunship)`: Los proyectiles de tus Gunships ahora atraviesan a un enemigo. (Requiere: 1x Gunship).
* `Postquemadores (Scout)`: Aumenta la velocidad y aceleración de todos tus Scouts en un 25%. (Requiere: 1x Scout).
* `Nanobots Amplificados (Support)`: El aura de reparación de tus naves de Apoyo ahora también repara ligeramente al Comandante. (Requiere: 1x Support).
* `Blindaje Reactivo (Guardian)`: Cuando un Guardián intercepta un proyectil, emite una pequeña onda de choque dañina. (Requiere: 1x Guardian).

**Categoría 3: Sinergias y Evoluciones de Flota (Raras)**
Estas son las "recetas" de alto nivel, el corazón de las builds únicas. Reemplazan las evoluciones de armas. Requieren una combinación específica de naves y/o mejoras.

* **Ejemplo 1: Evolución "Manada de Lobos"**
    * **Ingredientes:** 3x Scout + "Postquemadores (Scout)".
    * **Efecto (Evolución):** Tus Scouts ahora se mueven en una formación de flanqueo agresiva y concentran su fuego sobre el mismo objetivo que el Comandante. Su apariencia cambia ligeramente (ej. una estela de motor más brillante).
* **Ejemplo 2: Sinergia "Línea de Fuego"**
    * **Ingredientes:** 2x Gunship + 1x Guardian.
    * **Efecto (Pasiva de Flota):** Desbloquea una nueva formación táctica. Las Gunships se posicionan detrás del Guardian, obteniendo un bonus de daño mientras el Guardian esté absorbiendo daño.
* **Ejemplo 3: Evolución "Corvette -> Lanzatorpedos"**
    * **Ingredientes:** 1x Corvette + "Proyectiles Mejorados I".
    * **Efecto (Evolución de Nave):** La Corvette se transforma. Sus misiles ahora son torpedos de plasma más lentos pero con un gran daño de área al impactar.

---

#### **4. El Rol del Comandante: El Cerebro de la Operación**

Para que el jugador siga siendo el protagonista, sus acciones deben ser las más decisivas.

* **Habilidades Activas de Comando:** El jugador es el único que puede usar habilidades que afectan a toda la flota.
    * **Dash/Freno (Ya implementado):** Herramientas de supervivencia personal.
    * **Marcar Objetivo (Tecla `R`):** El Comandante dispara un marcador a un enemigo. **Toda la flota** priorizará atacar a ese enemigo con un bonus de daño durante 10 segundos. (Cooldown: 20s).
    * **Cambio de Formación (Tecla `F`):** Cicla entre formaciones tácticas (si se han desbloqueado). Ej: Formación Circular (defensiva) vs. Formación de Punta de Flecha (ofensiva).

* **Mejoras del Comandante:** Siempre existirá una categoría de mejoras que solo afecten a la nave del Comandante (su HP, su arma principal, el cooldown de sus habilidades). Esto crea una decisión estratégica constante: *¿invierto en mí mismo para sobrevivir mejor, o en mi flota para aumentar nuestro poder de fuego general?*

---

#### **5. Hoja de Ruta de Implementación (Fase a Fase)**

Este es el plan de desarrollo propuesto para implementar esta visión. Cada fase debe ser probada exhaustivamente antes de pasar a la siguiente.

**Fase 6.1: La Base - El Guardian y el Support**
1.  **Diseñar y Configurar:** Crear las entradas para `GUARDIAN` y `SUPPORT` en `CONFIG.ALLY`.
2.  **Crear Clases:** Implementar `GuardianShip.js` y `SupportShip.js` con su renderizado único.
3.  **Implementar Lógica Pasiva:**
    * Crear un `RepairAuraSystem` que actúe sobre las naves de Apoyo.
    * Modificar el `DamageSystem` para que las naves Guardian puedan interceptar proyectiles dirigidos al jugador.
4.  **Añadir Reclutamiento:** Añadir las cartas de "Añadir Nave: Guardian" y "Añadir Nave: Support" a la lista de `POWER_UP_DEFINITIONS`.
5.  **Pruebas:** Validar que las nuevas naves aparecen, se comportan como se espera y se integran en la formación.

**Fase 6.2: El Árbol de Mejoras - Especializaciones**
1.  **Refactorizar `PowerUpSystem`:** Añadir lógica para que, al generar opciones, compruebe la composición actual de la flota del jugador (`this.fleetSystem.getFleetData()`).
2.  **Implementar 2-3 Mejoras de Especialización:**
    * Ej: Crear la mejora "Cañones de Plasma (Gunship)".
    * Modificar el `ProjectileFactory` o el `DamageSystem` para que, al crear/procesar un proyectil de una Gunship, compruebe si el jugador tiene esta mejora para aplicar el efecto de perforación.
3.  **Pruebas:** Validar que las mejoras de especialización solo aparecen cuando se tiene la nave requerida y que sus efectos se aplican correctamente.

**Fase 6.3: El Pináculo del Poder - Sinergias de Flota**
1.  **Refactorizar `SynergyManager.js`:** Ampliar el método `getAvailableEvolutions` para que compruebe los `prerequisites.ships` (ej: que haya al menos 2 Scouts en la flota).
2.  **Implementar la Primera Sinergia:** Implementar la "Manada de Lobos".
    * Crear un nuevo componente, ej: `WolfpackTargetingComponent`.
    * Modificar `AllyCombatAISystem` para que, si una nave tiene este componente, cambie su lógica de targeting para atacar al objetivo del Comandante.
    * El efecto de la sinergia será añadir este componente a todos los Scouts.
3.  **Pruebas:** Crear una situación de prueba para obtener la sinergia y validar que el comportamiento de los Scouts cambia como se espera.

**Fase 6.4: El Comandante Activo**
1.  **Implementar "Marcar Objetivo":**
    * Añadir la habilidad y su cooldown al `AbilitiesComponent`.
    * Modificar `PlayerInputSystem` para escuchar la tecla `R`.
    * Crear un evento `command:mark_target` que se publica con la posición del ratón.
    * Los sistemas de IA de los aliados escucharán este evento para cambiar su objetivo prioritario temporalmente.
2.  **Pruebas:** Validar que la habilidad se puede usar, entra en cooldown y que la flota responde correctamente.

---