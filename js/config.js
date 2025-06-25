/**
 * Space Horde Survivor - Configuración Global Refactorizada
 * Estructura organizada en objetos anidados para mejor mantenibilidad
 * Fase 5.5.1: Refactorización Estructural sin cambios funcionales
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
        SPEED: 300,                    // Velocidad máxima
        ACCELERATION: 600,             // Píxeles por segundo²
        FRICTION: 0.85,                // Factor de fricción (0-1)
        ROTATION_SPEED: 5,             // Radianes por segundo
        RADIUS: 15,                    // Radio de colisión
        FIRE_RATE: 0.2,                // Segundos entre disparos
        PROJECTILE_SPEED: 400,         // Velocidad de proyectiles del jugador
        PROJECTILE_DAMAGE: 25,         // Daño por proyectil
        PROJECTILE_LIFETIME: 3.0,      // Segundos de vida del proyectil
        COLOR: '#00FF00'               // Color verde del comandante
    },

    // === CONFIGURACIÓN DE ENEMIGOS ===
    ENEMY: {
        DEFAULT: {
            HP: 40,                    // HP unificado (era 75 en una sección, 40 en otra)
            SPEED: 120,                // Píxeles por segundo
            ACCELERATION: 400,         // Píxeles por segundo²
            FRICTION: 0.90,            // Factor de fricción
            ROTATION_SPEED: 4,         // Radianes por segundo
            RADIUS: 10,                // Radio de colisión (era 15 en una sección, 10 en otra)
            DAMAGE: 15,                // Daño por contacto
            XP_VALUE: 100,             // XP base por enemigo
            COLOR: '#FF4444',          // Color rojo de enemigos
            SPAWN_RATE_INITIAL: 2.0    // Segundos entre spawns iniciales
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
            FIRE_CONE_ANGLE: Math.PI / 2,  // FASE 5.5.3: 90 grados - cono muy amplio para disparo efectivo
            XP_VALUE: 10,
            TYPE: 'defaultAlly'
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
            XP_VALUE: 5,               // Menos XP que default
            TYPE: 'scout'
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
            XP_VALUE: 8,               // Más XP que default
            TYPE: 'gunship'
        }
    },

    // === CONFIGURACIÓN DE FORMACIÓN DE FLOTA ===
    FORMATION: {
        RADIUS: 50,                    // Radio de la formación circular
        FOLLOW_STRENGTH: 300,          // Fuerza de seguimiento (ORGÁNICO - reducido de 500)
        MAX_CORRECTION_FORCE: 15000,   // Fuerza máxima para corrección de emergencia (ORGÁNICO - reducido de 20000)
        CORRECTION_THRESHOLD: 120,     // Distancia para corrección de emergencia
        SMOOTHING_FACTOR: 0.3,         // Factor de suavizado para movimiento orgánico (MÁS SUAVE - reducido de 0.4)
        ROTATION_SYNC: true,           // Sincronizar rotación con comandante
        DAMPING: 0.96,                 // Factor de amortiguación para estabilidad (MÁS ORGÁNICO - reducido de 0.98)
        VELOCITY_THRESHOLD: 5,         // Velocidad mínima para rotación orgánica
        SPEED_ADAPTATION_MAX_FACTOR: 1.5,    // Factor máximo de adaptación de velocidad
        DISTANCE_FACTOR_THRESHOLD: 80,       // Umbral para factor de distancia
        DISTANCE_FACTOR_MAX: 1.2,            // Factor máximo de distancia
        VELOCITY_DAMPING_FACTOR: 0.08,       // Factor de amortiguación de velocidad
        CORRECTION_STRENGTH_DISTANCE_THRESHOLD: 300,  // Umbral de distancia para corrección
        CORRECTION_STRENGTH_MAX_FACTOR: 0.5           // Factor máximo de fuerza de corrección
    },

    // === CONFIGURACIÓN DE PROYECTILES ===
    PROJECTILE: {
        SPEED: 500,                    // Velocidad base de proyectiles
        RADIUS: 3,                     // Radio de colisión base
        COLOR_PLAYER: '#FFFF00',       // Color amarillo para proyectiles del jugador
        COLOR_ENEMY: '#FF8800'         // Color naranja para proyectiles enemigos
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

    // === TAMAÑOS DE OBJECT POOLS ===
    POOL_SIZES: {
        PROJECTILES: 100,              // Máximo proyectiles simultáneos
        EXPLOSIONS: 50,                // Máximo explosiones simultáneas
        PARTICLES: 200,                // Máximo partículas simultáneas
        MATERIALS: 50,                 // Máximo materiales en pantalla
        ENEMIES: 30                    // Máximo enemigos simultáneos
    },

    // === CONFIGURACIÓN DE EXPLOSIONES ===
    EXPLOSION_EFFECTS: {
        DURATION: 0.5,                 // Segundos de duración
        COLORS: ['#FF4444', '#FF8844', '#FFAA44', '#FFFF44']
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
console.log("✅ CONFIG refactorizado cargado correctamente:", CONFIG); 