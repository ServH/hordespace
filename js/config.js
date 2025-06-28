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
        SPEED: 200,                    // Velocidad máxima
        ACCELERATION: 300,             // Píxeles por segundo²
        FRICTION: 0.85,                // Factor de fricción (0-1)
        ROTATION_SPEED: 5,             // Radianes por segundo
        RADIUS: 15,                    // Radio de colisión
        FIRE_RATE: 0.8,                // Segundos entre disparos
        PROJECTILE_TYPE_ID: 'PLAYER_LASER', // Referencia al ID del proyectil
        COLOR: '#00FF00',              // Color verde del comandante
        
        // === CONFIGURACIÓN DE CONTROL DE RATÓN (FASE 5.6) ===
        AIM_SMOOTHING_FACTOR: 0.2,     // Factor de suavizado para rotación hacia ratón
        MOUSE_AIM_TOGGLE_KEY: 'KeyM',  // Tecla para activar/desactivar control de ratón
        MOUSE_AIM_DEFAULT_ACTIVE: true // Control de ratón activo por defecto
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
            XP_VALUE: 100,             // XP base por enemigo
            COLOR: '#FF4444',          // Color rojo de enemigos
            SPAWN_RATE_INITIAL: 2.0,   // Segundos entre spawns iniciales
            PROJECTILE_TYPE_ID: 'BASIC_ENEMY_BULLET' // Referencia al ID del proyectil
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
            AI_TARGETING_RANGE: 500,
            ROTATION_SPEED_COMBAT: 1.5,     // FASE 5.5.3: Aumento para autoapuntado perceptible
            FIRE_CONE_ANGLE: Math.PI / 2,   // FASE 5.5.3: 90 grados - cono muy amplio para disparo efectivo
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
            FIRE_RATE: 0.5,            // Más rápido que default
            AI_TARGETING_RANGE: 550,   // Mayor rango que default
            ROTATION_SPEED_COMBAT: 1.5,     // FASE 5.5.3: Hereda rotación de combate
            FIRE_CONE_ANGLE: Math.PI / 2,   // FASE 5.5.3: 90 grados - cono amplio para disparo efectivo
            XP_VALUE: 5,               // Menos XP que default
            TYPE: 'scout',
            PROJECTILE_TYPE_ID: 'ALLY_SCOUT_SHOT' // Referencia al ID del proyectil
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
            FIRE_RATE: 0.9,            // Más lento que default
            AI_TARGETING_RANGE: 450,   // Menor rango que default
            ROTATION_SPEED_COMBAT: 1.5,     // FASE 5.5.3: Hereda rotación de combate
            FIRE_CONE_ANGLE: Math.PI / 2,   // FASE 5.5.3: 90 grados - cono amplio para disparo efectivo
            XP_VALUE: 8,               // Más XP que default
            TYPE: 'gunship',
            PROJECTILE_TYPE_ID: 'ALLY_GUNSHIP_CANNON' // Referencia al ID del proyectil
        }
    },

    // === CONFIGURACIÓN DE FORMACIÓN DE FLOTA ===
    FORMATION: {
        RADIUS: 50,                    // Radio de la formación circular
        FOLLOW_STRENGTH: 450,          // Fuerza de seguimiento (ORGÁNICO - reducido de 500)
        MAX_CORRECTION_FORCE: 15000,   // Fuerza máxima para corrección de emergencia (ORGÁNICO - reducido de 20000)
        CORRECTION_THRESHOLD: 120,     // Distancia para corrección de emergencia
        SMOOTHING_FACTOR: 0.3,         // Factor de suavizado para movimiento orgánico (MÁS SUAVE - reducido de 0.4)
        ROTATION_SYNC: true,           // Sincronizar rotación con comandante
        DAMPING: 0.88,                 // Factor de amortiguación para estabilidad (MÁS ORGÁNICO - reducido de 0.98)
        VELOCITY_THRESHOLD: 5,         // Velocidad mínima para rotación orgánica
        SPEED_ADAPTATION_MAX_FACTOR: 1.5,    // Factor máximo de adaptación de velocidad
        DISTANCE_FACTOR_THRESHOLD: 80,       // Umbral para factor de distancia
        DISTANCE_FACTOR_MAX: 1.2,            // Factor máximo de distancia
        VELOCITY_DAMPING_FACTOR: 0.08,       // Factor de amortiguación de velocidad
        CORRECTION_STRENGTH_DISTANCE_THRESHOLD: 300,  // Umbral de distancia para corrección
        CORRECTION_STRENGTH_MAX_FACTOR: 0.5,          // Factor máximo de fuerza de corrección
        ANGULAR_SEPARATION: Math.PI / 18               // 10° de separación entre naves para evitar solapamiento de disparos
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
                INNER_CORE_RADIUS_MULTIPLIER: 0.5,
                // Nuevas propiedades para efecto de brillo
                GLOW_COLOR: '#00FFFF',        // Cyan brillante como en películas de sci-fi
                GLOW_BLUR: 15,                // Intensidad del brillo
                SIZE: { width: 2, height: 15 }, // Tamaño visual ajustado
                PIERCE: 0                     // Perforación inicial (0 por defecto)
            },
            ALLY_DEFAULT_SHOT: {
                DAMAGE: 18,
                SPEED: 450,
                RADIUS: 2,
                COLOR: '#00FFFF',
                VISUAL_TYPE: 'bullet',
                TRAIL_EFFECT: 'basic',
                TRAIL_LENGTH: 5,
                LIFETIME: 1.5,
                LINE_WIDTH: 2,
                GLOW_RADIUS_MULTIPLIER: 0.8,
                INNER_CORE_RADIUS_MULTIPLIER: 0.4
            },
            ALLY_SCOUT_SHOT: {
                DAMAGE: 15,
                SPEED: 600,
                RADIUS: 2,
                COLOR: '#00AAFF',
                VISUAL_TYPE: 'bullet',
                TRAIL_EFFECT: 'short',
                TRAIL_LENGTH: 5,
                LIFETIME: 1.5,
                LINE_WIDTH: 2,
                GLOW_RADIUS_MULTIPLIER: 0.8,
                INNER_CORE_RADIUS_MULTIPLIER: 0.4
            },
            ALLY_GUNSHIP_CANNON: {
                DAMAGE: 28,
                SPEED: 400,
                RADIUS: 5,
                COLOR: '#FF6600',
                VISUAL_TYPE: 'orb',
                TRAIL_EFFECT: 'heavy',
                TRAIL_LENGTH: 10,
                LIFETIME: 2.5,
                LINE_WIDTH: 0,
                GLOW_RADIUS_MULTIPLIER: 1.2,
                INNER_CORE_RADIUS_MULTIPLIER: 0.6
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
                INNER_CORE_RADIUS_MULTIPLIER: 0.5
            }
        }
    },

    // === CONFIGURACIÓN DE MATERIALES ===
    MATERIAL: {
        DROP_CHANCE: 0.8,              // 80% probabilidad de drop
        COLLECTION_RADIUS: 80,         // Radio de recolección automática
        BASE_VALUE: 1,                 // Valor base de materiales
        LIFETIME: 10.0,                // Segundos de vida
        SIZE: 6,                       // Tamaño visual
        COLOR: '#FFD700'               // Color dorado
    },

    // === SISTEMA DE EXPERIENCIA Y POWER-UPS ===
    POWER_UP_SYSTEM: {
        BASE_XP_TO_LEVEL_UP: 100,      // XP necesario para nivel 2
        XP_INCREASE_PER_LEVEL: 50,     // XP adicional por nivel
        XP_BASE: 10,                   // XP base por acción
        XP_SCALING: 1.5                // Multiplicador de XP por nivel
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
        // Mejoras del Comandante
        {
            id: 'speed_boost',
            name: 'Propulsores Mejorados',
            description: 'Velocidad +15%',
            type: 'Commander',
            effect: { prop: 'maxSpeed', multiplier: 1.15 }
        },
        {
            id: 'health_boost',
            name: 'Blindaje Reforzado',
            description: 'HP Máximo +25',
            type: 'Commander',
            effect: { prop: 'maxHp', additive: 25 }
        },
        {
            id: 'fire_rate_boost',
            name: 'Sistema de Disparo Rápido',
            description: 'Cadencia +25%',
            type: 'Commander',
            effect: { prop: 'fireRate', multiplier: 0.8 }
        },
        {
            id: 'damage_boost',
            name: 'Proyectiles Mejorados',
            description: 'Daño +20%',
            type: 'Commander',
            effect: { prop: 'damage', multiplier: 1.2 }
        },
        {
            id: 'acceleration_boost',
            name: 'Motores Potenciados',
            description: 'Aceleración +20%',
            type: 'Commander',
            effect: { prop: 'acceleration', multiplier: 1.2 }
        },
        {
            id: 'health_regen',
            name: 'Reparación Automática',
            description: 'Regenera 1 HP/seg',
            type: 'Commander',
            effect: { prop: 'healthRegen', additive: 1 }
        },
        {
            id: 'pierce_shot',
            name: 'Proyectiles de Plasma',
            description: 'Tus disparos atraviesan 1 enemigo adicional',
            type: 'Commander',
            effect: { prop: 'pierce', additive: 1 }
        },
        // Mejoras Especiales
        {
            id: 'material_magnet',
            name: 'Imán de Materiales',
            description: 'Radio de recolección +50%',
            type: 'Special',
            effect: { prop: 'collectionRadius', multiplier: 1.5 }
        },
        {
            id: 'xp_boost',
            name: 'Analizador Táctico',
            description: 'XP +25%',
            type: 'Special',
            effect: { prop: 'xpMultiplier', multiplier: 1.25 }
        },
        {
            id: 'material_boost',
            name: 'Extractor Eficiente',
            description: 'Materiales +50%',
            type: 'Special',
            effect: { prop: 'materialMultiplier', multiplier: 1.5 }
        },
        // Naves de Flota
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
    ],

    // === CONFIGURACIÓN DE DEBUG ===
    DEBUG: {
        FLEET_INFO: true               // Mostrar información de debug de la flota
    }
};

// Hacer CONFIG accesible globalmente
console.log("✅ CONFIG refactorizado completamente cargado (Fase 5.5.4.1):", CONFIG); 