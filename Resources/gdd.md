---

¡Absolutamente! Es una excelente idea consolidar todo esto en un **Game Design Document (GDD)**. Este documento servirá como una guía fundamental para el desarrollo, asegurando que tengamos en cuenta la visión del juego y los desafíos técnicos en cada paso.

Aquí tienes un borrador de GDD para tu "Horde Survivor Espacial", diseñado para ser claro y completo, incorporando todas tus ideas y los retos técnicos que hemos discutido.

---

# Game Design Document (GDD): Space Horde Survivor

## 1. Visión General del Juego

* **Título del Juego:** Space Horde Survivor (Nombre Provisional)
* **Género:** Horde Survivor, Roguelike, Arcade Espacial.
* **Plataforma:** Navegador Web (HTML5, CSS3, JavaScript con Canvas2D).
* **Premisa:** El jugador comanda una nave central (Comandante) y su flota, defendiéndose de interminables oleadas de enemigos espaciales, recolectando recursos y mejorando su arsenal para sobrevivir el mayor tiempo posible. El juego enfatiza el control de la flota, las decisiones estratégicas de mejora y la gestión del espacio.
* **Público Objetivo:** Jugadores casuales y hardcore que disfrutan de la progresión roguelike, la acción intensa y la supervivencia.

## 2. Core Gameplay Loop

1.  **Inicio:** El jugador comienza con la nave Comandante.
2.  **Combate:** Oleadas de enemigos aparecen y atacan. El jugador y su flota disparan automáticamente.
3.  **Recolección:** Enemigos destruidos sueltan materiales que se recogen automáticamente al pasar cerca.
4.  **Progreso:**
    * **Nivelación:** Al subir de nivel (matar suficientes enemigos/tiempo), el jugador elige una mejora entre tres opciones.
    * **Construcción de Flota:** Periódicamente, aparece un Hangar que permite al jugador gastar materiales para construir nuevas naves para su flota.
    * **Escalada de Dificultad:** Las oleadas aumentan progresivamente en dificultad, introduciendo nuevos tipos de enemigos y jefes.
5.  **Supervivencia:** El objetivo es sobrevivir el mayor número de oleadas posible.
6.  **Derrota:** Si la nave Comandante es destruida, el juego termina.

## 3. Sistemas de Juego

### 3.1. Sistema de Control y Movimiento

* **Nave Comandante:**
    * **Movimiento:** Fluido, tipo "space drift" con inercia.
        * **Controles:** Teclas WASD o Flechas para aplicar impulso direccional.
        * La nave mantiene el `momentum` y gira gradualmente para cambiar de dirección, requiriendo que el jugador anticipe sus movimientos.
    * **Efectos Visuales:** Efectos de propulsión visuales que siguen la dirección del impulso.
* **Flota en Formación:**
    * **Formación Circular:** Las naves de la flota orbitan alrededor de la nave Comandante.
    * **Formación Escolta:** Algunas naves flanquean o se posicionan detrás del Comandante.
    * **Comportamiento IA:**
        * Mantienen una distancia relativa al Comandante.
        * Priorizan atacar a enemigos cercanos al Comandante.
        * (Objetivo a futuro): Esquivan obstáculos grandes o disparos específicos.

### 3.2. Habilidades de Comandante

* Activadas por el jugador con `cooldowns`.
    * **Rally:** Boost temporal de velocidad y daño para toda la flota.
    * **Shield Protocol:** Genera un escudo grupal que protege a la flota por X segundos.
    * **Formation Strike:** La flota realiza un ataque coordinado de alto daño o un ataque especial.

### 3.3. Sistema de Escalado de Dificultad (Oleadas y Ciclos)

* **Estructura por Oleadas:** El juego se organiza en oleadas de enemigos. Cada 10 oleadas completan un `Ciclo`.
* **Ciclo Básico:**
    * **Oleadas 1-3:** Enemigos básicos (Ej: Triángulos Rojos).
    * **Oleadas 4-6:** + Scouts rápidos (Ej: Círculos Pequeños).
    * **Oleadas 7-9:** + Tanques (Ej: Cuadrados Grandes).
    * **Oleada 10:** Jefe (BOSS) + minions.
* **Progreso por Ciclo:**
    * **Enemigos:** Cada ciclo, los enemigos aumentan su HP y Daño (+20%).
    * **Nuevos Tipos:** Se introduce un nuevo tipo de enemigo por ciclo.
    * **Bosses:** Los Jefes se vuelven más complejos (más HP/Daño, nuevos patrones de ataque).
    * **Velocidad de `Spawn`:** Aumenta la frecuencia de aparición de enemigos.
* **Ejemplos de Progresión:**
    * **Ciclo 1:** Básicos + Scouts + Tanques → Boss Cruiser.
    * **Ciclo 2:** + Sniper (Ej: Diamantes) → Boss Battleship.
    * **Ciclo 3:** + Kamikaze (Ej: Círculos Rápidos) → Boss Carrier.
    * **Ciclo 4+:** Introducción de enemigos élite, formaciones enemigas coordinadas, Jefes con múltiples fases.

### 3.4. Sistema de Hangares y Construcción

* **Mecánica del Hangar:**
    * **Aparición:** Un Hangar (Hexágono grande azul) aparece en un punto aleatorio del mapa cada 2-3 minutos.
    * **Interacción:** El jugador debe volar cerca del Hangar y mantener la posición por 3 segundos para acceder.
    * **UI:** Un menú `overlay` (superposición) aparece con opciones para construir naves.
    * **Costo:** La construcción de naves requiere materiales.
* **Tipos de Naves Aliadas (para Construir):**
    * **SCOUT (Triángulo Pequeño):** Costo 10 Materiales. Rápido, bajo daño, enfocado en enemigos pequeños.
    * **GUARDIAN (Círculo):** Costo 25 Materiales. Tanque, alta HP, protege al comandante, disparo lento.
    * **GUNSHIP (Rectángulo):** Costo 20 Materiales. Daño medio, disparo rápido, versátil.
    * **HEAVY (Hexágono):** Costo 40 Materiales. Lento, alto daño, ideal contra Jefes.
    * **SUPPORT (Diamante):** Costo 30 Materiales. Cura naves aliadas cercanas, puede dar un `boost` temporal de defensa o ataque a una nave aliada.

### 3.5. Sistema de Recursos y Recolección

* **Materiales:**
    * **Obtención:** Enemigos derrotados sueltan cristales (cuadrados brillantes).
    * **Recolección:** Automática al pasar cerca.
    * **Almacenamiento:** Sin límite (mostrado en el HUD).
    * **Bonus:** Enemigos más fuertes/Jefes sueltan más materiales.

### 3.6. Sistema de Power-ups (Al subir de Nivel)

* Al alcanzar un nuevo nivel, el jugador elige 1 de 3 mejoras aleatorias.
    * **Mejoras de Comandante:**
        * Velocidad de movimiento +15%.
        * `Cooldowns` de habilidades -20%.
        * +Resistencia al daño.
    * **Mejoras de Flota:**
        * +10% daño a toda la flota.
        * +15% velocidad de disparo de la flota.
        * Formación más compacta (+defensa de la formación).
    * **Mejoras Especiales:**
        * Nueva nave gratis (tipo aleatorio).
        * +50% materiales por 60 segundos.
        * Escudo regenerativo (para el Comandante o toda la flota).

## 4. Estructura Técnica (Clases y Bucle de Juego)

### 4.1. Clases Principales (JavaScript)

* `class Game`:
    * Bucle principal (`game loop`), gestión de estados del juego (Menú, Jugando, Pausa, Game Over, Hangar), gestión de `timers` de oleadas y aparición de hangares.
    * Contiene instancias de `Fleet`, `EnemyWave`, `Hangar`, `PowerUpSystem`.
* `class Fleet`:
    * Gestiona todas las naves aliadas (excepto el Comandante).
    * Controla las formaciones y la IA básica de las naves de la flota.
* `class Ship`:
    * Clase base abstracta para todas las naves (Comandante, Flota, Enemigos).
    * Propiedades comunes: posición (`x, y`), HP, velocidad, tipo de disparo, referencias a imágenes/sprites.
    * Métodos comunes: `update()`, `render()`, `takeDamage()`, `fire()`.
* `class EnemyWave`:
    * Responsable del `spawning` de enemigos según la oleada actual.
    * Gestiona el escalado de dificultad de los enemigos.
    * Maneja la lógica de aparición de Jefes.
* `class Hangar`:
    * Controla la aparición periódica del Hangar.
    * Gestiona la UI de construcción de naves.
    * Lógica para añadir naves a la flota una vez construidas.
* `class PowerUpSystem`:
    * Maneja la lógica de nivelación del jugador.
    * Presenta y aplica las mejoras de `power-up` elegidas.

### 4.2. Game Loop Principal (`requestAnimationFrame`)

* **`Update()`:**
    * Mover todas las entidades (Comandante, flota, enemigos, proyectiles, materiales, efectos).
    * Actualizar estados lógicos (cooldowns, timers, IA).
* **`Combat()`:**
    * Detectar colisiones entre proyectiles y naves, y entre naves y naves/entorno.
    * Aplicar daño, activar explosiones.
* **`Spawn()`:**
    * Generar enemigos según la lógica de la oleada actual (`EnemyWave`).
    * Controlar la aparición de Hangares.
* **`Collection()`:**
    * Detectar la proximidad del Comandante a los materiales y recogerlos.
* **`Render()`:**
    * Dibujar todas las entidades visibles, el fondo, los efectos y el HUD en el `canvas`.

## 5. Elementos Visuales y Audio

### 5.1. Fondo Espacial

* **Capas de Parallax:** 3 o más capas de estrellas con diferentes velocidades para crear profundidad.
* **Nebulosas:** Sutiles gradientes circulares y formas etéreas que se desplazan lentamente.
* **Partículas:** Pequeñas partículas espaciales flotando para dar vida al entorno.

### 5.2. Efectos de Combate

* **Disparos:** Líneas simples con un `trail` (rastro) para indicar velocidad.
* **Explosiones:** Partículas que se expanden y desvanecen rápidamente, simulando escombros o energía.
* **Escudos:** Círculos o auras semitransparentes y pulsantes alrededor de las naves.
* **Propulsión:** Líneas o chispas que se extienden desde los propulsores de las naves.

### 5.3. HUD y UI

* **Parte Superior:** HP del Comandante, Cantidad de Materiales, Oleada Actual.
* **Parte Inferior:** `Cooldowns` visuales de las habilidades del Comandante.
* **Minimapa (Opcional a futuro):** Pequeño mapa en la esquina para ver posiciones de enemigos y hangares.
* **Menú Hangar:** Overlay con botones para construir naves y mostrar costos.
* **Menú Nivelación:** Overlay con las 3 opciones de `power-up` a elegir.
* **Pantallas de Estado:** Menú principal, pausa, game over.

### 5.4. Audio (Objetivo a Futuro)

* Música de fondo ambiental y de combate que se adapte al ritmo.
* Efectos de sonido para disparos, explosiones, recogida de materiales, habilidades, UI.

## 6. Retos Técnicos y Soluciones Anticipadas

### 6.1. Rendimiento del Canvas2D

* **Optimización:** Implementar **Object Pooling** para disparos, explosiones y partículas.
* **Renderizado:** Solo dibujar entidades visibles en el `viewport`.
* **Resolución:** Posibilidad de dibujar en una resolución interna y escalar al `canvas` final si el rendimiento es un problema.

### 6.2. Gestión de Entidades

* **Estructura de Datos:** Usar `Arrays` simples para iteración rápida de entidades activas.
* **Limpieza:** Mecanismos robustos para eliminar objetos inactivos o fuera de pantalla.

### 6.3. Detección de Colisiones

* **Algoritmo Principal:** **Colisiones Circulares** para la mayoría de las naves y proyectiles por su eficiencia.
* **Optimización de Búsqueda:** Considerar **Particionamiento Espacial** (e.g., una cuadrícula simple) para reducir el número de comprobaciones de colisiones en mapas grandes y con muchas entidades.

### 6.4. Generación de Mapa Procedural

* **Manejo de Chunks:** Generar elementos de fondo (estrellas, nebulosas) en `chunks` o tiles a medida que el jugador se mueve para crear un mundo aparentemente infinito sin generar todo de golpe.
* **Reutilización:** `Parallax` de fondo que se repite o "teletransporta" para simular movimiento continuo.

### 6.5. Gestión del Estado del Juego y la Lógica

* **Máquina de Estados (`Game State Machine`):** La clase `Game` controlará explícitamente los estados (Menú, Jugando, Pausa, etc.) para modular la lógica y el `rendering`.
* **Configuración Externa:** Valores de balance de juego (HP, daño, costos) almacenados en un objeto de configuración (`config.js`) para facilitar ajustes.

---
