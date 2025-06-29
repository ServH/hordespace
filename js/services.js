// -- Importar todas las clases de Sistemas y Fábricas --
import EntityManager from './EntityManager.js';
import EventBus from './EventBus.js';
import SpriteCache from './SpriteCache.js';
import PowerUpSystem from './PowerUpSystem.js';
import GameDirector from './systems/GameDirector.js';
import SynergyManager from './systems/SynergyManager.js';

// Lógica
import PlayerInputSystem from './systems/PlayerInputSystem.js';
import EnemyAISystem from './systems/EnemyAISystem.js';
import PhysicsSystem from './systems/PhysicsSystem.js';
import CollisionSystem from './systems/CollisionSystem.js';
import DamageSystem from './systems/DamageSystem.js';
import InvincibilitySystem from './systems/InvincibilitySystem.js';
import HealthSystem from './systems/HealthSystem.js';
import LifetimeSystem from './systems/LifetimeSystem.js';
import ProjectileMovementSystem from './systems/ProjectileMovementSystem.js';
import MaterialDropSystem from './systems/MaterialDropSystem.js';
import AimSystem from './systems/AimSystem.js';
import WeaponSystem from './systems/WeaponSystem.js';
import AllyCombatAISystem from './systems/AllyCombatAISystem.js';
import AllyAimingSystem from './systems/AllyAimingSystem.js';
import FleetSystem from './systems/FleetSystem.js';
import FormationMovementSystem from './systems/FormationMovementSystem.js';
import FormationBonusSystem from './systems/FormationBonusSystem.js';
import BoundsSystem from './systems/BoundsSystem.js';
import SpatialGridUpdateSystem from './systems/SpatialGridUpdateSystem.js';
import DamageCooldownSystem from './systems/DamageCooldownSystem.js';
import BeamSystem from './systems/BeamSystem.js';

// Renderizado
import PlayerRenderSystem from './systems/PlayerRenderSystem.js';
import EnemyRenderSystem from './systems/EnemyRenderSystem.js';
import ProjectileRenderSystem from './systems/ProjectileRenderSystem.js';
import AllyRenderSystem from './systems/AllyRenderSystem.js';
import FormationBonusRenderSystem from './systems/FormationBonusRenderSystem.js';

// Sistemas de Partículas (Trails)
import ThrusterSystem from './systems/ThrusterSystem.js';
import TrailRenderSystem from './systems/TrailRenderSystem.js';

// Sistema de Paralaje
import ParallaxBackgroundSystem from './systems/ParallaxBackgroundSystem.js';

// Sistemas de Efectos Visuales
import ExplosionAnimationSystem from './systems/ExplosionAnimationSystem.js';
import ExplosionRenderSystem from './systems/ExplosionRenderSystem.js';

// Fábricas
import ProjectileFactory from './factories/ProjectileFactory.js';
import EnemyFactory from './factories/EnemyFactory.js';
import AllyFactory from './factories/AllyFactory.js';
import ExplosionFactory from './factories/ExplosionFactory.js';


/**
 * Define todos los servicios y sus dependencias para el DI Container.
 * @param {DIContainer} container - La instancia del contenedor.
 */
export function registerServices(container) {
    
    // --- SERVICIOS BASE (son instancias, no clases) ---
    // Estos no se crean, se registran directamente.
    // Los registraremos desde Game.js ya que son únicos de cada instancia del juego.

    // --- SISTEMAS DE LÓGICA ---
    container.register('playerInputSystem', PlayerInputSystem, ['entityManager', 'eventBus', 'keyboardState']);
    container.register('enemyAISystem', EnemyAISystem, ['entityManager', 'eventBus']);
    container.register('physicsSystem', PhysicsSystem, ['entityManager', 'eventBus']);
    container.register('collisionSystem', CollisionSystem, ['entityManager', 'eventBus']);
    container.register('damageSystem', DamageSystem, ['entityManager', 'eventBus']);
    container.register('damageCooldownSystem', DamageCooldownSystem, ['entityManager', 'eventBus']);
    container.register('invincibilitySystem', InvincibilitySystem, ['entityManager', 'eventBus']);
    container.register('healthSystem', HealthSystem, ['entityManager', 'eventBus']);
    container.register('lifetimeSystem', LifetimeSystem, ['entityManager', 'eventBus']);
    container.register('projectileMovementSystem', ProjectileMovementSystem, ['entityManager', 'eventBus']);
    container.register('materialDropSystem', MaterialDropSystem, ['entityManager', 'eventBus', 'materialPool']);
    container.register('aimSystem', AimSystem, ['entityManager', 'eventBus', 'mousePosition', 'mouseAimActive', 'camera']);
    container.register('weaponSystem', WeaponSystem, ['entityManager', 'eventBus']);
    container.register('allyCombatAISystem', AllyCombatAISystem, ['entityManager', 'eventBus']);
    container.register('allyAimingSystem', AllyAimingSystem, ['entityManager', 'eventBus']);
    container.register('fleetSystem', FleetSystem, ['entityManager', 'eventBus']);
    container.register('formationMovementSystem', FormationMovementSystem, ['entityManager', 'eventBus']);
    container.register('formationBonusSystem', FormationBonusSystem, ['entityManager', 'eventBus', 'powerUpSystem']);
    container.register('boundsSystem', BoundsSystem, ['entityManager', 'eventBus']);
    container.register('thrusterSystem', ThrusterSystem, ['entityManager', 'eventBus']);
    container.register('spatialGridUpdateSystem', SpatialGridUpdateSystem, ['entityManager', 'eventBus']);
    container.register('beamSystem', BeamSystem, ['entityManager', 'eventBus']);
    container.register('explosionAnimationSystem', ExplosionAnimationSystem, ['entityManager', 'eventBus']);

    // --- SISTEMAS DE RENDERIZADO ---
    container.register('parallaxBackgroundSystem', ParallaxBackgroundSystem, ['entityManager', 'eventBus', 'ctx', 'camera', 'spriteCache']);
    container.register('playerRenderSystem', PlayerRenderSystem, ['entityManager', 'eventBus', 'ctx', 'camera']);
    container.register('enemyRenderSystem', EnemyRenderSystem, ['entityManager', 'eventBus', 'ctx', 'camera']);
    container.register('projectileRenderSystem', ProjectileRenderSystem, ['entityManager', 'eventBus', 'ctx', 'spriteCache', 'camera']);
    container.register('allyRenderSystem', AllyRenderSystem, ['entityManager', 'eventBus', 'ctx', 'camera']);
    container.register('formationBonusRenderSystem', FormationBonusRenderSystem, ['entityManager', 'eventBus', 'ctx', 'camera']);
    container.register('trailRenderSystem', TrailRenderSystem, ['entityManager', 'eventBus', 'ctx', 'camera']);
    container.register('explosionRenderSystem', ExplosionRenderSystem, ['entityManager', 'eventBus', 'ctx', 'camera']);
    
    // --- FÁBRICAS ---
    container.register('projectileFactory', ProjectileFactory, ['entityManager', 'eventBus']);
    container.register('enemyFactory', EnemyFactory, ['entityManager', 'eventBus']);
    container.register('allyFactory', AllyFactory, ['entityManager', 'eventBus']);
    container.register('explosionFactory', ExplosionFactory, ['entityManager', 'eventBus']);

    // --- SISTEMAS DE JUEGO PRINCIPALES ---
    container.register('gameDirector', GameDirector, ['entityManager', 'eventBus', 'camera']);
    container.register('synergyManager', SynergyManager, ['entityManager', 'eventBus']);
    container.register('powerUpSystem', PowerUpSystem, ['entityManager', 'config', 'eventBus', 'synergyManager', 'fleetSystem']);
} 