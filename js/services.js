// -- Importar todas las clases de Sistemas y Fábricas --
import EntityManager from './EntityManager.js';
import EventBus from './EventBus.js';
import SpriteCache from './SpriteCache.js';

// Lógica
import PlayerInputSystem from './systems/PlayerInputSystem.js';
import EnemyAISystem from './systems/EnemyAISystem.js';
import PhysicsSystem from './systems/PhysicsSystem.js';
import CollisionSystem from './systems/CollisionSystem.js';
import DamageSystem from './systems/DamageSystem.js';
import InvincibilitySystem from './systems/InvincibilitySystem.js';
import LifetimeSystem from './systems/LifetimeSystem.js';
import ProjectileMovementSystem from './systems/ProjectileMovementSystem.js';
import MaterialDropSystem from './systems/MaterialDropSystem.js';
import AimSystem from './systems/AimSystem.js';
import WeaponSystem from './systems/WeaponSystem.js';
import AllyCombatAISystem from './systems/AllyCombatAISystem.js';
import AllyAimingSystem from './systems/AllyAimingSystem.js';
import FleetSystem from './systems/FleetSystem.js';
import FormationMovementSystem from './systems/FormationMovementSystem.js';
import BoundsSystem from './systems/BoundsSystem.js';

// Renderizado
import PlayerRenderSystem from './systems/PlayerRenderSystem.js';
import EnemyRenderSystem from './systems/EnemyRenderSystem.js';
import ProjectileRenderSystem from './systems/ProjectileRenderSystem.js';
import AllyRenderSystem from './systems/AllyRenderSystem.js';

// Fábricas
import ProjectileFactory from './factories/ProjectileFactory.js';
import EnemyFactory from './factories/EnemyFactory.js';
import AllyFactory from './factories/AllyFactory.js';


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
    container.register('invincibilitySystem', InvincibilitySystem, ['entityManager', 'eventBus']);
    container.register('lifetimeSystem', LifetimeSystem, ['entityManager', 'eventBus']);
    container.register('projectileMovementSystem', ProjectileMovementSystem, ['entityManager', 'eventBus']);
    container.register('materialDropSystem', MaterialDropSystem, ['entityManager', 'eventBus', 'materialPool']);
    container.register('aimSystem', AimSystem, ['entityManager', 'eventBus', 'mousePosition', 'mouseAimActive']);
    container.register('weaponSystem', WeaponSystem, ['entityManager', 'eventBus']);
    container.register('allyCombatAISystem', AllyCombatAISystem, ['entityManager', 'eventBus']);
    container.register('allyAimingSystem', AllyAimingSystem, ['entityManager', 'eventBus']);
    container.register('fleetSystem', FleetSystem, ['entityManager', 'eventBus']);
    container.register('formationMovementSystem', FormationMovementSystem, ['entityManager', 'eventBus']);
    container.register('boundsSystem', BoundsSystem, ['entityManager', 'eventBus']);

    // --- SISTEMAS DE RENDERIZADO ---
    container.register('playerRenderSystem', PlayerRenderSystem, ['entityManager', 'eventBus', 'ctx']);
    container.register('enemyRenderSystem', EnemyRenderSystem, ['entityManager', 'eventBus', 'ctx']);
    container.register('projectileRenderSystem', ProjectileRenderSystem, ['entityManager', 'eventBus', 'ctx', 'spriteCache']);
    container.register('allyRenderSystem', AllyRenderSystem, ['entityManager', 'eventBus', 'ctx']);
    
    // --- FÁBRICAS ---
    container.register('projectileFactory', ProjectileFactory, ['entityManager', 'eventBus']);
    container.register('enemyFactory', EnemyFactory, ['entityManager', 'eventBus']);
    container.register('allyFactory', AllyFactory, ['entityManager', 'eventBus']);

    // ... y aquí irían otros sistemas como PowerUpSystem, EnemyWaveManager, etc.
} 