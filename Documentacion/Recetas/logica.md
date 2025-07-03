
### **El Plan Arquitectónico: Sinergias y Evoluciones**

Tu visión se traduce en los siguientes componentes técnicos que implementaremos paso a paso:

1.  **Categorización de Power-ups:** Formalizaremos tus 4 categorías (Defensivo, Ofensivo, Flota, Especiales) directamente en la configuración. Esto es sencillo y nos dará la estructura que necesitamos.
2.  **Un Nuevo Archivo de "Recetas" (`evolutions.js`):** Tu idea de un config aislado es brillante. Crearemos un nuevo archivo que actuará como un libro de recetas. Cada "receta" definirá una evolución: qué ingredientes (power-ups/naves) se necesitan y cuál es el resultado (la nueva arma o nave evolucionada).
3.  **Un "Chef" - El `SynergyManager`:** Crearemos un nuevo sistema, un gestor de sinergias, cuya única misión será leer el libro de recetas y comprobar constantemente si el jugador tiene los "ingredientes" necesarios para cocinar una evolución.
4.  **Modificación del `PowerUpSystem`:** Haremos dos cambios clave en este sistema:
      * **Lógica de Selección 3 de 4:** Implementaremos tu regla para que la selección de power-ups sea más variada y estratégica.
      * **Comunicación con el Chef:** Antes de mostrar las opciones, el `PowerUpSystem` le preguntará al `SynergyManager`: "*Hey, ¿hay alguna evolución lista para preparar?*". Si la hay, la añadirá a la pool de "Especiales".

Vamos a ver cómo se materializaría esto.

-----

### **Paso 1 (Diseño): La Estructura de Datos**

Antes de escribir una línea de código, definamos cómo se verán nuestras "recetas". Un buen diseño de datos aquí nos ahorrará mucho trabajo después.

#### 1.1. Categorías en `config.js`

Simplemente añadiremos una nueva propiedad `category` a cada power-up en `POWER_UP_DEFINITIONS`.

```javascript
// En js/config.js
{
    id: 'health_boost',
    name: 'Blindaje Reforzado',
    description: 'HP Máximo +25',
    type: 'Commander',
    category: 'Defensive', // <-- NUEVA PROPIEDAD
    effect: { prop: 'maxHp', additive: 25 }
},
{
    id: 'damage_boost',
    name: 'Proyectiles Mejorados',
    description: 'Daño +20%',
    type: 'Commander',
    category: 'Offensive', // <-- NUEVA PROPIEDAD
    effect: { prop: 'damage', multiplier: 1.2 }
},
// etc.
```

#### 1.2. El Libro de Recetas: `js/evolutions.js`

Crearíamos un nuevo archivo con una estructura como esta. Fíjate en lo legible que es:

```javascript
// Nuevo archivo: js/evolutions.js

export const EVOLUTION_RECIPES = [
    {
        id: 'evo_dreadnought',
        name: 'Evolucionar: Acorazado',
        description: 'La Cañonera evoluciona a una fortaleza móvil con un cañón de plasma de área.',
        type: 'Evolution',
        prerequisites: {
            ships: ['gunship'], // Requiere tener al menos una nave tipo 'gunship'
            powerups: ['damage_boost', 'health_boost'] // Y tener estos dos power-ups
        },
        effect: {
            type: 'EVOLVE_ALLY',
            from: 'gunship', // La nave que se transforma
            to: 'dreadnought' // La nueva nave que la reemplaza
        }
    },
    {
        id: 'evo_disintegrator_ray',
        name: 'Sinergia: Rayo Desintegrador',
        description: 'Combina el láser y los proyectiles de plasma en un rayo continuo que derrite a los enemigos.',
        type: 'Evolution',
        prerequisites: {
            powerups: ['pierce_shot', 'fire_rate_boost'] // Requiere tener perforación y cadencia
        },
        effect: {
            type: 'EVOLVE_WEAPON',
            newProjectileTypeId: 'DISINTEGRATOR_RAY' // Reemplaza el proyectil del jugador
        }
    }
];
```

-----

### **Paso 2 (Diseño): El Flujo de Ejecución**

Así es como todos los sistemas colaborarían cuando subes de nivel:

1.  **Level Up\!** Se activa el `PowerUpSystem`.
2.  **Consulta al Chef:** `PowerUpSystem` llama al `SynergyManager` y le pregunta: `getAvailableEvolutions(player)`.
3.  **Revisión de Ingredientes:** El `SynergyManager` revisa el inventario del jugador (sus naves y power-ups activos) y lo compara con todas las recetas en `evolutions.js`.
4.  **Evoluciones Listas:** El `SynergyManager` devuelve una lista de las evoluciones que el jugador puede realizar en este momento (por ejemplo, `['evo_dreadnought']`).
5.  **Preparación de la Pool:** El `PowerUpSystem` coge las evoluciones disponibles y las añade temporalmente a la pool de la categoría "Especiales".
6.  **Selección Aleatoria de Categorías:** Se eligen 3 de las 4 categorías al azar (Defensivo, Ofensivo, Flota, Especiales).
7.  **Selección Final de Opciones:** De cada una de las 3 categorías elegidas, se saca un power-up al azar para presentárselo al jugador.
8.  **Aplicación:** Si el jugador elige una mejora normal, se aplica como hasta ahora. Si elige una evolución, se ejecuta el `effect` especial (ej. `EVOLVE_ALLY`), que le dirá al `AllyFactory` que reemplace una nave o al `WeaponComponent` del jugador que cambie su tipo de proyectil.

**Tu visión es excelente.** Este plan la traduce en una arquitectura modular, data-driven y muy escalable que encaja perfectamente en el motor que ya hemos construido.

Si te parece bien este enfoque, podemos empezar con el primer paso de la implementación: **añadir la propiedad `category` a todos los power-ups existentes en `config.js` y crear el archivo `evolutions.js` con estas recetas de ejemplo.**