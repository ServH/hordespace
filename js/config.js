/**
 * Space Horde Survivor - Configuración Global Refactorizada
 * Estructura organizada en objetos anidados para mejor mantenibilidad
 * Fase 5.5.4.1: Refactorización Estructural Completa con PROJECTILE_TYPES
 */

window.CONFIG = {
    // === DIMENSIONES DEL CANVAS ===
    CANVAS: {
        WIDTH: window.innerWidth,
        HEIGHT: window.innerHeight
    },

    // === CONFIGURACIÓN DEL COMANDANTE (JUGADOR) ===
    PLAYER: {
        HP: 100,
        SPEED: 280,                    // Velocidad máxima
        ACCELERATION: 300,             // Píxeles por segundo² (ahora controla todo el movimiento)
        FRICTION: 0.85,                // Factor de fricción (0-1)
        ROTATION_SPEED: 5,             // Radianes por segundo
        RADIUS: 15,                    // Radio de colisión
        FIRE_RATE: 0.5,                // Segundos entre disparos
        PROJECTILE_TYPE_ID: 'PLAYER_LASER', // Referencia al ID del proyectil
        COLOR: '#00FF00',              // Color verde del comandante
        TRAIL_TYPE: 'PLAYER_DEFAULT',  // Tipo de estela para el jugador
        
        // === REFACTORIZACIÓN: CONFIGURACIÓN DE MODOS DE APUNTADO ===
        AIM_MODES: ['MANUAL', 'AUTO'], // Modos disponibles para ciclar
        AIM_DEFAULT_MODE: 'MANUAL',     // Modo por defecto al iniciar
        AIM_TOGGLE_KEY: 'KeyM',         // Tecla para cambiar de modo
        AIM_SMOOTHING_FACTOR: 0.2,      // Suavizado para el modo MANUAL
        AUTO_AIM_ROTATION_SPEED: 7,     // Velocidad de giro para el modo AUTO

        // === NUEVO: CONFIGURACIÓN DE HABILIDADES ===
        ABILITIES: {
            DASH: {
                KEY: 'Space',      // Tecla para activar el Dash
                FORCE: 60000,      // ¡Una fuerza masiva para un impulso instantáneo!
                DURATION: 0.1,    // Segundos que dura el impulso
                COOLDOWN: 2.5      // Segundos de espera para volver a usarlo
            },
            BRAKE: {
                KEY: 'ShiftLeft',           // Tecla para activar el Freno
                BRAKE_FORCE_MULTIPLIER: 5.0 // Un valor alto para un frenado potente
            },
            AUTO_AIM_RANGE: 600    // Rango de 600 píxeles para el auto-apuntado
        }
    },

    // === CONFIGURACIÓN DE ENEMIGOS ===
    ENEMY: {
        DEFAULT: {
            HP: 40,                    // HP unificado
            SPEED: 120,                // Píxeles por segundo
            ACCELERATION: 400,         // Píxeles por segundo²
            FRICTION: 0.90,            // Factor de fricción
            ROTATION_SPEED: 4,         // Radianes por segundo
            RADIUS: 10,                // Radio de colisión
            DAMAGE: 15,                // Daño por contacto
            XP_VALUE: 30,             // XP base por enemigo
            COLOR: '#FF4444',          // Color rojo de enemigos
            SPAWN_RATE_INITIAL: 2.0,   // Segundos entre spawns iniciales
            PROJECTILE_TYPE_ID: 'BASIC_ENEMY_BULLET', // Referencia al ID del proyectil
            TYPE_ID: 'default',        // Identificador de tipo
            // --- NUEVAS PROPIEDADES DE ENJAMBRE ---
            SEPARATION_RADIUS: 35,     // Radio en píxeles para detectar a otros enemigos
            SEPARATION_FORCE: 1.25     // Multiplicador de la fuerza de separación
        },
        // --- NUEVO ENEMIGO ÉLITE ---
        ELITE: {
            HP: 120,                   // El triple de vida que el normal
            SPEED: 100,                // Ligeramente más lento
            ACCELERATION: 200,
            FRICTION: 0.90,
            ROTATION_SPEED: 3.0,
            RADIUS: 18,                // Un 80% más grande
            DAMAGE: 25,                // Más dañino
            XP_VALUE: 75,
            COLOR: '#FF88FF',          // Un color magenta/rosa para que destaque
            PROJECTILE_TYPE_ID: 'BASIC_ENEMY_BULLET',
            TYPE_ID: 'elite'           // Identificador de tipo
        }
    },

    // === CONFIGURACIÓN DE NAVES ALIADAS ===
    ALLY: {
        DEFAULT: {
            HP: 60,
            SPEED: 450,
            ACCELERATION: 800,
            FRICTION: 0.98,
            ROTATION_SPEED: 3,
            RADIUS: 8,
            COLOR: '#00FFFF',
            DAMAGE: 18,
            FIRE_RATE: 0.7,
            AI: {
                TARGETING_RANGE: 500,
                ROTATION_SPEED_COMBAT: 1.5,     // FASE 5.5.3: Aumento para autoapuntado perceptible
                FIRE_CONE_ANGLE: Math.PI / 2,   // FASE 5.5.3: 90 grados - cono muy amplio para disparo efectivo
                TARGETING_PREFERENCE: 'NEAREST' // Por defecto, priorizan al más cercano
            },
            XP_VALUE: 10,
            TYPE: 'defaultAlly',
            PROJECTILE_TYPE_ID: 'ALLY_DEFAULT_SHOT' // Referencia al ID del proyectil
        },
        SCOUT: {
            HP: 45,                    // Más frágil que default
            SPEED: 500,                // Más rápido que default
            ACCELERATION: 900,         // Más ágil que default
            FRICTION: 0.96,            // Más deslizante que default
            ROTATION_SPEED: 4,         // Más rápido que default
            RADIUS: 7,                 // Más pequeño que default
            COLOR: '#00AAFF',          // Azul claro distintivo
            DAMAGE: 15,                // Menos daño que default
            FIRE_RATE: 0.25,           // LLUVIA DE AGUJAS: Dispara 4 veces por segundo
            AI: {
                TARGETING_RANGE: 550,   // Mayor rango que default
                ROTATION_SPEED_COMBAT: 1.5,     // FASE 5.5.3: Hereda rotación de combate
                FIRE_CONE_ANGLE: Math.PI / 2,   // FASE 5.5.3: 90 grados - cono amplio para disparo efectivo
                TARGETING_PREFERENCE: 'LOWEST_HP' // Los Scouts priorizan a los enemigos más débiles
            },
            XP_VALUE: 5,               // Menos XP que default
            TYPE: 'scout',
            PROJECTILE_TYPE_ID: 'ALLY_SCOUT_SHOT', // Referencia al ID del proyectil
            TRAIL_TYPE: 'ALLY_SCOUT',   // Tipo de estela para el scout
            PREFERRED_RING: 'outer'    // Los scouts van en el anillo exterior
        },
        GUNSHIP: {
            HP: 80,                    // Más resistente que default
            SPEED: 400,                // Más lento que default
            ACCELERATION: 700,         // Menos ágil que default
            FRICTION: 0.99,            // Más estable que default
            ROTATION_SPEED: 2.5,       // Más lento que default
            RADIUS: 10,                // Más grande que default
            COLOR: '#FF6600',          // Naranja distintivo
            DAMAGE: 28,                // Más daño que default
            FIRE_RATE: 1.5,            // Más lento que default
            AI: {
                TARGETING_RANGE: 450,   // Menor rango que default
                ROTATION_SPEED_COMBAT: 1.5,     // FASE 5.5.3: Hereda rotación de combate
                FIRE_CONE_ANGLE: Math.PI / 2,   // FASE 5.5.3: 90 grados - cono amplio para disparo efectivo
                TARGETING_PREFERENCE: 'HIGHEST_HP' // Las Gunships priorizan a los más resistentes
            },
            XP_VALUE: 8,               // Más XP que default
            TYPE: 'gunship',
            PROJECTILE_TYPE_ID: 'ALLY_GUNSHIP_CANNON', // Referencia al ID del proyectil
            TRAIL_TYPE: 'ALLY_GUNSHIP', // Tipo de estela para el gunship
            PREFERRED_RING: 'inner'    // Las gunships van en el anillo interior
        }
    },

    // === CONFIGURACIÓN DE FORMACIÓN DE FLOTA ===
    FORMATION: {
        // --- NUEVA ESTRUCTURA DE FORMACIONES ---
        MODES: {
            // Cada objeto es un modo de formación que podemos activar
            CIRCLE: {
                TYPE: 'CIRCLE',
                RINGS: [ // Los anillos que ya teníamos
                    { id: 'inner', radius: 60, maxShips: 6 },
                    { id: 'outer', radius: 100, maxShips: 12 }
                ]
            },
            V_SHAPE: {
                TYPE: 'V_SHAPE',
                SPREAD_ANGLE: Math.PI / 6, // 30 grados de apertura de la V
                DISTANCE_STEP: 45          // 45 píxeles de separación entre naves
            }
        },
        DEFAULT_MODE: 'CIRCLE', // Modo de formación por defecto
        FORMATION_CYCLE_KEY: 'KeyF', // Tecla para cambiar formaciones
        
        // --- CATÁLOGO DE BONOS DE FORMACIÓN ---
        FORMATION_BONUSES: {
            // Cada objeto es un bono que se puede activar.
            // El jugador empezará con 'REPAIR' activo por defecto.
            REPAIR: {
                id: 'REPAIR',
                description: 'Regeneración de casco lenta',
                auraColor: '#00FF00', // Verde para la reparación
                healthRegen: 1 // 1 HP por segundo
            },
            FIRE_RATE: {
                id: 'FIRE_RATE',
                description: 'Aumento de cadencia de disparo',
                auraColor: '#FFD700', // Dorado para el ataque
                multiplier: 0.75 // 25% más rápido (0.8 -> 0.6)
            },
            DAMAGE: {
                id: 'DAMAGE',
                description: 'Aumento de daño de proyectiles',
                auraColor: '#FF4444', // Rojo para el daño
                multiplier: 1.25 // 25% más de daño
            },
            SHIELD: {
                id: 'SHIELD',
                description: 'Escudo de energía que absorbe un impacto',
                auraColor: '#00FFFF' // Cian para el escudo
            }
        },
        
        // Comportamiento de vuelo (los valores que ya teníamos)
        BEHAVIOR: {
            FOLLOW_STRENGTH: 5000,
            DAMPING: 0.85,
            MAX_CORRECTION_FORCE: 40000,
            CORRECTION_THRESHOLD: 50,
            SMOOTHING_FACTOR: 1,
            ROTATION_SYNC: true,
            VELOCITY_THRESHOLD: 5,
            SPEED_ADAPTATION_MAX_FACTOR: 1.5,
            DISTANCE_FACTOR_THRESHOLD: 70,
            DISTANCE_FACTOR_MAX: 1.0,
            VELOCITY_DAMPING_FACTOR: 0.08,
            CORRECTION_STRENGTH_DISTANCE_THRESHOLD: 300,
            CORRECTION_STRENGTH_MAX_FACTOR: 0.5,
            ANGULAR_SEPARATION: Math.PI / 18
        },
        
        FORMATION_BONUS_TOLERANCE: 40 // Distancia máxima para considerar formación estable
    },

    // === CONFIGURACIÓN DE PROYECTILES ===
    PROJECTILE: {
        BOUNDS_MARGIN: 50,
        // Definiciones detalladas de tipos de proyectiles por ID
        PROJECTILE_TYPES: {
            PLAYER_LASER: {
                DAMAGE: 25,
                SPEED: 500,
                RADIUS: 8,                    // Aumentado de 3 a 8 para mejor hitbox
                COLOR: '#FFFFFF',             // Color blanco puro
                VISUAL_TYPE: 'laser',
                TRAIL_EFFECT: 'basic',
                TRAIL_LENGTH: 8,
                LIFETIME: 2.0,
                LINE_WIDTH: 6,                // Aumentado de 3 a 6 para más grosor
                GLOW_RADIUS_MULTIPLIER: 2.0,  // Aumentado de 1.0 a 2.0 para más brillo
                INNER_CORE_RADIUS_MULTIPLIER: 0.5, // Nuevas propiedades para efecto de brillo
                GLOW_COLOR: '#00FFFF',        // Cyan brillante como en películas de sci-fi
                GLOW_BLUR: 15,                // Intensidad del brillo
                SIZE: { width: 2, height: 12 }, // Tamaño visual ajustado
                PIERCE: 0,                    // Perforación inicial (0 por defecto)
                bounces: 0                    // Rebotes iniciales (0 por defecto)
            },
            ALLY_DEFAULT_SHOT: {
                DAMAGE: 18,
                SPEED: 450,
                RADIUS: 8,
                COLOR: '#00FFFF',
                VISUAL_TYPE: 'bullet',
                TRAIL_EFFECT: 'basic',
                TRAIL_LENGTH: 5,
                LIFETIME: 1.5,
                LINE_WIDTH: 4,
                GLOW_RADIUS_MULTIPLIER: 0.8,
                INNER_CORE_RADIUS_MULTIPLIER: 0.4,
                GLOW_COLOR: '#00FFFF'         // Color de brillo cyan
            },
            ALLY_SCOUT_SHOT: {
                DAMAGE: 15,
                SPEED: 800,                 // Aumentamos la velocidad para que se sienta aún más rápido
                RADIUS: 3,                  // Reducimos el radio de colisión para que sea más fino
                COLOR: '#00AAFF',
                VISUAL_TYPE: 'needle',      // ¡CAMBIO CLAVE! Nuevo tipo visual
                TRAIL_EFFECT: 'short',
                TRAIL_LENGTH: 5,
                LIFETIME: 1.0,              // Reducimos el tiempo de vida por su alta velocidad
                LINE_WIDTH: 4,
                GLOW_RADIUS_MULTIPLIER: 0.8,
                INNER_CORE_RADIUS_MULTIPLIER: 0.4,
                // --- NUEVAS PROPIEDADES VISUALES ---
                SIZE: { width: 2, height: 12 }, // Define la forma de aguja: 2px de ancho, 12px de largo
                GLOW_COLOR: '#FFFFFF',      // Brillo blanco para contraste
                GLOW_BLUR: 8                // Brillo suave
            },
            ALLY_GUNSHIP_CANNON: {
                DAMAGE: 35,                 // Aumentado de 28 - Más devastador
                SPEED: 350,                 // Reducido de 400 - Proyectil más pesado
                RADIUS: 8,                  // Aumentado de 5 - Proyectil más grande
                COLOR: '#FF6600',
                VISUAL_TYPE: 'orb',
                TRAIL_EFFECT: 'heavy',
                TRAIL_LENGTH: 10,
                LIFETIME: 2.5,
                LINE_WIDTH: 0,
                GLOW_RADIUS_MULTIPLIER: 1.5, // Aumentado para más brillo
                INNER_CORE_RADIUS_MULTIPLIER: 0.6,
                // --- NUEVAS PROPIEDADES DE AOE ---
                HAS_AOE_ON_IMPACT: true,    // Flag para que el sistema sepa que tiene AoE
                AOE_RADIUS: 50,             // Radio del daño en área
                AOE_DAMAGE: 15              // Daño que hace la explosión a los enemigos cercanos
            },
            BASIC_ENEMY_BULLET: {
                DAMAGE: 10,
                SPEED: 300,
                RADIUS: 4,
                COLOR: '#FF4444',
                VISUAL_TYPE: 'bullet',
                TRAIL_EFFECT: 'basic',
                TRAIL_LENGTH: 6,
                LIFETIME: 3.0,
                LINE_WIDTH: 1,
                GLOW_RADIUS_MULTIPLIER: 0.9,
                INNER_CORE_RADIUS_MULTIPLIER: 0.5,
                GLOW_COLOR: '#FF4444'         // Color de brillo rojo
            },
            // --- RAYO DESINTEGRADOR ---
            DISINTEGRATOR_RAY: {
                DAMAGE: 5, // Daño bajo, pero tickea muy rápido
                SPEED: 0,  // No se mueve
                RADIUS: 5, // Ancho del rayo
                COLOR: '#FF00FF', // Magenta/fucsia
                VISUAL_TYPE: 'beam',
                LIFETIME: 0.1, // Vida muy corta, se redibuja constantemente
                PIERCE: Infinity, // Atraviesa todo
                fireRate: 0.05 // <-- Disparará 20 veces por segundo!
            },
            // --- CHAIN LIGHTNING ---
            CHAIN_LIGHTNING: {
                DAMAGE: 15,
                SPEED: 700,
                RADIUS: 10, // Un hitbox generoso
                COLOR: '#7DF9FF', // Un color azul eléctrico
                VISUAL_TYPE: 'chain_lightning', // Nuevo tipo visual
                LIFETIME: 2.0,
                bounces: 3, // Por defecto, rebota 3 veces
                PIERCE: 0 // No atraviesa, solo rebota
            }
        }
    },

    // === CONFIGURACIÓN DE MATERIALES ===
    MATERIAL: {
        RADIUS: 8,
        COLOR: '#CCCCCC', // Cambiado a gris claro/blanco roto
        ATTRACTION_RADIUS: 150,
        ATTRACTION_FORCE: 0.8,
        ATTRACTION_ACCELERATION: 0.15,
        MAX_SPEED: 3,
        LIFETIME: 15000,
        SPAWN_RATE: 0.3,
        DROP_CHANCE: 0.4
    },

    // === SISTEMA DE EXPERIENCIA Y POWER-UPS ===
    POWER_UP_SYSTEM: {
        XP_CURVE: {
            // La XP necesaria para el primer nivel (de 1 a 2).
            BASE_REQUIREMENT: 80,
            
            // Un multiplicador que se aplica en cada nivel.
            // Un valor ligeramente mayor que 1 crea un crecimiento suave.
            LEVEL_MULTIPLIER: 1.25, 
            
            // El exponente que define la "curva". Un valor más alto hace que
            // los niveles tardíos cuesten muchísimo más. 1.8 es un buen punto de partida.
            EXPONENT: 1.8 
        },
        XP_BASE: 10,                   // XP base por acción (se mantiene)
        XP_SCALING: 1.5                // Multiplicador de XP por nivel (se mantiene)
    },

    // === CONFIGURACIÓN DE OLEADAS ===
    WAVE_MANAGER: {
        ENEMIES_BASE: 5,               // Enemigos base por oleada
        ENEMIES_INCREMENT: 2,          // Incremento de enemigos
        BREAK_TIME: 3.0,               // Segundos entre oleadas
        WAVES_PER_CYCLE: 10,           // Oleadas por ciclo
        DIFFICULTY_HP_SCALING: 1.2,    // +20% HP por ciclo
        DIFFICULTY_DAMAGE_SCALING: 1.2 // +20% daño por ciclo
    },

    // === DIRECTOR DE JUEGO (PROGRESIÓN POR TIEMPO) ===
    GAME_DIRECTOR_TIMELINE: [
        {
            // Fase 1: Inicio tranquilo (0 a 30 segundos)
            startTime: 0,
            enemyPool: [{ type: 'default', weight: 100 }], // Solo enemigos básicos
            spawnRate: 0.5, // 0.5 enemigos por segundo (1 cada 2 segundos)
            maxEnemies: 5,  // Máximo 5 enemigos de este tipo en pantalla
            difficultyMultiplier: 1.0
        },
        {
            // Fase 2: Aumenta la presión (30 a 90 segundos)
            startTime: 30,
            enemyPool: [{ type: 'default', weight: 100 }],
            spawnRate: 1.5, // 1.5 enemigos por segundo
            maxEnemies: 15,
            difficultyMultiplier: 1.1 // Enemigos un 10% más fuertes
        },
        {
            // Fase 3: Introducción de aliados (a partir de 90 segundos)
            // Aquí podríamos introducir un nuevo tipo de enemigo si lo tuviéramos.
            // Por ahora, solo aumentamos la intensidad.
            startTime: 90,
            enemyPool: [{ type: 'default', weight: 100 }],
            spawnRate: 3.0, // 3 enemigos por segundo
            maxEnemies: 30,
            difficultyMultiplier: 1.25 // Enemigos un 25% más fuertes
        },
        {
            // Fase 4: Caos controlado (a partir de 180 segundos o 3 minutos)
            startTime: 180,
            enemyPool: [{ type: 'default', weight: 100 }],
            spawnRate: 5.0, // 5 enemigos por segundo
            maxEnemies: 50,
            difficultyMultiplier: 1.5 // Enemigos un 50% más fuertes
        }
        // El juego terminará a los 300 segundos (5 minutos)
    ],

    // === TAMAÑOS DE OBJECT POOLS ===
    POOL_SIZES: {
        PROJECTILES: 200,              // Aumentado de 100 a 200 - Máximo proyectiles simultáneos
        EXPLOSIONS: 100,               // Aumentado de 50 a 100 - Máximo explosiones simultáneas
        PARTICLES: 500,                // Aumentado de 200 a 500 - Máximo partículas simultáneas
        MATERIALS: 100,                // Aumentado de 50 a 100 - Máximo materiales en pantalla
        ENEMIES: 50                    // Aumentado de 30 a 50 - Máximo enemigos simultáneos
    },

    // === CONFIGURACIÓN DE EXPLOSIONES ===
    EXPLOSION_EFFECTS: {
        DURATION: 0.5,                 // Segundos de duración
        COLORS: ['#FF4444', '#FF8844', '#FFAA44', '#FFFF44'],
        PARTICLES: {
            MAX_COUNT: 12,
            MIN_SPEED: 50,
            SPEED_RANGE: 100,
            MIN_SIZE: 2,
            SIZE_RANGE: 4,
            MIN_LIFETIME: 0.3,
            LIFETIME_RANGE: 0.4,
            FRICTION: 0.95
        }
    },

    // === COSTOS DE NAVES ALIADAS (FUTURO) ===
    SHIP_COSTS: {
        SCOUT: 10,                     // Materiales
        GUARDIAN: 25,
        GUNSHIP: 20,
        HEAVY: 40,
        SUPPORT: 30
    },

    // === HABILIDADES DEL COMANDANTE (FUTURO) ===
    ABILITIES: {
        RALLY_COOLDOWN: 30,            // Segundos
        RALLY_DURATION: 10,            // Segundos
        SHIELD_COOLDOWN: 45,           // Segundos
        SHIELD_DURATION: 8,            // Segundos
        FORMATION_STRIKE_COOLDOWN: 20  // Segundos
    },

    // === LISTA MAESTRA DE POWER-UPS (ÚNICA FUENTE) ===
    POWER_UP_DEFINITIONS: [
        // --- Mejoras del Comandante ---

        // TIPO 1: DEFENSIVO
        {
            id: 'speed_boost',
            name: 'Propulsores Mejorados',
            description: 'Velocidad +15%',
            type: 'Commander',
            category: 'Defensive',
            maxLevel: 5,
            effect: { prop: 'maxSpeed', multiplier: 1.15 }
        },
        {
            id: 'health_boost',
            name: 'Blindaje Reforzado',
            description: 'HP Máximo +25',
            type: 'Commander',
            category: 'Defensive',
            maxLevel: 5,
            effect: { prop: 'maxHp', additive: 25 }
        },
        {
            id: 'acceleration_boost',
            name: 'Motores Potenciados',
            description: 'Aceleración +20%',
            type: 'Commander',
            category: 'Defensive',
            maxLevel: 5,
            effect: { prop: 'acceleration', multiplier: 1.2 }
        },
        {
            id: 'health_regen',
            name: 'Reparación Automática',
            description: 'Regenera 1 HP/seg',
            type: 'Commander',
            category: 'Defensive',
            maxLevel: 1,
            effect: { prop: 'healthRegen', additive: 1 }
        },

        // TIPO 2: OFENSIVO
        {
            id: 'fire_rate_boost',
            name: 'Sistema de Disparo Rápido',
            description: 'Cadencia +25%',
            type: 'Commander',
            category: 'Offensive',
            maxLevel: 5,
            effect: { prop: 'fireRate', multiplier: 0.8 }
        },
        {
            id: 'damage_boost',
            name: 'Proyectiles Mejorados',
            description: 'Daño +20%',
            type: 'Commander',
            category: 'Offensive',
            maxLevel: 5,
            effect: { prop: 'damage', multiplier: 1.2 }
        },
        {
            id: 'pierce_shot',
            name: 'Proyectiles de Plasma',
            description: 'Tus disparos atraviesan\n1 enemigo adicional.',
            type: 'Commander',
            category: 'Offensive',
            maxLevel: 3,
            effect: { prop: 'pierce', additive: 1 }
        },
        {
            id: 'chain_lightning',
            name: 'Bobina de Tesla',
            description: 'Tus proyectiles rebotan a\n1 enemigo cercano.',
            type: 'Commander',
            category: 'Offensive',
            maxLevel: 5, // Podrá rebotar hasta 5 veces si se mejora
            effect: { prop: 'bounces', additive: 1 }
        },
        {
            id: 'equip_chain_lightning',
            name: 'Cañón de Iones',
            description: 'Transforma tu arma principal.\nDispara un rayo que rebota\nentre enemigos.',
            type: 'Commander', // Es una mejora del comandante
            category: 'Offensive',
            maxLevel: 1, // Es un cambio de arma, solo se coge una vez
            effect: { 
                type: 'CHANGE_WEAPON', // Un nuevo tipo de efecto que vamos a implementar
                newProjectileTypeId: 'CHAIN_LIGHTNING' 
            }
        },

        // TIPO 3: FLOTA
        {
            id: 'add_scout',
            name: 'Añadir Nave: Explorador',
            description: 'Scout rápido y ágil',
            type: 'Fleet',
            category: 'Fleet',
            maxLevel: 4,
            effect: { prop: 'addShip', value: 'scout' }
        },
        {
            id: 'add_gunship',
            name: 'Añadir Nave: Cañonera',
            description: 'Gunship resistente y letal',
            type: 'Fleet',
            category: 'Fleet',
            maxLevel: 4,
            effect: { prop: 'addShip', value: 'gunship' }
        },
        
        // --- BONOS DE FORMACIÓN ---
        {
            id: 'unlock_formation_repair',
            name: 'Protocolo de Nanobots',
            description: 'Mientras la formación está estable,\nregeneras 1 HP por segundo.',
            type: 'FormationUnlock',
            category: 'Defensive',
            maxLevel: 1,
            effect: { bonusId: 'REPAIR' }
        },
        {
            id: 'unlock_formation_firerate',
            name: 'Sincronizador de Disparo',
            description: 'Mientras la formación está estable,\nla cadencia de disparo aumenta un 25%.',
            type: 'FormationUnlock',
            category: 'Offensive',
            maxLevel: 1,
            effect: { bonusId: 'FIRE_RATE' }
        },
        {
            id: 'unlock_formation_damage',
            name: 'Amplificador de Flota',
            description: 'Mientras la formación está estable,\nel daño de todas las armas aumenta un 25%.',
            type: 'FormationUnlock',
            category: 'Offensive',
            maxLevel: 1,
            effect: { bonusId: 'DAMAGE' }
        },

        // TIPO 4: UTILIDAD
        {
            id: 'material_magnet',
            name: 'Imán de Materiales',
            description: 'Radio de recolección +50%',
            type: 'Special',
            category: 'Utility',
            maxLevel: 3,
            effect: { prop: 'collectionRadius', multiplier: 1.5 }
        },
        {
            id: 'xp_boost',
            name: 'Analizador Táctico',
            description: 'XP +25%',
            type: 'Special',
            category: 'Utility',
            maxLevel: 3,
            effect: { prop: 'xpMultiplier', multiplier: 1.25 }
        },
        {
            id: 'material_boost',
            name: 'Extractor Eficiente',
            description: 'Materiales +50%',
            type: 'Special',
            category: 'Utility',
            maxLevel: 3,
            effect: { prop: 'materialMultiplier', multiplier: 1.5 }
        }
    ],

    // === CONFIGURACIÓN DE DEBUG ===
    DEBUG: {
        FLEET_INFO: true,              // Mostrar información de debug de la flota
        SHOW_AI_TARGETS: false          // Mostrar líneas de objetivo de IA
    },

    // === CONFIGURACIÓN DE TIPOS DE ESTELAS ===
    TRAIL_TYPES: {
        PLAYER_DEFAULT: {
            color: '#66ff99',
            glowColor: '#ffffff',
            width: 4,
            maxLength: 40,
            fadeType: 'linear',
            emitterSize: 5, // Tamaño base del emisor
            useAdvancedGlow: true // Efectos avanzados para el jugador
        },
        ALLY_SCOUT: {
            color: '#44DDFF',
            glowColor: '#aaffff',
            width: 2.5,
            maxLength: 25,
            fadeType: 'linear',
            emitterSize: 3, // Un emisor más pequeño para el Scout
            useAdvancedGlow: true // Efectos avanzados para aliados
        },
        ALLY_GUNSHIP: {
            color: '#FF8800',
            glowColor: '#ffcc66',
            width: 5,
            maxLength: 35,
            fadeType: 'exponential',
            emitterSize: 7, // Un emisor más grande para la Gunship
            useAdvancedGlow: true // Efectos avanzados para aliados
        },
        ENEMY_DEFAULT: {
            color: '#553333',         // Un color rojo oscuro, casi marrón
            glowColor: '#FF4444',     // Un rojo apagado para el gradiente
            width: 2,                 // Muy fina
            maxLength: 18,            // Bastante corta
            fadeType: 'linear',
            emitterSize: 0,           // Sin emisor
            useAdvancedGlow: false    // NUEVA BANDERA CLAVE para renderizado optimizado
        }
    }
};

// Hacer CONFIG accesible globalmente
console.log("✅ CONFIG cargado:", CONFIG); 