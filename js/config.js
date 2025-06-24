/**
 * Space Horde Survivor - Configuración Global
 * Todas las constantes del juego centralizadas para fácil balanceo
 */

window.CONFIG = {
    // === DIMENSIONES DEL CANVAS ===
    CANVAS_WIDTH: window.innerWidth,
    CANVAS_HEIGHT: window.innerHeight,
    
    // === PROPIEDADES DEL COMANDANTE (JUGADOR) ===
    PLAYER_BASE_HP: 100,
    PLAYER_BASE_SPEED: 200,           // píxeles por segundo
    PLAYER_ACCELERATION: 600,         // píxeles por segundo²
    PLAYER_FRICTION: 0.85,            // factor de fricción (0-1)
    PLAYER_ROTATION_SPEED: 5,         // radianes por segundo
    PLAYER_RADIUS: 15,                // radio de colisión
    
    // === PROPIEDADES DE PROYECTILES (BÁSICOS) ===
    PROJECTILE_SPEED: 500,            // píxeles por segundo
    PROJECTILE_DAMAGE: 25,            // puntos de daño
    PROJECTILE_FIRE_RATE: 0.2,        // segundos entre disparos
    PROJECTILE_RADIUS: 3,             // radio de colisión
    
    // === PROPIEDADES DE ENEMIGOS (BÁSICOS) ===
    ENEMY_BASE_HP: 75,
    ENEMY_BASE_SPEED: 120,            // píxeles por segundo
    ENEMY_BASE_ACCELERATION: 150,     // píxeles por segundo²
    ENEMY_BASE_FRICTION: 0.90,        // factor de fricción
    ENEMY_BASE_ROTATION_SPEED: 4,     // radianes por segundo
    ENEMY_BASE_RADIUS: 15,            // radio de colisión
    ENEMY_BASE_DAMAGE: 20,            // daño por contacto
    ENEMY_SPAWN_RATE_INITIAL: 2.0,   // segundos entre spawns
    
    // === TAMAÑOS DE OBJECT POOLS ===
    POOL_SIZE_PROJECTILES: 100,       // máximo proyectiles simultáneos
    POOL_SIZE_EXPLOSIONS: 50,         // máximo explosiones simultáneas
    POOL_SIZE_PARTICLES: 200,         // máximo partículas simultáneas
    POOL_SIZE_MATERIALS: 50,          // máximo materiales en pantalla
    
    // === ESCALADO DE DIFICULTAD ===
    DIFFICULTY_ENEMY_HP_SCALING: 1.2,     // +20% HP por ciclo
    DIFFICULTY_ENEMY_DAMAGE_SCALING: 1.2, // +20% daño por ciclo
    WAVES_PER_CYCLE: 10,                  // oleadas por ciclo
    
    // === MATERIALES Y RECOLECCIÓN ===
    MATERIAL_DROP_CHANCE: 0.8,        // 80% chance de drop
    MATERIAL_COLLECTION_RADIUS: 80,   // radio de recolección automática
    MATERIAL_BASE_VALUE: 1,           // valor base de materiales
    
    // === SISTEMA DE EXPERIENCIA Y POWER-UPS ===
    ENEMY_BASE_XP_VALUE: 100,          // XP base por enemigo
    BASE_XP_TO_LEVEL_UP: 100,         // XP necesario para nivel 2
    XP_INCREASE_PER_LEVEL: 50,        // XP adicional por nivel
    
    // === HANGAR Y CONSTRUCCIÓN ===
    HANGAR_SPAWN_INTERVAL: 120,       // segundos entre apariciones de hangar
    
    // === COSTOS DE NAVES ALIADAS ===
    SHIP_COSTS: {
        SCOUT: 10,      // materiales
        GUARDIAN: 25,
        GUNSHIP: 20,
        HEAVY: 40,
        SUPPORT: 30
    },
    
    // === HABILIDADES DEL COMANDANTE ===
    ABILITIES: {
        RALLY_COOLDOWN: 30,           // segundos
        RALLY_DURATION: 10,           // segundos
        SHIELD_COOLDOWN: 45,          // segundos
        SHIELD_DURATION: 8,           // segundos
        FORMATION_STRIKE_COOLDOWN: 20 // segundos
    },
    
    // === LISTA MAESTRA DE POWER-UPS ===
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
        }
    ]
};

// Hacer CONFIG accesible globalmente
console.log("✅ CONFIG cargado correctamente:", CONFIG); 