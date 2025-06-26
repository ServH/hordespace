Por supuesto. Aquí tienes el documento maestro que servirá como nuestra "Constitución" para todo el proceso de refactorización.

Es una excelente idea tenerlo. Referencia este documento en tus interacciones con la IA para asegurar que siempre mantenga el contexto y los objetivos finales en mente.

---

### **Documento Maestro de Arquitectura y Refactorización: Space Horde Survivor**

#### **1. Visión General y Objetivos Clave**

* **Proyecto:** Space Horde Survivor
* **Visión:** Guiar la refactorización del proyecto desde su estado actual —un prototipo funcional y robusto— hacia una arquitectura de software de nivel profesional que sea mantenible, de alto rendimiento y fácilmente escalable.
* **Objetivos Específicos:**
    1.  **Mantenibilidad:** Simplificar drásticamente la adición de nuevas funcionalidades (naves, enemigos, power-ups, habilidades) sin necesidad de modificar el núcleo del sistema.
    2.  **Escalabilidad:** Asegurar que la arquitectura pueda soportar una mayor cantidad y complejidad de entidades en el juego sin degradar la estructura del código.
    3.  **Rendimiento:** Optimizar activamente los cuellos de botella de rendimiento, especialmente en el renderizado y la gestión de memoria, para garantizar 60 FPS estables en todo momento.
    4.  **Desacoplamiento:** Eliminar las dependencias directas entre los distintos sistemas del juego, permitiendo que operen de forma independiente y se comuniquen de manera anónima.
    5.  **Testabilidad:** Estructurar el código de manera que los módulos lógicos (Sistemas) puedan ser probados de forma aislada, sin depender del estado global del juego.

#### **2. Arquitectura Objetivo**

La arquitectura final será un sistema de **Entidad-Componente-Sistema (ECS)**, un patrón estándar en el desarrollo de videojuegos de alto rendimiento.

* **Entidades:** Serán simples identificadores numéricos (`number`). No contendrán datos ni lógica. Representan "cosas" en el juego como el jugador, un proyectil, o un enemigo.
* **Componentes:** Serán objetos de datos puros (POJOs - Plain Old JavaScript Objects), sin métodos. Describen una faceta o propiedad de una entidad. Ejemplos: `TransformComponent` (con datos de posición y rotación), `HealthComponent` (con datos de vida), `RenderComponent` (con datos para el dibujado).
* **Sistemas:** Contendrán el 100% de la lógica del juego. Operarán en cada frame sobre conjuntos de entidades que posean los componentes requeridos. Ejemplo: `PhysicsSystem` actualizará la posición de *todas* las entidades que tengan un `TransformComponent`.

La comunicación entre estos sistemas se realizará exclusivamente a través de un **Bus de Eventos (EventBus)**, y la creación de entidades complejas será gestionada por **Fábricas (Factories)** que ensamblarán entidades con los componentes correctos a partir de plantillas (arquetipos) definidas en `config.js`.

#### **3. Patrones Arquitectónicos a Implementar**

* **Entidad-Componente-Sistema (ECS):** Será el pilar central de la nueva arquitectura, separando datos (Componentes) de lógica (Sistemas).
* **Bus de Eventos (Pub/Sub):** Actuará como el "sistema nervioso" del juego, permitiendo que los Sistemas se comuniquen sin acoplamiento directo.
* **Inyección de Dependencias (DI Container):** Será el mecanismo para crear y "cablear" los Sistemas y servicios entre sí de forma limpia y centralizada.
* **Fábricas (Factory Pattern):** Se usarán como constructores especializados para crear Entidades pre-configuradas (prefabs/arquetipos) a partir de las definiciones en `config.js`.
* **Diseño Guiado por Datos (Data-Driven Design):** Se potenciará el uso de `config.js` como la única fuente de verdad para definir las características de todas las entidades y mecánicas del juego.

#### **4. Anti-Patrones a Evitar**

* **Objeto Dios (God Object):** Se desmantelará por completo la clase `Game` como orquestador central que conoce y controla todo. Ninguna clase debe tener un conocimiento excesivo del resto del sistema.
* **Acoplamiento Fuerte:** Se eliminarán todas las llamadas a métodos directos entre sistemas (ej. `game.enemyWaveManager.onEnemyDestroyed()`). La comunicación se realizará exclusivamente vía `EventBus`.
* **Clases Monolíticas:** Se descompondrán clases como `PlayerShip` y `AllyShip`. La lógica de IA, física y renderizado vivirá en Sistemas separados, no dentro de la clase de la entidad.
* **Manipulación de Estado Externo:** Un sistema no debe modificar directamente los datos de otro. Publicará un evento con una "intención" y el sistema propietario de los datos será quien los modifique.

#### **5. Hoja de Ruta de Refactorización por Fases**

El proceso se ejecutará de forma iterativa siguiendo este plan maestro.

* **Fase 0: Preparación y Optimizaciones Inmediatas:** Limpieza de código, optimización del `ObjectPool` y eliminación de "magic numbers". Prepara el terreno sin alterar la arquitectura.
* **Fase 1: El Bus de Eventos:** Implementación del `EventBus` para desacoplar la comunicación entre los sistemas existentes.
* **Fase 2: Optimización Radical del Renderizado:** Implementación de Fading Overlay y Sprites Pre-renderizados para un aumento masivo del rendimiento.
* **Fase 3: Transición a ECS - `EntityManager` y Migración de Entidades Simples:** Creación del `EntityManager`, los Componentes base y los primeros Sistemas. Se migrarán las entidades más sencillas como `Projectile` y `Explosion`.
* **Fase 4: Consolidación de ECS - Migración de Entidades Complejas:** Descomposición de `PlayerShip`, `EnemyShip` y `AllyShip` en Componentes. Creación de Sistemas de lógica complejos (`PlayerControlSystem`, `FormationSystem`, `AITargetingSystem`).
* **Fase 5: Inyección de Dependencias - Cableado Final:** Implementación de un `DIContainer` para gestionar la creación e interconexión de todos los Sistemas, eliminando las últimas trazas de creación manual.

#### **6. Principios y Convenciones**

* **Nomenclatura de Eventos:** Se usará el formato `"sujeto:acción"` para los nombres de eventos (ej. `"enemy:destroyed"`, `"ui:show_powerup_selection"`). Esto aporta claridad y consistencia.
* **Flujo de Datos Unidireccional:** Siempre que sea posible, los datos deben fluir en una dirección: `Input -> Lógica (Sistemas) -> Estado (Componentes) -> Renderizado`.
* **Validación por Fase:** El juego debe estar en un estado 100% funcional y jugable al finalizar cada fase principal del plan, antes de comenzar la siguiente.

---

Este documento es nuestra guía. Ahora que está definido, podemos proceder con total confianza.

Cuando quieras, dime: **"Dame el detalle de la Fase 0"**.