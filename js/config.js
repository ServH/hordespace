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
    DEBUG_FLEET_INFO: true, // Mostrar información de debug de la flota
    
    // === CONFIGURACIÓN DEL COMANDANTE ===
    PLAYER_MAX_HP: 100,
    PLAYER_MAX_SPEED: 300,
    PLAYER_FIRE_RATE: 0.2, // segundos entre disparos
    PLAYER_PROJECTILE_SPEED: 400,
    PLAYER_PROJECTILE_LIFETIME: 3.0, // segundos
    PLAYER_COLOR: '#00FF00',
    
    // === CONFIGURACIÓN DE NAVES ALIADAS ===
    ALLY_DEFAULT_HP: 60,
    ALLY_DEFAULT_SPEED: 450,
    ALLY_DEFAULT_ACCELERATION: 800,
    ALLY_DEFAULT_FRICTION: 0.98,
    ALLY_DEFAULT_ROTATION_SPEED: 3,
    ALLY_DEFAULT_RADIUS: 8,
    ALLY_DEFAULT_COLOR: '#00FFFF',
    
    // === CONFIGURACIÓN DE COMBATE PARA NAVES ALIADAS ===
    ALLY_DEFAULT_DAMAGE: 18,                 // Daño por proyectil
    ALLY_DEFAULT_FIRE_RATE: 0.7,             // Segundos entre disparos
    ALLY_DEFAULT_AI_TARGETING_RANGE: 500,    // Rango de detección de enemigos en píxeles
    ALLY_DEFAULT_ROTATION_SPEED_COMBAT: 0.12, // Factor de suavizado para rotación de combate
    
    // === CONFIGURACIÓN ESPECÍFICA DE SCOUT SHIP ===
    ALLY_SCOUT_HP: 45,                       // HP menor que default (más frágil)
    ALLY_SCOUT_SPEED: 500,                   // Velocidad mayor que default (más rápido)
    ALLY_SCOUT_ACCELERATION: 900,            // Aceleración mayor (más ágil)
    ALLY_SCOUT_FRICTION: 0.96,               // Fricción menor (más deslizante)
    ALLY_SCOUT_ROTATION_SPEED: 4,            // Rotación más rápida
    ALLY_SCOUT_RADIUS: 7,                    // Radio menor (más pequeño)
    ALLY_SCOUT_COLOR: '#00AAFF',             // Azul más claro que default
    ALLY_SCOUT_DAMAGE: 15,                   // Daño menor (scout = exploración)
    ALLY_SCOUT_FIRE_RATE: 0.5,               // Disparo más rápido (compensar menor daño)
    ALLY_SCOUT_AI_TARGETING_RANGE: 550,      // Rango mayor (mejor detección)
    ALLY_SCOUT_XP_VALUE: 5,                  // XP si es destruido
    
    // === CONFIGURACIÓN ESPECÍFICA DE GUNSHIP ===
    ALLY_GUNSHIP_HP: 80,                     // HP mayor que default (más resistente)
    ALLY_GUNSHIP_SPEED: 400,                 // Velocidad menor que default (más lento)
    ALLY_GUNSHIP_ACCELERATION: 700,          // Aceleración menor (más pesado)
    ALLY_GUNSHIP_FRICTION: 0.99,             // Fricción mayor (más estable)
    ALLY_GUNSHIP_ROTATION_SPEED: 2.5,        // Rotación más lenta
    ALLY_GUNSHIP_RADIUS: 10,                 // Radio mayor (más grande)
    ALLY_GUNSHIP_COLOR: '#FF6600',           // Naranja distintivo
    ALLY_GUNSHIP_DAMAGE: 28,                 // Daño mayor (gunship = combate)
    ALLY_GUNSHIP_FIRE_RATE: 0.9,             // Disparo más lento (mayor daño)
    ALLY_GUNSHIP_AI_TARGETING_RANGE: 450,    // Rango menor (enfoque en combate cercano)
    ALLY_GUNSHIP_XP_VALUE: 8,                // XP si es destruido
    
    // === CONFIGURACIÓN DE ENEMIGOS ===
    ENEMY_BASE_HP: 40,
    ENEMY_BASE_SPEED: 120,
    ENEMY_BASE_ACCELERATION: 400,
    ENEMY_BASE_DAMAGE: 15,
    ENEMY_RADIUS: 10,
    ENEMY_COLOR: '#FF4444',
    
    // === CONFIGURACIÓN DE PROYECTILES ===
    PROJECTILE_COLOR_PLAYER: '#FFFF00',
    PROJECTILE_COLOR_ENEMY: '#FF8800',
    
    // === CONFIGURACIÓN DE MATERIALES ===
    MATERIAL_LIFETIME: 10.0, // segundos
    MATERIAL_SIZE: 6,
    MATERIAL_COLOR: '#FFD700',
    
    // === CONFIGURACIÓN DE POWER-UPS ===
    POWER_UP_XP_BASE: 10, // XP necesaria para el primer nivel
    POWER_UP_XP_SCALING: 1.5, // Multiplicador de XP por nivel
    
    // === CONFIGURACIÓN DE OLEADAS ===
    WAVE_ENEMIES_BASE: 5,
    WAVE_ENEMIES_INCREMENT: 2,
    WAVE_BREAK_TIME: 3.0, // segundos entre oleadas
    
    // === CONFIGURACIÓN DE OBJECT POOLS ===
    POOL_SIZE_ENEMIES: 30,
    
    // === CONFIGURACIÓN DE EXPLOSIONES ===
    EXPLOSION_DURATION: 0.5, // segundos
    EXPLOSION_COLORS: ['#FF4444', '#FF8844', '#FFAA44', '#FFFF44'],
    
    // === POWER-UPS DISPONIBLES ===
    POWER_UPS: [
        {
            name: "Propulsión Mejorada",
            description: "+20% velocidad máxima",
            type: "Commander",
            effect: { prop: 'maxSpeed', multiplier: 1.2 }
        },
        {
            name: "Casco Reforzado",
            description: "+25 HP máximo",
            type: "Commander",
            effect: { prop: 'maxHp', additive: 25 }
        },
        {
            name: "Motor Optimizado",
            description: "+30% aceleración",
            type: "Commander",
            effect: { prop: 'acceleration', multiplier: 1.3 }
        },
        {
            name: "Regeneración",
            description: "+2 HP/seg regeneración",
            type: "Commander",
            effect: { prop: 'healthRegen', additive: 2 }
        },
        {
            name: "Colector Avanzado",
            description: "+50% radio de recolección",
            type: "Special",
            effect: { prop: 'collectionRadius', multiplier: 1.5 }
        },
        {
            name: "Amplificador XP",
            description: "+50% experiencia ganada",
            type: "Special",
            effect: { prop: 'xpMultiplier', multiplier: 1.5 }
        },
        {
            name: "Procesador de Materiales",
            description: "+50% valor de materiales",
            type: "Special",
            effect: { prop: 'materialMultiplier', multiplier: 1.5 }
        }
    ],
    
    // === CONFIGURACIÓN DE FORMACIÓN DE FLOTA ===
    FORMATION_RADIUS: 50,                    // Radio de la formación circular
    FORMATION_FOLLOW_STRENGTH: 10,            // Fuerza de seguimiento REDUCIDA para suavidad
    FORMATION_MAX_CORRECTION_FORCE: 800,     // Fuerza máxima REDUCIDA para evitar sobrecorrección
    FORMATION_CORRECTION_THRESHOLD: 120,     // Distancia para corrección de emergencia REDUCIDA
    FORMATION_SMOOTHING_FACTOR: 0.15,        // Factor de suavizado para movimiento orgánico
    FORMATION_ROTATION_SYNC: true,           // Sincronizar rotación con comandante
    FORMATION_DAMPING: 0.92                  // Factor de amortiguación para estabilidad
};

// Hacer CONFIG accesible globalmente
console.log("✅ CONFIG cargado correctamente:", CONFIG); 