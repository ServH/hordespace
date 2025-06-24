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
    PLAYER_BASE_SPEED: 300,           // píxeles por segundo
    PLAYER_ACCELERATION: 800,         // píxeles por segundo²
    PLAYER_FRICTION: 0.85,            // factor de fricción (0-1)
    PLAYER_ROTATION_SPEED: 5,         // radianes por segundo
    PLAYER_RADIUS: 15,                // radio de colisión
    
    // === PROPIEDADES DE PROYECTILES (BÁSICOS) ===
    PROJECTILE_SPEED: 500,            // píxeles por segundo
    PROJECTILE_DAMAGE: 25,            // puntos de daño
    PROJECTILE_FIRE_RATE: 0.2,        // segundos entre disparos
    PROJECTILE_RADIUS: 3,             // radio de colisión
    
    // === PROPIEDADES DE ENEMIGOS (BÁSICOS) ===
    ENEMY_BASE_HP: 50,
    ENEMY_BASE_SPEED: 150,            // píxeles por segundo
    ENEMY_SPAWN_RATE_INITIAL: 2.0,    // segundos entre spawns
    ENEMY_RADIUS: 12,                 // radio de colisión
    
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
    MATERIAL_COLLECTION_RADIUS: 30,   // radio de recolección automática
    
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
    }
};

// Hacer CONFIG accesible globalmente
console.log("✅ CONFIG cargado correctamente:", CONFIG); 