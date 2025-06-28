import System from './System.js';
import TransformComponent from '../components/TransformComponent.js';
import CollisionComponent from '../components/CollisionComponent.js';
import PlayerControlledComponent from '../components/PlayerControlledComponent.js';
import ProjectileComponent from '../components/ProjectileComponent.js';

export default class BoundsSystem extends System {
    constructor(entityManager, eventBus) {
        super(entityManager, eventBus);
    }

    update(deltaTime) {
        // El sistema de límites ya no es necesario para un mundo infinito con cámara.
        // Los proyectiles son destruidos por LifetimeSystem.
        // Los enemigos deben poder existir fuera de la vista de la cámara.
        // Dejamos este método vacío para neutralizar el sistema.
    }
} 